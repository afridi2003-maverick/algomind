import os
from dotenv import load_dotenv
# Load .env file from the root directory
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)
else:
    load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from services.algorithm_service import AlgorithmService
from services.chatbot_service import ChatbotService
from services.quiz_service import QuizService
from fastapi.responses import StreamingResponse
from db.database import engine, Base, SessionLocal
import db.models
import uuid

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AlgoMind API")

# Setup CORS — read allowed origins from environment variable for deployment flexibility
cors_origins = os.getenv("CORS_ORIGINS", os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chatbot_service = ChatbotService()

# ─── Request Models ───────────────────────────────────────────────

class AlgorithmRequest(BaseModel):
    graph: Dict[str, Any]
    algorithm: str
    start_node: Optional[str] = None
    goal_node: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    context: Dict[str, Any]

class QuizGenerateRequest(BaseModel):
    algorithm: str
    num_questions: int = 5

class QuizSubmitRequest(BaseModel):
    quiz_id: str
    algorithm: str
    questions: List[Dict[str, Any]]
    answers: List[int]
    student_id: Optional[str] = None

class ProgressUpdateRequest(BaseModel):
    student_id: str
    algorithms_started: Optional[List[str]] = None
    algorithms_mastered: Optional[List[str]] = None

# ─── Root ─────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "Welcome to AlgoMind API"}

# ─── Algorithm Execution ─────────────────────────────────────────

@app.post("/api/algorithm/execute")
def execute_algorithm(request: AlgorithmRequest):
    if request.algorithm != "Kruskal" and not request.start_node:
        raise HTTPException(status_code=400, detail=f"Start node is required for {request.algorithm}")
    try:
        result = AlgorithmService.execute_algorithm(
            graph_dict=request.graph,
            algorithm_name=request.algorithm,
            start_node=request.start_node,
            goal_node=request.goal_node
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Chat / AI Tutor ─────────────────────────────────────────────

@app.post("/api/chat")
def chat(request: ChatRequest):
    try:
        def stream_generator():
            for chunk in chatbot_service.get_response(
                messages=request.messages,
                context=request.context,
                stream=True
            ):
                yield chunk
        return StreamingResponse(stream_generator(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── Quiz System ─────────────────────────────────────────────────

@app.post("/api/quiz/generate")
def generate_quiz(request: QuizGenerateRequest):
    """Generate a quiz for a specific algorithm."""
    try:
        quiz = QuizService.generate_quiz(
            algorithm=request.algorithm,
            num_questions=request.num_questions
        )
        return quiz
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

def ensure_student_exists(db_session, student_id: str):
    """
    Ensure a student record exists in the database to satisfy foreign keys.
    NOTE: This is a placeholder mock stub for student authentication/identification in a development setup.
    For a production deployment, this stub should be replaced by a secure integration with an authentication provider
    (e.g., OAuth, Auth0, or custom session auth) to prevent unauthorized/fabricated database records.
    """
    student = db_session.query(db.models.Student).filter(db.models.Student.id == student_id).first()
    if not student:
        student = db.models.Student(
            id=student_id,
            email=f"{student_id}@example.com",
            name=student_id.replace("_", " ").title()
        )
        db_session.add(student)
        db_session.commit()

@app.post("/api/quiz/submit")
def submit_quiz(request: QuizSubmitRequest):
    """Grade a submitted quiz and store results."""
    try:
        quiz_data = {
            "quiz_id": request.quiz_id,
            "algorithm": request.algorithm,
            "questions": request.questions
        }
        result = QuizService.grade_quiz(quiz_data, request.answers)
        
        # Store quiz attempt in database if student_id provided
        if request.student_id:
            try:
                with SessionLocal() as db_session:
                    ensure_student_exists(db_session, request.student_id)
                    attempt = db.models.QuizAttempt(
                        id=str(uuid.uuid4()),
                        student_id=request.student_id,
                        algorithm=request.algorithm,
                        score=result["score"],
                        total_questions=result["total_questions"],
                        correct_answers=result["correct_answers"]
                    )
                    db_session.add(attempt)
                    db_session.commit()
            except Exception as db_err:
                print(f"Warning: could not save quiz attempt: {db_err}")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── Student Progress ────────────────────────────────────────────

@app.post("/api/student/progress")
def update_progress(request: ProgressUpdateRequest):
    """Update student progress tracking."""
    try:
        with SessionLocal() as db_session:
            ensure_student_exists(db_session, request.student_id)
            
            # Find or create progress record
            progress = db_session.query(db.models.StudentProgress).filter(
                db.models.StudentProgress.student_id == request.student_id
            ).first()
            
            if not progress:
                progress = db.models.StudentProgress(
                    id=str(uuid.uuid4()),
                    student_id=request.student_id,
                    algorithms_started=request.algorithms_started or [],
                    algorithms_mastered=request.algorithms_mastered or []
                )
                db_session.add(progress)
            else:
                if request.algorithms_started is not None:
                    progress.algorithms_started = request.algorithms_started
                if request.algorithms_mastered is not None:
                    progress.algorithms_mastered = request.algorithms_mastered
            
            db_session.commit()
            return {"status": "ok", "student_id": request.student_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/student/progress/{student_id}")
def get_progress(student_id: str):
    """Get student progress data."""
    try:
        with SessionLocal() as db_session:
            progress = db_session.query(db.models.StudentProgress).filter(
                db.models.StudentProgress.student_id == student_id
            ).first()
            
            quiz_attempts = db_session.query(db.models.QuizAttempt).filter(
                db.models.QuizAttempt.student_id == student_id
            ).all()
            
            started = list(progress.algorithms_started) if (progress and progress.algorithms_started) else []
            mastered = list(progress.algorithms_mastered) if (progress and progress.algorithms_mastered) else []
            time_spent = progress.total_time_spent if progress else 0
            attempts = [
                {
                    "algorithm": qa.algorithm,
                    "score": qa.score,
                    "total_questions": qa.total_questions,
                    "correct_answers": qa.correct_answers,
                    "attempted_at": qa.attempted_at.isoformat() if qa.attempted_at else None
                }
                for qa in quiz_attempts
            ]
            
            return {
                "student_id": student_id,
                "algorithms_started": started,
                "algorithms_mastered": mastered,
                "total_time_spent": time_spent,
                "quiz_attempts": attempts
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

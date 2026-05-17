from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, ForeignKey
from datetime import datetime
from db.database import Base

class Student(Base):
    __tablename__ = "students"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    algorithm = Column(String, index=True, nullable=False)
    score = Column(Float, nullable=False)  # 0-100
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    attempted_at = Column(DateTime, default=datetime.utcnow)

class StudentProgress(Base):
    __tablename__ = "student_progress"
    
    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), unique=True, nullable=False)
    algorithms_started = Column(JSON, default=list)  # e.g., ["BFS", "DFS", ...]
    algorithms_mastered = Column(JSON, default=list)  # e.g., ["BFS"] (where score >= 80%)
    total_time_spent = Column(Integer, default=0)    # in seconds
    last_accessed = Column(DateTime, default=datetime.utcnow)

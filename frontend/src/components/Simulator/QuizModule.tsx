"use client";
import React, { useState, useCallback } from 'react';
import { CheckCircle, XCircle, Award, RotateCcw, Loader2, BookOpen } from 'lucide-react';
import axios from 'axios';

type AlgoKey = 'BFS' | 'DFS' | 'Dijkstra' | 'AStar' | 'Kruskal' | 'BellmanFord';

interface QuizQuestion {
  id: string;
  type: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface QuizData {
  quiz_id: string;
  algorithm: string;
  total_questions: number;
  questions: QuizQuestion[];
}

interface QuizFeedback {
  question_id: string;
  selected: number;
  correct: number;
  is_correct: boolean;
  explanation: string;
}

interface QuizResult {
  quiz_id: string;
  algorithm: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  feedback: QuizFeedback[];
  passed: boolean;
}

interface QuizModuleProps {
  algorithm: AlgoKey;
  studentId?: string;
  onQuizComplete?: (result: QuizResult) => void;
}

export default function QuizModule({ algorithm, studentId, onQuizComplete }: QuizModuleProps) {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/quiz/generate', {
        algorithm,
        num_questions: 5
      });
      setQuiz(response.data);
      setAnswers(new Array(response.data.total_questions).fill(null));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  }, [algorithm]);

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (result) return; // Don't allow changes after submission
    setAnswers(prev => {
      const updated = [...prev];
      updated[questionIndex] = optionIndex;
      return updated;
    });
  };

  const handleSubmitQuiz = useCallback(async () => {
    if (!quiz) return;
    if (answers.some(a => a === null)) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/quiz/submit', {
        quiz_id: quiz.quiz_id,
        algorithm: quiz.algorithm,
        questions: quiz.questions,
        answers: answers as number[],
        student_id: studentId || null
      });
      setResult(response.data);
      if (onQuizComplete) onQuizComplete(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  }, [quiz, answers, studentId, onQuizComplete]);

  const handleRetry = () => {
    setQuiz(null);
    setAnswers([]);
    setResult(null);
    setError(null);
  };

  // ─── Not Started ───
  if (!quiz && !loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800/80 rounded-xl p-8 text-center backdrop-blur">
        <BookOpen className="mx-auto text-teal-400 mb-3" size={32} />
        <h3 className="text-lg font-bold text-gray-100 mb-2">Algorithm Quiz</h3>
        <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
          Test your understanding of <span className="text-teal-400 font-semibold">{algorithm}</span> with 
          5 auto-generated questions. Score 80%+ to master it!
        </p>
        <button
          onClick={handleGenerateQuiz}
          className="px-6 py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 hover:border-teal-400/60 rounded-xl text-teal-400 font-bold transition-all hover:scale-105 cursor-pointer"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  // ─── Loading ───
  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800/80 rounded-xl p-8 text-center backdrop-blur">
        <Loader2 className="mx-auto text-teal-400 mb-3 animate-spin" size={32} />
        <p className="text-sm text-gray-400">Generating quiz...</p>
      </div>
    );
  }

  if (!quiz) return null;

  // ─── Result View ───
  if (result) {
    return (
      <div className="bg-gray-900/50 border border-gray-800/80 rounded-xl p-6 backdrop-blur space-y-6">
        {/* Score Header */}
        <div className={`text-center p-6 rounded-xl border ${
          result.passed 
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-orange-500/10 border-orange-500/30'
        }`}>
          <Award className={`mx-auto mb-3 ${result.passed ? 'text-emerald-400' : 'text-orange-400'}`} size={40} />
          <h3 className="text-2xl font-extrabold text-white mb-1">
            {result.score}%
          </h3>
          <p className={`text-sm font-semibold ${result.passed ? 'text-emerald-400' : 'text-orange-400'}`}>
            {result.passed ? '🎉 Congratulations! You mastered this algorithm!' : 'Keep practicing! You need 80% to master.'}
          </p>
          <p className="text-xs text-gray-500 mt-2">{result.correct_answers}/{result.total_questions} correct</p>
        </div>

        {/* Per-Question Feedback */}
        <div className="space-y-4">
          {quiz.questions.map((q, i) => {
            const fb = result.feedback[i];
            return (
              <div key={q.id} className={`p-4 rounded-lg border ${fb.is_correct ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex items-start gap-2 mb-2">
                  {fb.is_correct ? <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" /> : <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />}
                  <span className="text-sm font-medium text-gray-200">{q.question}</span>
                </div>
                <div className="ml-6 space-y-1">
                  <p className="text-xs text-gray-400">
                    Your answer: <span className={fb.is_correct ? 'text-emerald-400' : 'text-red-400'}>{q.options[fb.selected]}</span>
                    {!fb.is_correct && <> | Correct: <span className="text-emerald-400">{q.options[fb.correct]}</span></>}
                  </p>
                  <p className="text-xs text-gray-500 italic">{fb.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRetry}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700 rounded-xl text-gray-200 font-semibold transition-all cursor-pointer"
        >
          <RotateCcw size={16} /> Try Again
        </button>
      </div>
    );
  }

  // ─── Active Quiz ───
  return (
    <div className="bg-gray-900/50 border border-gray-800/80 rounded-xl p-6 backdrop-blur space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
          <BookOpen size={20} className="text-teal-400" />
          {algorithm} Quiz
        </h3>
        <span className="text-xs font-mono text-gray-500 bg-black/40 px-2 py-1 rounded border border-gray-800">
          {answers.filter(a => a !== null).length}/{quiz.total_questions} answered
        </span>
      </div>

      <div className="space-y-5">
        {quiz.questions.map((q, i) => (
          <div key={q.id} className="bg-black/30 border border-gray-800/60 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-200 mb-3">
              <span className="text-teal-400 mr-2">Q{i + 1}.</span>
              {q.question}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, optIdx) => (
                <button
                  key={optIdx}
                  onClick={() => handleSelectAnswer(i, optIdx)}
                  className={`text-left px-4 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                    answers[i] === optIdx
                      ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 shadow-md shadow-teal-500/5'
                      : 'bg-gray-900/40 border-gray-800/60 text-gray-300 hover:bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <span className="text-xs text-gray-500 mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/30 border border-red-500/20 rounded-lg p-3">{error}</p>
      )}

      <button
        onClick={handleSubmitQuiz}
        disabled={submitting}
        className="w-full px-4 py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 hover:border-teal-400/60 rounded-xl text-teal-400 font-bold transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
      >
        {submitting ? 'Grading...' : 'Submit Quiz'}
      </button>
    </div>
  );
}

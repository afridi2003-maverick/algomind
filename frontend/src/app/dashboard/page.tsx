"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Code2, Award, Zap, TrendingUp, Trophy } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

const ALGORITHMS = [
  { key: 'BFS', name: "Breadth-First Search (BFS)" },
  { key: 'DFS', name: "Depth-First Search (DFS)" },
  { key: 'Dijkstra', name: "Dijkstra's Algorithm" },
  { key: 'AStar', name: "A* Search" },
  { key: 'Kruskal', name: "Kruskal's Algorithm" },
  { key: 'BellmanFord', name: "Bellman-Ford" },
  { key: 'Prim', name: "Prim's Algorithm" }
];

interface QuizAttempt {
  algorithm: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  attempted_at: string;
}

interface ProgressData {
  student_id: string;
  algorithms_started: string[];
  algorithms_mastered: string[];
  total_time_spent: number;
  quiz_attempts: QuizAttempt[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function DashboardPage() {
  const user = useUserStore(state => state.user);
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/student/progress/${user.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch student progress data');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error connecting to backend API.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-gray-400">Loading student dashboard...</p>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col items-center justify-center p-6">
        <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-8 max-w-md text-center backdrop-blur shadow-2xl">
          <h3 className="text-xl font-bold text-red-400 mb-2">Connection Error</h3>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-400 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Retry
            </button>
            <Link 
              href="/"
              className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-sm font-semibold transition-all text-gray-300"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const algorithmsMastered = data?.algorithms_mastered?.length || 0;
  
  let quizScoreAvg = 0;
  if (data && data.quiz_attempts && data.quiz_attempts.length > 0) {
    const sum = data.quiz_attempts.reduce((acc, attempt) => acc + attempt.score, 0);
    quizScoreAvg = Math.round(sum / data.quiz_attempts.length);
  }

  const formatTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0m";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };
  const totalTimeSpent = data ? formatTime(data.total_time_spent) : "0m";

  // Calculate streak from unique attempt dates
  const calculateStreak = (attempts: QuizAttempt[]) => {
    if (!attempts || attempts.length === 0) return 0;
    
    const dates = Array.from(new Set(attempts.map(a => {
      if (!a.attempted_at) return '';
      const d = new Date(a.attempted_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }).filter(Boolean))).sort().reverse();

    if (dates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }

    streak = 1;
    let current = new Date(dates[0]);
    
    for (let i = 1; i < dates.length; i++) {
      const nextDate = new Date(dates[i]);
      const diffTime = Math.abs(current.getTime() - nextDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        current = nextDate;
      } else if (diffDays > 1) {
        break;
      }
    }
    return streak;
  };
  const learningStreak = data ? calculateStreak(data.quiz_attempts) : 0;

  // Calculate progress for each algorithm
  const getAlgoProgress = (key: string) => {
    if (!data) return 0;
    if (data.algorithms_mastered.includes(key)) return 100;
    
    const attempts = data.quiz_attempts.filter(a => a.algorithm === key);
    if (attempts.length > 0) {
      const highestScore = Math.max(...attempts.map(a => a.score));
      return Math.max(highestScore, 30); // At least 30 if attempted
    }
    
    if (data.algorithms_started.includes(key)) return 30;
    return 0;
  };

  // Compile Dynamic Activities
  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'some time ago';
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getRecentActivity = () => {
    if (!data) return [];
    
    const activities: Array<{ id: string; action: string; time: string; timestamp: number; type: string }> = [];
    
    data.quiz_attempts.forEach((attempt, idx) => {
      const dateObj = new Date(attempt.attempted_at);
      const isMastered = attempt.score >= 80;
      
      activities.push({
        id: `quiz_${idx}_${attempt.algorithm}`,
        action: `Completed ${attempt.algorithm} Quiz - ${attempt.score}%`,
        time: formatTimeAgo(attempt.attempted_at),
        timestamp: dateObj.getTime(),
        type: 'quiz'
      });
      
      if (isMastered) {
        activities.push({
          id: `mastered_${idx}_${attempt.algorithm}`,
          action: `Mastered ${attempt.algorithm} Algorithm`,
          time: formatTimeAgo(attempt.attempted_at),
          timestamp: dateObj.getTime() + 1000,
          type: 'success'
        });
      }
    });
    
    data.algorithms_started.forEach((key) => {
      const hasQuiz = data.quiz_attempts.some(a => a.algorithm === key);
      if (!hasQuiz) {
        activities.push({
          id: `started_${key}`,
          action: `Explored ${key} Search`,
          time: 'Recently',
          timestamp: 0,
          type: 'explore'
        });
      }
    });
    
    return activities.sort((a, b) => b.timestamp - a.timestamp);
  };
  const recentActivity = getRecentActivity();

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-teal-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-indigo-600/10 blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-teal-600/10 blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors mb-4 group"
            >
              <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Dashboard</span>
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Welcome back, <span className="text-teal-400 font-semibold">{user?.name || 'Student'}</span>! Track your algorithm mastery progress.
            </p>
          </div>
          
          <Link 
            href="/simulator"
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl backdrop-blur-md transition-all font-semibold flex items-center gap-2 shadow-xl hover:shadow-teal-500/10 group"
          >
            <Code2 size={18} className="text-teal-400 group-hover:animate-pulse" />
            Resume Simulation
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Algorithms Mastered" 
            value={`${algorithmsMastered} / 6`}
            icon={<Award size={24} className="text-yellow-400" />}
            gradient="from-yellow-500/20 to-orange-500/5"
            border="border-yellow-500/20"
          />
          <StatCard 
            title="Avg. Quiz Score" 
            value={`${quizScoreAvg}%`}
            icon={<TrendingUp size={24} className="text-emerald-400" />}
            gradient="from-emerald-500/20 to-teal-500/5"
            border="border-emerald-500/20"
          />
          <StatCard 
            title="Total Time Spent" 
            value={totalTimeSpent}
            icon={<Clock size={24} className="text-indigo-400" />}
            gradient="from-indigo-500/20 to-blue-500/5"
            border="border-indigo-500/20"
          />
          <StatCard 
            title="Learning Streak" 
            value={`${learningStreak} Days`}
            icon={<Zap size={24} className="text-rose-400" />}
            gradient="from-rose-500/20 to-pink-500/5"
            border="border-rose-500/20"
          />
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Progress Bars */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen size={24} className="text-teal-400" />
              Algorithm Mastery
            </h2>
            
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
              {ALGORITHMS.map((algo) => {
                const progress = getAlgoProgress(algo.key);
                const isMastered = data?.algorithms_mastered?.includes(algo.key) || progress === 100;
                return (
                  <ProgressBar 
                    key={algo.key}
                    name={algo.name} 
                    progress={progress} 
                    isMastered={isMastered} 
                  />
                );
              })}
            </div>
          </div>

          {/* Right Column: Recent Activity */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy size={24} className="text-indigo-400" />
              Recent Activity
            </h2>
            
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl max-h-[500px] overflow-y-auto scrollbar-thin">
              {recentActivity.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No activity logged yet. Explore algorithms and take quizzes to build your timeline!
                </div>
              ) : (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-fadeIn">
                      {/* Icon */}
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-900 bg-gray-800 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow flex-none ${activity.type === 'success' ? 'ring-2 ring-emerald-500/50' : 'ring-2 ring-indigo-500/50'}`}>
                        <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-emerald-400' : activity.type === 'quiz' ? 'bg-yellow-400' : 'bg-indigo-400'}`} />
                      </div>
                      
                      {/* Card */}
                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-white/5 border border-white/5 hover:border-white/10 p-4 rounded-xl shadow-lg backdrop-blur-sm transition-all">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-200">{activity.action}</span>
                          <time className="text-xs text-gray-500 mt-1">{activity.time}</time>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

// Utility Components
function StatCard({ title, value, icon, gradient, border }: { title: string, value: string, icon: React.ReactNode, gradient: string, border: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-900/40 border ${border} rounded-2xl p-6 backdrop-blur-xl shadow-2xl transition-transform hover:-translate-y-1 hover:shadow-3xl cursor-default group`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 font-semibold text-sm tracking-wide uppercase">{title}</h3>
          <div className="p-2 bg-gray-800/80 rounded-lg backdrop-blur-md shadow-inner">{icon}</div>
        </div>
        <div className="text-3xl font-black tracking-tight text-white">{value}</div>
      </div>
    </div>
  );
}

function ProgressBar({ name, progress, isMastered = false }: { name: string, progress: number, isMastered?: boolean }) {
  return (
    <div className="space-y-2 group">
      <div className="flex justify-between items-end">
        <span className="font-medium text-gray-200 group-hover:text-white transition-colors">{name}</span>
        <span className="text-sm font-mono text-gray-400">{progress}%</span>
      </div>
      <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
            isMastered 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-500'
          }`}
          style={{ width: `${progress}%` }}
        >
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
    </div>
  );
}

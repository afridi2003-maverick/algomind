"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Code2, Award, Zap, TrendingUp, Trophy } from 'lucide-react';

export default function DashboardPage() {
  const mockStats = {
    algorithmsMastered: 2,
    totalTimeSpent: "4h 15m",
    quizScoreAvg: 85,
    streak: 5,
  };

  const recentActivity = [
    { id: 1, action: "Mastered BFS Algorithm", time: "2 hours ago", type: "success" },
    { id: 2, action: "Completed Dijkstra Quiz - 90%", time: "5 hours ago", type: "quiz" },
    { id: 3, action: "Explored A* Search", time: "1 day ago", type: "explore" },
  ];

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
            <p className="text-gray-400 mt-2 text-lg">Welcome back! Track your algorithm mastery progress.</p>
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
            value={`${mockStats.algorithmsMastered} / 6`}
            icon={<Award size={24} className="text-yellow-400" />}
            gradient="from-yellow-500/20 to-orange-500/5"
            border="border-yellow-500/20"
          />
          <StatCard 
            title="Avg. Quiz Score" 
            value={`${mockStats.quizScoreAvg}%`}
            icon={<TrendingUp size={24} className="text-emerald-400" />}
            gradient="from-emerald-500/20 to-teal-500/5"
            border="border-emerald-500/20"
          />
          <StatCard 
            title="Total Time Spent" 
            value={mockStats.totalTimeSpent}
            icon={<Clock size={24} className="text-indigo-400" />}
            gradient="from-indigo-500/20 to-blue-500/5"
            border="border-indigo-500/20"
          />
          <StatCard 
            title="Learning Streak" 
            value={`${mockStats.streak} Days`}
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
              <ProgressBar name="Breadth-First Search (BFS)" progress={100} isMastered />
              <ProgressBar name="Dijkstra's Algorithm" progress={85} isMastered />
              <ProgressBar name="Depth-First Search (DFS)" progress={40} />
              <ProgressBar name="A* Search" progress={10} />
              <ProgressBar name="Kruskal's Algorithm" progress={0} />
              <ProgressBar name="Bellman-Ford" progress={0} />
            </div>
          </div>

          {/* Right Column: Recent Activity */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy size={24} className="text-indigo-400" />
              Recent Activity
            </h2>
            
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
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

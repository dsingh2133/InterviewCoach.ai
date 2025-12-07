import React from 'react';
import { User, InterviewSession, InterviewContext } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Plus, TrendingUp, Calendar, Trophy, ArrowUpRight, Repeat, Eye } from 'lucide-react';

interface DashboardProps {
  user: User;
  history: InterviewSession[];
  onStartNew: () => void;
  onRetry: (context: InterviewContext) => void;
  onViewReport: (session: InterviewSession) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, history, onStartNew, onRetry, onViewReport }) => {
  // Sort history by date
  const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
  
  // Calculate Stats
  const totalInterviews = history.length;
  const avgScore = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => {
        const score = (curr.report.metrics.clarity + curr.report.metrics.confidence + curr.report.metrics.technicalFit + curr.report.metrics.culturalFit) / 4;
        return acc + score;
      }, 0) / history.length) 
    : 0;

  const bestScore = history.length > 0
    ? Math.round(Math.max(...history.map(s => (s.report.metrics.clarity + s.report.metrics.confidence + s.report.metrics.technicalFit + s.report.metrics.culturalFit) / 4)))
    : 0;

  // Chart Data
  const data = sortedHistory.map((s, index) => ({
    name: `Session ${index + 1}`,
    date: new Date(s.timestamp).toLocaleDateString(),
    score: Math.round((s.report.metrics.clarity + s.report.metrics.confidence + s.report.metrics.technicalFit + s.report.metrics.culturalFit) / 4),
    confidence: s.report.metrics.confidence,
    clarity: s.report.metrics.clarity,
  }));

  return (
    <div className="max-w-7xl mx-auto w-full p-6 animate-fade-in space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {user.name}</h1>
          <p className="text-slate-400 mt-1">Here is how you are progressing in your interview prep.</p>
        </div>
        <button 
          onClick={onStartNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
        >
          <Plus size={20} />
          Start New Interview
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex items-center gap-4">
           <div className="p-4 bg-blue-500/10 rounded-lg text-blue-500">
             <TrendingUp size={24} />
           </div>
           <div>
             <div className="text-slate-400 text-sm font-medium">Average Score</div>
             <div className="text-3xl font-bold text-slate-100">{avgScore}</div>
           </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex items-center gap-4">
           <div className="p-4 bg-green-500/10 rounded-lg text-green-500">
             <Calendar size={24} />
           </div>
           <div>
             <div className="text-slate-400 text-sm font-medium">Total Sessions</div>
             <div className="text-3xl font-bold text-slate-100">{totalInterviews}</div>
           </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex items-center gap-4">
           <div className="p-4 bg-amber-500/10 rounded-lg text-amber-500">
             <Trophy size={24} />
           </div>
           <div>
             <div className="text-slate-400 text-sm font-medium">Best Performance</div>
             <div className="text-3xl font-bold text-slate-100">{bestScore}</div>
           </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-200 mb-6">Progress Over Time</h2>
          {history.length > 0 ? (
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                     itemStyle={{ color: '#60a5fa' }}
                   />
                   <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                   <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500 flex-col gap-2">
              <TrendingUp size={48} className="opacity-20" />
              <p>Complete your first interview to see analytics</p>
            </div>
          )}
        </div>

        {/* Recent History List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col">
           <h2 className="text-xl font-semibold text-slate-200 mb-6">Recent Activity</h2>
           <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px]">
             {sortedHistory.length > 0 ? (
               sortedHistory.reverse().map((s) => (
                 <div key={s.id} className="p-4 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-blue-500/50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-slate-200 line-clamp-1">{s.jobRole || 'General Interview'}</div>
                        <div className="text-xs text-slate-500">{new Date(s.timestamp).toLocaleDateString()}</div>
                      </div>
                      <div className="text-lg font-bold text-blue-400">
                        {Math.round((s.report.metrics.clarity + s.report.metrics.confidence + s.report.metrics.technicalFit + s.report.metrics.culturalFit) / 4)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                           <span className={`px-2 py-0.5 rounded-full ${s.report.metrics.confidence > 70 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                             Confidence: {s.report.metrics.confidence}%
                           </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => onViewReport(s)}
                            className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700"
                          >
                            <Eye size={12} />
                            View
                          </button>
                          
                          {s.context && (
                            <button 
                              onClick={() => onRetry(s.context)}
                              className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded border border-blue-500/30"
                            >
                              <Repeat size={12} />
                              Retry
                            </button>
                          )}
                        </div>
                    </div>
                 </div>
               ))
             ) : (
               <div className="text-center text-slate-500 py-10">No interviews yet</div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};
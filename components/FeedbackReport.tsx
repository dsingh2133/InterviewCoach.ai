import React from 'react';
import { InterviewReport } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { Award, TrendingUp, AlertCircle, RefreshCcw, LayoutDashboard, Repeat } from 'lucide-react';

interface FeedbackReportProps {
  report: InterviewReport | null;
  onRestart: () => void;
  onRetake: () => void;
  onDashboard?: () => void;
}

export const FeedbackReport: React.FC<FeedbackReportProps> = ({ report, onRestart, onRetake, onDashboard }) => {
  if (!report) return null;

  const chartData = [
    { subject: 'Clarity', A: report.metrics.clarity, fullMark: 100 },
    { subject: 'Confidence', A: report.metrics.confidence, fullMark: 100 },
    { subject: 'Tech Fit', A: report.metrics.technicalFit, fullMark: 100 },
    { subject: 'Culture Fit', A: report.metrics.culturalFit, fullMark: 100 },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full p-6 animate-fade-in space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <h2 className="text-3xl font-bold text-slate-100">Performance Analysis</h2>
         <div className="flex flex-wrap justify-center gap-3">
           {onDashboard && (
             <button 
               onClick={onDashboard}
               className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors border border-slate-700"
             >
               <LayoutDashboard size={16} />
               Dashboard
             </button>
           )}
           <button 
             onClick={onRestart}
             className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors border border-slate-700"
           >
             <RefreshCcw size={16} />
             New Setup
           </button>
           <button 
             onClick={onRetake}
             className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors shadow-lg shadow-blue-500/20"
           >
             <Repeat size={16} />
             Practice Again
           </button>
         </div>
      </div>

      {/* Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
         <h3 className="text-xl font-semibold text-blue-400 mb-4">Executive Summary</h3>
         <p className="text-slate-300 leading-relaxed">{report.summary}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         {/* Metrics Visual */}
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg h-80 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Competency Radar</h3>
            <div className="flex-1 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Strengths */}
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-green-400">
               <Award size={20} />
               <h3 className="text-lg font-semibold">Key Strengths</h3>
            </div>
            <ul className="space-y-3">
               {report.strengths.map((s, i) => (
                 <li key={i} className="flex gap-3 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></span>
                    <span>{s}</span>
                 </li>
               ))}
            </ul>
         </div>

         {/* Improvements */}
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-orange-400">
               <TrendingUp size={20} />
               <h3 className="text-lg font-semibold">Areas for Growth</h3>
            </div>
            <ul className="space-y-3">
               {report.improvements.map((s, i) => (
                 <li key={i} className="flex gap-3 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></span>
                    <span>{s}</span>
                 </li>
               ))}
            </ul>
         </div>

         {/* Overall Score */}
         <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center">
            <h3 className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2">Overall Score</h3>
            <div className="text-6xl font-bold text-white">
               {Math.round((report.metrics.clarity + report.metrics.confidence + report.metrics.technicalFit + report.metrics.culturalFit) / 4)}
            </div>
            <div className="text-indigo-400 text-sm mt-2">out of 100</div>
         </div>
      </div>
    </div>
  );
};
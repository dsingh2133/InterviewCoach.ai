import React from 'react';
import { GeneratedQuestion } from '../types';
import { Play, BrainCircuit, Loader2 } from 'lucide-react';

interface PreparationPhaseProps {
  questions: GeneratedQuestion[];
  isLoading: boolean;
  onStartInterview: () => void;
}

export const PreparationPhase: React.FC<PreparationPhaseProps> = ({ questions, isLoading, onStartInterview }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative z-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Analyzing Profile</h2>
          <p className="text-slate-400 mt-2">Generating personalized interview questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full p-6 animate-fade-in flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Preparation Strategy</h2>
          <p className="text-slate-400 mt-1">Review these potential topics before we go live.</p>
        </div>
        <button
          onClick={onStartInterview}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-green-500/20"
        >
          <Play size={20} fill="currentColor" />
          Start Live Interview
        </button>
      </div>

      <div className="grid gap-4 flex-1 overflow-y-auto pb-4">
        {questions.map((q, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-blue-500/50 transition-colors">
            <div className="flex gap-4">
              <div className="bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center text-blue-400 font-bold shrink-0">
                {i + 1}
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-slate-200">{q.question}</h3>
                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                    <BrainCircuit size={14} />
                    Ideal Answer Strategy
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{q.idealAnswerKey}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
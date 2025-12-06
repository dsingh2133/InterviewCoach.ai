import React, { useState } from 'react';
import { SetupPhase } from './components/SetupPhase';
import { PreparationPhase } from './components/PreparationPhase';
import { LiveInterviewSession } from './components/LiveInterviewSession';
import { FeedbackReport } from './components/FeedbackReport';
import { AppStep, InterviewContext, GeneratedQuestion, TranscriptItem, InterviewReport } from './types';
import { generateQuestions, generateInterviewReport } from './services/geminiService';
import { Loader2, LogIn, UserPlus } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [context, setContext] = useState<InterviewContext>({ resume: '', jobDescription: '' });
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSetupComplete = async (resume: string, jobDesc: string) => {
    setContext({ resume, jobDescription: jobDesc });
    setStep(AppStep.PREPARATION);
    setLoading(true);
    
    // Generate questions for prep
    const generated = await generateQuestions({ resume, jobDescription: jobDesc });
    setQuestions(generated);
    setLoading(false);
  };

  const handleStartInterview = () => {
    setStep(AppStep.INTERVIEW);
  };

  const handleEndInterview = async (transcriptItems: TranscriptItem[]) => {
    setLoading(true);
    setStep(AppStep.FEEDBACK);

    // Build plain text transcript for analysis
    const fullTranscript = transcriptItems
        .map(t => `${t.role === 'model' ? 'Interviewer' : 'Candidate'}: ${t.text}`)
        .join('\n');

    const generatedReport = await generateInterviewReport(fullTranscript, context);
    setReport(generatedReport);
    setLoading(false);
  };

  const handleRestart = () => {
    setStep(AppStep.SETUP);
    setContext({ resume: '', jobDescription: '' });
    setQuestions([]);
    setReport(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between relative">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-2 shrink-0 z-10">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-bold text-white text-lg">I</span>
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline">InterviewCoach<span className="text-blue-500">.ai</span></span>
            <span className="font-bold text-xl tracking-tight sm:hidden">IC<span className="text-blue-500">.ai</span></span>
          </div>
          
          {/* Center: Steps (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className={`flex items-center gap-2 transition-colors ${step === AppStep.SETUP ? 'text-blue-400' : ''}`}>
               <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${step === AppStep.SETUP ? 'border-blue-400 bg-blue-400/10' : 'border-slate-700'}`}>1</span> 
               <span>Setup</span>
             </div>
             <div className="w-8 h-[1px] bg-slate-800"></div>
             <div className={`flex items-center gap-2 transition-colors ${step === AppStep.PREPARATION ? 'text-blue-400' : ''}`}>
               <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${step === AppStep.PREPARATION ? 'border-blue-400 bg-blue-400/10' : 'border-slate-700'}`}>2</span>
               <span>Prep</span>
             </div>
             <div className="w-8 h-[1px] bg-slate-800"></div>
             <div className={`flex items-center gap-2 transition-colors ${step === AppStep.INTERVIEW ? 'text-blue-400' : ''}`}>
               <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${step === AppStep.INTERVIEW ? 'border-blue-400 bg-blue-400/10' : 'border-slate-700'}`}>3</span>
               <span>Live</span>
             </div>
             <div className="w-8 h-[1px] bg-slate-800"></div>
             <div className={`flex items-center gap-2 transition-colors ${step === AppStep.FEEDBACK ? 'text-blue-400' : ''}`}>
               <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${step === AppStep.FEEDBACK ? 'border-blue-400 bg-blue-400/10' : 'border-slate-700'}`}>4</span>
               <span>Results</span>
             </div>
          </div>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-3 shrink-0 z-10">
             <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2">
               <LogIn size={16} />
               <span>Sign In</span>
             </button>
             <button className="flex items-center gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-all shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95">
               <UserPlus size={16} />
               <span>Sign Up</span>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* Mobile Steps Indicator */}
        <div className="md:hidden flex items-center justify-center gap-3 py-3 border-b border-slate-800/50 bg-slate-950/30 backdrop-blur-sm sticky top-0 z-40">
           <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</span>
           <div className="flex items-center gap-1.5">
              {[AppStep.SETUP, AppStep.PREPARATION, AppStep.INTERVIEW, AppStep.FEEDBACK].map((s, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-2 bg-slate-800'}`}></div>
              ))}
           </div>
        </div>

        {step === AppStep.SETUP && (
          <SetupPhase onComplete={handleSetupComplete} />
        )}

        {step === AppStep.PREPARATION && (
          <PreparationPhase 
            questions={questions} 
            isLoading={loading} 
            onStartInterview={handleStartInterview} 
          />
        )}

        {step === AppStep.INTERVIEW && (
          <LiveInterviewSession 
            context={context} 
            onEndSession={handleEndInterview} 
          />
        )}

        {step === AppStep.FEEDBACK && (
          loading ? (
            <div className="flex flex-col items-center justify-center flex-1 animate-fade-in">
               <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
               <p className="text-slate-400">Compiling your performance report...</p>
            </div>
          ) : (
            <FeedbackReport 
              report={report} 
              onRestart={handleRestart} 
            />
          )
        )}
      </main>
    </div>
  );
}
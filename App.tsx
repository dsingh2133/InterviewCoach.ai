import React, { useState } from 'react';
import { SetupPhase } from './components/SetupPhase';
import { PreparationPhase } from './components/PreparationPhase';
import { LiveInterviewSession } from './components/LiveInterviewSession';
import { FeedbackReport } from './components/FeedbackReport';
import { AppStep, InterviewContext, GeneratedQuestion, TranscriptItem, InterviewReport } from './types';
import { generateQuestions, generateInterviewReport } from './services/geminiService';
import { Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-lg">I</span>
            </div>
            <span className="font-bold text-xl tracking-tight">InterviewCoach<span className="text-blue-500">.ai</span></span>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
             <div className={`flex items-center gap-2 ${step === AppStep.SETUP ? 'text-blue-400' : ''}`}>
               <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">1</span> Setup
             </div>
             <div className="w-8 h-[1px] bg-slate-800"></div>
             <div className={`flex items-center gap-2 ${step === AppStep.PREPARATION ? 'text-blue-400' : ''}`}>
               <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">2</span> Prep
             </div>
             <div className="w-8 h-[1px] bg-slate-800"></div>
             <div className={`flex items-center gap-2 ${step === AppStep.INTERVIEW ? 'text-blue-400' : ''}`}>
               <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">3</span> Live
             </div>
             <div className="w-8 h-[1px] bg-slate-800"></div>
             <div className={`flex items-center gap-2 ${step === AppStep.FEEDBACK ? 'text-blue-400' : ''}`}>
               <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">4</span> Results
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

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
            <div className="flex flex-col items-center justify-center flex-1">
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
import React, { useState, useEffect } from 'react';
import { SetupPhase } from './components/SetupPhase';
import { PreparationPhase } from './components/PreparationPhase';
import { LiveInterviewSession } from './components/LiveInterviewSession';
import { FeedbackReport } from './components/FeedbackReport';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { AppStep, InterviewContext, GeneratedQuestion, TranscriptItem, InterviewReport, User, InterviewSession } from './types';
import { generateQuestions, generateInterviewReport } from './services/geminiService';
import { Loader2, LogIn, UserPlus, LogOut, LayoutDashboard, AlertCircle } from 'lucide-react';

export default function App() {
  // State
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [context, setContext] = useState<InterviewContext>({ resume: '', jobDescription: '' });
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auth & Data State
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initialize User
  useEffect(() => {
    const storedUser = localStorage.getItem('interview_saarthi_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setStep(AppStep.DASHBOARD);
    }
  }, []);

  // Sync History with User State
  useEffect(() => {
    if (user) {
      const storedHistory = localStorage.getItem('interview_saarthi_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } else {
      setHistory([]);
    }
  }, [user]);

  // Persist History changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('interview_saarthi_history', JSON.stringify(history));
    }
  }, [history, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('interview_saarthi_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('interview_saarthi_user');
    }
  }, [user]);


  const handleSetupComplete = async (resume: string, jobDesc: string) => {
    setContext({ resume, jobDescription: jobDesc });
    setStep(AppStep.PREPARATION);
    setLoading(true);
    setError(null);
    
    try {
      const generated = await generateQuestions({ resume, jobDescription: jobDesc });
      if (generated && generated.length > 0) {
        setQuestions(generated);
      } else {
        throw new Error("Failed to generate questions. Please try again.");
      }
    } catch (err: any) {
      console.error("Setup failed:", err);
      setError(err.message || "A network error occurred. Please check your connection and API key.");
      setStep(AppStep.SETUP); // Go back to setup on error
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = async (storedContext?: InterviewContext) => {
    const activeContext = storedContext || context;
    if (!activeContext.resume || !activeContext.jobDescription) return;

    if (activeContext !== context) {
      setContext(activeContext);
    }

    setStep(AppStep.PREPARATION);
    setLoading(true);
    setError(null);
    
    try {
      // Regenerate questions for a fresh practice session
      const generated = await generateQuestions(activeContext);
      if (generated && generated.length > 0) {
        setQuestions(generated);
      } else {
        throw new Error("Failed to regenerate questions.");
      }
    } catch (err: any) {
      console.error("Retake failed:", err);
      setError(err.message || "Failed to start retake. Please try again.");
      setStep(AppStep.DASHBOARD);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (session: InterviewSession) => {
    setReport(session.report);
    setContext(session.context);
    setStep(AppStep.FEEDBACK);
  };

  const handleStartInterview = () => {
    setStep(AppStep.INTERVIEW);
  };

  const handleEndInterview = async (transcriptItems: TranscriptItem[]) => {
    setLoading(true);
    setStep(AppStep.FEEDBACK);

    try {
      const fullTranscript = transcriptItems
          .map(t => `${t.role === 'model' ? 'Interviewer' : 'Candidate'}: ${t.text}`)
          .join('\n');

      const generatedReport = await generateInterviewReport(fullTranscript, context);
      setReport(generatedReport);

      // Save to history if logged in
      if (user && generatedReport) {
        const newSession: InterviewSession = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          jobRole: context.jobDescription.split(' ').slice(0, 5).join(' ') + '...', // Simple truncated title
          report: generatedReport,
          context: context // Save context for retries
        };
        setHistory(prev => [...prev, newSession]);
      }
    } catch (err) {
      console.error("Report generation failed:", err);
      // Even if report fails, we stay on feedback page but might show partial state?
      // For now, let's just leave report null, Feedback component handles null report
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setStep(AppStep.SETUP);
    setContext({ resume: '', jobDescription: '' });
    setQuestions([]);
    setReport(null);
    setError(null);
  };

  const handleGoToDashboard = () => {
    setStep(AppStep.DASHBOARD);
    setContext({ resume: '', jobDescription: '' });
    setQuestions([]);
    setReport(null);
    setError(null);
  }

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    // Merge local history if any? For now just overwrite or keep local
    if (step === AppStep.SETUP) {
       setStep(AppStep.DASHBOARD);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setHistory([]);
    localStorage.removeItem('interview_saarthi_history');
    setStep(AppStep.SETUP);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin} 
      />

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between relative">
          
          {/* Left: Logo */}
          <div 
            className="flex items-center gap-2 shrink-0 z-10 cursor-pointer"
            onClick={() => user ? setStep(AppStep.DASHBOARD) : setStep(AppStep.SETUP)}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-bold text-white text-lg">I</span>
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline">InterviewSaarthi<span className="text-blue-500">.ai</span></span>
            <span className="font-bold text-xl tracking-tight sm:hidden">IS<span className="text-blue-500">.ai</span></span>
          </div>
          
          {/* Center: Steps (Hidden on dashboard) */}
          {step !== AppStep.DASHBOARD && (
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
          )}

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-3 shrink-0 z-10">
             {user ? (
               <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setStep(AppStep.DASHBOARD)}
                   className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${step === AppStep.DASHBOARD ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 hover:text-white'}`}
                 >
                   <LayoutDashboard size={18} />
                   <span className="hidden sm:inline">Dashboard</span>
                 </button>
                 <div className="h-6 w-[1px] bg-slate-800"></div>
                 <button 
                   onClick={handleLogout}
                   className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
                   title="Sign Out"
                 >
                   <LogOut size={18} />
                 </button>
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-sm font-bold shadow-md">
                   {user.name.charAt(0).toUpperCase()}
                 </div>
               </div>
             ) : (
               <>
                 <button 
                   onClick={() => setIsAuthModalOpen(true)}
                   className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2"
                 >
                   <LogIn size={16} />
                   <span>Sign In</span>
                 </button>
                 <button 
                   onClick={() => setIsAuthModalOpen(true)}
                   className="flex items-center gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-all shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
                 >
                   <UserPlus size={16} />
                   <span>Sign Up</span>
                 </button>
               </>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* Error Toast */}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up w-full max-w-md px-4">
             <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg shadow-xl flex items-start gap-3 backdrop-blur-md">
               <AlertCircle className="shrink-0 text-red-500" size={20} />
               <div className="flex-1 text-sm">{error}</div>
               <button onClick={() => setError(null)} className="text-red-400 hover:text-red-100">
                 &times;
               </button>
             </div>
          </div>
        )}

        {/* Mobile Steps Indicator */}
        {step !== AppStep.DASHBOARD && (
          <div className="md:hidden flex items-center justify-center gap-3 py-3 border-b border-slate-800/50 bg-slate-950/30 backdrop-blur-sm sticky top-0 z-40">
             <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</span>
             <div className="flex items-center gap-1.5">
                {[AppStep.SETUP, AppStep.PREPARATION, AppStep.INTERVIEW, AppStep.FEEDBACK].map((s, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-2 bg-slate-800'}`}></div>
                ))}
             </div>
          </div>
        )}

        {step === AppStep.DASHBOARD && user && (
          <Dashboard 
            user={user} 
            history={history} 
            onStartNew={handleRestart}
            onRetry={handleRetake} 
            onViewReport={handleViewReport}
          />
        )}

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
               {user && <p className="text-slate-500 text-sm mt-2">Saving to your profile...</p>}
            </div>
          ) : (
            <FeedbackReport 
              report={report} 
              onRestart={handleRestart} 
              onRetake={() => handleRetake()}
              onDashboard={user ? handleGoToDashboard : undefined}
            />
          )
        )}
      </main>
    </div>
  );
}
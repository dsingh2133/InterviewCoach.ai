import React, { useState, useEffect } from 'react';
import { SetupPhase } from './components/SetupPhase';
import { PreparationPhase } from './components/PreparationPhase';
import { LiveInterviewSession } from './components/LiveInterviewSession';
import { FeedbackReport } from './components/FeedbackReport';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { AppStep, InterviewContext, GeneratedQuestion, TranscriptItem, InterviewReport, User, InterviewSession } from './types';
import { generateQuestions, generateInterviewReport } from './services/geminiService';
import { Loader2, LogIn, UserPlus, LogOut, LayoutDashboard, AlertCircle, Menu } from 'lucide-react';

export default function App() {
  // State
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
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
    } else {
      setStep(AppStep.LANDING);
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (step !== AppStep.LANDING) {
      setStep(AppStep.LANDING);
      // Wait for React to render the LandingPage before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

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
    if (step === AppStep.LANDING || step === AppStep.SETUP) {
       setStep(AppStep.DASHBOARD);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setHistory([]);
    localStorage.removeItem('interview_saarthi_history');
    setStep(AppStep.LANDING);
  };

  return (
    <div className="min-h-screen bg-[#050A15] text-slate-100 flex flex-col font-sans overflow-x-hidden">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin} 
      />

      {/* Header */}
      <header className={`border-b border-slate-900 bg-[#050A15]/80 backdrop-blur-md sticky top-0 z-50 ${step === AppStep.LANDING ? 'border-transparent' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Left: Logo */}
          <div 
            className="flex items-center gap-3 shrink-0 cursor-pointer"
            onClick={() => user ? setStep(AppStep.DASHBOARD) : setStep(AppStep.LANDING)}
          >
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="font-bold text-[#050A15] text-xl">S</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white hidden sm:inline">InterviewSaarthi</span>
          </div>
          
          {/* Middle: Navigation (Visible on Landing/Setup mostly) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="hover:text-white transition-colors cursor-pointer">Features</a>
            <a href="#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')} className="hover:text-white transition-colors cursor-pointer">How It Works</a>
            <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="hover:text-white transition-colors cursor-pointer">Pricing</a>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 shrink-0">
             {user ? (
               <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setStep(AppStep.DASHBOARD)}
                   className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${step === AppStep.DASHBOARD ? 'text-cyan-400 bg-cyan-950/30' : 'text-slate-400 hover:text-white'}`}
                 >
                   <LayoutDashboard size={18} />
                   <span className="hidden sm:inline">Dashboard</span>
                 </button>
                 <button 
                   onClick={handleLogout}
                   className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
                   title="Sign Out"
                 >
                   <LogOut size={18} />
                 </button>
                 <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                   {user.name.charAt(0).toUpperCase()}
                 </div>
               </div>
             ) : (
               <>
                 <button 
                   onClick={() => setIsAuthModalOpen(true)}
                   className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
                 >
                   Sign In
                 </button>
                 <button 
                   onClick={() => setStep(AppStep.SETUP)}
                   className="hidden sm:flex items-center justify-center px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-orange-500/20"
                 >
                   Start Free
                 </button>
                 {/* Mobile Menu Icon Placeholder */}
                 <button className="sm:hidden text-slate-300">
                    <Menu size={24} />
                 </button>
               </>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full">
        {/* Error Toast */}
        {error && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up w-full max-w-md px-4">
             <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl shadow-2xl flex items-start gap-3 backdrop-blur-md">
               <AlertCircle className="shrink-0 text-red-500" size={20} />
               <div className="flex-1 text-sm">{error}</div>
               <button onClick={() => setError(null)} className="text-red-400 hover:text-red-100">
                 &times;
               </button>
             </div>
          </div>
        )}

        {step === AppStep.LANDING && (
          <LandingPage 
            onStart={() => setStep(AppStep.SETUP)} 
            onSignIn={() => setIsAuthModalOpen(true)} 
          />
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
               <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
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
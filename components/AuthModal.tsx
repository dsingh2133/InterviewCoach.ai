import React, { useState } from 'react';
import { X, Mail, User, ArrowRight, Loader2, Linkedin, ArrowLeft } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserType) => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 23 23">
    <path fill="#f35325" d="M1 1h10v10H1z"/>
    <path fill="#81bc06" d="M12 1h10v10H12z"/>
    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
    <path fill="#ffba08" d="M12 12h10v10H12z"/>
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State for social login flow
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const [socialEmail, setSocialEmail] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setSocialEmail('');
    setPendingProvider(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const user: UserType = {
        id: crypto.randomUUID(),
        name: isSignUp ? name : 'Demo User',
        email: email,
        joinedAt: Date.now()
      };
      onLogin(user);
      resetForm();
      onClose();
    }, 1000);
  };

  const initSocialLogin = (provider: string) => {
    // If user has already entered an email in the main form, use it directly
    if (email.trim()) {
        executeSocialLogin(provider, email);
    } else {
        // Otherwise, prompt for email
        setPendingProvider(provider);
        setSocialEmail('');
    }
  };

  const executeSocialLogin = (provider: string, emailToUse: string) => {
    setLoading(true);
    
    // Simulate Social Auth
    setTimeout(() => {
      const user: UserType = {
        id: crypto.randomUUID(),
        name: isSignUp && name ? name : `User (${provider})`,
        email: emailToUse,
        joinedAt: Date.now()
      };
      onLogin(user);
      resetForm();
      onClose();
    }, 1500);
  };

  const handleSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingProvider && socialEmail) {
        executeSocialLogin(pendingProvider, socialEmail);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={handleClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-fade-in-up">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Social Email Entry Step */}
        {pendingProvider ? (
          <div className="animate-fade-in">
             <button 
               onClick={() => setPendingProvider(null)}
               className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm"
             >
               <ArrowLeft size={16} />
               Back to options
             </button>
             
             <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                   Continue with {pendingProvider}
                </h2>
                <p className="text-slate-400">
                   Please confirm the email address associated with your account.
                </p>
             </div>

             <form onSubmit={handleSocialSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      required
                      autoFocus
                      value={socialEmail}
                      onChange={(e) => setSocialEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder={`your-email@example.com`}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg mt-2 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
             </form>
          </div>
        ) : (
          /* Main Auth View */
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isSignUp ? 'Create an Account' : 'Welcome Back'}
              </h2>
              <p className="text-slate-400">
                {isSignUp 
                  ? 'Join InterviewSaarthi to track your progress.' 
                  : 'Sign in to access your interview history.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      required={isSignUp}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg mt-2 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button 
                type="button"
                onClick={() => initSocialLogin('Google')}
                disabled={loading}
                className="flex items-center justify-center py-2.5 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {loading && pendingProvider === 'Google' ? <Loader2 className="animate-spin text-slate-400" size={20} /> : <GoogleIcon />}
              </button>
              
              <button 
                type="button"
                onClick={() => initSocialLogin('Microsoft')}
                disabled={loading}
                className="flex items-center justify-center py-2.5 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {loading && pendingProvider === 'Microsoft' ? <Loader2 className="animate-spin text-slate-400" size={20} /> : <MicrosoftIcon />}
              </button>
              
              <button 
                type="button"
                onClick={() => initSocialLogin('LinkedIn')}
                disabled={loading}
                className="flex items-center justify-center py-2.5 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {loading && pendingProvider === 'LinkedIn' ? <Loader2 className="animate-spin text-slate-400" size={20} /> : <Linkedin size={20} className="text-[#0a66c2] fill-current" />}
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-slate-500">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
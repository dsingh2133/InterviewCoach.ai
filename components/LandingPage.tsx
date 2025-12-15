import React from 'react';
import { ArrowRight, CheckCircle2, Play, Upload, Mic, BrainCircuit, Check, FileText, Activity, Target, Database, TrendingUp, Settings, FileBarChart } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onSignIn }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#050A15] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 flex flex-col items-center text-center">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="animate-fade-in-up space-y-8 max-w-5xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-cyan-400 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            AI-Powered Interview Preparation
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Your Personal <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              AI Interview Coach
            </span>
          </h1>
          
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Practice with hyper-personalized interviews tailored to your resume and
            job description. Get real-time feedback and land your dream job.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={onStart}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-lg font-semibold text-lg shadow-lg shadow-orange-500/20 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Start Free Interview
              <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white rounded-lg font-semibold text-lg transition-all flex items-center gap-2">
              <Play size={20} fill="currentColor" />
              Watch Demo
            </button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mt-12 text-slate-400 text-sm font-medium">
             <div className="flex items-center gap-2 px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-full">
                <Upload size={16} className="text-cyan-400" />
                Upload Resume + JD
             </div>
             <div className="flex items-center gap-2 px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-full">
                <Mic size={16} className="text-cyan-400" />
                Voice Interviews
             </div>
             <div className="flex items-center gap-2 px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-full">
                <BrainCircuit size={16} className="text-cyan-400" />
                AI Feedback
             </div>
          </div>
          
          {/* Visual Mockup Area */}
          <div className="mt-16 relative mx-auto max-w-4xl w-full aspect-[16/9] bg-slate-900/50 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm group">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050A15]/90"></div>
             <div className="absolute bottom-10 left-10 flex items-center gap-4">
                <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                   <Mic size={32} className="text-white" />
                </div>
                <div className="text-left">
                   <div className="text-cyan-400 font-medium text-sm mb-1">Behavioral Question • Round 1 of 5</div>
                   <div className="text-2xl font-semibold text-white">"Tell me about a challenge you overcame."</div>
                </div>
             </div>
             {/* Decorative Elements */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-slate-700/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-slate-700/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#02040a] relative overflow-hidden scroll-mt-24">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 max-w-3xl mx-auto">
                <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-orange-500 uppercase bg-orange-500/10 rounded-full">
                    Why Choose Us
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 whitespace-nowrap">
                    Master Every Stage of the Interview
                </h2>
                <p className="text-slate-400 text-lg">
                    From technical deep dives to behavioral questions, our AI coach provides the comprehensive training you need to succeed.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Feature 1 */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:bg-slate-900/60 hover:border-cyan-500/30 transition-all group">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                        <Mic size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Real-time Voice AI</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Experience natural, conversational interviews. Our AI adapts to your pace, interrupts naturally, and simulates a real human interviewer.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:bg-slate-900/60 hover:border-blue-500/30 transition-all group">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Resume Analysis</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Upload your resume and job description. The system generates questions specifically targeting your experience gaps and role requirements.
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:bg-slate-900/60 hover:border-purple-500/30 transition-all group">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                        <Activity size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Instant Feedback</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Get a detailed scorecard immediately after your session. We analyze your confidence, clarity, technical accuracy, and cultural fit.
                    </p>
                </div>

                {/* Feature 4 */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:bg-slate-900/60 hover:border-orange-500/30 transition-all group">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                        <Target size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">STAR Method Coaching</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Learn to structure your answers effectively. Our AI guides you to use the Situation, Task, Action, Result framework for maximum impact.
                    </p>
                </div>

                {/* Feature 5 */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:bg-slate-900/60 hover:border-green-500/30 transition-all group">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
                        <Database size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Vast Question Bank</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Access thousands of role-specific questions generated from real tech, management, and creative job descriptions across the globe.
                    </p>
                </div>

                {/* Feature 6 */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:bg-slate-900/60 hover:border-pink-500/30 transition-all group">
                    <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                        <TrendingUp size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Progress Tracking</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Monitor your improvement over time with our detailed dashboard. Visualize your growth in confidence and answer quality.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-[#050A15] scroll-mt-24">
         <div className="max-w-[90rem] mx-auto">
             <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold text-white whitespace-nowrap">From Nervous to Confident in 5 Steps</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                   A simple, effective journey to interview mastery.
                </p>
             </div>
             
             <div className="flex flex-wrap justify-center gap-3 relative z-10">
                {/* Step 1 */}
                <div className="w-full md:w-[calc(33.333%-1rem)] lg:w-[calc(20%-0.6rem)] min-w-[200px] bg-[#0B1221] border border-slate-800 p-4 rounded-2xl text-center flex flex-col items-center hover:border-cyan-500/50 transition-colors shadow-lg group">
                   <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-cyan-400 mb-4 text-lg font-bold relative z-10 shadow-xl group-hover:scale-110 transition-transform">
                      01
                   </div>
                   <div className="mb-3 bg-cyan-500/10 p-2.5 rounded-xl text-cyan-400">
                      <Upload size={20} />
                   </div>
                   <h3 className="text-base font-bold text-white mb-2">Upload Resume & JD</h3>
                   <p className="text-slate-400 text-xs leading-relaxed">
                      AI extracts your skills, experience, and the job requirements to create personalized questions.
                   </p>
                </div>

                {/* Step 2 */}
                <div className="w-full md:w-[calc(33.333%-1rem)] lg:w-[calc(20%-0.6rem)] min-w-[200px] bg-[#0B1221] border border-slate-800 p-4 rounded-2xl text-center flex flex-col items-center hover:border-purple-500/50 transition-colors shadow-lg group">
                   <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-purple-400 mb-4 text-lg font-bold relative z-10 shadow-xl group-hover:scale-110 transition-transform">
                      02
                   </div>
                   <div className="mb-3 bg-purple-500/10 p-2.5 rounded-xl text-purple-400">
                      <Settings size={20} />
                   </div>
                   <h3 className="text-base font-bold text-white mb-2">Choose Interview Mode</h3>
                   <p className="text-slate-400 text-xs leading-relaxed">
                      Select voice/text mode, interview type (HR, Technical, Behavioral), and difficulty level.
                   </p>
                </div>

                {/* Step 3 */}
                <div className="w-full md:w-[calc(33.333%-1rem)] lg:w-[calc(20%-0.6rem)] min-w-[200px] bg-[#0B1221] border border-slate-800 p-4 rounded-2xl text-center flex flex-col items-center hover:border-orange-500/50 transition-colors shadow-lg group">
                   <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-orange-400 mb-4 text-lg font-bold relative z-10 shadow-xl group-hover:scale-110 transition-transform">
                      03
                   </div>
                   <div className="mb-3 bg-orange-500/10 p-2.5 rounded-xl text-orange-400">
                      <Mic size={20} />
                   </div>
                   <h3 className="text-base font-bold text-white mb-2">Practice the Interview</h3>
                   <p className="text-slate-400 text-xs leading-relaxed">
                      Engage with our AI interviewer. Get real-time hints and dynamic follow-up questions.
                   </p>
                </div>

                {/* Step 4 */}
                <div className="w-full md:w-[calc(33.333%-1rem)] lg:w-[calc(20%-0.6rem)] min-w-[200px] bg-[#0B1221] border border-slate-800 p-4 rounded-2xl text-center flex flex-col items-center hover:border-green-500/50 transition-colors shadow-lg group">
                   <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-green-400 mb-4 text-lg font-bold relative z-10 shadow-xl group-hover:scale-110 transition-transform">
                      04
                   </div>
                   <div className="mb-3 bg-green-500/10 p-2.5 rounded-xl text-green-400">
                      <FileBarChart size={20} />
                   </div>
                   <h3 className="text-base font-bold text-white mb-2">Receive Feedback</h3>
                   <p className="text-slate-400 text-xs leading-relaxed">
                      Get detailed scores on communication, confidence, and domain knowledge with improvement tips.
                   </p>
                </div>

                {/* Step 5 */}
                <div className="w-full md:w-[calc(33.333%-1rem)] lg:w-[calc(20%-0.6rem)] min-w-[200px] bg-[#0B1221] border border-slate-800 p-4 rounded-2xl text-center flex flex-col items-center hover:border-pink-500/50 transition-colors shadow-lg group">
                   <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-pink-400 mb-4 text-lg font-bold relative z-10 shadow-xl group-hover:scale-110 transition-transform">
                      05
                   </div>
                   <div className="mb-3 bg-pink-500/10 p-2.5 rounded-xl text-pink-400">
                      <TrendingUp size={20} />
                   </div>
                   <h3 className="text-base font-bold text-white mb-2">Track Progress</h3>
                   <p className="text-slate-400 text-xs leading-relaxed">
                      Monitor your performance over time. See strengths grow and weaknesses improve.
                   </p>
                </div>
             </div>
         </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-[#050A15] relative scroll-mt-24">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] left-[5%] w-96 h-96 bg-blue-900/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[20%] right-[5%] w-96 h-96 bg-cyan-900/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
             <h2 className="text-3xl md:text-5xl font-bold text-white">Simple, Transparent Pricing</h2>
             <p className="text-slate-400 text-lg max-w-2xl mx-auto">
               Choose the plan that fits your career goals. No hidden fees. Cancel anytime.
             </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             {/* Free Plan */}
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 flex flex-col hover:border-slate-700 transition-colors">
                <div className="mb-6">
                   <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                   <div className="text-4xl font-bold text-white mb-1">Free</div>
                   <p className="text-slate-500 text-sm">Forever free for basics.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                   <li className="flex items-start gap-3 text-slate-300">
                      <Check size={18} className="text-cyan-500 mt-1 shrink-0" />
                      <span>3 AI Interviews per month</span>
                   </li>
                   <li className="flex items-start gap-3 text-slate-300">
                      <Check size={18} className="text-cyan-500 mt-1 shrink-0" />
                      <span>Basic Performance Summary</span>
                   </li>
                   <li className="flex items-start gap-3 text-slate-300">
                      <Check size={18} className="text-cyan-500 mt-1 shrink-0" />
                      <span>Standard Voice Models</span>
                   </li>
                </ul>
                <button 
                  onClick={onStart}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors border border-slate-700"
                >
                  Get Started
                </button>
             </div>

             {/* Pro Plan */}
             <div className="relative bg-[#0B1221] border border-orange-500/50 rounded-2xl p-8 flex flex-col shadow-2xl shadow-orange-500/10 transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                   Most Popular
                </div>
                <div className="mb-6">
                   <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                   <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">₹999</span>
                      <span className="text-slate-500 text-sm">/month</span>
                   </div>
                   <p className="text-orange-400 text-sm mt-1">Accelerate your prep.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                   <li className="flex items-start gap-3 text-white">
                      <div className="bg-orange-500/20 p-1 rounded-full">
                        <Check size={14} className="text-orange-500" />
                      </div>
                      <span>Unlimited AI Interviews</span>
                   </li>
                   <li className="flex items-start gap-3 text-white">
                      <div className="bg-orange-500/20 p-1 rounded-full">
                        <Check size={14} className="text-orange-500" />
                      </div>
                      <span>Detailed Metric Analytics</span>
                   </li>
                   <li className="flex items-start gap-3 text-white">
                      <div className="bg-orange-500/20 p-1 rounded-full">
                        <Check size={14} className="text-orange-500" />
                      </div>
                      <span>Advanced Question Bank</span>
                   </li>
                   <li className="flex items-start gap-3 text-white">
                      <div className="bg-orange-500/20 p-1 rounded-full">
                        <Check size={14} className="text-orange-500" />
                      </div>
                      <span>Priority Support</span>
                   </li>
                </ul>
                <button 
                  onClick={onSignIn}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-lg font-bold shadow-lg shadow-orange-500/20 transition-all"
                >
                  Upgrade to Pro
                </button>
             </div>

             {/* Enterprise Plan */}
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 flex flex-col hover:border-slate-700 transition-colors">
                <div className="mb-6">
                   <h3 className="text-xl font-bold text-white mb-2">Campus</h3>
                   <div className="text-4xl font-bold text-white mb-1">Custom</div>
                   <p className="text-slate-500 text-sm">For colleges & institutions.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                   <li className="flex items-start gap-3 text-slate-300">
                      <Check size={18} className="text-cyan-500 mt-1 shrink-0" />
                      <span>Bulk Student Accounts</span>
                   </li>
                   <li className="flex items-start gap-3 text-slate-300">
                      <Check size={18} className="text-cyan-500 mt-1 shrink-0" />
                      <span>Placement Dashboard</span>
                   </li>
                   <li className="flex items-start gap-3 text-slate-300">
                      <Check size={18} className="text-cyan-500 mt-1 shrink-0" />
                      <span>Custom Question Sets</span>
                   </li>
                   <li className="flex items-start gap-3 text-slate-300">
                      <Check size={18} className="text-cyan-500 mt-1 shrink-0" />
                      <span>Dedicated Account Manager</span>
                   </li>
                </ul>
                <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors border border-slate-700">
                  Contact Sales
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#02040a] pt-16 pb-8">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            <div className="lg:col-span-2 space-y-4">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                   <span className="font-bold text-white">S</span>
                 </div>
                 <span className="font-bold text-xl text-white">InterviewSaarthi</span>
               </div>
               <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                 Your AI-powered interview coach. Practice, improve, and land your dream job with confidence.
               </p>
               <div className="flex gap-4 pt-2">
                  <a href="#" className="text-slate-500 hover:text-white transition-colors">Twitter</a>
                  <a href="#" className="text-slate-500 hover:text-white transition-colors">LinkedIn</a>
                  <a href="#" className="text-slate-500 hover:text-white transition-colors">Instagram</a>
               </div>
            </div>
            
            <div>
               <h4 className="font-semibold text-white mb-4">Product</h4>
               <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a></li>
                  <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Question Library</a></li>
               </ul>
            </div>
            
            <div>
               <h4 className="font-semibold text-white mb-4">Company</h4>
               <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
               </ul>
            </div>
            
             <div>
               <h4 className="font-semibold text-white mb-4">Resources</h4>
               <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Interview Tips</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">STAR Method Guide</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a></li>
               </ul>
            </div>

             <div>
               <h4 className="font-semibold text-white mb-4">Legal</h4>
               <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Cookie Policy</a></li>
               </ul>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>&copy; 2025 InterviewSaarthi. All rights reserved.</div>
            <div className="flex items-center gap-1">
               Made with <span className="text-red-500">❤️</span> in India
            </div>
         </div>
      </footer>
    </div>
  );
};
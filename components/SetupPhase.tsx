import React, { useState } from 'react';
import { Upload, FileText, Briefcase, ArrowRight, Sparkles } from 'lucide-react';

interface SetupPhaseProps {
  onComplete: (resume: string, jobDesc: string) => void;
}

export const SetupPhase: React.FC<SetupPhaseProps> = ({ onComplete }) => {
  const [resume, setResume] = useState('');
  const [jobDesc, setJobDesc] = useState('');

  const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          setResume(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const isReady = resume.length > 20 && jobDesc.length > 20;

  return (
    <div className="max-w-5xl mx-auto w-full p-6 animate-fade-in flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-center mb-10 space-y-3">
        <h1 className="text-4xl font-bold text-white">
          Configure Your Session
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Add your details below to generate a hyper-personalized interview plan.
        </p>
      </div>

      <div className="w-full grid md:grid-cols-2 gap-8 mb-10">
        {/* Resume Section */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col shadow-xl hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
                <FileText size={24} className="text-cyan-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Resume</h2>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
             <div className="relative group">
                <input 
                  type="file" 
                  id="resume-upload" 
                  className="hidden" 
                  accept=".txt,.md"
                  onChange={handleFileRead}
                />
                <label 
                  htmlFor="resume-upload" 
                  className="flex items-center justify-center gap-2 w-full p-4 border border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-cyan-500 hover:text-cyan-400 cursor-pointer transition-all bg-slate-900/50 hover:bg-slate-900"
                >
                  <Upload size={18} />
                  <span>Upload Resume (TXT/MD)</span>
                </label>
             </div>
             
             <textarea 
               className="flex-1 w-full bg-[#050A15] border border-slate-800 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 resize-none transition-all placeholder:text-slate-600"
               placeholder="Or paste your resume text here..."
               value={resume}
               onChange={(e) => setResume(e.target.value)}
               rows={8}
             />
          </div>
        </div>

        {/* Job Description Section */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col shadow-xl hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-blue-500/10 rounded-lg">
                <Briefcase size={24} className="text-blue-400" />
             </div>
            <h2 className="text-xl font-semibold text-white">Job Description</h2>
          </div>
          
          <div className="flex-1 flex flex-col">
             <textarea 
               className="flex-1 w-full bg-[#050A15] border border-slate-800 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500 resize-none h-full transition-all placeholder:text-slate-600"
               placeholder="Paste the job description here..."
               value={jobDesc}
               onChange={(e) => setJobDesc(e.target.value)}
               rows={10}
             />
          </div>
        </div>
      </div>

      <button
        onClick={() => onComplete(resume, jobDesc)}
        disabled={!isReady}
        className={`group relative flex items-center gap-3 px-10 py-5 rounded-xl text-lg font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
          isReady 
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30' 
            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
        }`}
      >
        <Sparkles size={20} className={isReady ? 'text-white' : 'text-slate-500'} />
        Start AI Interview
        {isReady && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
      </button>
      
      {!isReady && (
        <p className="text-slate-500 text-sm mt-4">
           Please provide both resume and job description to continue.
        </p>
      )}
    </div>
  );
};
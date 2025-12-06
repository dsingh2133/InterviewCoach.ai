import React, { useState } from 'react';
import { Upload, FileText, Briefcase, ArrowRight } from 'lucide-react';

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

  // Reduced threshold for easier testing
  const isReady = resume.length > 20 && jobDesc.length > 20;

  return (
    <div className="max-w-4xl mx-auto w-full p-6 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          InterviewSaarthi
        </h1>
        <p className="text-slate-400 text-lg">
          Master your next interview with real-time, voice-based AI simulation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Resume Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col shadow-lg">
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <FileText size={24} />
            <h2 className="text-xl font-semibold">Your Resume</h2>
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
                  className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-slate-700 rounded-lg text-slate-400 hover:border-blue-500 hover:text-blue-400 cursor-pointer transition-all"
                >
                  <Upload size={18} />
                  <span>Upload Text File</span>
                </label>
             </div>
             
             <textarea 
               className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500 resize-none"
               placeholder="Or paste your resume text here..."
               value={resume}
               onChange={(e) => setResume(e.target.value)}
               rows={10}
             />
          </div>
        </div>

        {/* Job Description Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col shadow-lg">
          <div className="flex items-center gap-2 mb-4 text-indigo-400">
            <Briefcase size={24} />
            <h2 className="text-xl font-semibold">Job Description</h2>
          </div>
          
          <div className="flex-1 flex flex-col">
             <textarea 
               className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 resize-none h-full"
               placeholder="Paste the job description here..."
               value={jobDesc}
               onChange={(e) => setJobDesc(e.target.value)}
               rows={12}
             />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center pb-10">
        <button
          onClick={() => onComplete(resume, jobDesc)}
          disabled={!isReady}
          className={`flex items-center gap-3 px-8 py-4 rounded-full text-lg font-semibold transition-all ${
            isReady 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          Generate Plan & Start
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
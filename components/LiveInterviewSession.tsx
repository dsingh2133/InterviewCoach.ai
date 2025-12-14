import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, PhoneOff, Lightbulb, Activity, BarChart3, MessageSquare } from 'lucide-react';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { InterviewContext, TranscriptItem } from '../types';

interface LiveInterviewSessionProps {
  context: InterviewContext;
  onEndSession: (transcript: TranscriptItem[]) => void;
}

export const LiveInterviewSession: React.FC<LiveInterviewSessionProps> = ({ context, onEndSession }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Fake stats for UI cloning
  const [confidenceScore, setConfidenceScore] = useState(85);
  const [questionCount, setQuestionCount] = useState(0);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Logic Refs
  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    startSession();
    
    // Poll to check if AI is currently speaking
    const speakingInterval = window.setInterval(() => {
        setIsAiSpeaking(scheduledSourcesRef.current.size > 0);
    }, 100);

    // Timer
    timerRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
        // Simulate changing confidence score slightly
        setConfidenceScore(prev => {
            const change = Math.random() > 0.7 ? (Math.random() - 0.5) * 2 : 0;
            return Math.min(99, Math.max(70, Math.round(prev + change)));
        });
    }, 1000);

    return () => {
        cleanupSession();
        window.clearInterval(speakingInterval);
        if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = async () => {
    try {
      setStatus('Requesting Microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      setStatus('Connecting...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      aiRef.current = ai;

      // Audio Output Context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });

      // Audio Input Context
      inputContextRef.current = new AudioContextClass({ sampleRate: 16000 });

      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `
            You are a professional hiring manager. 
            CANDIDATE RESUME: "${context.resume.substring(0, 2000)}"
            JOB DESCRIPTION: "${context.jobDescription.substring(0, 2000)}"

            Start by asking: "Tell me about a time when you had to lead a team through a challenging project. How did you handle conflicts?"
            Wait for the answer, then follow up or move to the next question.
            Keep responses concise.
          `,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      };

      const sessionPromise = ai.live.connect({
        ...config,
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setStatus('Live');
            setupAudioInput(stream);
          },
          onmessage: handleMessage,
          onclose: () => {
            setIsConnected(false);
            setStatus('Disconnected');
          },
          onerror: (err) => {
            console.error("Gemini Live API Error:", err);
            setStatus('Error');
          },
        }
      });
      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error('Failed to start session:', error);
      setStatus('Connection Failed');
    }
  };

  const setupAudioInput = (stream: MediaStream) => {
    if (!inputContextRef.current) return;
    
    const inputCtx = inputContextRef.current;
    const source = inputCtx.createMediaStreamSource(stream);
    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      if (isMuted) return;

      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      setVolumeLevel(Math.min(1, rms * 8));

      const pcmBlob = createBlob(inputData);
      
      if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then((session: any) => {
            session.sendRealtimeInput({ media: pcmBlob });
        }).catch(err => {
            console.error("Error sending audio input:", err);
        });
      }
    };

    source.connect(processor);
    processor.connect(inputCtx.destination);

    sourceRef.current = source;
    processorRef.current = processor;
  };

  const handleMessage = async (message: LiveServerMessage) => {
    const serverContent = message.serverContent;
    if (serverContent) {
      if (serverContent.modelTurn) {
        const parts = serverContent.modelTurn.parts;
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                playAudioChunk(part.inlineData.data);
            }
        }
      }

      if (serverContent.outputTranscription?.text) {
         currentOutputTransRef.current += serverContent.outputTranscription.text;
      }
      
      if (serverContent.inputTranscription?.text) {
          currentInputTransRef.current += serverContent.inputTranscription.text;
      }

      if (serverContent.turnComplete) {
         const newItems: TranscriptItem[] = [];
         if (currentInputTransRef.current.trim()) {
            newItems.push({ role: 'user', text: currentInputTransRef.current.trim(), timestamp: Date.now() });
            currentInputTransRef.current = '';
         }
         if (currentOutputTransRef.current.trim()) {
            newItems.push({ role: 'model', text: currentOutputTransRef.current.trim(), timestamp: Date.now() });
            currentOutputTransRef.current = '';
            setQuestionCount(prev => prev + 1); // Increment mock question count
         }
         
         if (newItems.length > 0) {
             setTranscript(prev => [...prev, ...newItems]);
         }
      }
      
      if (serverContent.interrupted) {
         stopAllAudio();
      }
    }
  };

  const playAudioChunk = async (base64Audio: string) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') try { await ctx.resume(); } catch(e) {}
    
    try {
        const arrayBuffer = decode(base64Audio);
        const audioBuffer = await decodeAudioData(arrayBuffer, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        
        const currentTime = ctx.currentTime;
        if (nextStartTimeRef.current < currentTime) nextStartTimeRef.current = currentTime;
        
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
        scheduledSourcesRef.current.add(source);
        source.onended = () => scheduledSourcesRef.current.delete(source);
    } catch (e) { console.error("Audio decode error", e); }
  };

  const stopAllAudio = () => {
    scheduledSourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
    scheduledSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const cleanupSession = () => {
    if (sessionPromiseRef.current) sessionPromiseRef.current.then((s: any) => { if (s.close) s.close(); }).catch(() => {});
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
    if (sourceRef.current) { sourceRef.current.disconnect(); sourceRef.current = null; }
    if (inputContextRef.current) { inputContextRef.current.close(); inputContextRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
  };

  const handleEnd = () => {
    cleanupSession();
    onEndSession(transcript);
  };

  // Determine what to show in the "Question" area. 
  // If we have a transcript, show the last model message. If empty, show initial prompt logic.
  const lastModelMessage = transcript.slice().reverse().find(t => t.role === 'model');
  const displayQuestion = lastModelMessage ? lastModelMessage.text : "Tell me about a time when you had to lead a team through a challenging project. How did you handle conflicts?";

  return (
    <div className="flex flex-col h-full w-full bg-[#050A15] relative overflow-hidden">
        {/* Floating Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-blue-900/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[10%] left-[10%] w-80 h-80 bg-cyan-900/10 rounded-full blur-[80px]"></div>
        </div>

        {/* Top: Question Display */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-8 pb-4">
            <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-medium text-slate-100 leading-snug">
                   "{displayQuestion}"
                </h2>
                
                {/* Hint Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D1B15] border border-orange-900/30 rounded-full text-orange-400 text-sm">
                   <Lightbulb size={16} />
                   <span>Use the STAR method to structure your answer</span>
                </div>
            </div>
        </div>

        {/* Middle: Visualizer & Stats */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-5xl mx-auto px-6">
             {/* Stats Overlay - Left */}
             <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden md:block">
                <div className="bg-[#0F172A]/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl w-48 shadow-xl">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                         <Activity size={20} />
                      </div>
                      <span className="text-slate-400 text-sm">Confidence</span>
                   </div>
                   <div className="text-3xl font-bold text-white">{confidenceScore}%</div>
                   <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${confidenceScore}%` }}></div>
                   </div>
                </div>
             </div>

             {/* Stats Overlay - Right */}
             <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block">
                <div className="bg-[#0F172A]/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl w-48 shadow-xl">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                         <MessageSquare size={20} />
                      </div>
                      <span className="text-slate-400 text-sm">Questions</span>
                   </div>
                   <div className="text-3xl font-bold text-white">{12000 + questionCount}+</div>
                   <div className="text-xs text-slate-500 mt-1">Database Access</div>
                </div>
             </div>

             {/* Main Audio Interaction Area */}
             <div className="w-full max-w-2xl bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-2xl flex items-center gap-4">
                 {/* Mic Icon */}
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-orange-500 text-white'}`}>
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                 </div>

                 {/* Visualizer Bar */}
                 <div className="flex-1 flex flex-col justify-center h-full">
                    <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
                       <span>{isConnected ? (isAiSpeaking ? 'AI Speaking...' : 'Recording...') : 'Connecting...'}</span>
                       <span>{formatTime(elapsedTime)}</span>
                    </div>
                    
                    {/* Horizontal Waveform Simulation */}
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex items-center gap-0.5 px-1">
                       {Array.from({ length: 40 }).map((_, i) => (
                          <div 
                            key={i}
                            className={`w-1 rounded-full transition-all duration-75 ${isAiSpeaking ? 'bg-blue-400' : 'bg-cyan-400'}`}
                            style={{ 
                               height: isAiSpeaking 
                                  ? `${Math.random() * 100}%` 
                                  : volumeLevel > 0.02 
                                    ? `${Math.max(20, Math.random() * volumeLevel * 300)}%` 
                                    : '20%',
                               opacity: isAiSpeaking ? 1 : volumeLevel > 0.02 ? 1 : 0.3
                            }}
                          />
                       ))}
                    </div>
                 </div>
             </div>
        </div>

        {/* Bottom Controls */}
        <div className="w-full bg-[#02040a]/50 backdrop-blur-md border-t border-slate-900 p-6 flex justify-center gap-4 z-20">
             <button 
                onClick={() => setIsMuted(!isMuted)}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors border border-slate-700"
             >
                {isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
             </button>
             <button 
                onClick={handleEnd}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2"
             >
                <PhoneOff size={18} />
                End Session
             </button>
        </div>
    </div>
  );
};
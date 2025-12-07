import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, PhoneOff, Volume2, User, Bot, Activity } from 'lucide-react';
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
  const [status, setStatus] = useState('Initializing...');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  
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

  useEffect(() => {
    startSession();
    return () => cleanupSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSession = async () => {
    try {
      setStatus('Requesting Microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      setStatus('Connecting to Gemini...');
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
            You are a professional, friendly, and observant hiring manager. 
            You are conducting a job interview with a candidate.
            
            CANDIDATE RESUME: "${context.resume.substring(0, 2000)}"
            JOB DESCRIPTION: "${context.jobDescription.substring(0, 2000)}"

            Your goal is to assess their fit for this role based on the provided documents.
            Start by briefly introducing yourself as the hiring manager and asking an initial ice-breaker or introductory question.
            Keep your responses concise (1-3 sentences) to allow the candidate to speak more.
            Do not mention you are an AI. Treat this as a real voice call.
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
            setStatus('Interview in Progress');
            setupAudioInput(stream);
          },
          onmessage: handleMessage,
          onclose: () => {
            setIsConnected(false);
            setStatus('Disconnected');
          },
          onerror: (err) => {
            console.error("Gemini Live API Error:", err);
            setStatus('Error occurred');
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
      if (isMuted) return; // Software mute

      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      setVolumeLevel(Math.min(1, rms * 5)); // Amplify for visual

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
    // 1. Handle Transcription
    const serverContent = message.serverContent;
    if (serverContent) {
      if (serverContent.modelTurn) {
        // Audio handling
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
         // Commit transcriptions
         const newItems: TranscriptItem[] = [];
         if (currentInputTransRef.current.trim()) {
            newItems.push({
                role: 'user',
                text: currentInputTransRef.current.trim(),
                timestamp: Date.now()
            });
            currentInputTransRef.current = '';
         }
         if (currentOutputTransRef.current.trim()) {
            newItems.push({
                role: 'model',
                text: currentOutputTransRef.current.trim(),
                timestamp: Date.now()
            });
            currentOutputTransRef.current = '';
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
    
    // Ensure context is running (required for some browsers if not started by user interaction)
    if (ctx.state === 'suspended') {
        try { await ctx.resume(); } catch(e) {}
    }
    
    try {
        const arrayBuffer = decode(base64Audio);
        const audioBuffer = await decodeAudioData(arrayBuffer, ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        
        // Schedule
        const currentTime = ctx.currentTime;
        // Ensure we don't schedule in the past
        if (nextStartTimeRef.current < currentTime) {
            nextStartTimeRef.current = currentTime;
        }
        
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
        
        scheduledSourcesRef.current.add(source);
        
        source.onended = () => {
            scheduledSourcesRef.current.delete(source);
        };
    } catch (e) {
        console.error("Audio decode error", e);
    }
  };

  const stopAllAudio = () => {
    scheduledSourcesRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    scheduledSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const cleanupSession = () => {
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then((s: any) => {
             if (s.close) s.close();
        }).catch(() => {});
    }

    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    if (inputContextRef.current) {
        inputContextRef.current.close();
        inputContextRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
  };

  const handleEnd = () => {
    cleanupSession();
    // Pass whatever transcript we have
    onEndSession(transcript);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col items-center justify-between h-full max-w-2xl mx-auto py-10 w-full animate-fade-in">
       {/* Status Header */}
       <div className="text-center space-y-2">
         <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${isConnected ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'}`}>
            <Activity size={14} className={isConnected ? "animate-pulse" : ""} />
            {status}
         </div>
       </div>

       {/* Visualizer Area */}
       <div className="relative flex items-center justify-center flex-1 w-full my-8">
          {/* Avatar / Visualizer */}
          <div className="relative w-64 h-64 flex items-center justify-center">
             {/* Ripple effects */}
             <div 
               className="absolute inset-0 bg-blue-500 rounded-full opacity-20 blur-xl transition-all duration-75"
               style={{ transform: `scale(${1 + volumeLevel})` }} 
             />
             <div 
               className="absolute inset-4 bg-indigo-500 rounded-full opacity-20 blur-lg transition-all duration-100"
               style={{ transform: `scale(${1 + volumeLevel * 0.8})` }} 
             />
             
             {/* Core Circle */}
             <div className="relative z-10 w-48 h-48 bg-slate-900 border-4 border-slate-700 rounded-full flex items-center justify-center shadow-2xl overflow-hidden">
                <Bot size={64} className="text-slate-500" />
                {/* Simulated Audio Waveform overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 flex items-end justify-center gap-1 pb-8 opacity-50">
                   {[1,2,3,4,5].map(i => (
                      <div 
                        key={i} 
                        className="w-2 bg-blue-400 rounded-full transition-all duration-150"
                        style={{ height: `${20 + Math.random() * 50 * (isConnected ? 1 : 0)}%` }} 
                      />
                   ))}
                </div>
             </div>
          </div>
       </div>

       {/* Transcript Preview (Last message) */}
       <div className="h-24 w-full text-center px-4 mb-8">
         {transcript.length > 0 && (
             <p className="text-slate-400 text-sm italic animate-fade-in-up">
               "{transcript[transcript.length - 1].text}"
             </p>
         )}
       </div>

       {/* Controls */}
       <div className="flex items-center gap-6">
          <button 
            onClick={toggleMute}
            className={`p-6 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
          >
             {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
          </button>

          <button 
             onClick={handleEnd}
             className="px-8 py-6 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-red-500/20 flex items-center gap-3 transition-all transform hover:scale-105"
          >
             <PhoneOff size={24} />
             End Interview
          </button>
          
          <div className="p-6 rounded-full bg-slate-800 text-slate-500">
             <Volume2 size={32} />
          </div>
       </div>
    </div>
  );
};
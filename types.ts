export enum AppStep {
  SETUP = 'SETUP',
  PREPARATION = 'PREPARATION',
  INTERVIEW = 'INTERVIEW',
  FEEDBACK = 'FEEDBACK'
}

export interface InterviewContext {
  resume: string;
  jobDescription: string;
}

export interface InterviewMetrics {
  clarity: number;
  confidence: number;
  technicalFit: number;
  culturalFit: number;
}

export interface InterviewReport {
  summary: string;
  strengths: string[];
  improvements: string[];
  metrics: InterviewMetrics;
}

export interface GeneratedQuestion {
  question: string;
  idealAnswerKey: string;
}

// Minimal type for transcript items used internally
export interface TranscriptItem {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

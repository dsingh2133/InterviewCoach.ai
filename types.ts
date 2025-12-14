export enum AppStep {
  LANDING = 'LANDING',
  SETUP = 'SETUP',
  PREPARATION = 'PREPARATION',
  INTERVIEW = 'INTERVIEW',
  FEEDBACK = 'FEEDBACK',
  DASHBOARD = 'DASHBOARD'
}

export interface User {
  id: string;
  name: string;
  email: string;
  joinedAt: number;
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

export interface InterviewSession {
  id: string;
  timestamp: number;
  jobRole: string; // Extracted or inferred from JD
  report: InterviewReport;
  context: InterviewContext; // Added to allow retrying specific sessions
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
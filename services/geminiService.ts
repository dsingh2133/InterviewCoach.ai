import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedQuestion, InterviewContext, InterviewReport } from "../types";

// Helper to get AI instance
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean JSON text (remove markdown code blocks)
const cleanJsonText = (text: string): string => {
  return text.replace(/```json\n?|```/g, '').trim();
};

export const generateQuestions = async (context: InterviewContext): Promise<GeneratedQuestion[]> => {
  const ai = getAI();
  const prompt = `
    Based on the following resume and job description, generate 5 potential interview questions.
    Resume: ${context.resume.substring(0, 5000)}...
    Job Description: ${context.jobDescription.substring(0, 5000)}...
    
    Provide a brief ideal answer key for each.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  idealAnswerKey: { type: Type.STRING }
                },
                required: ["question", "idealAnswerKey"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const cleanedText = cleanJsonText(text);
    const parsed = JSON.parse(cleanedText);
    
    // Handle both root array (legacy behavior) and object wrapper (new behavior)
    if (Array.isArray(parsed)) {
      return parsed as GeneratedQuestion[];
    } else if (parsed.questions && Array.isArray(parsed.questions)) {
      return parsed.questions as GeneratedQuestion[];
    }
    
    return [];
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error; // Re-throw to be handled by UI
  }
};

export const generateInterviewReport = async (transcript: string, context: InterviewContext): Promise<InterviewReport | null> => {
  const ai = getAI();
  const prompt = `
    Analyze the following interview transcript between a Hiring Manager (AI) and a Candidate (User).
    
    Context:
    Resume Summary: ${context.resume.substring(0, 1000)}...
    Job Description Summary: ${context.jobDescription.substring(0, 1000)}...

    Transcript:
    ${transcript}

    Provide a JSON report with:
    1. A summary of the performance.
    2. List of strengths (max 3).
    3. List of areas for improvement (max 3).
    4. Numeric scores (0-100) for clarity, confidence, technicalFit, and culturalFit.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            metrics: {
              type: Type.OBJECT,
              properties: {
                clarity: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER },
                technicalFit: { type: Type.NUMBER },
                culturalFit: { type: Type.NUMBER }
              },
              required: ["clarity", "confidence", "technicalFit", "culturalFit"]
            }
          },
          required: ["summary", "strengths", "improvements", "metrics"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const cleanedText = cleanJsonText(text);
    return JSON.parse(cleanedText) as InterviewReport;
  } catch (error) {
    console.error("Error generating report:", error);
    return null;
  }
};
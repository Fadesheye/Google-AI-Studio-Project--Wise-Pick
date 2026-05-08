import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ProCon {
  type: 'pro' | 'con';
  text: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ComparisonCriterion {
  name: string;
  values: { option: string; text: string }[];
}

export interface ComparisonData {
  options: string[];
  criteria: ComparisonCriterion[];
}

export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface DecisionAnalysis {
  prosCons: ProCon[];
  comparison: ComparisonData;
  swot: SWOTData;
  summary: string;
}

export async function analyzeDecision(decision: string): Promise<DecisionAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are the "Wise Pick" engine—a neutral, analytical decision partner. 
    Your goal is to help the user make an informed choice by providing objective perspectives.
    
    Avoid taking a side or making a specific recommendation unless the user's prompt explicitly asks for one.
    Use clear, professional language.
    
    Analyze the following decision and provide a comprehensive breakdown for three distinct views:
    1. A balanced Pros/Cons list (limit to 5-7 items per side).
    2. A Comparison Table (if binary choice, compare "Action" vs "Status Quo" or "Yes" vs "No").
    3. A SWOT analysis for high-stakes context.
    
    Decision: "${decision}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prosCons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["pro", "con"] },
                text: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ["high", "medium", "low"] }
              },
              required: ["type", "text", "impact"]
            }
          },
          comparison: {
            type: Type.OBJECT,
            properties: {
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              criteria: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    values: { 
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          option: { type: Type.STRING },
                          text: { type: Type.STRING }
                        },
                        required: ["option", "text"]
                      }
                    }
                  },
                  required: ["name", "values"]
                }
              }
            },
            required: ["options", "criteria"]
          },
          swot: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["strengths", "weaknesses", "opportunities", "threats"]
          },
          summary: { type: Type.STRING }
        },
        required: ["prosCons", "comparison", "swot", "summary"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Failed to generate analysis");
  }

  try {
    return JSON.parse(text) as DecisionAnalysis;
  } catch (e) {
    console.error("Malformed JSON in Gemini response:", text);
    throw new Error("The wisdom returned in an unreadable format. Please try again.");
  }
}

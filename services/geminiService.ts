
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SmartResponse } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getMathExplanation = async (expression: string, result: string): Promise<SmartResponse> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze this calculation: ${expression} = ${result}. 
    Provide a deep conceptual explanation, practical applications, and step-by-step breakdown. 
    If appropriate, provide 10 coordinate points (x, y) for a visual representation.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          visualData: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              points: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        },
        required: ["explanation", "steps"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { explanation: response.text || "Analysis failed.", steps: [] };
  }
};

export const solveWithVision = async (base64Image: string, mimeType: string): Promise<SmartResponse> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: "Solve the mathematical problem in this image. Provide the answer, detailed steps, and a conceptual explanation." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          result: { type: Type.STRING }
        },
        required: ["explanation", "steps", "result"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const solveComplexProblem = async (problem: string): Promise<SmartResponse> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Solve: "${problem}". Provide explanation, steps, and result.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          result: { type: Type.STRING }
        },
        required: ["explanation", "steps", "result"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

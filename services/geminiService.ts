
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, VideoAnalysisResult, ChatMessage, Language, AspectRatio } from "../types";

// Helper function to safely retrieve the API key
const getApiKey = (): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) {
    return (import.meta as any).env.VITE_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

const getLanguageName = (code: Language): string => {
  const map: Record<Language, string> = {
    en: 'English',
    hi: 'Hindi',
    ta: 'Tamil',
    te: 'Telugu',
    kn: 'Kannada'
  };
  return map[code] || 'English';
};

export const analyzeRetinalImage = async (base64Image: string, language: Language = 'en'): Promise<AnalysisResult> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Configuration Error: API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const langName = getLanguageName(language);
  
  const prompt = `
    As a Senior Ophthalmology AI Specialist, provide a quantitative and qualitative analysis of this retinal fundus scan.
    
    IMPORTANT: Provide the response text (narratives, recommendations) in the following language: ${langName}.
    
    CRITICAL INSTRUCTION:
    In the 'detailedPathology' field, provide a narrative that describes the visual evidence as if analyzing the image layers. 
    Explicitly mention what would be seen in a contrast-enhanced view (CLAHE) versus the original view. 
    Describe specific features like:
    1. Optic Disc appearance.
    2. Vascular structure (tortuosity, beading).
    3. Distinct pathology: Microaneurysms (red dots), Hemorrhages (blot/flame), Exudates (hard/soft yellow patches).
    
    REQUIRED METRICS:
    - Detection: (Detected/Not Detected) - Translate this value to ${langName} if possible, or keep English clinical terms.
    - Severity: (No DR, Mild, Moderate, Severe, Proliferative) - Translate this value to ${langName} if possible.
    - Health Score: 0-100 (100 = Optimal health, 0 = High pathology)
    - Severity Index: 0-100 (0 = No DR, 100 = Advanced Proliferative)
    - Progression Risk: 0-100% (Probability of condition worsening within 12 months)
    - Confidence Score: 0-100% (AI reliability for this specific scan quality)
    
    CLINICAL METRICS (Numeric/Counts):
    - Microaneurysms Count (Approximate number or 'None')
    - Hemorrhage Risk (Percentage 0-100)
    - Exudate Density (Percentage 0-100)
    - Macular Edema Risk (Percentage 0-100)

    Format your response as a valid JSON object strictly following the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for deep analysis
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Enable Thinking Mode for complex medical reasoning
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detection: { type: Type.STRING },
            severity: { type: Type.STRING },
            keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendation: { type: Type.STRING },
            detailedPathology: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            severityIndex: { type: Type.NUMBER },
            healthScore: { type: Type.NUMBER },
            progressionRisk: { type: Type.NUMBER },
            clinicalMetrics: {
              type: Type.OBJECT,
              properties: {
                microaneurysmsCount: { type: Type.STRING },
                hemorrhageRisk: { type: Type.NUMBER },
                exudateDensity: { type: Type.NUMBER },
                macularEdemaRisk: { type: Type.NUMBER },
              },
              required: ['microaneurysmsCount', 'hemorrhageRisk', 'exudateDensity', 'macularEdemaRisk'],
            },
          },
          required: ['detection', 'severity', 'keyFindings', 'recommendation', 'detailedPathology', 'confidenceScore', 'severityIndex', 'healthScore', 'progressionRisk', 'clinicalMetrics'],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI model.");
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw new Error(`Analysis failed: ${error.message || "Ensure the scan shows the retina clearly."}`);
  }
};

export const analyzeRetinalVideo = async (base64Video: string, language: Language = 'en'): Promise<VideoAnalysisResult> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Configuration Error: API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const langName = getLanguageName(language);
  
  const prompt = `
    You are an expert Ophthalmologist analyzing a medical video.
    IMPORTANT: Provide the response in: ${langName}.
    Analyze specifically for signs of Diabetic Retinopathy (DR).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'video/mp4', data: base64Video.split(',')[1] || base64Video } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            findings: { type: Type.ARRAY, items: { type: Type.STRING } },
            drDetails: {
              type: Type.OBJECT,
              properties: {
                detected: { type: Type.BOOLEAN },
                severity: { type: Type.STRING },
                evidence: { type: Type.STRING },
              },
              required: ['detected', 'severity', 'evidence']
            },
            recommendations: { type: Type.STRING },
          },
          required: ['summary', 'findings', 'drDetails', 'recommendations'],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI model.");
    return JSON.parse(resultText) as VideoAnalysisResult;
  } catch (error: any) {
    throw new Error(`Video analysis failed: ${error.message}`);
  }
};

export const getChatResponse = async (
  history: ChatMessage[], 
  newMessage: string, 
  language: Language = 'en',
  useSearch: boolean = false
): Promise<{ text: string, sources?: { title: string, uri: string }[] }> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key missing");
    
    const ai = new GoogleGenAI({ apiKey });
    const langName = getLanguageName(language);

    let context = "";
    if (history.length > 0) {
        context = "Previous conversation:\n" + history.slice(-5).map(h => `${h.role}: ${h.text}`).join("\n") + "\n\n";
    }
    const fullPrompt = `${context}Current user question: ${newMessage}`;

    if (useSearch) {
        // Use gemini-3-flash-preview with Google Search for grounded/current info
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: fullPrompt,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: `You are a medical research assistant. Use Google Search to find the latest information. Respond in ${langName}.`
            }
        });
        
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web)
            .filter((web: any) => web && web.uri && web.title)
            .map((web: any) => ({ title: web.title, uri: web.uri }));

        return { text: response.text || "No response generated.", sources };
    } else {
        // Use gemini-3-pro-preview for high-quality assistant interactions
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: fullPrompt,
            config: {
                systemInstruction: `You are a friendly, empathetic, and highly knowledgeable Ophthalmology Assistant. Help patients understand Diabetic Retinopathy. Keep answers concise and supportive. ALWAYS reply in ${langName}.`
            }
        });

        return { text: response.text || "No response generated." };
    }
}

export const generateMedicalImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });

    // Use gemini-3-pro-image-preview for high quality image generation
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
            parts: [{ text: prompt }]
        },
        config: {
            imageConfig: {
                aspectRatio: aspectRatio,
                imageSize: "1K"
            }
        }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("No image generated.");
};


import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AnalysisResult, VideoAnalysisResult, ChatMessage, Language } from "../types";

// Helper function to safely retrieve the API key from various environments
const getApiKey = (): string => {
  // Check for Vite environment variable (most likely for Vercel/client-side)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) {
    return (import.meta as any).env.VITE_API_KEY;
  }
  // Check for standard Node/CRA environment variable
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

// Helper to map Language code to full name for the AI
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
  
  if (!apiKey) {
    throw new Error("Configuration Error: API Key is missing. Please set VITE_API_KEY in your environment variables.");
  }

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
      model: 'gemini-3-flash-preview',
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
    if (error.message && (error.message.includes("API Key") || error.message.includes("VITE_API_KEY"))) {
      throw error;
    }
    throw new Error(`Analysis failed: ${error.message || "Ensure the scan shows the retina clearly."}`);
  }
};

export const analyzeRetinalVideo = async (base64Video: string, language: Language = 'en'): Promise<VideoAnalysisResult> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("Configuration Error: API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const langName = getLanguageName(language);
  
  const prompt = `
    You are an expert Ophthalmologist analyzing a medical video (such as a dynamic fundus examination, OCT scan, or educational video about retinal health).
    
    IMPORTANT: Provide the response in the following language: ${langName}.

    Your task is to analyze this video specifically for signs of Diabetic Retinopathy (DR).
    
    Provide a detailed report in JSON format containing:
    1. 'summary': A concise overview of what is shown in the video.
    2. 'findings': A list of visual observations (e.g., "Clear view of optic disc", "Presence of cotton wool spots").
    3. 'drDetails': An object containing:
       - 'detected': boolean indicating if DR signs are present.
       - 'severity': Estimated severity (None, Mild, Moderate, Severe, Proliferative).
       - 'evidence': A detailed paragraph describing the specific signs of DR observed (hemorrhages, microaneurysms, neovascularization, hard exudates) and explaining their significance in detail.
    4. 'recommendations': Clinical next steps.

    If the video is not clear or relevant, state that in the summary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'video/mp4',
              data: base64Video.split(',')[1] || base64Video,
            },
          },
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
    console.error("Video Analysis Error:", error);
    if (error.message && (error.message.includes("API Key") || error.message.includes("VITE_API_KEY"))) {
      throw error;
    }
    throw new Error(`Video analysis failed: ${error.message}`);
  }
};

export const getChatResponse = async (history: ChatMessage[], newMessage: string, language: Language = 'en'): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key missing");
    
    const ai = new GoogleGenAI({ apiKey });
    
    const langName = getLanguageName(language);

    const chat: Chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: `You are a friendly, empathetic, and highly knowledgeable Ophthalmology Assistant. You help patients understand Diabetic Retinopathy, their symptoms, and general eye health. Keep answers concise, easy to read, and supportive. Use simple language but remain medically accurate. If a user describes severe symptoms like sudden vision loss, pain, or flashing lights, advise them to see a doctor immediately. ALWAYS reply in ${langName}.`
        }
    });

    let context = "";
    if (history.length > 0) {
        context = "Previous conversation:\n" + history.slice(-5).map(h => `${h.role}: ${h.text}`).join("\n") + "\n\nCurrent user question:\n";
    }

    const response = await chat.sendMessage({
        message: context + newMessage
    });

    return response.text;
}

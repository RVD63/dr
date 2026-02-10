
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeRetinalImage = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    As a Senior Ophthalmology AI Specialist, provide a quantitative and qualitative analysis of this retinal fundus scan.
    
    REQUIRED METRICS:
    - Detection: (Detected/Not Detected)
    - Severity: (No DR, Mild, Moderate, Severe, Proliferative)
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
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Medical analysis failed. Ensure the scan shows the retina clearly.");
  }
};

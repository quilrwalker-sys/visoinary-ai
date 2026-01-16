
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

export interface AnalysisResult {
  summary: string;
  details: string;
  objects: string[];
  colors: string[];
  textFound: string | null;
  mood: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai = new GoogleGenAI({ apiKey: (process as any).env.API_KEY });

  async analyzeImage(base64Data: string, mimeType: string): Promise<AnalysisResult> {
    const prompt = "Analise esta imagem em detalhes. Forneça um resumo curto, uma descrição detalhada, uma lista de objetos identificados, a paleta de cores predominantes (códigos hex), qualquer texto que consiga ler e o clima/vibe geral da imagem.";

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              details: { type: Type.STRING },
              objects: { type: Type.ARRAY, items: { type: Type.STRING } },
              colors: { type: Type.ARRAY, items: { type: Type.STRING } },
              textFound: { type: Type.STRING, nullable: true },
              mood: { type: Type.STRING }
            },
            required: ["summary", "details", "objects", "colors", "mood"]
          }
        }
      });

      return JSON.parse(response.text) as AnalysisResult;
    } catch (error) {
      console.error("AI Analysis Error:", error);
      throw error;
    }
  }
}

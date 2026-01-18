
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";

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
  async analyzeImage(base64Data: string, mimeType: string, mode: 'flash' | 'pro' = 'flash'): Promise<AnalysisResult> {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("API_KEY não disponível no ambiente.");
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Configuração baseada no modo
      // Modo 'flash' desativa o pensamento para velocidade máxima
      // Modo 'pro' (padrão do gemini-2.5-flash quando omitido) permite pensamento profundo
      const config: any = {
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
      };

      if (mode === 'flash') {
        config.thinkingConfig = { thinkingBudget: 0 };
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: `Analise esta imagem em Português. ${mode === 'pro' ? 'Forneça uma análise extremamente profunda e detalhada.' : 'Seja direto e conciso.'} Retorne APENAS um JSON com: summary, details, objects (lista), colors (hex codes), textFound, mood.` }
            ]
          }
        ],
        config
      });

      const text = response.text;
      if (!text) throw new Error("A IA não retornou dados.");
      return JSON.parse(text) as AnalysisResult;
    } catch (error: any) {
      console.error("Erro no serviço de IA:", error);
      throw new Error(error.message || "Falha na comunicação com o Gemini.");
    }
  }

  isConfigured(): boolean {
    return !!process.env.API_KEY;
  }
}

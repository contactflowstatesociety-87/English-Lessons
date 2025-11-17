
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Assume API key is set in the environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY || 'MISSING_API_KEY' });

export const geminiService = {
  generateText: async (prompt: string): Promise<string> => {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating text:", error);
      return "Sorry, I couldn't generate a response right now.";
    }
  },

  generateTextWithThinking: async (prompt: string): Promise<string> => {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 32768 },
        }
      });
      return response.text;
    } catch (error) {
      console.error("Error generating text with thinking:", error);
      return "Sorry, I couldn't generate a thoughtful response right now.";
    }
  },
  
  generateTextWithSearch: async (prompt: string): Promise<{ text: string, sources: any[] }> => {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });
      
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      return { text: response.text, sources };
    } catch (error) {
      console.error("Error generating text with search:", error);
      return { text: "Sorry, I couldn't get up-to-date information right now.", sources: [] };
    }
  },

  generateAudio: async (text: string): Promise<string | null> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating audio:", error);
        return null;
    }
  }
};

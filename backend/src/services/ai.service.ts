import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
class AIService {
  ai: GoogleGenAI;
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY
    });
  }

  async generateContent(prompt: string) {
    if (!prompt) throw new Error("Prompt не указан");

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      return response.text;
    } catch (err) {
      console.error("Ошибка Gemini API:", err);
      throw err;
    }
  }
  
  async generateImage(prompt: string, saveToFile = false): Promise<Buffer> {
    if (!prompt) throw new Error("Prompt не указан");

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: prompt,
      });

      const candidate = response.candidates?.[0];
      if (!candidate) throw new Error("Нет кандидатов в ответе AI");

      const parts = candidate.content?.parts;
      if (!parts || parts.length === 0) throw new Error("Нет контента в ответе AI");

      const imagePart = parts.find(part => part.inlineData?.data);
      if (!imagePart || !imagePart.inlineData?.data)
        throw new Error("Картинка не найдена в ответе AI");

      const buffer = Buffer.from(imagePart.inlineData.data, "base64");

      if (saveToFile) {
        const fileName = "f1-generated-image.png";
        fs.writeFileSync(fileName, buffer);
        console.log(`Image saved as ${fileName}`);
      }

      return buffer;
    } catch (err) {
      console.error("Ошибка Gemini API (image):", err);
      throw err;
    }
  }
}

export const aiService = new AIService();

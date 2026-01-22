import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import { logger } from "../utils/log";

class AIService {
  ai: GoogleGenAI;

  constructor() {
    if (!process.env.GOOGLE_API_KEY) {
      logger.error("GOOGLE_API_KEY не задан в env");
      throw new Error("GOOGLE_API_KEY не задан");
    }

    this.ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    logger.info("AIService инициализирован");
  }

  async generateContent(prompt: string) {
    if (!prompt) {
      logger.warn("generateContent вызван без prompt");
      throw new Error("Prompt не указан");
    }

    try {
      logger.debug("Gemini generateContent start", { prompt });

      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      logger.info("Gemini generateContent success");
      return response.text;
    } catch (err) {
      logger.error("Ошибка Gemini API (text)", { err });
      throw err;
    }
  }

  async generateImage(prompt: string, saveToFile = false): Promise<Buffer> {
    if (!prompt) {
      logger.warn("generateImage вызван без prompt");
      throw new Error("Prompt не указан");
    }

    try {
      logger.debug("Gemini generateImage start", { prompt, saveToFile });

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: prompt,
      });

      const candidate = response.candidates?.[0];
      if (!candidate) {
        logger.error("Нет candidates в ответе AI");
        throw new Error("Нет кандидатов в ответе AI");
      }

      const parts = candidate.content?.parts;
      if (!parts || parts.length === 0) {
        logger.error("Нет parts в ответе AI");
        throw new Error("Нет контента в ответе AI");
      }

      const imagePart = parts.find((part) => part.inlineData?.data);
      if (!imagePart || !imagePart.inlineData?.data) {
        logger.error("Картинка не найдена в ответе AI");
        throw new Error("Картинка не найдена в ответе AI");
      }

      const buffer = Buffer.from(imagePart.inlineData.data, "base64");

      if (saveToFile) {
        const fileName = "f1-generated-image.png";
        fs.writeFileSync(fileName, buffer);
        logger.info("Image saved", { fileName });
      }

      logger.info("Gemini generateImage success");
      return buffer;
    } catch (err) {
      logger.error("Ошибка Gemini API (image)", { err });
      throw err;
    }
  }
}

export const aiService = new AIService();

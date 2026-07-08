import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import { logger } from "../utils/log";
import { aiQueue, AITextJob, AIImageJob, QueueJobType } from "./queue.service";
import { redis } from "../redis";

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

    // Проверяем кэш
    const cacheKey = `ai:text:${Buffer.from(prompt).toString('base64').slice(0, 50)}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const size = Buffer.byteLength(cached, 'utf-8');
        logger.info("📤 [AI] Text generation from Redis cache", {
          key: cacheKey,
          size: `${(size / 1024).toFixed(2)} KB`,
          promptLength: prompt.length,
        });
        return cached;
      }
    } catch (err) {
      logger.warn("[AI] Failed to check cache:", {
        error: err instanceof Error ? err.message : String(err),
        key: cacheKey,
      });
    }

    try {
      logger.debug("🔄 [AI] Generating text with Gemini", { 
        promptLength: prompt.length,
        model: "gemini-3-flash-preview",
      });

      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const result = response.text;

      // Кэшируем результат на 7 дней
      if (result) {
        const size = Buffer.byteLength(result, 'utf-8');
        await redis.setex(cacheKey, 7 * 24 * 60 * 60, result)
          .then(() => {
            logger.info("📥 [AI] Text generation cached to Redis", {
              key: cacheKey,
              size: `${(size / 1024).toFixed(2)} KB`,
              ttl: '7 days',
              promptLength: prompt.length,
            });
          })
          .catch((err) => logger.error("[AI] Failed to cache text:", {
            error: err instanceof Error ? err.message : String(err),
            key: cacheKey,
          }));
      }

      logger.info("✅ [AI] Text generation completed");
      return result;
    } catch (err) {
      logger.error("❌ [AI] Gemini API error (text)", { 
        error: err instanceof Error ? err.message : String(err),
        promptLength: prompt.length,
      });
      throw err;
    }
  }

  async generateImage(prompt: string, saveToFile = false): Promise<Buffer> {
    if (!prompt) {
      logger.warn("generateImage вызван без prompt");
      throw new Error("Prompt не указан");
    }

    // Проверяем кэш
    const cacheKey = `ai:image:${Buffer.from(prompt).toString('base64').slice(0, 50)}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const buffer = Buffer.from(cached, 'base64');
        const size = buffer.length;
        logger.info("📤 [AI] Image generation from Redis cache", {
          key: cacheKey,
          size: `${(size / 1024).toFixed(2)} KB`,
          promptLength: prompt.length,
        });
        return buffer;
      }
    } catch (err) {
      logger.warn("[AI] Failed to check image cache:", {
        error: err instanceof Error ? err.message : String(err),
        key: cacheKey,
      });
    }

    try {
      logger.debug("🔄 [AI] Generating image with Gemini", { 
        promptLength: prompt.length,
        model: "gemini-2.5-flash-image",
      });

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: prompt,
      });

      const candidate = response.candidates?.[0];
      if (!candidate) {
        logger.error("❌ [AI] No candidates in Gemini response");
        throw new Error("Нет кандидатов в ответе AI");
      }

      const parts = candidate.content?.parts;
      if (!parts || parts.length === 0) {
        logger.error("❌ [AI] No parts in Gemini response");
        throw new Error("Нет контента в ответе AI");
      }

      const imagePart = parts.find((part) => part.inlineData?.data);
      if (!imagePart || !imagePart.inlineData?.data) {
        logger.error("❌ [AI] Image not found in Gemini response");
        throw new Error("Картинка не найдена в ответе AI");
      }

      const buffer = Buffer.from(imagePart.inlineData.data, "base64");
      const size = buffer.length;

      // Кэшируем изображение на 30 дней
      await redis.setex(cacheKey, 30 * 24 * 60 * 60, buffer.toString('base64'))
        .then(() => {
          logger.info("📥 [AI] Image generation cached to Redis", {
            key: cacheKey,
            size: `${(size / 1024).toFixed(2)} KB`,
            ttl: '30 days',
            promptLength: prompt.length,
          });
        })
        .catch((err) => logger.error("[AI] Failed to cache image:", {
          error: err instanceof Error ? err.message : String(err),
          key: cacheKey,
        }));

      if (saveToFile) {
        const fileName = "f1-generated-image.png";
        fs.writeFileSync(fileName, buffer);
        logger.info("💾 [AI] Image saved to file", { 
          fileName,
          size: `${(size / 1024).toFixed(2)} KB`,
        });
      }

      logger.info("✅ [AI] Image generation completed", {
        size: `${(size / 1024).toFixed(2)} KB`,
      });
      return buffer;
    } catch (err) {
      logger.error("❌ [AI] Gemini API error (image)", { 
        error: err instanceof Error ? err.message : String(err),
        promptLength: prompt.length,
      });
      throw err;
    }
  }

  // Добавить задачу на текстовую генерацию в очередь
  async queueTextGeneration(prompt: string, userId: string) {
    try {
      const job = await aiQueue.add(
        { prompt, userId } as AITextJob,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
        }
      );
      logger.info("📤 [AI Queue] Text generation job queued", {
        jobId: job.id,
        userId,
        promptLength: prompt.length,
        queueName: 'ai-tasks',
      });
      return job.id;
    } catch (err) {
      logger.error("❌ [AI Queue] Failed to queue text generation:", {
        error: err instanceof Error ? err.message : String(err),
        userId,
        promptLength: prompt.length,
      });
      throw err;
    }
  }

  // Добавить задачу на генерацию изображения в очередь
  async queueImageGeneration(prompt: string, userId: string, saveToFile = false) {
    try {
      const job = await aiQueue.add(
        { prompt, userId, saveToFile } as AIImageJob,
        {
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: true,
        }
      );
      logger.info("📤 [AI Queue] Image generation job queued", {
        jobId: job.id,
        userId,
        promptLength: prompt.length,
        saveToFile,
        queueName: 'ai-tasks',
      });
      return job.id;
    } catch (err) {
      logger.error("❌ [AI Queue] Failed to queue image generation:", {
        error: err instanceof Error ? err.message : String(err),
        userId,
        promptLength: prompt.length,
      });
      throw err;
    }
  }
}

export const aiService = new AIService();

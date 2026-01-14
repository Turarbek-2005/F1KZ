import express from "express";
import { aiService } from "../services/ai.service";

const router = express.Router();

router.post("/generate-news", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt не указан" });

  try {
    const news = await aiService.generateContent(prompt);
    res.json({ news });
  } catch (err) {
    res.status(500).json({ error: "Ошибка генерации новости" });
  }
});

router.post("/generate-image", async (req, res) => {
  const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt не указан" });
    try {
        const imageBuffer = await aiService.generateImage(prompt);
        res.setHeader("Content-Type", "image/png");
        res.send(imageBuffer);
    } catch (err) {
        res.status(500).json({ error: "Ошибка генерации изображения" });
    }
});


export default router;

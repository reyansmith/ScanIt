import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../security.js';
import { buildFallbackResponse, streamMedibotResponse } from '../services/medibotService.js';
import { store } from '../store.js';
import { validateBody } from '../utils.js';

const router = Router();
const botLimiter = rateLimit({ limit: 20, windowSeconds: 60 });
const chatSchema = z.object({
  message: z.string().min(1).max(1000),
  product_context: z.record(z.string(), z.unknown()).optional().default({}),
  chat_history: z.array(z.record(z.string(), z.unknown())).max(20).optional().default([]),
});

router.post('/chat', botLimiter, requireAuth, validateBody(chatSchema), async (req, res) => {
  const body = req.validatedBody;
  const profile = store.getProfile(req.currentUser.id);
  const profileContext = { health_conditions: profile?.health_conditions ?? [], age: profile?.age ?? 'N/A',
    weight_kg: profile?.weight_kg ?? 'N/A', height_cm: profile?.height_cm ?? 'N/A',
    activity_level: profile?.activity_level ?? 'N/A' };

  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let streamed = false;
  if (config.groqApiKey) {
    try {
      const stream = await streamMedibotResponse({ message: body.message, productContext: body.product_context,
        profileContext, chatHistory: body.chat_history });
      for await (const chunk of stream) {
        const token = chunk.choices?.[0]?.delta?.content;
        if (token) {
          streamed = true;
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    } catch {
      if (streamed) {
        res.write('data: [DONE]\n\n');
        return res.end();
      }
    }
  }

  const words = buildFallbackResponse(body.product_context, profileContext).split(' ');
  for (let index = 0; index < words.length; index += 1) {
    const token = index === words.length - 1 ? words[index] : `${words[index]} `;
    res.write(`data: ${JSON.stringify({ token })}\n\n`);
    await new Promise((resolve) => setTimeout(resolve, 8));
  }
  res.write('data: [DONE]\n\n');
  return res.end();
});

export default router;

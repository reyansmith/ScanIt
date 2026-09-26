import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { store } from '../store.js';
import { HttpError, isoNow, newId, validateBody } from '../utils.js';
import { rateLimit } from '../security.js';
import { createToken, decodeToken } from '../middleware/auth.js';

const router = Router();
const authLimiter = rateLimit({ limit: 10, windowSeconds: 60 });
const refreshLimiter = rateLimit({ limit: 30, windowSeconds: 60 });
const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const commonPasswords = new Set(['password', 'password123', '12345678', 'mediscan123']);

const registerSchema = z.object({
  email: z.string().min(3).max(255).transform((value) => value.trim().toLowerCase()).refine((value) => emailPattern.test(value), 'Invalid email address'),
  password: z.string().min(8).max(128)
    .refine((value) => value.trim() === value, 'Password must not start or end with whitespace')
    .refine((value) => !commonPasswords.has(value.toLowerCase()), 'Password is too common'),
  full_name: z.string().max(120).nullable().optional().default(null),
});
const loginSchema = z.object({
  email: z.string().min(3).max(255).transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1).max(128),
});
const refreshSchema = z.object({ refresh_token: z.string().min(20).max(4096) });
const tokens = (userId) => ({ access_token: createToken(userId, 'access'), refresh_token: createToken(userId, 'refresh'), token_type: 'bearer' });

router.post('/register', authLimiter, validateBody(registerSchema), async (req, res) => {
  const body = req.validatedBody;
  if (store.getUserByEmail(body.email)) throw new HttpError(400, 'Email already registered');
  const now = isoNow();
  const user = {
    id: newId(), email: body.email, hashed_password: await bcrypt.hash(body.password, 12),
    google_id: null, full_name: body.full_name, is_active: true, profile_complete: false,
    created_at: now, updated_at: now,
  };
  store.saveUser(user);
  store.saveProfile({ id: newId(), user_id: user.id, height_cm: null, weight_kg: null, age: null,
    activity_level: null, health_conditions: [], dietary_goals: {}, avatar_url: null, updated_at: now });
  res.status(201).json(tokens(user.id));
});

router.post('/login', authLimiter, validateBody(loginSchema), async (req, res) => {
  const user = store.getUserByEmail(req.validatedBody.email);
  if (!user?.hashed_password || !(await bcrypt.compare(req.validatedBody.password, user.hashed_password))) {
    throw new HttpError(401, 'Invalid email or password');
  }
  res.json(tokens(user.id));
});

router.post('/refresh', refreshLimiter, validateBody(refreshSchema), (req, res) => {
  const payload = decodeToken(req.validatedBody.refresh_token, 'refresh', 'Invalid refresh token');
  if (!store.getUserById(payload.sub)) throw new HttpError(401, 'Invalid refresh token');
  res.json(tokens(payload.sub));
});

export default router;

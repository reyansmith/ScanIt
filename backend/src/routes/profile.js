import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { store } from '../store.js';
import { HttpError, isoNow, newId, nullableNumber, validateBody } from '../utils.js';

export const VALID_CONDITIONS = ['Type 1 Diabetes', 'Type 2 Diabetes', 'Hypertension (High Blood Pressure)',
  'Hypercholesterolemia (High Cholesterol)', 'Chronic Kidney Disease (CKD)', 'Celiac Disease',
  'Nut Allergy (General)', 'Dairy Allergy', 'IBS/FODMAP Sensitivity'];
const VALID_ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active'];
const profileSchema = z.object({
  height_cm: nullableNumber(z.number().min(30).max(300)),
  weight_kg: nullableNumber(z.number().min(1).max(700)),
  age: nullableNumber(z.number().int().min(1).max(130)),
  activity_level: z.string().max(30).nullable().optional(),
  health_conditions: z.array(z.string()).max(20).nullable().optional(),
  dietary_goals: z.record(z.string(), z.unknown()).nullable().optional(),
});
const router = Router();

router.get('/conditions', (_req, res) => res.json({ conditions: VALID_CONDITIONS }));
router.use(requireAuth);

router.get('/', (req, res) => {
  const user = req.currentUser;
  const profile = store.getProfile(user.id);
  res.json({
    user: { id: user.id, email: user.email, full_name: user.full_name, profile_complete: user.profile_complete },
    profile: profile ? { height_cm: profile.height_cm, weight_kg: profile.weight_kg, age: profile.age,
      activity_level: profile.activity_level, health_conditions: profile.health_conditions, dietary_goals: profile.dietary_goals } : null,
  });
});

router.put('/', validateBody(profileSchema), (req, res) => {
  const body = req.validatedBody;
  if (body.health_conditions !== null && body.health_conditions !== undefined) {
    const invalid = body.health_conditions.filter((condition) => !VALID_CONDITIONS.includes(condition));
    if (invalid.length) throw new HttpError(422, `Invalid conditions: [${invalid.map((item) => `'${item}'`).join(', ')}]`);
  }
  if (body.activity_level && !VALID_ACTIVITY_LEVELS.includes(body.activity_level)) {
    throw new HttpError(422, `activity_level must be one of ['sedentary', 'light', 'moderate', 'active']`);
  }
  const user = req.currentUser;
  const profile = store.getProfile(user.id) ?? { id: newId(), user_id: user.id, height_cm: null,
    weight_kg: null, age: null, activity_level: null, health_conditions: [], dietary_goals: {}, avatar_url: null };
  for (const key of ['height_cm', 'weight_kg', 'age', 'activity_level', 'health_conditions', 'dietary_goals']) {
    if (body[key] !== null && body[key] !== undefined) profile[key] = body[key];
  }
  profile.updated_at = isoNow();
  if (profile.height_cm && profile.weight_kg && profile.age) user.profile_complete = true;
  store.saveProfile(profile);
  res.json({ message: 'Profile updated successfully' });
});

export default router;

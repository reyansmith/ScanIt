import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit, validateBarcode } from '../security.js';
import { store } from '../store.js';
import { HttpError, isoNow, newId, validateBody, validateQuery } from '../utils.js';

const VALID_CATEGORIES = ['general', 'recipe', 'symptom'];
const router = Router();
const writeLimiter = rateLimit({ limit: 20, windowSeconds: 60 });
const voteLimiter = rateLimit({ limit: 60, windowSeconds: 60 });
const postSchema = z.object({
  category: z.string().default('general'), title: z.string().min(5).max(160), body: z.string().min(1).max(5000),
  tags: z.array(z.string().nullable()).max(10).nullable().optional().default([]),
  product_barcode: z.string().max(50).nullable().optional().default(null),
});
const voteSchema = z.object({ direction: z.enum(['up', 'down']) });
const listSchema = z.object({ category: z.string().optional(), page: z.coerce.number().int().min(1).max(1000).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(15) });
router.use(requireAuth);

router.get('/posts', validateQuery(listSchema), (req, res) => {
  const { category, page, per_page: perPage } = req.validatedQuery;
  const filter = VALID_CATEGORIES.includes(category) ? category : null;
  const posts = store.getPosts(filter).slice((page - 1) * perPage, page * perPage);
  res.json({ posts: posts.map((post) => ({ id: post.id, author: post.author_name || 'Anonymous', category: post.category,
    title: post.title, body: post.body.slice(0, 200) + (post.body.length > 200 ? '...' : ''), tags: post.tags,
    upvotes: post.upvotes, downvotes: post.downvotes, net_votes: post.upvotes - post.downvotes,
    product_barcode: post.product_barcode, created_at: post.created_at })) });
});

router.post('/posts', writeLimiter, validateBody(postSchema), (req, res) => {
  const body = req.validatedBody;
  if (!VALID_CATEGORIES.includes(body.category)) throw new HttpError(422, "category must be one of ['general', 'recipe', 'symptom']");
  const now = isoNow();
  const post = { id: newId(), user_id: req.currentUser.id,
    author_name: req.currentUser.full_name || req.currentUser.email.split('@')[0], category: body.category,
    title: body.title.trim(), body: body.body.trim(), tags: (body.tags ?? []).map((tag) => (tag ?? '').trim().slice(0, 40)).filter(Boolean).slice(0, 10),
    product_barcode: body.product_barcode ? validateBarcode(body.product_barcode) : null,
    upvotes: 0, downvotes: 0, created_at: now, updated_at: now };
  store.savePost(post);
  res.status(201).json({ id: post.id, message: 'Post created' });
});

router.post('/posts/:postId/vote', voteLimiter, validateBody(voteSchema), (req, res) => {
  const post = store.getPostById(req.params.postId);
  if (!post) throw new HttpError(404, 'Post not found');
  if (req.validatedBody.direction === 'up') post.upvotes += 1;
  else post.downvotes += 1;
  res.json({ upvotes: post.upvotes, downvotes: post.downvotes });
});

router.get('/recipes', (_req, res) => {
  const recipes = store.getPosts('recipe').sort((a, b) => b.upvotes - a.upvotes).slice(0, 20);
  res.json({ posts: recipes.map((post) => ({ id: post.id, title: post.title, upvotes: post.upvotes })) });
});

router.get('/symptoms', (_req, res) => {
  const symptoms = store.getPosts('symptom').slice(0, 20);
  res.json({ posts: symptoms.map((post) => ({ id: post.id, title: post.title, created_at: post.created_at })) });
});

export default router;

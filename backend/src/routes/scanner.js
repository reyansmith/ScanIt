import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit, validateBarcode } from '../security.js';
import { lookupProduct } from '../services/productService.js';
import { buildAlertSummary, computeVerdict } from '../services/verdictService.js';
import { store } from '../store.js';
import { HttpError, isoNow, newId, validateBody, validateQuery } from '../utils.js';

const router = Router();
const scanLimiter = rateLimit({ limit: 30, windowSeconds: 60 });
const scanSchema = z.object({ barcode: z.string().min(3).max(50) });
const historySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});
router.post('/scan-product', scanLimiter, requireAuth, validateBody(scanSchema), async (req, res) => {
  const barcode = validateBarcode(req.validatedBody.barcode);
  const product = await lookupProduct(barcode);
  if (!product) throw new HttpError(404, `Product with barcode '${barcode}' not found.`);
  const profile = store.getProfile(req.currentUser.id);
  const result = computeVerdict(product, profile?.health_conditions ?? []);
  const scan = { id: newId(), user_id: req.currentUser.id, barcode, product_name: product.product_name,
    brand: product.brand, image_url: product.image_url, product_data: product, verdict: result.verdict,
    flags: result.flags, scanned_at: isoNow() };
  store.saveScan(scan);
  res.json({ scan_id: scan.id, product, verdict: result.verdict, flags: result.flags,
    alert_summaries: buildAlertSummary(result.flags) });
});

router.get('/scan-product/:barcode', scanLimiter, requireAuth, async (req, res) => {
  const product = await lookupProduct(validateBarcode(req.params.barcode));
  if (!product) throw new HttpError(404, 'Product not found');
  res.json({ product });
});

router.get('/scans/history', requireAuth, validateQuery(historySchema), (req, res) => {
  const { page, per_page: perPage } = req.validatedQuery;
  const scans = store.getUserScans(req.currentUser.id).slice((page - 1) * perPage, page * perPage);
  res.json({ page, per_page: perPage, scans: scans.map((scan) => ({ id: scan.id, barcode: scan.barcode,
    product_name: scan.product_name, brand: scan.brand, image_url: scan.image_url, verdict: scan.verdict,
    flags: scan.flags, scanned_at: scan.scanned_at })) });
});

export default router;

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { buildAlertSummary } from '../services/verdictService.js';
import { store } from '../store.js';

const router = Router();
router.use(requireAuth);

router.get('/summary', (req, res) => {
  const scans = store.getUserScans(req.currentUser.id);
  const recent = scans.slice(0, 10);
  const alerts = recent.flatMap((scan) => (['DANGER', 'CAUTION'].includes(scan.verdict) && scan.flags?.length)
    ? buildAlertSummary(scan.flags).map((summary) => ({ product_name: scan.product_name, verdict: scan.verdict,
      summary, scan_id: scan.id, scanned_at: scan.scanned_at })) : []).slice(0, 8);
  res.json({
    total_scans: scans.length,
    safe_scans: scans.filter((scan) => scan.verdict === 'SAFE').length,
    danger_scans: scans.filter((scan) => scan.verdict === 'DANGER').length,
    recent_scans: recent.map((scan) => ({ id: scan.id, product_name: scan.product_name, brand: scan.brand,
      image_url: scan.image_url, verdict: scan.verdict, scanned_at: scan.scanned_at })),
    alerts,
  });
});

router.get('/progress', (req, res) => {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const scans = store.getUserScans(req.currentUser.id).filter((scan) => Date.parse(scan.scanned_at) >= cutoff);
  const average = (values) => values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;
  const nutrients = (key) => scans.map((scan) => Number(scan.product_data?.nutrient_levels?.[key] ?? 0));
  res.json({ period: 'last_7_days', scans_this_week: scans.length, avg_sodium_mg: average(nutrients('sodium_100g')),
    avg_sugar_g: average(nutrients('sugars_100g')), avg_calories_kcal: average(nutrients('energy_100g')),
    safe_pct: Math.round((scans.filter((scan) => scan.verdict === 'SAFE').length / Math.max(scans.length, 1) * 100) * 10) / 10 });
});

export default router;

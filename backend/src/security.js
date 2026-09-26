import { HttpError } from './utils.js';

const BARCODE_RE = /^[A-Za-z0-9._-]{3,50}$/;

export function validateBarcode(value) {
  const barcode = value.trim();
  if (!BARCODE_RE.test(barcode)) {
    throw new HttpError(422, 'Barcode must be 3-50 characters and contain only letters, numbers, dots, underscores, or hyphens.');
  }
  return barcode;
}

export function securityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(self)');
  next();
}

export function rateLimit({ limit, windowSeconds }) {
  const hits = new Map();
  return (req, res, next) => {
    const forwarded = req.get('x-forwarded-for') ?? '';
    const client = forwarded.split(',', 1)[0].trim() || req.socket.remoteAddress || 'unknown';
    const key = `${client}:${req.path}`;
    const now = Date.now();
    const cutoff = now - windowSeconds * 1000;
    const bucket = (hits.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
    if (bucket.length >= limit) {
      const retryAfter = Math.max(1, Math.floor(windowSeconds - ((now - bucket[0]) / 1000)));
      res.setHeader('Retry-After', String(retryAfter));
      return next(new HttpError(429, 'Too many requests. Please try again later.'));
    }
    bucket.push(now);
    hits.set(key, bucket);
    return next();
  };
}

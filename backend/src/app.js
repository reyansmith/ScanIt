import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { securityHeaders } from './security.js';
import { HttpError } from './utils.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import scannerRoutes from './routes/scanner.js';
import dashboardRoutes from './routes/dashboard.js';
import botRoutes from './routes/bot.js';
import communityRoutes from './routes/community.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin(origin, callback) {
    if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
    return callback(new HttpError(400, 'Disallowed CORS origin'));
  }, credentials: true, methods: ['GET', 'POST', 'PUT', 'OPTIONS'], allowedHeaders: ['Authorization', 'Content-Type'] }));
  app.use(securityHeaders);
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api', scannerRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/bot', botRoutes);
  app.use('/api/community', communityRoutes);
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'MediScan API v1.0' }));

  app.use((_req, _res, next) => next(new HttpError(404, 'Not Found')));
  app.use((error, _req, res, _next) => {
    if (res.headersSent) return res.end();
    if (error?.type === 'entity.parse.failed') return res.status(422).json({ detail: 'Invalid JSON body' });
    const status = error.status ?? 500;
    for (const [key, value] of Object.entries(error.headers ?? {})) res.setHeader(key, value);
    return res.status(status).json({ detail: status === 500 ? 'Internal Server Error' : error.detail ?? error.message });
  });
  return app;
}

import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const DEFAULT_DEV_SECRET = 'mediscan-dev-secret-change-in-production';

function parseInteger(name, fallback) {
  const value = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(value) ? value : fallback;
}

function parseOrigins(value) {
  if (!value) return ['http://localhost:5173', 'http://localhost:3000'];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((origin) => typeof origin === 'string')) return parsed;
  } catch {
    // Also support a comma-separated value for ordinary Node deployments.
  }
  return value.split(',').map((origin) => origin.trim()).filter(Boolean);
}

export const config = {
  environment: process.env.ENVIRONMENT ?? 'development',
  port: parseInteger('PORT', 8000),
  secretKey: process.env.SECRET_KEY ?? DEFAULT_DEV_SECRET,
  algorithm: process.env.ALGORITHM ?? 'HS256',
  accessTokenExpireMinutes: parseInteger('ACCESS_TOKEN_EXPIRE_MINUTES', 60),
  refreshTokenExpireDays: parseInteger('REFRESH_TOKEN_EXPIRE_DAYS', 7),
  groqApiKey: process.env.GROQ_API_KEY ?? '',
  groqModel: process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b',
  nutritionixAppId: process.env.NUTRITIONIX_APP_ID ?? '',
  nutritionixApiKey: process.env.NUTRITIONIX_API_KEY ?? '',
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
};

export function validateRuntimeConfig() {
  if (['prod', 'production'].includes(config.environment.toLowerCase())) {
    if (config.secretKey === DEFAULT_DEV_SECRET || config.secretKey.length < 32) {
      throw new Error('SECRET_KEY must be a unique 32+ character value in production.');
    }
  }
}

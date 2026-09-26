import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { store } from '../store.js';
import { HttpError } from '../utils.js';

export function createToken(userId, type) {
  const expiresIn = type === 'access'
    ? `${config.accessTokenExpireMinutes}m`
    : `${config.refreshTokenExpireDays}d`;
  return jwt.sign({ sub: userId, type }, config.secretKey, {
    algorithm: config.algorithm,
    expiresIn,
    noTimestamp: true,
  });
}

export function decodeToken(token, expectedType, detail = 'Invalid or expired token') {
  try {
    const payload = jwt.verify(token, config.secretKey, { algorithms: [config.algorithm] });
    if (!payload.sub || payload.type !== expectedType) throw new Error('Wrong token type');
    return payload;
  } catch {
    throw new HttpError(401, detail, expectedType === 'access' ? { 'WWW-Authenticate': 'Bearer' } : {});
  }
}

export function requireAuth(req, _res, next) {
  try {
    const authorization = req.get('authorization') ?? '';
    const match = /^Bearer\s+(.+)$/i.exec(authorization);
    if (!match) throw new HttpError(401, 'Not authenticated', { 'WWW-Authenticate': 'Bearer' });
    const payload = decodeToken(match[1], 'access');
    const user = store.getUserById(payload.sub);
    if (!user) throw new HttpError(401, 'Invalid or expired token', { 'WWW-Authenticate': 'Bearer' });
    req.currentUser = user;
    next();
  } catch (error) {
    next(error);
  }
}

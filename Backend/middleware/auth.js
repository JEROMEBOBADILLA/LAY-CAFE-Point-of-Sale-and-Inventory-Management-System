import { createHmac, scryptSync, timingSafeEqual, randomBytes } from 'node:crypto';
import ValidationError from '../utils/ValidationError.js';
const secret = process.env.AUTH_SECRET || 'local-dev-only-please-set-auth-secret';
if (!process.env.AUTH_SECRET)
  console.warn('[SECURITY] Set AUTH_SECRET in Backend/.env before deploying.');
const sign = (data) => createHmac('sha256', secret).update(data).digest('base64url');
export function hashPassword(value) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(value, salt, 64).toString('hex')}`;
}
export function verifyPassword(value, saved) {
  const [salt, hex] = String(saved || '').split(':');
  if (!salt || !hex || !/^[a-f0-9]{128}$/.test(hex))
    return false;
  const expected = Buffer.from(hex, 'hex');
  return timingSafeEqual(scryptSync(value, salt, 64), expected);
}
export function makeToken(user) {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    role: user.role,
    name: user.full_name,
    exp: Math.floor(Date.now() / 1000) + 28800
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}
export function requireAuth(...roles) {
  return (req, _res, next) => {
    try {
      const value = req.headers.authorization || '';
      const [kind, token] = value.split(' ');
      if (kind !== 'Bearer' || !token)
        throw new ValidationError(401, 'Please sign in to continue.');
      const [payload, mac] = token.split('.');
      if (!payload || !mac)
        throw new ValidationError(401, 'Invalid session. Sign in again.');
      const actual = Buffer.from(mac);
      const expected = Buffer.from(sign(payload));
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
        throw new ValidationError(401, 'Invalid session. Sign in again.');
      const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      if (!Number.isInteger(session.id) || session.exp < Date.now() / 1000)
        throw new ValidationError(401, 'Session expired. Sign in again.');
      if (roles.length && !roles.includes(session.role))
        throw new ValidationError(403, 'This module is not available to your account.');
      req.user = session;
      next();
    }
    catch (err) {
      next(err instanceof ValidationError ? err : new ValidationError(401, 'Invalid session. Sign in again.'));
    }
  };
}

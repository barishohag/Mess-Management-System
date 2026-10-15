/// <reference types="node" />
import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'mess_admin_session';
const SESSION_SECONDS = 60 * 60 * 24 * 7;
const failedLogins = new Map<string, { count: number; resetAt: number }>();

function sendJson(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function cookieOptions(maxAge: number) {
  const secure = process.env.VERCEL === '1' ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function signature(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function readAdminSession(req: any) {
  const userId = process.env.VITE_ADMIN_USER_ID?.trim();
  const password = process.env.VITE_ADMIN_PASSWORD;
  if (!userId || !password) return null;

  const cookie = String(req.headers.cookie || '')
    .split(';')
    .map((part: string) => part.trim())
    .find((part: string) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  if (!cookie) return null;

  const [payload, suppliedSignature] = cookie.split('.');
  if (!payload || !suppliedSignature) return null;
  if (!safeEqual(signature(payload, password), suppliedSignature)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (session.userId !== userId || !Number.isFinite(session.exp) || session.exp <= Date.now()) return null;
    return { isLoggedIn: true, userId, displayName: 'Mess Manager (Admin)', role: 'Super Admin', loginTime: session.iat };
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const session = readAdminSession(req);
    return session ? sendJson(res, 200, { session }) : sendJson(res, 401, { message: 'Not signed in' });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', cookieOptions(0));
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, DELETE');
    return sendJson(res, 405, { message: 'Method not allowed' });
  }

  const expectedUser = process.env.VITE_ADMIN_USER_ID?.trim();
  const expectedPassword = process.env.VITE_ADMIN_PASSWORD;
  if (!expectedUser || !expectedPassword) {
    return sendJson(res, 503, { message: 'Admin credentials are not configured in Vercel project settings.' });
  }

  const suppliedUser = String(req.body?.userId || '').trim();
  const suppliedPassword = String(req.body?.password || '');
  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const attempts = failedLogins.get(ip);
  if (attempts && attempts.resetAt > now && attempts.count >= 10) {
    return sendJson(res, 429, { message: 'Too many sign-in attempts. Wait 15 minutes and try again.' });
  }
  if (!safeEqual(suppliedUser.toLowerCase(), expectedUser.toLowerCase()) || !safeEqual(suppliedPassword, expectedPassword)) {
    const current = attempts && attempts.resetAt > now ? attempts : { count: 0, resetAt: now + 15 * 60 * 1000 };
    failedLogins.set(ip, { ...current, count: current.count + 1 });
    return sendJson(res, 401, { message: 'Invalid User ID or Password.' });
  }

  failedLogins.delete(ip);
  const payload = Buffer.from(JSON.stringify({ userId: expectedUser, iat: new Date(now).toISOString(), exp: now + SESSION_SECONDS * 1000 })).toString('base64url');
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${payload}.${signature(payload, expectedPassword)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}${process.env.VERCEL === '1' ? '; Secure' : ''}`);
  return sendJson(res, 200, {
    session: { isLoggedIn: true, userId: expectedUser, displayName: 'Mess Manager (Admin)', role: 'Super Admin', loginTime: new Date(now).toISOString() }
  });
}


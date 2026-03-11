import { NextRequest } from 'next/server';
import { verifyToken } from './auth';
import { JWTPayload } from '@/types';

const COOKIE_NAME = 'f1fun_token';

export async function getAuthFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

export function forbidden() {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}

export async function requireAuth(req: NextRequest): Promise<JWTPayload | Response> {
  const user = await getAuthFromRequest(req);
  if (!user) return unauthorized();
  return user;
}

export async function requireApproved(req: NextRequest): Promise<JWTPayload | Response> {
  const user = await getAuthFromRequest(req);
  if (!user) return unauthorized();
  if (user.status !== 'approved') return forbidden();
  return user;
}

export async function requireAdmin(req: NextRequest): Promise<JWTPayload | Response> {
  const user = await getAuthFromRequest(req);
  if (!user) return unauthorized();
  if (user.role !== 'admin') return forbidden();
  return user;
}

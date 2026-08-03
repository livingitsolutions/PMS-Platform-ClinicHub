import { getUser } from '@netlify/identity';
import { jwtVerify } from 'jose';
import Stripe from 'stripe';
import type { PoolClient } from 'pg';

interface AuthenticatedUser {
  id: string;
  email: string;
}

class AuthenticationError extends Error {}

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export const json = (body: unknown, init: ResponseInit = {}) => Response.json(body, init);

export function requirePost(request: Request): void {
  if (request.method !== 'POST') throw new HttpError('Method not allowed', 405);
}

export async function readObject(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body as Record<string, unknown>;
  } catch {
    throw new HttpError('Invalid JSON body', 400);
  }
}

export function requireString(body: Record<string, unknown>, field: string): string {
  const value = body[field];
  if (typeof value !== 'string' || !value.trim()) throw new HttpError(`${field} is required`, 400);
  return value;
}

export function requireUrl(body: Record<string, unknown>, field: string): string {
  const value = requireString(body, field);
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error();
    return url.toString();
  } catch {
    throw new HttpError(`${field} must be a valid HTTP URL`, 400);
  }
}

async function getCurrentUser(request: Request, client: PoolClient): Promise<AuthenticatedUser> {
  const identityUser = await getUser();
  let authenticatedUser: AuthenticatedUser | null = identityUser?.id && identityUser.email
    ? { id: identityUser.id, email: identityUser.email }
    : null;

  if (!authenticatedUser) {
    const authorization = request.headers.get('authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    const secret = process.env.JWT_SECRET;

    if (token && secret) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
          algorithms: ['HS256'],
        });
        if (typeof payload.sub === 'string' && typeof payload.email === 'string') {
          authenticatedUser = { id: payload.sub, email: payload.email };
        }
      } catch {
        throw new AuthenticationError('Unauthorized');
      }
    }
  }

  if (!authenticatedUser) throw new AuthenticationError('Unauthorized');

  await client.query(
    `INSERT INTO users (id, email)
     VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email`,
    [authenticatedUser.id, authenticatedUser.email],
  );

  return authenticatedUser;
}

export async function requireClinicOwner(request: Request, client: PoolClient, clinicId: string) {
  const user = await getCurrentUser(request, client);
  const membership = await client.query(
    `SELECT 1
       FROM user_clinics
      WHERE user_id = $1 AND clinic_id = $2 AND role = 'owner'
      LIMIT 1`,
    [user.id, clinicId],
  );

  if (!membership.rowCount) throw new HttpError('Forbidden', 403);
  return user;
}

export function errorResponse(error: unknown): Response {
  if (error instanceof AuthenticationError) return json({ error: error.message }, { status: 401 });
  if (error instanceof HttpError) {
    const headers = error.status === 405 ? { Allow: 'POST' } : undefined;
    return json({ error: error.message }, { status: error.status, headers });
  }
  if (error instanceof Stripe.errors.StripeError) {
    console.error(error);
    return json({ error: 'Stripe request failed' }, { status: error.statusCode ?? 502 });
  }

  console.error(error);
  return json({ error: 'Unexpected server error' }, { status: 500 });
}

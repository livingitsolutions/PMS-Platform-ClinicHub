import { getUser } from '@netlify/identity';
import { jwtVerify } from 'jose';
import { db } from '../../../db/index.js';
import { users } from '../../../db/schema.js';
import { ensureDemoAccountData } from './demo-data.mjs';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export class AuthenticationError extends Error {}

export async function getCurrentUser(request: Request): Promise<AuthenticatedUser> {
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

  await db.insert(users).values(authenticatedUser).onConflictDoUpdate({
    target: users.id,
    set: { email: authenticatedUser.email },
  });

  await ensureDemoAccountData(authenticatedUser);

  return authenticatedUser;
}

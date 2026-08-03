import { AuthenticationError } from './auth.mjs';
import { DemoAccountReadOnlyError } from './demo-data.mjs';

export const json = (body: unknown, init: ResponseInit = {}) => Response.json(body, init);

export function errorResponse(error: unknown): Response {
  if (error instanceof AuthenticationError) return json({ error: error.message }, { status: 401 });
  if (error instanceof DemoAccountReadOnlyError) return json({ error: error.message }, { status: 403 });
  const message = error instanceof Error ? error.message : 'Unexpected server error';
  console.error(error);
  return json({ error: message }, { status: 500 });
}

export async function readJson<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}

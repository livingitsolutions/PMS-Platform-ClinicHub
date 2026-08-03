import type { Config, Context } from '@netlify/functions';
import { getDatabase } from '@netlify/database';
import { getStore } from '@netlify/blobs';
import { getCurrentUser } from './_shared/auth.mjs';
import { errorResponse } from './_shared/http.mjs';
import { requireClinicAccess } from './_shared/tenant.mjs';

export default async (request: Request, context: Context) => {
  try {
    const user = await getCurrentUser(request);
    const result = await getDatabase().pool.query('SELECT clinic_id FROM backups WHERE id = $1', [context.params.id]);
    if (!result.rows[0]?.clinic_id) return new Response('Not found', { status: 404 });
    await requireClinicAccess(user.id, result.rows[0].clinic_id);
    const value = await getStore({ name: 'clinic-backups', consistency: 'strong' }).get(`${result.rows[0].clinic_id}/${context.params.id}.json`, { type: 'text' });
    if (!value) return new Response('Not found', { status: 404 });
    return new Response(value, { headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="clinic-backup-${context.params.id}.json"` } });
  } catch (error) { return errorResponse(error); }
};

export const config: Config = { path: '/api/backup-download/:id' };

import type { Config } from '@netlify/functions';
import { getDatabase } from '@netlify/database';
import { getStore } from '@netlify/blobs';
import { getCurrentUser } from './_shared/auth.mjs';
import { errorResponse, json, readJson } from './_shared/http.mjs';
import { requireClinicAccess } from './_shared/tenant.mjs';

export default async (request: Request) => {
  try {
    const user = await getCurrentUser(request);
    const { backup_id, clinic_id } = await readJson<Record<string, string>>(request);
    await requireClinicAccess(user.id, clinic_id, ['owner', 'admin']);
    const database = getDatabase();
    await database.pool.query(`UPDATE backups SET backup_status = 'in_progress', updated_at = now() WHERE id = $1 AND clinic_id = $2`, [backup_id, clinic_id]);
    const tables = ['patients', 'appointments', 'providers', 'visits', 'procedures', 'invoices', 'payments'];
    const exported: Record<string, unknown[]> = {};
    for (const table of tables) {
      const result = await database.pool.query(`SELECT * FROM "${table}" WHERE clinic_id = $1`, [clinic_id]);
      exported[table] = result.rows;
    }
    const visitProcedures = await database.pool.query(
      'SELECT vp.* FROM visit_procedures vp JOIN visits v ON v.id = vp.visit_id WHERE v.clinic_id = $1', [clinic_id],
    );
    exported.visit_procedures = visitProcedures.rows;
    const clinic = await database.pool.query('SELECT * FROM clinics WHERE id = $1', [clinic_id]);
    const payload = JSON.stringify({ exported_at: new Date().toISOString(), clinic: clinic.rows[0], data: exported }, null, 2);
    const key = `${clinic_id}/${backup_id}.json`;
    await getStore({ name: 'clinic-backups', consistency: 'strong' }).set(key, payload, { metadata: { contentType: 'application/json' } });
    await database.pool.query(
      `UPDATE backups SET backup_status = 'completed', backup_size = $1, storage_url = $2, error_message = null, updated_at = now() WHERE id = $3`,
      [Buffer.byteLength(payload), `/api/backup-download/${backup_id}`, backup_id],
    );
    return json({ success: true, backup_id, size: Buffer.byteLength(payload) });
  } catch (error) { return errorResponse(error); }
};

export const config: Config = { path: '/api/perform-backup', background: true };

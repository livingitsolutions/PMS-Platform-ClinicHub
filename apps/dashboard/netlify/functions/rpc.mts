import type { Config, Context } from '@netlify/functions';
import { getDatabase } from '@netlify/database';
import { getCurrentUser } from './_shared/auth.mjs';
import { assertDemoAccountCanMutate } from './_shared/demo-data.mjs';
import { errorResponse, json, readJson } from './_shared/http.mjs';
import { requireClinicAccess } from './_shared/tenant.mjs';

export default async (request: Request, context: Context) => {
  try {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 });
    const user = await getCurrentUser(request);
    const name = context.params.name;
    const args = await readJson<Record<string, unknown>>(request);
    const database = getDatabase();

    if (name === 'create_clinic_for_authenticated_user') {
      assertDemoAccountCanMutate(user.email);
      const client = await database.pool.connect();
      try {
        await client.query('BEGIN');
        const clinicResult = await client.query(
          `INSERT INTO clinics (name, address, phone, email) VALUES ($1, $2, $3, $4) RETURNING *`,
          [args.p_name, args.p_address || null, args.p_phone || null, args.p_email || null],
        );
        await client.query(
          `INSERT INTO user_clinics (user_id, clinic_id, role) VALUES ($1, $2, 'owner')`,
          [user.id, clinicResult.rows[0].id],
        );
        await client.query('COMMIT');
        return json({ data: clinicResult.rows[0] });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    if (name === 'get_user_id_by_email') {
      const result = await database.pool.query('SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1', [args.email_input]);
      return json({ data: result.rows[0]?.id ?? null });
    }

    if (name === 'get_users_by_ids') {
      const ids = Array.isArray(args.user_ids) ? args.user_ids : [];
      const result = await database.pool.query(
        `SELECT DISTINCT u.id, u.email FROM users u
         JOIN user_clinics peer ON peer.user_id = u.id
         JOIN user_clinics mine ON mine.clinic_id = peer.clinic_id
         WHERE mine.user_id = $1 AND u.id = ANY($2::uuid[])`,
        [user.id, ids],
      );
      return json({ data: result.rows });
    }

    const clinicId = String(args.p_clinic_id || '');
    await requireClinicAccess(user.id, clinicId);

    if (name === 'get_today_stats') {
      const [result] = await Promise.all([
        database.pool.query(
          `SELECT
             (SELECT count(*)::int FROM visits WHERE clinic_id = $1 AND visit_date >= $2) AS "totalVisits",
             (SELECT coalesce(sum(amount), 0) FROM payments WHERE clinic_id = $1 AND created_at >= $2) AS "totalRevenue",
             (SELECT coalesce(sum(total_amount - amount_paid), 0) FROM invoices WHERE clinic_id = $1 AND status NOT IN ('paid', 'void')) AS "outstandingInvoices",
             (SELECT count(*)::int FROM patients WHERE clinic_id = $1 AND created_at >= $2) AS "newPatients"`,
          [clinicId, args.p_today],
        ),
      ]);
      return json({ data: result.rows[0] });
    }

    if (name === 'get_monthly_revenue') {
      const result = await database.pool.query(
        `WITH date_series AS (
           SELECT generate_series($2::date, CURRENT_DATE, '1 day'::interval)::date AS day
         )
         SELECT ds.day::text AS date, coalesce(sum(p.amount), 0) AS revenue
         FROM date_series ds
         LEFT JOIN payments p ON p.created_at::date = ds.day AND p.clinic_id = $1
         GROUP BY ds.day ORDER BY ds.day`,
        [clinicId, args.p_start_date],
      );
      return json({ data: result.rows });
    }

    if (name === 'get_top_procedures') {
      const result = await database.pool.query(
        `SELECT vp.procedure_id, pr.name AS procedure_name, sum(vp.quantity)::int AS count,
                sum(vp.quantity * vp.price) AS total_revenue
         FROM visit_procedures vp
         JOIN procedures pr ON pr.id = vp.procedure_id
         JOIN visits v ON v.id = vp.visit_id
         WHERE pr.clinic_id = $1 AND v.visit_date >= $2
         GROUP BY vp.procedure_id, pr.name ORDER BY total_revenue DESC LIMIT 5`,
        [clinicId, args.p_start_date],
      );
      return json({ data: result.rows });
    }

    if (name === 'get_top_providers') {
      const result = await database.pool.query(
        `SELECT v.provider_id, prov.name AS provider_name, count(v.id)::int AS visit_count,
                coalesce(sum(inv.total_amount), 0) AS total_revenue
         FROM visits v JOIN providers prov ON prov.id = v.provider_id
         LEFT JOIN invoices inv ON inv.visit_id = v.id
         WHERE v.clinic_id = $1 AND v.visit_date >= $2
         GROUP BY v.provider_id, prov.name ORDER BY total_revenue DESC LIMIT 5`,
        [clinicId, args.p_start_date],
      );
      return json({ data: result.rows });
    }

    return json({ error: 'Unknown RPC' }, { status: 404 });
  } catch (error) {
    return errorResponse(error);
  }
};

export const config: Config = { path: '/api/rpc/:name' };

import type { Config, Context } from '@netlify/functions';
import { getDatabase } from '@netlify/database';
import { getCurrentUser } from './_shared/auth.mjs';
import { assertDemoAccountCanMutate } from './_shared/demo-data.mjs';
import { errorResponse, json, readJson } from './_shared/http.mjs';

type Filter = { column: string; operator: 'eq' | 'neq' | 'gte' | 'lte' | 'in' | 'is'; value: unknown };
type DataRequest = {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  values?: Record<string, unknown> | Record<string, unknown>[];
  filters?: Filter[];
  or?: string;
  orForeignTable?: string;
  select?: string;
  count?: 'exact';
  head?: boolean;
  order?: { column: string; ascending: boolean }[];
  limit?: number;
  range?: [number, number];
  single?: boolean;
  maybeSingle?: boolean;
  onConflict?: string;
};

const tables = new Set([
  'clinics', 'user_clinics', 'patients', 'providers', 'provider_availability',
  'appointments', 'procedures', 'visits', 'visit_procedures', 'invoices', 'payments',
  'audit_logs', 'subscriptions', 'notifications', 'backups', 'appointment_reminders',
  'subscription_invoices', 'users',
]);

const directClinicTables = new Set([
  'patients', 'providers', 'appointments', 'procedures', 'visits', 'invoices', 'payments',
  'audit_logs', 'subscriptions', 'notifications', 'backups', 'appointment_reminders',
  'subscription_invoices', 'user_clinics',
]);

const privilegedWrites: Record<string, string[]> = {
  clinics: ['owner'],
  user_clinics: ['owner'],
  providers: ['owner', 'admin'],
  provider_availability: ['owner', 'admin'],
  procedures: ['owner', 'admin'],
  backups: ['owner', 'admin'],
};

const identifier = (value: string) => {
  if (!/^[a-z_][a-z0-9_]*$/.test(value)) throw new Error(`Invalid identifier: ${value}`);
  return `"${value}"`;
};

function accessPredicate(table: string, userPlaceholder: string): string {
  if (table === 'clinics') return `id IN (SELECT clinic_id FROM user_clinics WHERE user_id = ${userPlaceholder})`;
  if (table === 'users') return `id = ${userPlaceholder} OR id IN (
    SELECT peer.user_id FROM user_clinics peer
    JOIN user_clinics mine ON mine.clinic_id = peer.clinic_id
    WHERE mine.user_id = ${userPlaceholder}
  )`;
  if (table === 'notifications') return `user_id = ${userPlaceholder}`;
  if (table === 'provider_availability') return `provider_id IN (
    SELECT p.id FROM providers p JOIN user_clinics uc ON uc.clinic_id = p.clinic_id WHERE uc.user_id = ${userPlaceholder}
  )`;
  if (table === 'visit_procedures') return `visit_id IN (
    SELECT v.id FROM visits v JOIN user_clinics uc ON uc.clinic_id = v.clinic_id WHERE uc.user_id = ${userPlaceholder}
  )`;
  if (directClinicTables.has(table)) return `clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = ${userPlaceholder})`;
  throw new Error(`No access policy configured for ${table}`);
}

function buildWhere(table: string, userId: string, filters: Filter[] = [], or?: string, orForeignTable?: string) {
  const values: unknown[] = [userId];
  const clauses = [accessPredicate(table, '$1')];

  for (const filter of filters) {
    if (filter.column.includes('.')) {
      if (table === 'appointment_reminders' && filter.column === 'appointments.status' && filter.operator === 'neq') {
        values.push(filter.value);
        clauses.push(`appointment_id IN (SELECT id FROM appointments WHERE status <> $${values.length})`);
        continue;
      }
      throw new Error(`Unsupported related filter: ${filter.column}`);
    }
    const column = identifier(filter.column);
    if (filter.operator === 'in') {
      const list = Array.isArray(filter.value) ? filter.value : [];
      if (!list.length) clauses.push('false');
      else {
        const placeholders = list.map((item) => {
          values.push(item);
          return `$${values.length}`;
        });
        clauses.push(`${column} IN (${placeholders.join(', ')})`);
      }
      continue;
    }
    if (filter.operator === 'is') {
      clauses.push(filter.value === null ? `${column} IS NULL` : `${column} IS NOT NULL`);
      continue;
    }
    values.push(filter.value);
    const operators = { eq: '=', neq: '<>', gte: '>=', lte: '<=' } as const;
    clauses.push(`${column} ${operators[filter.operator]} $${values.length}`);
  }

  if (or) {
    if (orForeignTable === 'patients' && (table === 'visits' || table === 'appointments')) {
      const nested = or.split(',').map((condition) => {
        const [, column, operator, ...rawValue] = condition.split('.');
        if (!column || operator !== 'ilike') throw new Error('Unsupported related OR filter');
        values.push(rawValue.join('.').replaceAll('*', '%'));
        return `${identifier(column)} ILIKE $${values.length}`;
      });
      clauses.push(`patient_id IN (SELECT id FROM patients WHERE ${nested.join(' OR ')})`);
      return { sql: clauses.join(' AND '), values };
    }
    const orClauses = or.split(',').map((condition) => {
      const [column, operator, ...rawValue] = condition.split('.');
      if (!column || operator !== 'ilike') throw new Error('Unsupported OR filter');
      values.push(rawValue.join('.').replaceAll('*', '%'));
      return `${identifier(column)} ILIKE $${values.length}`;
    });
    clauses.push(`(${orClauses.join(' OR ')})`);
  }

  return { sql: clauses.join(' AND '), values };
}

async function hydrate(table: string, rows: Record<string, unknown>[], select = '') {
  if (!rows.length || !select) return rows;
  const database = getDatabase();

  const attach = async (relation: string, foreignKey: string, sourceTable: string) => {
    if (!select.includes(relation)) return;
    const ids = [...new Set(rows.map((row) => row[foreignKey]).filter(Boolean))];
    if (!ids.length) return;
    const result = await database.pool.query(`SELECT * FROM ${identifier(sourceTable)} WHERE id = ANY($1::uuid[])`, [ids]);
    const byId = new Map(result.rows.map((row: Record<string, unknown>) => [row.id, row]));
    rows.forEach((row) => { row[relation] = byId.get(row[foreignKey]) ?? null; });
  };

  if (table === 'user_clinics') await attach('clinics', 'clinic_id', 'clinics');
  if (table === 'visits') {
    await attach('patients', 'patient_id', 'patients');
    await attach('providers', 'provider_id', 'providers');
    await attach('appointments', 'appointment_id', 'appointments');
  }
  if (table === 'appointments') {
    await attach('patients', 'patient_id', 'patients');
    await attach('providers', 'provider_id', 'providers');
  }
  if (table === 'visit_procedures') await attach('procedures', 'procedure_id', 'procedures');
  if (table === 'appointment_reminders') {
    await attach('appointments', 'appointment_id', 'appointments');
    const appointments = rows.map((row) => row.appointments).filter(Boolean) as Record<string, unknown>[];
    const patientIds = [...new Set(appointments.map((row) => row.patient_id).filter(Boolean))];
    if (patientIds.length) {
      const result = await database.pool.query('SELECT * FROM patients WHERE id = ANY($1::uuid[])', [patientIds]);
      const byId = new Map(result.rows.map((row: Record<string, unknown>) => [row.id, row]));
      appointments.forEach((row) => { row.patients = byId.get(row.patient_id) ?? null; });
    }
    const providerIds = [...new Set(appointments.map((row) => row.provider_id).filter(Boolean))];
    if (providerIds.length) {
      const result = await database.pool.query('SELECT * FROM providers WHERE id = ANY($1::uuid[])', [providerIds]);
      const byId = new Map(result.rows.map((row: Record<string, unknown>) => [row.id, row]));
      appointments.forEach((row) => { row.providers = byId.get(row.provider_id) ?? null; });
    }
    const clinicIds = [...new Set(rows.map((row) => row.clinic_id).filter(Boolean))];
    if (clinicIds.length) {
      const result = await database.pool.query('SELECT * FROM clinics WHERE id = ANY($1::uuid[])', [clinicIds]);
      const byId = new Map(result.rows.map((row: Record<string, unknown>) => [row.id, row]));
      appointments.forEach((row, index) => { row.clinics = byId.get(rows[index]?.clinic_id) ?? null; });
    }
  }
  if (table === 'invoices') {
    await attach('visits', 'visit_id', 'visits');
    const visits = rows.map((row) => row.visits).filter(Boolean) as Record<string, unknown>[];
    const patientIds = [...new Set(visits.map((row) => row.patient_id).filter(Boolean))];
    if (patientIds.length) {
      const result = await database.pool.query('SELECT * FROM patients WHERE id = ANY($1::uuid[])', [patientIds]);
      const byId = new Map(result.rows.map((row: Record<string, unknown>) => [row.id, row]));
      visits.forEach((row) => { row.patients = byId.get(row.patient_id) ?? null; });
    }
  }
  return rows;
}

async function assertInsertAccess(table: string, userId: string, records: Record<string, unknown>[]) {
  const database = getDatabase();
  if (table === 'users') throw new Error('Users are synchronized from authentication only');
  if (table === 'clinics') throw new Error('Use the clinic onboarding endpoint');

  for (const record of records) {
    let clinicId = record.clinic_id;
    if (!clinicId && table === 'provider_availability') {
      const result = await database.pool.query('SELECT clinic_id FROM providers WHERE id = $1', [record.provider_id]);
      clinicId = result.rows[0]?.clinic_id;
    }
    if (!clinicId && table === 'visit_procedures') {
      const result = await database.pool.query('SELECT clinic_id FROM visits WHERE id = $1', [record.visit_id]);
      clinicId = result.rows[0]?.clinic_id;
    }
    const result = await database.pool.query(
      'SELECT role FROM user_clinics WHERE user_id = $1 AND clinic_id = $2',
      [userId, clinicId],
    );
    if (!result.rowCount) throw new Error('Forbidden');
    const allowedRoles = privilegedWrites[table];
    if (allowedRoles && !allowedRoles.includes(result.rows[0].role)) throw new Error('Forbidden');
    if (table === 'notifications' && record.user_id) {
      const target = await database.pool.query(
        'SELECT 1 FROM user_clinics WHERE user_id = $1 AND clinic_id = $2',
        [record.user_id, clinicId],
      );
      if (!target.rowCount) throw new Error('Notification recipient is not a clinic member');
    }
    if (table === 'audit_logs' && record.user_id !== userId) throw new Error('Invalid audit user');
  }
}

async function assertMutationRole(table: string, userId: string, whereSql: string, values: unknown[], filters: Filter[] = []) {
  const roles = privilegedWrites[table];
  if (!roles) return;
  const database = getDatabase();
  let clinicQuery: string;
  if (table === 'clinics') clinicQuery = `SELECT id AS clinic_id FROM clinics WHERE ${whereSql}`;
  else if (table === 'provider_availability') {
    const idFilter = filters.find((filter) => filter.column === 'id' && filter.operator === 'eq');
    const providerFilter = filters.find((filter) => filter.column === 'provider_id' && filter.operator === 'eq');
    if (idFilter) {
      clinicQuery = 'SELECT p.clinic_id FROM provider_availability pa JOIN providers p ON p.id = pa.provider_id WHERE pa.id = $1';
      values = [idFilter.value];
    } else if (providerFilter) {
      clinicQuery = 'SELECT clinic_id FROM providers WHERE id = $1';
      values = [providerFilter.value];
    } else throw new Error('Provider availability mutation requires an id filter');
  } else clinicQuery = `SELECT DISTINCT clinic_id FROM ${identifier(table)} WHERE ${whereSql}`;
  const clinics = await database.pool.query(clinicQuery, values);
  for (const row of clinics.rows) {
    const membership = await database.pool.query('SELECT role FROM user_clinics WHERE user_id = $1 AND clinic_id = $2', [userId, row.clinic_id]);
    if (!membership.rows[0] || !roles.includes(membership.rows[0].role)) throw new Error('Forbidden');
  }
}

export default async (request: Request, _context: Context) => {
  try {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 });
    const user = await getCurrentUser(request);
    const input = await readJson<DataRequest>(request);
    if (!tables.has(input.table)) return json({ error: 'Unknown table' }, { status: 400 });
    if (input.operation !== 'select') assertDemoAccountCanMutate(user.email);

    const database = getDatabase();
    const table = identifier(input.table);
    const where = buildWhere(input.table, user.id, input.filters, input.or, input.orForeignTable);

    if (input.operation === 'select') {
      const countResult = input.count === 'exact'
        ? await database.pool.query(`SELECT count(*)::int AS count FROM ${table} WHERE ${where.sql}`, where.values)
        : null;
      if (input.head) return json({ data: null, error: null, count: countResult?.rows[0]?.count ?? null });

      let query = `SELECT * FROM ${table} WHERE ${where.sql}`;
      if (input.order?.length) query += ` ORDER BY ${input.order.map((item) => `${identifier(item.column)} ${item.ascending ? 'ASC' : 'DESC'}`).join(', ')}`;
      if (input.range) query += ` LIMIT ${Math.max(0, input.range[1] - input.range[0] + 1)} OFFSET ${Math.max(0, input.range[0])}`;
      else if (input.limit) query += ` LIMIT ${Math.max(0, input.limit)}`;
      const result = await database.pool.query(query, where.values);
      const rows = await hydrate(input.table, result.rows, input.select);
      const data = input.single || input.maybeSingle ? rows[0] ?? null : rows;
      return json({ data, error: null, count: countResult?.rows[0]?.count ?? null });
    }

    if (input.operation === 'insert' || input.operation === 'upsert') {
      const records = Array.isArray(input.values) ? input.values : [input.values ?? {}];
      await assertInsertAccess(input.table, user.id, records);
      const columns = [...new Set(records.flatMap((record) => Object.keys(record)))];
      columns.forEach(identifier);
      const values: unknown[] = [];
      const rowsSql = records.map((record) => `(${columns.map((column) => {
        values.push(record[column] ?? null);
        return `$${values.length}`;
      }).join(', ')})`).join(', ');
      let query = `INSERT INTO ${table} (${columns.map(identifier).join(', ')}) VALUES ${rowsSql}`;
      if (input.operation === 'upsert') {
        const conflictColumns = (input.onConflict || 'id').split(',').map((column) => identifier(column.trim()));
        const updateColumns = columns.filter((column) => !conflictColumns.includes(identifier(column)));
        query += ` ON CONFLICT (${conflictColumns.join(', ')}) DO UPDATE SET ${updateColumns.map((column) => `${identifier(column)} = EXCLUDED.${identifier(column)}`).join(', ')}`;
      }
      query += ' RETURNING *';
      const result = await database.pool.query(query, values);
      const data = input.single || input.maybeSingle ? result.rows[0] ?? null : result.rows;
      return json({ data, error: null, count: null });
    }

    if (input.operation === 'update') {
      await assertMutationRole(input.table, user.id, where.sql, where.values, input.filters);
      const valuesToSet = input.values && !Array.isArray(input.values) ? input.values : {};
      const queryValues = [...where.values];
      const assignments = Object.entries(valuesToSet).map(([column, value]) => {
        queryValues.push(value);
        return `${identifier(column)} = $${queryValues.length}`;
      });
      const result = await database.pool.query(
        `UPDATE ${table} SET ${assignments.join(', ')} WHERE ${where.sql} RETURNING *`,
        queryValues,
      );
      const data = input.single || input.maybeSingle ? result.rows[0] ?? null : result.rows;
      return json({ data, error: null, count: null });
    }

    await assertMutationRole(input.table, user.id, where.sql, where.values, input.filters);
    if (input.table === 'patients') {
      const clinics = await database.pool.query(`SELECT DISTINCT clinic_id FROM patients WHERE ${where.sql}`, where.values);
      for (const row of clinics.rows) {
        const membership = await database.pool.query('SELECT role FROM user_clinics WHERE user_id = $1 AND clinic_id = $2', [user.id, row.clinic_id]);
        if (!['owner', 'admin'].includes(membership.rows[0]?.role)) throw new Error('Forbidden');
      }
    }
    const result = await database.pool.query(`DELETE FROM ${table} WHERE ${where.sql} RETURNING *`, where.values);
    return json({ data: input.single ? result.rows[0] ?? null : result.rows, error: null, count: null });
  } catch (error) {
    return errorResponse(error);
  }
};

export const config: Config = { path: '/api/data' };

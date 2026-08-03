import { getPool } from './database.js';

export const DEMO_ACCOUNT_EMAIL = 'demo@clinichub.app';
export const DEMO_CLINIC_ID = '10000000-0000-4000-8000-000000000001';

export class DemoAccountReadOnlyError extends Error {
  constructor() {
    super('Demo account is read-only');
    this.name = 'DemoAccountReadOnlyError';
  }
}

export function isDemoAccount(email: string): boolean {
  return email.trim().toLowerCase() === DEMO_ACCOUNT_EMAIL;
}

export function assertDemoAccountCanMutate(email: string): void {
  if (isDemoAccount(email)) throw new DemoAccountReadOnlyError();
}

export async function ensureDemoAccountData(user: { id: string; email: string }): Promise<void> {
  if (!isDemoAccount(user.email)) return;

  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('clinichub-demo-account-data'))");

    const currentSeed = await client.query(
      `SELECT 1
         FROM clinics c
         JOIN user_clinics uc ON uc.clinic_id = c.id
        WHERE c.id = $1
          AND uc.user_id = $2
          AND c.updated_at::date = CURRENT_DATE
        LIMIT 1`,
      [DEMO_CLINIC_ID, user.id],
    );

    if (currentSeed.rowCount) {
      await client.query('COMMIT');
      return;
    }

    await client.query(
      `INSERT INTO clinics (
         id, name, address, phone, email, plan, subscription_status,
         currency_code, currency_symbol, created_at, updated_at
       ) VALUES (
         $1, 'Harbor Health Demo Clinic', '1250 Market Street, San Francisco, CA 94102',
         '(415) 555-0142', 'demo-clinic@example.com', 'professional', 'active',
         'USD', '$', now() - interval '18 months', now()
       )
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         address = EXCLUDED.address,
         phone = EXCLUDED.phone,
         email = EXCLUDED.email,
         plan = EXCLUDED.plan,
         subscription_status = EXCLUDED.subscription_status,
         currency_code = EXCLUDED.currency_code,
         currency_symbol = EXCLUDED.currency_symbol`,
      [DEMO_CLINIC_ID],
    );

    await client.query('DELETE FROM user_clinics WHERE clinic_id = $1 AND user_id <> $2', [DEMO_CLINIC_ID, user.id]);
    await client.query(
      `INSERT INTO user_clinics (user_id, clinic_id, role)
       VALUES ($1, $2, 'owner')
       ON CONFLICT (user_id, clinic_id) DO UPDATE SET role = 'owner'`,
      [user.id, DEMO_CLINIC_ID],
    );

    await client.query(
      `INSERT INTO patients (
         id, clinic_id, first_name, last_name, email, phone, date_of_birth,
         gender, address, medical_notes, created_at, updated_at
       ) VALUES
         ('20000000-0000-4000-8000-000000000001', $1, 'Olivia', 'Bennett', 'olivia.bennett@example.com', '(415) 555-0101', '1988-04-12', 'female', 'San Francisco, CA', 'Seasonal allergies. No known medication allergies.', date_trunc('day', now()) + interval '8 hours', now()),
         ('20000000-0000-4000-8000-000000000002', $1, 'Ethan', 'Carter', 'ethan.carter@example.com', '(415) 555-0102', '1976-11-03', 'male', 'Oakland, CA', 'Hypertension monitored by primary care provider.', now() - interval '4 days', now()),
         ('20000000-0000-4000-8000-000000000003', $1, 'Mia', 'Rodriguez', 'mia.rodriguez@example.com', '(415) 555-0103', '1993-08-21', 'female', 'Daly City, CA', 'Prefers morning appointments.', now() - interval '12 days', now()),
         ('20000000-0000-4000-8000-000000000004', $1, 'Noah', 'Thompson', 'noah.thompson@example.com', '(415) 555-0104', '1982-01-29', 'male', 'Berkeley, CA', 'History of lower back strain.', now() - interval '24 days', now()),
         ('20000000-0000-4000-8000-000000000005', $1, 'Ava', 'Kim', 'ava.kim@example.com', '(415) 555-0105', '2001-06-15', 'female', 'San Mateo, CA', '', now() - interval '38 days', now()),
         ('20000000-0000-4000-8000-000000000006', $1, 'Lucas', 'Morgan', 'lucas.morgan@example.com', '(415) 555-0106', '1969-09-07', 'male', 'San Francisco, CA', 'Type 2 diabetes, controlled.', now() - interval '52 days', now()),
         ('20000000-0000-4000-8000-000000000007', $1, 'Sophia', 'Patel', 'sophia.patel@example.com', '(415) 555-0107', '1996-12-18', 'female', 'Alameda, CA', 'No known allergies.', now() - interval '67 days', now()),
         ('20000000-0000-4000-8000-000000000008', $1, 'Jackson', 'Lee', 'jackson.lee@example.com', '(415) 555-0108', '1985-03-24', 'male', 'South San Francisco, CA', 'Follow-up every six months.', now() - interval '83 days', now())
       ON CONFLICT (id) DO UPDATE SET
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         email = EXCLUDED.email,
         phone = EXCLUDED.phone,
         date_of_birth = EXCLUDED.date_of_birth,
         gender = EXCLUDED.gender,
         address = EXCLUDED.address,
         medical_notes = EXCLUDED.medical_notes,
         created_at = EXCLUDED.created_at`,
      [DEMO_CLINIC_ID],
    );

    await client.query(
      `INSERT INTO providers (id, clinic_id, name, specialization, created_at, updated_at) VALUES
         ('30000000-0000-4000-8000-000000000001', $1, 'Dr. Maya Chen', 'Family Medicine', now() - interval '18 months', now()),
         ('30000000-0000-4000-8000-000000000002', $1, 'Dr. Daniel Brooks', 'Internal Medicine', now() - interval '14 months', now()),
         ('30000000-0000-4000-8000-000000000003', $1, 'Dr. Priya Shah', 'Dermatology', now() - interval '9 months', now())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         specialization = EXCLUDED.specialization`,
      [DEMO_CLINIC_ID],
    );

    await client.query(
      `INSERT INTO provider_availability (id, provider_id, day_of_week, start_time, end_time) VALUES
         ('31000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 1, '08:00', '16:00'),
         ('31000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 3, '08:00', '16:00'),
         ('31000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000001', 5, '08:00', '14:00'),
         ('31000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000002', 2, '09:00', '17:00'),
         ('31000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000002', 4, '09:00', '17:00'),
         ('31000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000003', 1, '10:00', '18:00'),
         ('31000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000003', 4, '10:00', '18:00')
       ON CONFLICT (id) DO UPDATE SET
         day_of_week = EXCLUDED.day_of_week,
         start_time = EXCLUDED.start_time,
         end_time = EXCLUDED.end_time`,
    );

    await client.query(
      `INSERT INTO procedures (id, clinic_id, name, description, base_cost) VALUES
         ('40000000-0000-4000-8000-000000000001', $1, 'Comprehensive Consultation', 'Full health assessment and care plan.', 180.00),
         ('40000000-0000-4000-8000-000000000002', $1, 'Routine Follow-up', 'Progress review and medication check.', 95.00),
         ('40000000-0000-4000-8000-000000000003', $1, 'Preventive Screening', 'Age-appropriate preventive health screening.', 140.00),
         ('40000000-0000-4000-8000-000000000004', $1, 'Minor Procedure', 'In-office minor procedure and aftercare.', 260.00),
         ('40000000-0000-4000-8000-000000000005', $1, 'Dermatology Evaluation', 'Skin concern evaluation and treatment plan.', 165.00)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         base_cost = EXCLUDED.base_cost`,
      [DEMO_CLINIC_ID],
    );

    await client.query(
      `INSERT INTO appointments (
         id, clinic_id, patient_id, provider_id, start_time, end_time, status, notes, created_at, updated_at
       ) VALUES
         ('50000000-0000-4000-8000-000000000001', $1, '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', date_trunc('day', now()) + interval '9 hours', date_trunc('day', now()) + interval '9 hours 45 minutes', 'completed', 'Annual wellness consultation.', now() - interval '6 days', now()),
         ('50000000-0000-4000-8000-000000000002', $1, '20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', date_trunc('day', now()) + interval '11 hours', date_trunc('day', now()) + interval '11 hours 30 minutes', 'confirmed', 'Blood pressure follow-up.', now() - interval '3 days', now()),
         ('50000000-0000-4000-8000-000000000003', $1, '20000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', date_trunc('day', now()) + interval '14 hours', date_trunc('day', now()) + interval '14 hours 45 minutes', 'scheduled', 'Skin irritation consultation.', now() - interval '2 days', now()),
         ('50000000-0000-4000-8000-000000000004', $1, '20000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000001', date_trunc('day', now()) + interval '1 day 10 hours', date_trunc('day', now()) + interval '1 day 10 hours 30 minutes', 'confirmed', 'Back pain follow-up.', now() - interval '1 day', now()),
         ('50000000-0000-4000-8000-000000000005', $1, '20000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000002', date_trunc('day', now()) + interval '2 days 13 hours', date_trunc('day', now()) + interval '2 days 13 hours 45 minutes', 'scheduled', 'New patient consultation.', now(), now()),
         ('50000000-0000-4000-8000-000000000006', $1, '20000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000002', date_trunc('day', now()) - interval '2 days' + interval '10 hours', date_trunc('day', now()) - interval '2 days' + interval '10 hours 30 minutes', 'completed', 'Diabetes follow-up.', now() - interval '8 days', now()),
         ('50000000-0000-4000-8000-000000000007', $1, '20000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000003', date_trunc('day', now()) - interval '5 days' + interval '15 hours', date_trunc('day', now()) - interval '5 days' + interval '15 hours 45 minutes', 'completed', 'Dermatology evaluation.', now() - interval '11 days', now()),
         ('50000000-0000-4000-8000-000000000008', $1, '20000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000001', date_trunc('day', now()) - interval '9 days' + interval '9 hours', date_trunc('day', now()) - interval '9 days' + interval '9 hours 30 minutes', 'completed', 'Preventive screening.', now() - interval '14 days', now()),
         ('50000000-0000-4000-8000-000000000009', $1, '20000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002', date_trunc('day', now()) - interval '16 days' + interval '13 hours', date_trunc('day', now()) - interval '16 days' + interval '13 hours 30 minutes', 'completed', 'Routine follow-up.', now() - interval '20 days', now()),
         ('50000000-0000-4000-8000-000000000010', $1, '20000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000001', date_trunc('day', now()) - interval '24 days' + interval '11 hours', date_trunc('day', now()) - interval '24 days' + interval '11 hours 45 minutes', 'completed', 'Minor procedure.', now() - interval '27 days', now())
       ON CONFLICT (id) DO UPDATE SET
         patient_id = EXCLUDED.patient_id,
         provider_id = EXCLUDED.provider_id,
         start_time = EXCLUDED.start_time,
         end_time = EXCLUDED.end_time,
         status = EXCLUDED.status,
         notes = EXCLUDED.notes,
         created_at = EXCLUDED.created_at`,
      [DEMO_CLINIC_ID],
    );

    await client.query(
      `INSERT INTO visits (
         id, clinic_id, appointment_id, patient_id, provider_id, status,
         chief_complaint, diagnosis, notes, visit_date, created_at, updated_at
       ) VALUES
         ('60000000-0000-4000-8000-000000000001', $1, '50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'completed', 'Annual wellness visit', 'Healthy adult preventive care', 'Reviewed preventive screening schedule and lifestyle goals.', date_trunc('day', now()) + interval '9 hours', now(), now()),
         ('60000000-0000-4000-8000-000000000002', $1, '50000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000002', 'completed', 'Diabetes follow-up', 'Type 2 diabetes, controlled', 'Continue current plan and repeat labs in three months.', date_trunc('day', now()) - interval '2 days' + interval '10 hours', now() - interval '2 days', now()),
         ('60000000-0000-4000-8000-000000000003', $1, '50000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000003', 'completed', 'Persistent skin irritation', 'Contact dermatitis', 'Recommended fragrance-free moisturizer and short topical treatment.', date_trunc('day', now()) - interval '5 days' + interval '15 hours', now() - interval '5 days', now()),
         ('60000000-0000-4000-8000-000000000004', $1, '50000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000001', 'completed', 'Preventive screening', 'Routine preventive care', 'Screening results reviewed; no acute concerns.', date_trunc('day', now()) - interval '9 days' + interval '9 hours', now() - interval '9 days', now()),
         ('60000000-0000-4000-8000-000000000005', $1, '50000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002', 'completed', 'Fatigue follow-up', 'Improving sleep-related fatigue', 'Symptoms improving with sleep hygiene changes.', date_trunc('day', now()) - interval '16 days' + interval '13 hours', now() - interval '16 days', now()),
         ('60000000-0000-4000-8000-000000000006', $1, '50000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000001', 'completed', 'Painful skin lesion', 'Benign lesion', 'Minor in-office removal completed without complication.', date_trunc('day', now()) - interval '24 days' + interval '11 hours', now() - interval '24 days', now())
       ON CONFLICT (id) DO UPDATE SET
         appointment_id = EXCLUDED.appointment_id,
         patient_id = EXCLUDED.patient_id,
         provider_id = EXCLUDED.provider_id,
         status = EXCLUDED.status,
         chief_complaint = EXCLUDED.chief_complaint,
         diagnosis = EXCLUDED.diagnosis,
         notes = EXCLUDED.notes,
         visit_date = EXCLUDED.visit_date,
         created_at = EXCLUDED.created_at`,
      [DEMO_CLINIC_ID],
    );

    await client.query(
      `INSERT INTO invoices (id, clinic_id, visit_id, status, total_amount, amount_paid, created_at, updated_at) VALUES
         ('80000000-0000-4000-8000-000000000001', $1, '60000000-0000-4000-8000-000000000001', 'paid', 320.00, 320.00, date_trunc('day', now()) + interval '10 hours', now()),
         ('80000000-0000-4000-8000-000000000002', $1, '60000000-0000-4000-8000-000000000002', 'paid', 95.00, 95.00, now() - interval '2 days', now()),
         ('80000000-0000-4000-8000-000000000003', $1, '60000000-0000-4000-8000-000000000003', 'partial', 165.00, 80.00, now() - interval '5 days', now()),
         ('80000000-0000-4000-8000-000000000004', $1, '60000000-0000-4000-8000-000000000004', 'paid', 140.00, 140.00, now() - interval '9 days', now()),
         ('80000000-0000-4000-8000-000000000005', $1, '60000000-0000-4000-8000-000000000005', 'unpaid', 95.00, 0.00, now() - interval '16 days', now()),
         ('80000000-0000-4000-8000-000000000006', $1, '60000000-0000-4000-8000-000000000006', 'paid', 260.00, 260.00, now() - interval '24 days', now())
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         total_amount = EXCLUDED.total_amount,
         amount_paid = EXCLUDED.amount_paid,
         created_at = EXCLUDED.created_at`,
      [DEMO_CLINIC_ID],
    );

    await client.query(
      `INSERT INTO visit_procedures (id, visit_id, procedure_id, quantity, price, notes) VALUES
         ('70000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 1, 180.00, ''),
         ('70000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000003', 1, 140.00, ''),
         ('70000000-0000-4000-8000-000000000003', '60000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 1, 95.00, ''),
         ('70000000-0000-4000-8000-000000000004', '60000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000005', 1, 165.00, ''),
         ('70000000-0000-4000-8000-000000000005', '60000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000003', 1, 140.00, ''),
         ('70000000-0000-4000-8000-000000000006', '60000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000002', 1, 95.00, ''),
         ('70000000-0000-4000-8000-000000000007', '60000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-000000000004', 1, 260.00, '')
       ON CONFLICT (id) DO UPDATE SET
         visit_id = EXCLUDED.visit_id,
         procedure_id = EXCLUDED.procedure_id,
         quantity = EXCLUDED.quantity,
         price = EXCLUDED.price,
         notes = EXCLUDED.notes`,
    );

    await client.query(
      `INSERT INTO payments (id, clinic_id, invoice_id, amount, method, notes, created_at) VALUES
         ('90000000-0000-4000-8000-000000000001', $1, '80000000-0000-4000-8000-000000000001', 320.00, 'card', 'Paid in full.', date_trunc('day', now()) + interval '10 hours 15 minutes'),
         ('90000000-0000-4000-8000-000000000002', $1, '80000000-0000-4000-8000-000000000002', 95.00, 'card', '', now() - interval '2 days'),
         ('90000000-0000-4000-8000-000000000003', $1, '80000000-0000-4000-8000-000000000003', 80.00, 'cash', 'Partial payment.', now() - interval '5 days'),
         ('90000000-0000-4000-8000-000000000004', $1, '80000000-0000-4000-8000-000000000004', 140.00, 'bank_transfer', '', now() - interval '9 days'),
         ('90000000-0000-4000-8000-000000000005', $1, '80000000-0000-4000-8000-000000000006', 260.00, 'card', '', now() - interval '24 days')
       ON CONFLICT (id) DO UPDATE SET
         amount = EXCLUDED.amount,
         method = EXCLUDED.method,
         notes = EXCLUDED.notes,
         created_at = EXCLUDED.created_at`,
      [DEMO_CLINIC_ID],
    );

    await client.query(
      `INSERT INTO subscriptions (
         id, clinic_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end
       ) VALUES (
         'a0000000-0000-4000-8000-000000000001', $1,
         'demo_customer_10000000000040008000000000000001',
         'demo_subscription_10000000000040008000000000000001',
         'professional', 'active', now() + interval '30 days'
       )
       ON CONFLICT (id) DO UPDATE SET
         plan = EXCLUDED.plan,
         status = EXCLUDED.status,
         current_period_end = EXCLUDED.current_period_end`,
      [DEMO_CLINIC_ID],
    );

    await client.query(
      `INSERT INTO notifications (id, clinic_id, user_id, type, message, read, metadata, created_at) VALUES
         ('b0000000-0000-4000-8000-000000000001', $1, $2, 'appointment', 'Two appointments are scheduled for today.', false, '{"source":"demo"}', now() - interval '25 minutes'),
         ('b0000000-0000-4000-8000-000000000002', $1, $2, 'payment', 'A payment of $320.00 was recorded.', false, '{"source":"demo"}', now() - interval '1 hour'),
         ('b0000000-0000-4000-8000-000000000003', $1, $2, 'system', 'The demo clinic data refreshes daily.', true, '{"source":"demo"}', now() - interval '1 day')
       ON CONFLICT (id) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         message = EXCLUDED.message,
         read = EXCLUDED.read,
         metadata = EXCLUDED.metadata,
         created_at = EXCLUDED.created_at`,
      [DEMO_CLINIC_ID, user.id],
    );

    await client.query(
      `INSERT INTO backups (
         id, clinic_id, backup_time, backup_status, backup_size, backup_type, created_at, updated_at
       ) VALUES (
         'c0000000-0000-4000-8000-000000000001', $1, now() - interval '1 day', 'completed', 2841600, 'full', now() - interval '1 day', now()
       )
       ON CONFLICT (id) DO UPDATE SET
         backup_time = EXCLUDED.backup_time,
         backup_status = EXCLUDED.backup_status,
         backup_size = EXCLUDED.backup_size,
         backup_type = EXCLUDED.backup_type`,
      [DEMO_CLINIC_ID],
    );

    await client.query(
      `UPDATE appointment_reminders
          SET sent = true
        WHERE clinic_id = $1
          AND appointment_id IN (
            '50000000-0000-4000-8000-000000000001',
            '50000000-0000-4000-8000-000000000002',
            '50000000-0000-4000-8000-000000000003',
            '50000000-0000-4000-8000-000000000004',
            '50000000-0000-4000-8000-000000000005',
            '50000000-0000-4000-8000-000000000006',
            '50000000-0000-4000-8000-000000000007',
            '50000000-0000-4000-8000-000000000008',
            '50000000-0000-4000-8000-000000000009',
            '50000000-0000-4000-8000-000000000010'
          )`,
      [DEMO_CLINIC_ID],
    );

    await client.query('UPDATE clinics SET updated_at = now() WHERE id = $1', [DEMO_CLINIC_ID]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

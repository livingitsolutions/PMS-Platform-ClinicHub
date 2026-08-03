import type { Config } from '@netlify/functions';
import { getDatabase } from '@netlify/database';
import { getCurrentUser } from './_shared/auth.mjs';
import { assertDemoAccountCanMutate } from './_shared/demo-data.mjs';
import { errorResponse, json } from './_shared/http.mjs';

export async function processAppointmentReminders() {
  const database = getDatabase();
  const result = await database.pool.query(
    `SELECT ar.id, a.start_time, p.first_name, p.last_name, p.email AS patient_email,
            pr.name AS provider_name, c.name AS clinic_name, c.email AS clinic_email
     FROM appointment_reminders ar
     JOIN appointments a ON a.id = ar.appointment_id
     JOIN patients p ON p.id = a.patient_id
     LEFT JOIN providers pr ON pr.id = a.provider_id
     JOIN clinics c ON c.id = ar.clinic_id
     WHERE ar.sent = false AND ar.reminder_time <= now() AND a.status <> 'cancelled'
     ORDER BY ar.reminder_time LIMIT 100`,
  );
  const resendKey = process.env.RESEND_API_KEY;
  let sent = 0;
  let skipped = 0;
  for (const reminder of result.rows) {
    if (!reminder.patient_email || !resendKey) { skipped += 1; continue; }
    const appointmentDate = new Date(reminder.start_time);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: reminder.clinic_email ? `${reminder.clinic_name} <${reminder.clinic_email}>` : `${reminder.clinic_name} <onboarding@resend.dev>`,
        to: [reminder.patient_email],
        subject: `Appointment reminder from ${reminder.clinic_name}`,
        html: `<p>Hello ${reminder.first_name} ${reminder.last_name},</p><p>This is a reminder for your appointment on <strong>${appointmentDate.toLocaleString('en-US')}</strong> with ${reminder.provider_name || 'your provider'}.</p>`,
      }),
    });
    if (response.ok) {
      await database.pool.query('UPDATE appointment_reminders SET sent = true WHERE id = $1', [reminder.id]);
      sent += 1;
    } else skipped += 1;
  }
  return { processed: result.rowCount, sent, skipped };
}

export default async (request: Request) => {
  try {
    const user = await getCurrentUser(request);
    assertDemoAccountCanMutate(user.email);
    return json(await processAppointmentReminders());
  } catch (error) { return errorResponse(error); }
};

export const config: Config = { path: '/api/process-appointment-reminders' };

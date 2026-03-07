import type { PendingReminderWithDetails } from '../api/remindersApi';

export interface EmailReminderData {
  clinicName: string;
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  providerName: string;
}

export function prepareReminderEmail(
  reminder: PendingReminderWithDetails
): EmailReminderData | null {
  if (!reminder.appointments) return null;

  const appointment = reminder.appointments;
  const patient = appointment.patients;
  const provider = appointment.providers;
  const clinic = appointment.clinics;

  if (!patient?.email) return null;

  const appointmentDate = new Date(appointment.start_time);

  return {
    clinicName: clinic?.name || 'Your Clinic',
    patientName: `${patient.first_name} ${patient.last_name}`,
    patientEmail: patient.email,
    appointmentDate: appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    appointmentTime: appointmentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    providerName: provider?.name || 'Your Provider',
  };
}

export function generateReminderEmailHTML(data: EmailReminderData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Reminder</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #007bff;
    }
    .header h1 {
      color: #007bff;
      margin: 0;
      font-size: 28px;
    }
    .clinic-name {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .appointment-details {
      background-color: #f8f9fa;
      border-left: 4px solid #007bff;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .detail-row {
      margin: 12px 0;
      display: flex;
      align-items: baseline;
    }
    .detail-label {
      font-weight: 600;
      color: #555;
      min-width: 120px;
    }
    .detail-value {
      color: #333;
      font-weight: 500;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 14px;
      color: #666;
      text-align: center;
    }
    .important-note {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Appointment Reminder</h1>
      <div class="clinic-name">${data.clinicName}</div>
    </div>

    <div class="greeting">
      Hello ${data.patientName},
    </div>

    <p>This is a friendly reminder about your upcoming appointment.</p>

    <div class="appointment-details">
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value">${data.appointmentDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span class="detail-value">${data.appointmentTime}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Provider:</span>
        <span class="detail-value">${data.providerName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Location:</span>
        <span class="detail-value">${data.clinicName}</span>
      </div>
    </div>

    <div class="important-note">
      <strong>Please Note:</strong> If you need to reschedule or cancel your appointment, please contact us as soon as possible.
    </div>

    <p>We look forward to seeing you!</p>

    <div class="footer">
      <p>This is an automated reminder from ${data.clinicName}.</p>
      <p style="font-size: 12px; color: #999;">Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateReminderEmailText(data: EmailReminderData): string {
  return `
APPOINTMENT REMINDER
${data.clinicName}

Hello ${data.patientName},

This is a friendly reminder about your upcoming appointment.

APPOINTMENT DETAILS:
Date: ${data.appointmentDate}
Time: ${data.appointmentTime}
Provider: ${data.providerName}
Location: ${data.clinicName}

IMPORTANT: If you need to reschedule or cancel your appointment, please contact us as soon as possible.

We look forward to seeing you!

---
This is an automated reminder from ${data.clinicName}.
Please do not reply to this email.
  `.trim();
}

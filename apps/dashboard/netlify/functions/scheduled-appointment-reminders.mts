import type { Config } from '@netlify/functions';
import { processAppointmentReminders } from './process-appointment-reminders.mjs';

export default async () => Response.json(await processAppointmentReminders());

export const config: Config = { schedule: '*/15 * * * *' };

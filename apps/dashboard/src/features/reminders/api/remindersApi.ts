import { supabase } from '@/lib/supabase';

export interface AppointmentReminder {
  id: string;
  appointment_id: string;
  clinic_id: string;
  reminder_time: string;
  sent: boolean;
  created_at: string;
}

export interface PendingReminderWithDetails extends AppointmentReminder {
  appointments: {
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    patients: {
      id: string;
      first_name: string;
      last_name: string;
      email: string | null;
    } | null;
    providers: {
      id: string;
      name: string;
    } | null;
    clinics: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export async function getPendingReminders(
  clinicId?: string
): Promise<PendingReminderWithDetails[]> {
  let query = supabase
    .from('appointment_reminders')
    .select(`
      id,
      appointment_id,
      clinic_id,
      reminder_time,
      sent,
      created_at,
      appointments!inner (
        id,
        start_time,
        end_time,
        status,
        patients!inner (
          id,
          first_name,
          last_name,
          email
        ),
        providers (
          id,
          name
        ),
        clinics (
          id,
          name
        )
      )
    `)
    .eq('sent', false)
    .lte('reminder_time', new Date().toISOString())
    .neq('appointments.status', 'cancelled');

  if (clinicId) {
    query = query.eq('clinic_id', clinicId);
  }

  const { data, error } = await query.order('reminder_time', { ascending: true });

  if (error) throw error;

  return data as unknown as PendingReminderWithDetails[];
}

export async function markReminderAsSent(reminderId: string): Promise<void> {
  const { error } = await supabase
    .from('appointment_reminders')
    .update({ sent: true })
    .eq('id', reminderId);

  if (error) throw error;
}

export async function getClinicReminders(
  clinicId: string,
  includeAll: boolean = false
): Promise<AppointmentReminder[]> {
  let query = supabase
    .from('appointment_reminders')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('reminder_time', { ascending: false });

  if (!includeAll) {
    query = query.eq('sent', false);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data as AppointmentReminder[];
}

export async function createManualReminder(
  appointmentId: string,
  clinicId: string,
  reminderTime: string
): Promise<AppointmentReminder> {
  const { data, error } = await supabase
    .from('appointment_reminders')
    .insert({
      appointment_id: appointmentId,
      clinic_id: clinicId,
      reminder_time: reminderTime,
    })
    .select()
    .single();

  if (error) throw error;

  return data as AppointmentReminder;
}

export async function deleteReminder(reminderId: string, clinicId: string): Promise<void> {
  const { error } = await supabase
    .from('appointment_reminders')
    .delete()
    .eq('id', reminderId)
    .eq('clinic_id', clinicId);

  if (error) throw error;
}

import { supabase } from '@/lib/supabase';
import { createNotification } from '@/features/notifications/api/notificationsApi';

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  provider_id: string | null;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  clinic_id: string;
  user_id: string | null;
  name: string;
  specialization: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentPayload {
  patient_id: string;
  provider_id: string;
  start_time: string;
  end_time: string;
  notes?: string | null;
}

export interface UpdateAppointmentPayload {
  patient_id?: string;
  provider_id?: string;
  start_time?: string;
  end_time?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string | null;
}

export async function getAppointments(
  clinicId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    providerId?: string;
    patientId?: string;
  }
): Promise<Appointment[]> {
  let query = supabase
    .from('appointments')
    .select(`
      id,
      clinic_id,
      patient_id,
      provider_id,
      start_time,
      end_time,
      status,
      notes
    `)
    .eq('clinic_id', clinicId);

  if (filters?.startDate) {
    query = query.gte('start_time', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('start_time', filters.endDate);
  }

  if (filters?.providerId) {
    query = query.eq('provider_id', filters.providerId);
  }

  if (filters?.patientId) {
    query = query.eq('patient_id', filters.patientId);
  }

  const { data, error } = await query.order('start_time', { ascending: true });

  if (error) throw error;

  return data as Appointment[];
}

export async function createAppointment(
  clinicId: string,
  payload: CreateAppointmentPayload
): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      clinic_id: clinicId,
      patient_id: payload.patient_id,
      provider_id: payload.provider_id,
      start_time: payload.start_time,
      end_time: payload.end_time,
      notes: payload.notes || null,
      status: 'scheduled',
    })
    .select()
    .single();

  if (error) throw error;

  const appointment = data as Appointment;

  const { data: patientData } = await supabase
    .from('patients')
    .select('first_name, last_name')
    .eq('id', appointment.patient_id)
    .single();

  const { data: clinicUsers } = await supabase
    .from('user_clinics')
    .select('user_id')
    .eq('clinic_id', clinicId);

  if (clinicUsers && patientData) {
    const appointmentDate = new Date(appointment.start_time).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const message = `New appointment scheduled for ${patientData.first_name} ${patientData.last_name} on ${appointmentDate}`;

    for (const clinicUser of clinicUsers) {
      try {
        await createNotification(
          clinicId,
          clinicUser.user_id,
          'appointment_created',
          message,
          { appointmentId: appointment.id }
        );
      } catch (err) {
        console.error('Failed to create notification:', err);
      }
    }
  }

  return appointment;
}

export async function updateAppointment(
  appointmentId: string,
  payload: UpdateAppointmentPayload
): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .update(payload)
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) throw error;

  return data as Appointment;
}

export async function deleteAppointment(appointmentId: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId);

  if (error) throw error;
}

export async function getProviders(clinicId: string): Promise<Provider[]> {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true });

  if (error) throw error;

  return data as Provider[];
}

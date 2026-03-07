import { supabase } from '@/lib/supabase';
import { logAuditEvent, AuditActions, EntityTypes } from '@/lib/audit';

export interface Patient {
  id: string;
  clinic_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientPayload {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
}

export async function getPatients(
  clinicId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Patient>> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { count } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId);

  const { data, error } = await supabase
    .from('patients')
    .select(`
      id,
      clinic_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      created_at,
      updated_at
    `)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data as Patient[],
    totalCount: count || 0,
  };
}

export async function createPatient(
  clinicId: string,
  payload: CreatePatientPayload
): Promise<Patient> {
  const { data, error } = await supabase
    .from('patients')
    .insert({
      clinic_id: clinicId,
      first_name: payload.first_name,
      last_name: payload.last_name,
      date_of_birth: payload.date_of_birth,
      gender: payload.gender,
      phone: payload.phone || null,
      email: payload.email || null,
      address: payload.address || null,
    })
    .select()
    .single();

  if (error) throw error;

  const patient = data as Patient;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await logAuditEvent({
      clinicId,
      userId: user.id,
      action: AuditActions.PATIENT_CREATED,
      entityType: EntityTypes.PATIENT,
      entityId: patient.id,
      metadata: {
        patient_name: `${payload.first_name} ${payload.last_name}`,
        date_of_birth: payload.date_of_birth,
      },
    });
  }

  return patient;
}

export async function updatePatient(
  patientId: string,
  payload: Partial<CreatePatientPayload>
): Promise<Patient> {
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  );

  const { data, error } = await supabase
    .from('patients')
    .update({
      ...cleanPayload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', patientId)
    .select()
    .single();

  if (error) throw error;

  const patient = data as Patient;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await logAuditEvent({
      clinicId: patient.clinic_id,
      userId: user.id,
      action: AuditActions.PATIENT_UPDATED,
      entityType: EntityTypes.PATIENT,
      entityId: patient.id,
      metadata: {
        updated_fields: Object.keys(cleanPayload),
        patient_name: `${patient.first_name} ${patient.last_name}`,
      },
    });
  }

  return patient;
}

export async function deletePatient(patientId: string): Promise<void> {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', patientId);

  if (error) throw error;
}

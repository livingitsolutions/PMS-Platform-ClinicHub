import { supabase } from '@/lib/supabase';
import { logAuditEvent, AuditActions, EntityTypes } from '@/lib/audit';

export interface CreateClinicPayload {
  clinic_name: string;
  address: string;
  phone: string;
  email: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  created_at: string;
}

export async function createClinic(payload: CreateClinicPayload): Promise<Clinic> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to create a clinic');
  }

  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .insert({
      name: payload.clinic_name,
      address: payload.address,
      phone: payload.phone,
      email: payload.email,
    })
    .select()
    .single();

  if (clinicError) throw clinicError;

  const { error: clinicUserError } = await supabase
    .from('user_clinics')
    .insert({
      clinic_id: clinic.id,
      user_id: user.id,
      role: 'owner',
    });

  if (clinicUserError) throw clinicUserError;

  await logAuditEvent({
    clinicId: clinic.id,
    userId: user.id,
    action: AuditActions.CLINIC_CREATED,
    entityType: EntityTypes.CLINIC,
    entityId: clinic.id,
    metadata: {
      clinic_name: clinic.name,
    },
  });

  return clinic;
}

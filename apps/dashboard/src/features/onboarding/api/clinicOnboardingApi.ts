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
    .rpc('create_clinic_for_authenticated_user', {
      p_name: payload.clinic_name,
      p_address: payload.address,
      p_phone: payload.phone,
      p_email: payload.email,
    });

  if (clinicError) throw clinicError;

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

import { supabase } from '@/lib/supabase';
import { logAuditEvent, AuditActions, EntityTypes } from '@/lib/audit';
import { VisitWithDetails } from './visitsApi';

const VISIT_SELECT = `
  id,
  clinic_id,
  appointment_id,
  patient_id,
  provider_id,
  status,
  chief_complaint,
  diagnosis,
  notes,
  visit_date,
  created_at,
  updated_at,
  patients (
    id,
    first_name,
    last_name
  ),
  providers (
    id,
    name
  )
`;

export interface CreateWalkInVisitPayload {
  clinic_id: string;
  patient_id: string;
  provider_id: string;
  chief_complaint: string;
  visit_date: string;
}

export async function createWalkInVisit(
  payload: CreateWalkInVisitPayload
): Promise<VisitWithDetails> {
  const { data, error } = await supabase
    .from('visits')
    .insert({
      clinic_id: payload.clinic_id,
      patient_id: payload.patient_id,
      provider_id: payload.provider_id,
      chief_complaint: payload.chief_complaint,
      visit_date: payload.visit_date,
      appointment_id: null,
      status: 'in_progress',
    })
    .select(VISIT_SELECT)
    .single();

  if (error) throw error;

  const visit = data as unknown as VisitWithDetails;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await logAuditEvent({
      clinicId: payload.clinic_id,
      userId: user.id,
      action: AuditActions.VISIT_CREATED,
      entityType: EntityTypes.VISIT,
      entityId: visit.id,
      metadata: {
        walk_in: true,
        patient_name: `${visit.patients.first_name} ${visit.patients.last_name}`,
        provider_name: visit.providers.name,
      },
    });
  }

  return visit;
}

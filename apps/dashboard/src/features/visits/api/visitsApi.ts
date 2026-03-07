import { supabase } from '@/lib/supabase';
import { logAuditEvent, AuditActions, EntityTypes } from '@/lib/audit';
import { createNotification } from '@/features/notifications/api/notificationsApi';

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

export interface Visit {
  id: string;
  clinic_id: string;
  appointment_id: string | null;
  patient_id: string;
  provider_id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  chief_complaint: string;
  diagnosis: string;
  notes: string;
  visit_date: string;
  created_at: string;
  updated_at: string;
}

export interface VisitWithDetails extends Visit {
  patients: {
    id: string;
    first_name: string;
    last_name: string;
  };
  providers: {
    id: string;
    name: string;
  };
}

export async function getVisit(visitId: string): Promise<VisitWithDetails | null> {
  const { data, error } = await supabase
    .from('visits')
    .select(VISIT_SELECT)
    .eq('id', visitId)
    .maybeSingle();

  if (error) throw error;

  return data ? (data as unknown as VisitWithDetails) : null;
}

export async function getOrCreateVisitByAppointment(
  appointmentId: string
): Promise<VisitWithDetails> {
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .select('clinic_id, patient_id, provider_id, start_time')
    .eq('id', appointmentId)
    .single();

  if (appointmentError) throw appointmentError;
  if (!appointment) throw new Error('Appointment not found');

  const { data: upsertedVisit, error: upsertError } = await supabase
    .from('visits')
    .upsert(
      {
        clinic_id: appointment.clinic_id,
        patient_id: appointment.patient_id,
        provider_id: appointment.provider_id,
        appointment_id: appointmentId,
        status: 'scheduled',
        visit_date: appointment.start_time,
      },
      {
        onConflict: 'appointment_id',
        ignoreDuplicates: false,
      }
    )
    .select(VISIT_SELECT)
    .single();

  if (upsertError) throw upsertError;

  const visit = upsertedVisit as unknown as VisitWithDetails;

  const { data: existingVisit } = await supabase
    .from('visits')
    .select('created_at')
    .eq('id', visit.id)
    .single();

  const isNewVisit = existingVisit &&
    new Date(existingVisit.created_at).getTime() === new Date(visit.created_at).getTime();

  if (isNewVisit) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await logAuditEvent({
        clinicId: appointment.clinic_id,
        userId: user.id,
        action: AuditActions.VISIT_CREATED,
        entityType: EntityTypes.VISIT,
        entityId: visit.id,
        metadata: {
          appointment_id: appointmentId,
          patient_name: `${visit.patients.first_name} ${visit.patients.last_name}`,
          provider_name: visit.providers.name,
        },
      });
    }
  }

  return visit;
}

export interface UpdateVisitPayload {
  chief_complaint?: string;
  diagnosis?: string;
  notes?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export async function updateVisit(visitId: string, payload: UpdateVisitPayload): Promise<VisitWithDetails> {
  const { data, error } = await supabase
    .from('visits')
    .update(payload)
    .eq('id', visitId)
    .select(VISIT_SELECT)
    .single();

  if (error) throw error;

  const visit = data as unknown as VisitWithDetails;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await logAuditEvent({
      clinicId: visit.clinic_id,
      userId: user.id,
      action: AuditActions.VISIT_UPDATED,
      entityType: EntityTypes.VISIT,
      entityId: visitId,
      metadata: {
        updated_fields: Object.keys(payload),
        patient_name: `${visit.patients.first_name} ${visit.patients.last_name}`,
      },
    });
  }

  if (payload.status === 'completed') {
    const { data: clinicUsers } = await supabase
      .from('clinic_users')
      .select('user_id')
      .eq('clinic_id', visit.clinic_id);

    if (clinicUsers) {
      const patientName = `${visit.patients.first_name} ${visit.patients.last_name}`;
      const message = `Visit completed for ${patientName}`;

      for (const clinicUser of clinicUsers) {
        try {
          await createNotification(
            visit.clinic_id,
            clinicUser.user_id,
            'visit_completed',
            message,
            { visitId: visit.id }
          );
        } catch (err) {
          console.error('Failed to create notification:', err);
        }
      }
    }
  }

  return visit;
}

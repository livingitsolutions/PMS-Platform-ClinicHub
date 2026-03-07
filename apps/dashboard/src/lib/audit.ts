import { supabase } from './supabase';

export interface AuditEventParams {
  clinicId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
}

export async function logAuditEvent({
  clinicId,
  userId,
  action,
  entityType,
  entityId,
  metadata = {},
}: AuditEventParams): Promise<void> {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      clinic_id: clinicId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

export const AuditActions = {
  CLINIC_CREATED: 'clinic_created',
  PATIENT_CREATED: 'patient_created',
  PATIENT_UPDATED: 'patient_updated',
  VISIT_CREATED: 'visit_created',
  VISIT_UPDATED: 'visit_updated',
  INVOICE_CREATED: 'invoice_created',
  PAYMENT_ADDED: 'payment_added',
} as const;

export const EntityTypes = {
  CLINIC: 'clinic',
  PATIENT: 'patient',
  VISIT: 'visit',
  INVOICE: 'invoice',
  PAYMENT: 'payment',
} as const;

import { supabase } from '@/lib/supabase';
import { logAuditEvent, AuditActions, EntityTypes } from '@/lib/audit';
import { assertNotDemoMode } from '@/lib/demoMode';

export interface VisitProcedure {
  id: string;
  visit_id: string;
  procedure_id: string;
  quantity: number;
  price: number;
  notes: string | null;
  created_at: string;
}

export interface Procedure {
  id: string;
  clinic_id: string;
  name: string;
  description: string | null;
  base_cost: number;
  created_at: string;
  updated_at: string;
}

export interface CreateVisitProcedurePayload {
  visit_id: string;
  procedure_id: string;
  quantity?: number;
  price?: number | null;
  notes?: string | null;
}

export interface UpdateVisitProcedurePayload {
  quantity?: number;
  price?: number;
  notes?: string | null;
}

export async function getVisitProcedures(visitId: string): Promise<VisitProcedure[]> {
  const { data, error } = await supabase
    .from('visit_procedures')
    .select('*')
    .eq('visit_id', visitId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data as VisitProcedure[];
}

export async function createVisitProcedure(
  payload: CreateVisitProcedurePayload
): Promise<VisitProcedure> {
  assertNotDemoMode();
  let finalPrice = payload.price;

  if (finalPrice === null || finalPrice === undefined) {
    const { data: procedure, error: procedureError } = await supabase
      .from('procedures')
      .select('base_cost')
      .eq('id', payload.procedure_id)
      .maybeSingle();

    if (procedureError) throw procedureError;
    if (!procedure) throw new Error('Procedure not found');

    finalPrice = procedure.base_cost;
  }

  const { data, error } = await supabase
    .from('visit_procedures')
    .insert({
      visit_id: payload.visit_id,
      procedure_id: payload.procedure_id,
      quantity: payload.quantity ?? 1,
      price: finalPrice,
      notes: payload.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  return data as VisitProcedure;
}

export async function updateVisitProcedure(
  id: string,
  payload: UpdateVisitProcedurePayload
): Promise<VisitProcedure> {
  assertNotDemoMode();
  const updateData: Record<string, unknown> = {};

  if (payload.quantity !== undefined) updateData.quantity = payload.quantity;
  if (payload.price !== undefined) updateData.price = payload.price;
  if (payload.notes !== undefined) updateData.notes = payload.notes;

  const { data, error } = await supabase
    .from('visit_procedures')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  const visitProcedure = data as VisitProcedure;

  const { data: visit } = await supabase
    .from('visits')
    .select('clinic_id')
    .eq('id', visitProcedure.visit_id)
    .maybeSingle();

  if (visit) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await logAuditEvent({
        clinicId: visit.clinic_id,
        userId: user.id,
        action: AuditActions.VISIT_UPDATED,
        entityType: EntityTypes.VISIT,
        entityId: visitProcedure.visit_id,
        metadata: {
          updated_fields: Object.keys(updateData),
          visit_procedure_id: id,
        },
      });
    }
  }

  return visitProcedure;
}

export async function deleteVisitProcedure(id: string): Promise<void> {
  assertNotDemoMode();
  const { error } = await supabase
    .from('visit_procedures')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

import { apiClient } from '@/lib/apiClient';
import { assertNotDemoMode } from '@/lib/demoMode';

export interface Procedure {
  id: string;
  clinic_id: string;
  name: string;
  description: string | null;
  base_cost: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProcedurePayload {
  name: string;
  description?: string | null;
  base_cost: number;
}

export async function getProcedures(clinicId: string): Promise<Procedure[]> {
  const { data, error } = await apiClient
    .from('procedures')
    .select(`
      id,
      clinic_id,
      name,
      description,
      base_cost,
      created_at,
      updated_at
    `)
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true });

  if (error) throw error;

  return data as Procedure[];
}

export async function createProcedure(
  clinicId: string,
  payload: CreateProcedurePayload
): Promise<Procedure> {
  assertNotDemoMode();
  const { data, error } = await apiClient
    .from('procedures')
    .insert({
      clinic_id: clinicId,
      name: payload.name,
      description: payload.description || null,
      base_cost: payload.base_cost,
    })
    .select()
    .single();

  if (error) throw error;

  return data as Procedure;
}

export async function updateProcedure(
  procedureId: string,
  payload: Partial<CreateProcedurePayload>
): Promise<Procedure> {
  assertNotDemoMode();
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );

  const { data, error } = await apiClient
    .from('procedures')
    .update({
      ...cleanPayload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', procedureId)
    .select()
    .single();

  if (error) throw error;

  return data as Procedure;
}

export async function deleteProcedure(procedureId: string): Promise<void> {
  assertNotDemoMode();
  const { error } = await apiClient
    .from('procedures')
    .delete()
    .eq('id', procedureId);

  if (error) throw error;
}

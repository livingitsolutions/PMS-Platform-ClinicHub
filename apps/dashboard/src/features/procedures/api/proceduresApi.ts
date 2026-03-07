import { supabase } from '@/lib/supabase';

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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  );

  const { data, error } = await supabase
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
  const { error } = await supabase
    .from('procedures')
    .delete()
    .eq('id', procedureId);

  if (error) throw error;
}

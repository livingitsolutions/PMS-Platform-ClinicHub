import { supabase } from '@/lib/supabase';

export interface Provider {
  id: string;
  clinic_id: string;
  user_id: string | null;
  name: string;
  specialization: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProviderPayload {
  name: string;
  specialization: string;
  user_id?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
}

export async function getProviders(
  clinicId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Provider>> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { count } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId);

  const { data, error } = await supabase
    .from('providers')
    .select(`
      id,
      clinic_id,
      user_id,
      name,
      specialization,
      created_at,
      updated_at
    `)
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true })
    .range(from, to);

  if (error) throw error;

  return {
    data: data as Provider[],
    totalCount: count || 0,
  };
}

export async function createProvider(
  clinicId: string,
  payload: CreateProviderPayload
): Promise<Provider> {
  const { data, error } = await supabase
    .from('providers')
    .insert({
      clinic_id: clinicId,
      name: payload.name,
      specialization: payload.specialization,
      user_id: payload.user_id || null,
    })
    .select()
    .single();

  if (error) throw error;

  return data as Provider;
}

export async function updateProvider(
  providerId: string,
  payload: Partial<CreateProviderPayload>
): Promise<Provider> {
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  );

  const { data, error } = await supabase
    .from('providers')
    .update({
      ...cleanPayload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', providerId)
    .select()
    .single();

  if (error) throw error;

  return data as Provider;
}

export async function deleteProvider(providerId: string): Promise<void> {
  const { error } = await supabase
    .from('providers')
    .delete()
    .eq('id', providerId);

  if (error) throw error;
}

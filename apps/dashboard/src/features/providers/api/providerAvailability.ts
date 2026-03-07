import { supabase } from '@/lib/supabase';
import { assertNotDemoMode } from '@/lib/demoMode';

export interface ProviderAvailability {
  id: string;
  provider_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAvailabilityPayload {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface UpdateAvailabilityPayload {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
}

export async function getProviderAvailability(providerId: string) {
  const { data, error } = await supabase
    .from('provider_availability')
    .select('*')
    .eq('provider_id', providerId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch provider availability: ${error.message}`);
  }

  return data as ProviderAvailability[];
}

export async function createAvailability(
  providerId: string,
  payload: CreateAvailabilityPayload
) {
  assertNotDemoMode();
  const { data, error } = await supabase
    .from('provider_availability')
    .insert({
      provider_id: providerId,
      ...payload,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create availability: ${error.message}`);
  }

  return data as ProviderAvailability;
}

export async function updateAvailability(
  availabilityId: string,
  payload: UpdateAvailabilityPayload
) {
  assertNotDemoMode();
  const { data, error } = await supabase
    .from('provider_availability')
    .update(payload)
    .eq('id', availabilityId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update availability: ${error.message}`);
  }

  return data as ProviderAvailability;
}

export async function deleteAvailability(availabilityId: string) {
  assertNotDemoMode();
  const { error } = await supabase
    .from('provider_availability')
    .delete()
    .eq('id', availabilityId);

  if (error) {
    throw new Error(`Failed to delete availability: ${error.message}`);
  }
}

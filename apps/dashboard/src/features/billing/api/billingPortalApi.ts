import { supabase } from '@/lib/supabase';

export async function openBillingPortal(clinicId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-billing-portal', {
    body: {
      clinicId,
      returnUrl: window.location.href,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('No billing portal URL returned');

  return data.url as string;
}

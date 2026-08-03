import { apiClient } from '@/lib/apiClient';

export async function openBillingPortal(clinicId: string): Promise<string> {
  const { data, error } = await apiClient.functions.invoke<{ url: string }>('create-billing-portal', {
    body: {
      clinicId,
      returnUrl: window.location.href,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('No billing portal URL returned');

  return data.url;
}

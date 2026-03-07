import { useQuery } from '@tanstack/react-query';
import { getSubscriptionInvoices, type SubscriptionInvoice } from '../api/subscriptionInvoicesApi';

export function useSubscriptionInvoices(clinicId: string | null) {
  return useQuery<SubscriptionInvoice[]>({
    queryKey: ['subscription-invoices', clinicId],
    queryFn: () => getSubscriptionInvoices(clinicId!),
    enabled: !!clinicId,
  });
}

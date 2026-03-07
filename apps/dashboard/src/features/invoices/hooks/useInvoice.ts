import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrCreateInvoice,
  getInvoiceByVisit,
  getPaymentsByInvoice,
  createPayment,
  type Invoice,
  type Payment,
  type CreatePaymentPayload,
} from '../api/invoicesApi';

export function useInvoice(visitId: string | undefined) {
  return useQuery<Invoice | null>({
    queryKey: ['invoice', visitId],
    queryFn: () => (visitId ? getInvoiceByVisit(visitId) : null),
    enabled: !!visitId,
  });
}

async function getOrFetchInvoice(visitId: string): Promise<Invoice | null> {
  const existing = await getInvoiceByVisit(visitId);
  if (existing) return existing;
  return getOrCreateInvoice(visitId);
}

export function useEnsureInvoice(visitId: string | undefined) {
  return useQuery<Invoice | null>({
    queryKey: ['invoice', visitId],
    queryFn: () => (visitId ? getOrFetchInvoice(visitId) : null),
    enabled: !!visitId,
  });
}

export function usePayments(invoiceId: string | undefined) {
  return useQuery<Payment[]>({
    queryKey: ['payments', invoiceId],
    queryFn: () => (invoiceId ? getPaymentsByInvoice(invoiceId) : []),
    enabled: !!invoiceId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaymentPayload & { visitId: string }) => createPayment(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments', variables.invoice_id] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.visitId] });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

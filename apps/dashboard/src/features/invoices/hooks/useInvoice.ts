import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrCreateInvoice,
  getPaymentsByInvoice,
  createPayment,
  type Invoice,
  type Payment,
  type CreatePaymentPayload,
} from '../api/invoicesApi';

export function useInvoice(visitId: string | undefined) {
  return useQuery<Invoice | null>({
    queryKey: ['invoice', visitId],
    queryFn: () => (visitId ? getOrCreateInvoice(visitId) : null),
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
    },
  });
}

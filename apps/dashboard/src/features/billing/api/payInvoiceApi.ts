import { apiClient } from '@/lib/apiClient';

interface InvoicePaymentSessionResponse {
  checkout_url: string;
}

export async function payInvoice(stripeInvoiceId: string): Promise<string> {
  const { data, error } = await apiClient.functions.invoke<InvoicePaymentSessionResponse>(
    'create-invoice-payment-session',
    { body: {
      stripe_invoice_id: stripeInvoiceId,
      return_url: window.location.href,
    } },
  );

  if (error) throw error;
  if (!data?.checkout_url) throw new Error('No checkout URL returned');

  return data.checkout_url;
}

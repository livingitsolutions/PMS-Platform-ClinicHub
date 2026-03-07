import { supabase } from '@/lib/supabase';

export async function payInvoice(stripeInvoiceId: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-invoice-payment-session`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      stripe_invoice_id: stripeInvoiceId,
      return_url: window.location.href,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to create payment session');
  }

  if (!data.checkout_url) {
    throw new Error('No checkout URL returned');
  }

  return data.checkout_url;
}

export async function payInvoice(stripeInvoiceId: string): Promise<string> {
  const response = await fetch('/api/create-invoice-payment-session', {
    method: 'POST',
    credentials: 'include',
    headers: {
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

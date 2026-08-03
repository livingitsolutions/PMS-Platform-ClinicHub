import type { Config } from '@netlify/functions';
import { getDatabase } from '@netlify/database';
import { getCurrentUser } from './_shared/auth.mjs';
import { errorResponse, json, readJson } from './_shared/http.mjs';
import { requireClinicAccess } from './_shared/tenant.mjs';
import { getStripe } from './_shared/stripe.mjs';

export default async (request: Request) => {
  try {
    const user = await getCurrentUser(request);
    const { stripe_invoice_id, return_url } = await readJson<Record<string, string>>(request);
    const database = getDatabase();
    const localInvoice = await database.pool.query('SELECT clinic_id FROM subscription_invoices WHERE stripe_invoice_id = $1', [stripe_invoice_id]);
    if (!localInvoice.rows[0]) return json({ error: 'Invoice not found' }, { status: 404 });
    await requireClinicAccess(user.id, localInvoice.rows[0].clinic_id, ['owner', 'admin']);
    const stripe = getStripe();
    const invoice = await stripe.invoices.retrieve(stripe_invoice_id, { expand: ['lines.data.price'] });
    const items = invoice.lines.data.map((line) => ({
      price_data: { currency: invoice.currency, product_data: { name: line.description || 'Subscription' }, unit_amount: line.amount },
      quantity: 1,
    }));
    if (!items.length) return json({ error: 'No line items found on invoice' }, { status: 400 });
    const baseUrl = return_url || new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', customer: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id,
      line_items: items, success_url: `${baseUrl}?payment=success`, cancel_url: `${baseUrl}?payment=cancelled`,
      metadata: { stripe_invoice_id: invoice.id },
    });
    return json({ checkout_url: session.url });
  } catch (error) { return errorResponse(error); }
};

export const config: Config = { path: '/api/create-invoice-payment-session' };

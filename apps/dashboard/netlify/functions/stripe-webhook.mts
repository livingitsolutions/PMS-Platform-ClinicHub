import type { Config } from '@netlify/functions';
import { getDatabase } from '@netlify/database';
import { errorResponse, json } from './_shared/http.mjs';
import { getStripe } from './_shared/stripe.mjs';

const subscriptionIdOf = (object: any) => {
  const subscription = object.subscription ?? object.parent?.subscription_details?.subscription;
  return typeof subscription === 'string' ? subscription : subscription?.id;
};

export default async (request: Request) => {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = request.headers.get('stripe-signature');
    if (!secret || !signature) return json({ error: 'Webhook is not configured' }, { status: 400 });
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
    const database = getDatabase();
    const object: any = event.data.object;

    const findClinic = async (subscriptionId?: string, customerId?: string) => {
      if (subscriptionId) {
        const result = await database.pool.query('SELECT clinic_id FROM subscriptions WHERE stripe_subscription_id = $1', [subscriptionId]);
        if (result.rows[0]) return result.rows[0].clinic_id as string;
      }
      if (customerId) {
        const result = await database.pool.query('SELECT clinic_id FROM subscriptions WHERE stripe_customer_id = $1', [customerId]);
        if (result.rows[0]) return result.rows[0].clinic_id as string;
      }
      return undefined;
    };

    const syncInvoice = async (invoice: any, clinicId: string) => {
      await database.pool.query(
        `INSERT INTO subscription_invoices
          (clinic_id, stripe_invoice_id, stripe_subscription_id, amount_due, amount_paid, currency, status, invoice_pdf_url, paid_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (stripe_invoice_id) DO UPDATE SET
          amount_due = EXCLUDED.amount_due, amount_paid = EXCLUDED.amount_paid, status = EXCLUDED.status,
          invoice_pdf_url = EXCLUDED.invoice_pdf_url, paid_at = EXCLUDED.paid_at`,
        [clinicId, invoice.id, subscriptionIdOf(invoice), (invoice.amount_due || 0) / 100, (invoice.amount_paid || 0) / 100,
          invoice.currency || 'usd', invoice.status || 'open', invoice.invoice_pdf || invoice.hosted_invoice_url || null,
          invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : null],
      );
    };

    if (event.type === 'checkout.session.completed' && object.mode === 'subscription') {
      const clinicId = object.metadata?.clinic_id;
      const subscriptionId = typeof object.subscription === 'string' ? object.subscription : object.subscription?.id;
      if (clinicId && subscriptionId) {
        await database.pool.query(
          `UPDATE subscriptions SET stripe_subscription_id = $1, status = 'active', updated_at = now() WHERE clinic_id = $2`,
          [subscriptionId, clinicId],
        );
        await database.pool.query(`UPDATE clinics SET subscription_status = 'active', updated_at = now() WHERE id = $1`, [clinicId]);
      }
    }

    if (['invoice.created', 'invoice.payment_succeeded', 'invoice.paid', 'invoice.payment_failed'].includes(event.type)) {
      const subscriptionId = subscriptionIdOf(object);
      const clinicId = await findClinic(subscriptionId, typeof object.customer === 'string' ? object.customer : object.customer?.id);
      if (clinicId) {
        const status = event.type === 'invoice.payment_failed' ? 'past_due' : event.type === 'invoice.created' ? null : 'active';
        if (status) {
          await database.pool.query('UPDATE subscriptions SET status = $1, updated_at = now() WHERE clinic_id = $2', [status, clinicId]);
          await database.pool.query('UPDATE clinics SET subscription_status = $1, updated_at = now() WHERE id = $2', [status, clinicId]);
        }
        await syncInvoice(object, clinicId);
      }
    }

    if (event.type.startsWith('customer.subscription.')) {
      const clinicId = await findClinic(object.id, typeof object.customer === 'string' ? object.customer : object.customer?.id);
      if (clinicId) {
        const priceId = object.items?.data?.[0]?.price?.id;
        const plan = Object.entries({ starter: process.env.STRIPE_PRICE_STARTER, professional: process.env.STRIPE_PRICE_PROFESSIONAL, enterprise: process.env.STRIPE_PRICE_ENTERPRISE })
          .find(([, id]) => id && id === priceId)?.[0];
        const status = event.type === 'customer.subscription.deleted' ? 'canceled' : object.status;
        const periodEnd = object.items?.data?.[0]?.current_period_end || object.current_period_end;
        await database.pool.query(
          `UPDATE subscriptions SET status = $1, plan = coalesce($2, plan), current_period_end = $3, updated_at = now() WHERE clinic_id = $4`,
          [status, plan || null, periodEnd ? new Date(periodEnd * 1000) : null, clinicId],
        );
        await database.pool.query(
          `UPDATE clinics SET subscription_status = $1, plan = coalesce($2, plan), updated_at = now() WHERE id = $3`,
          [status, plan || null, clinicId],
        );
      }
    }

    return json({ received: true });
  } catch (error) { return errorResponse(error); }
};

export const config: Config = { path: '/api/stripe-webhook' };

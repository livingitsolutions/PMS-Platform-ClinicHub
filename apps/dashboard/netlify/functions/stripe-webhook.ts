import type { Config } from '@netlify/functions';
import type Stripe from 'stripe';
import type { PoolClient } from 'pg';
import { errorResponse, HttpError, json, requirePost } from './_shared/billing-http.js';
import { getPool } from './_shared/database.js';
import { getStripe } from './_shared/stripe.mjs';

type ExpandableId = string | { id: string } | null | undefined;
type InvoiceWithLegacySubscription = Stripe.Invoice & { subscription?: ExpandableId };
type SubscriptionWithLegacyPeriodEnd = Stripe.Subscription & { current_period_end?: number };

const idOf = (value: ExpandableId) => typeof value === 'string' ? value : value?.id;

const subscriptionIdOf = (invoice: Stripe.Invoice) => {
  const legacyInvoice = invoice as InvoiceWithLegacySubscription;
  return idOf(legacyInvoice.subscription ?? invoice.parent?.subscription_details?.subscription);
};

async function findClinic(client: PoolClient, subscriptionId?: string, customerId?: string) {
  if (subscriptionId) {
    const result = await client.query<{ clinic_id: string }>(
      'SELECT clinic_id FROM subscriptions WHERE stripe_subscription_id = $1',
      [subscriptionId],
    );
    if (result.rows[0]) return result.rows[0].clinic_id;
  }

  if (customerId) {
    const result = await client.query<{ clinic_id: string }>(
      'SELECT clinic_id FROM subscriptions WHERE stripe_customer_id = $1',
      [customerId],
    );
    if (result.rows[0]) return result.rows[0].clinic_id;
  }

  return undefined;
}

async function syncInvoice(client: PoolClient, invoice: Stripe.Invoice, clinicId: string) {
  await client.query(
    `INSERT INTO subscription_invoices
      (clinic_id, stripe_invoice_id, stripe_subscription_id, amount_due, amount_paid, currency, status, invoice_pdf_url, paid_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (stripe_invoice_id) DO UPDATE SET
      amount_due = EXCLUDED.amount_due,
      amount_paid = EXCLUDED.amount_paid,
      status = EXCLUDED.status,
      invoice_pdf_url = EXCLUDED.invoice_pdf_url,
      paid_at = EXCLUDED.paid_at`,
    [
      clinicId,
      invoice.id,
      subscriptionIdOf(invoice),
      (invoice.amount_due || 0) / 100,
      (invoice.amount_paid || 0) / 100,
      invoice.currency || 'usd',
      invoice.status || 'open',
      invoice.invoice_pdf || invoice.hosted_invoice_url || null,
      invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : null,
    ],
  );
}

async function processEvent(client: PoolClient, event: Stripe.Event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.mode !== 'subscription') return;

    const clinicId = session.metadata?.clinic_id;
    const subscriptionId = idOf(session.subscription);
    if (clinicId && subscriptionId) {
      await client.query(
        `UPDATE subscriptions
            SET stripe_subscription_id = $1, status = 'active', updated_at = now()
          WHERE clinic_id = $2`,
        [subscriptionId, clinicId],
      );
      await client.query(
        `UPDATE clinics SET subscription_status = 'active', updated_at = now() WHERE id = $1`,
        [clinicId],
      );
    }
    return;
  }

  if (
    event.type === 'invoice.created' ||
    event.type === 'invoice.payment_succeeded' ||
    event.type === 'invoice.paid' ||
    event.type === 'invoice.payment_failed'
  ) {
    const invoice = event.data.object;
    const clinicId = await findClinic(client, subscriptionIdOf(invoice), idOf(invoice.customer));
    if (!clinicId) return;

    const status = event.type === 'invoice.payment_failed'
      ? 'past_due'
      : event.type === 'invoice.created'
        ? null
        : 'active';

    if (status) {
      await client.query('UPDATE subscriptions SET status = $1, updated_at = now() WHERE clinic_id = $2', [status, clinicId]);
      await client.query('UPDATE clinics SET subscription_status = $1, updated_at = now() WHERE id = $2', [status, clinicId]);
    }
    await syncInvoice(client, invoice, clinicId);
    return;
  }

  if (event.type.startsWith('customer.subscription.')) {
    const subscription = event.data.object as SubscriptionWithLegacyPeriodEnd;
    const clinicId = await findClinic(client, subscription.id, idOf(subscription.customer));
    if (!clinicId) return;

    const priceId = subscription.items.data[0]?.price.id;
    const plan = Object.entries({
      starter: process.env.STRIPE_PRICE_STARTER,
      professional: process.env.STRIPE_PRICE_PROFESSIONAL,
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
    }).find(([, id]) => id && id === priceId)?.[0];
    const status = event.type === 'customer.subscription.deleted' ? 'canceled' : subscription.status;
    const periodEnd = subscription.items.data[0]?.current_period_end || subscription.current_period_end;

    await client.query(
      `UPDATE subscriptions
          SET status = $1, plan = coalesce($2, plan), current_period_end = $3, updated_at = now()
        WHERE clinic_id = $4`,
      [status, plan || null, periodEnd ? new Date(periodEnd * 1000) : null, clinicId],
    );
    await client.query(
      `UPDATE clinics
          SET subscription_status = $1, plan = coalesce($2, plan), updated_at = now()
        WHERE id = $3`,
      [status, plan || null, clinicId],
    );
  }
}

export default async (request: Request) => {
  let client: PoolClient | undefined;

  try {
    requirePost(request);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new HttpError('Webhook is not configured', 500);

    const signature = request.headers.get('stripe-signature');
    if (!signature) throw new HttpError('Missing Stripe signature', 400);

    const stripe = getStripe();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
    } catch {
      throw new HttpError('Invalid Stripe signature', 400);
    }

    client = await getPool().connect();
    await client.query('BEGIN');
    const claimed = await client.query(
      `INSERT INTO stripe_webhook_events (event_id, event_type)
       VALUES ($1, $2)
       ON CONFLICT (event_id) DO NOTHING
       RETURNING event_id`,
      [event.id, event.type],
    );

    if (!claimed.rowCount) {
      await client.query('COMMIT');
      return json({ received: true, duplicate: true }, { status: 200 });
    }

    await processEvent(client, event);
    await client.query(
      'UPDATE stripe_webhook_events SET processed_at = now() WHERE event_id = $1',
      [event.id],
    );
    await client.query('COMMIT');
    return json({ received: true }, { status: 200 });
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => undefined);
    return errorResponse(error);
  } finally {
    client?.release();
  }
};

export const config: Config = { path: '/api/stripe-webhook' };

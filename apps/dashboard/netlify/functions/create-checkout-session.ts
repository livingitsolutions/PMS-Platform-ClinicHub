import type { Config } from '@netlify/functions';
import type { PoolClient } from 'pg';
import { errorResponse, HttpError, json, readObject, requireClinicOwner, requirePost, requireString, requireUrl } from './_shared/billing-http.js';
import { getPool } from './_shared/database.js';
import { getPriceId, getStripe, planPrices } from './_shared/stripe.mjs';

export default async (request: Request) => {
  let client: PoolClient | undefined;

  try {
    requirePost(request);
    client = await getPool().connect();
    const body = await readObject(request);
    const clinicId = requireString(body, 'clinicId');
    const plan = requireString(body, 'plan');
    const successUrl = requireUrl(body, 'successUrl');
    const cancelUrl = requireUrl(body, 'cancelUrl');
    const user = await requireClinicOwner(request, client, clinicId);

    if (!planPrices[plan]) throw new HttpError('Invalid plan', 400);

    const clinic = await client.query<{ name: string; email: string | null }>(
      'SELECT name, email FROM clinics WHERE id = $1',
      [clinicId],
    );
    if (!clinic.rows[0]) throw new HttpError('Clinic not found', 404);

    const stripe = getStripe();
    const subscription = await client.query<{ stripe_customer_id: string }>(
      'SELECT stripe_customer_id FROM subscriptions WHERE clinic_id = $1 LIMIT 1',
      [clinicId],
    );
    let customerId = subscription.rows[0]?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: clinic.rows[0].email || user.email,
        name: clinic.rows[0].name,
        metadata: { clinic_id: clinicId },
      });
      customerId = customer.id;
      await client.query(
        `INSERT INTO subscriptions (clinic_id, stripe_customer_id, plan, status)
         VALUES ($1, $2, $3, 'incomplete')`,
        [clinicId, customerId, plan],
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: await getPriceId(stripe, plan), quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { clinic_id: clinicId, plan },
    });

    return json({ sessionId: session.id, url: session.url }, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  } finally {
    client?.release();
  }
};

export const config: Config = { path: '/api/create-checkout-session' };

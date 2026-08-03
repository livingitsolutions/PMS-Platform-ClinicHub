import type { Config } from '@netlify/functions';
import { getDatabase } from '@netlify/database';
import { getCurrentUser } from './_shared/auth.mjs';
import { errorResponse, json, readJson } from './_shared/http.mjs';
import { requireClinicAccess } from './_shared/tenant.mjs';
import { getPriceId, getStripe, planPrices } from './_shared/stripe.mjs';

export default async (request: Request) => {
  try {
    const user = await getCurrentUser(request);
    const { clinicId, plan, successUrl, cancelUrl } = await readJson<Record<string, string>>(request);
    await requireClinicAccess(user.id, clinicId, ['owner']);
    if (!planPrices[plan]) return json({ error: 'Invalid plan' }, { status: 400 });
    const database = getDatabase();
    const stripe = getStripe();
    const clinic = await database.pool.query('SELECT name, email FROM clinics WHERE id = $1', [clinicId]);
    if (!clinic.rows[0]) return json({ error: 'Clinic not found' }, { status: 404 });
    let subscription = await database.pool.query('SELECT * FROM subscriptions WHERE clinic_id = $1 LIMIT 1', [clinicId]);
    let customerId = subscription.rows[0]?.stripe_customer_id as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: clinic.rows[0].email || user.email,
        name: clinic.rows[0].name,
        metadata: { clinic_id: clinicId },
      });
      customerId = customer.id;
      subscription = await database.pool.query(
        `INSERT INTO subscriptions (clinic_id, stripe_customer_id, plan, status)
         VALUES ($1, $2, $3, 'incomplete') RETURNING *`,
        [clinicId, customerId, plan],
      );
    }
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: await getPriceId(stripe, plan), quantity: 1 }],
      mode: 'subscription', success_url: successUrl, cancel_url: cancelUrl,
      metadata: { clinic_id: clinicId, plan },
    });
    return json({ sessionId: session.id, url: session.url });
  } catch (error) { return errorResponse(error); }
};

export const config: Config = { path: '/api/create-checkout-session' };

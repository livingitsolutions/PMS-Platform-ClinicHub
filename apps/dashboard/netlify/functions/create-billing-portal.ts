import type { Config } from '@netlify/functions';
import type { PoolClient } from 'pg';
import { errorResponse, HttpError, json, readObject, requireClinicOwner, requirePost, requireString, requireUrl } from './_shared/billing-http.js';
import { getPool } from './_shared/database.js';
import { getStripe } from './_shared/stripe.mjs';

export default async (request: Request) => {
  let client: PoolClient | undefined;

  try {
    requirePost(request);
    client = await getPool().connect();
    const body = await readObject(request);
    const clinicId = requireString(body, 'clinicId');
    const returnUrl = requireUrl(body, 'returnUrl');
    await requireClinicOwner(request, client, clinicId);

    const result = await client.query<{ stripe_customer_id: string }>(
      'SELECT stripe_customer_id FROM subscriptions WHERE clinic_id = $1 LIMIT 1',
      [clinicId],
    );
    const customerId = result.rows[0]?.stripe_customer_id;
    if (!customerId) throw new HttpError('No billing account found', 404);

    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return json({ url: session.url }, { status: 200 });
  } catch (error) {
    return errorResponse(error);
  } finally {
    client?.release();
  }
};

export const config: Config = { path: '/api/create-billing-portal' };

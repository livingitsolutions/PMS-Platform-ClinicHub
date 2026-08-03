import type { Config } from '@netlify/functions';
import { getDatabase } from '@netlify/database';
import { getCurrentUser } from './_shared/auth.mjs';
import { errorResponse, json, readJson } from './_shared/http.mjs';
import { requireClinicAccess } from './_shared/tenant.mjs';
import { getStripe } from './_shared/stripe.mjs';

export default async (request: Request) => {
  try {
    const user = await getCurrentUser(request);
    const { clinicId, returnUrl } = await readJson<Record<string, string>>(request);
    await requireClinicAccess(user.id, clinicId, ['owner']);
    const result = await getDatabase().pool.query('SELECT stripe_customer_id FROM subscriptions WHERE clinic_id = $1 LIMIT 1', [clinicId]);
    if (!result.rows[0]) return json({ error: 'No billing account found' }, { status: 404 });
    const session = await getStripe().billingPortal.sessions.create({
      customer: result.rows[0].stripe_customer_id,
      return_url: returnUrl,
    });
    return json({ url: session.url });
  } catch (error) { return errorResponse(error); }
};

export const config: Config = { path: '/api/create-billing-portal' };

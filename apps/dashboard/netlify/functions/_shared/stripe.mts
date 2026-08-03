import Stripe from 'stripe';

export const getStripe = () => {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(secret);
};

export const planPrices: Record<string, { env: string; name: string; amount: number }> = {
  starter: { env: 'STRIPE_PRICE_STARTER', name: 'Starter Plan', amount: 4900 },
  professional: { env: 'STRIPE_PRICE_PROFESSIONAL', name: 'Professional Plan', amount: 9900 },
  enterprise: { env: 'STRIPE_PRICE_ENTERPRISE', name: 'Enterprise Plan', amount: 19900 },
};

export async function getPriceId(stripe: Stripe, plan: string) {
  const config = planPrices[plan];
  if (!config) throw new Error(`Invalid plan: ${plan}`);
  const configured = process.env[config.env];
  if (configured) return configured;
  const existing = await stripe.prices.list({ lookup_keys: [`pms_${plan}_monthly`] });
  if (existing.data[0]) return existing.data[0].id;
  const product = await stripe.products.create({ name: config.name });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: config.amount,
    currency: 'usd',
    recurring: { interval: 'month' },
    lookup_key: `pms_${plan}_monthly`,
  });
  return price.id;
}

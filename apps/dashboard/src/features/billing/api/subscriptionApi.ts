import { apiClient } from '@/lib/apiClient';

export interface Subscription {
  id: string;
  clinic_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  plan: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export async function getClinicSubscription(clinicId: string): Promise<Subscription | null> {
  const { data, error } = await apiClient
    .from<Subscription | null>('subscriptions')
    .select('*')
    .eq('clinic_id', clinicId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export interface CreateCheckoutSessionPayload {
  clinicId: string;
  plan: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export async function createCheckoutSession(
  payload: CreateCheckoutSessionPayload
): Promise<CheckoutSessionResponse> {
  const {
    data: { session },
  } = await apiClient.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await apiClient.functions.invoke<CheckoutSessionResponse>(
    'create-checkout-session',
    { body: payload },
  );

  if (error) throw error;
  if (!data) throw new Error('Checkout session returned no data');
  return data;
}

export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false;

  return ['active', 'trialing'].includes(subscription.status);
}

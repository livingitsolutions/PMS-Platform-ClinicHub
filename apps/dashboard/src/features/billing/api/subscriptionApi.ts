import { supabase } from '@/lib/supabase';

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
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('clinic_id', clinicId)
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
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const headers = {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return await response.json();
}

export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false;

  return ['active', 'trialing'].includes(subscription.status);
}

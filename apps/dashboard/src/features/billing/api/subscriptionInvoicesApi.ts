import { supabase } from '@/lib/supabase';

export interface SubscriptionInvoice {
  id: string;
  clinic_id: string;
  stripe_invoice_id: string;
  stripe_subscription_id: string | null;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  invoice_pdf_url: string | null;
  paid_at: string | null;
  created_at: string;
}

export async function getSubscriptionInvoices(clinicId: string): Promise<SubscriptionInvoice[]> {
  const { data, error } = await supabase
    .from('subscription_invoices')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as SubscriptionInvoice[];
}

import { supabase } from '@/lib/supabase';

export interface TodayStats {
  totalVisits: number;
  totalRevenue: number;
  outstandingInvoices: number;
  newPatients: number;
}

export interface MonthlyRevenue {
  date: string;
  revenue: number;
}

export interface TopProcedure {
  procedure_id: string;
  procedure_name: string;
  count: number;
  total_revenue: number;
}

export interface TopProvider {
  provider_id: string;
  provider_name: string;
  visit_count: number;
  total_revenue: number;
}

export async function getTodayStats(clinicId: string): Promise<TodayStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const { data, error } = await supabase.rpc('get_today_stats', {
    p_clinic_id: clinicId,
    p_today: todayISO
  });

  if (error) throw error;

  return data as TodayStats;
}

export async function getMonthlyRevenue(
  clinicId: string
): Promise<MonthlyRevenue[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const { data, error } = await supabase.rpc('get_monthly_revenue', {
    p_clinic_id: clinicId,
    p_start_date: thirtyDaysAgo.toISOString()
  });

  if (error) throw error;

  return (data || []) as MonthlyRevenue[];
}

export async function getTopProcedures(
  clinicId: string
): Promise<TopProcedure[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase.rpc('get_top_procedures', {
    p_clinic_id: clinicId,
    p_start_date: thirtyDaysAgo.toISOString()
  });

  if (error) throw error;

  return (data || []) as TopProcedure[];
}

export async function getTopProviders(
  clinicId: string
): Promise<TopProvider[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase.rpc('get_top_providers', {
    p_clinic_id: clinicId,
    p_start_date: thirtyDaysAgo.toISOString()
  });

  if (error) throw error;

  return (data || []) as TopProvider[];
}

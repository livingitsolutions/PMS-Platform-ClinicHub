import { useQuery } from '@tanstack/react-query';
import {
  getTodayStats,
  getMonthlyRevenue,
  getTopProcedures,
  getTopProviders,
  type TodayStats,
  type MonthlyRevenue,
  type TopProcedure,
  type TopProvider,
} from '../api/dashboardApi';

interface DashboardStats extends TodayStats {
  monthlyRevenue: MonthlyRevenue[];
  topProcedures: TopProcedure[];
  topProviders: TopProvider[];
}

async function fetchDashboardStats(clinicId: string): Promise<DashboardStats> {
  const [todayStats, monthlyRevenue, topProcedures, topProviders] =
    await Promise.all([
      getTodayStats(clinicId),
      getMonthlyRevenue(clinicId),
      getTopProcedures(clinicId),
      getTopProviders(clinicId),
    ]);

  return {
    ...todayStats,
    monthlyRevenue,
    topProcedures,
    topProviders,
  };
}

export function useDashboardStats(clinicId: string | null) {
  return useQuery({
    queryKey: ['dashboard-stats', clinicId],
    queryFn: () => fetchDashboardStats(clinicId!),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

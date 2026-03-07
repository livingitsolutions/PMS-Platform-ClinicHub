import { useClinicStore } from '@/store/clinic-store';
import { AppLayout } from '@/components/layout/AppLayout';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { RevenueReport } from '../components/RevenueReport';
import { ProviderPerformanceReport } from '../components/ProviderPerformanceReport';
import { ProcedureReport } from '../components/ProcedureReport';
import { QueryErrorAlert } from '@/components/system/ErrorAlert';

export function ReportsPage() {
  const clinicId = useClinicStore((s) => s.clinicId);
  const { data, isLoading, error, refetch } = useDashboardStats(clinicId);

  if (!clinicId) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-muted-foreground">Please select a clinic.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Analytics for the last 30 days
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <QueryErrorAlert error={error} onRetry={() => refetch()} />
          </div>
        )}

        {!error && (
          <div className="space-y-8">
            <RevenueReport
              data={data?.monthlyRevenue || []}
              isLoading={isLoading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ProviderPerformanceReport
                providers={data?.topProviders || []}
                isLoading={isLoading}
              />
              <ProcedureReport
                procedures={data?.topProcedures || []}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

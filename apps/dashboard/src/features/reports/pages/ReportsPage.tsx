import { useClinicStore } from '@/store/clinic-store';
import { DashboardLayout, PageHeader } from '@/components/layout/DashboardLayout';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { RevenueReport } from '../components/RevenueReport';
import { ProviderPerformanceReport } from '../components/ProviderPerformanceReport';
import { ProcedureReport } from '../components/ProcedureReport';
import { QueryErrorAlert } from '@/components/system/ErrorAlert';
import { ExportCSVButton } from '@/components/system/ExportCSVButton';

export function ReportsPage() {
  const { clinicId, clinics } = useClinicStore();
  const selectedClinic = clinics.find((c) => c.id === clinicId);
  const currencyCode = selectedClinic?.currency_code ?? 'PHP';
  const { data, isLoading, error, refetch } = useDashboardStats(clinicId);

  if (!clinicId) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-muted-foreground">Please select a clinic.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Reports"
        subtitle="Analytics for the last 30 days"
        actions={
          <ExportCSVButton
            label="Export Revenue"
            filename="revenue-report"
            data={(data?.monthlyRevenue || []).map((r) => ({
              date: r.date,
              revenue: r.revenue,
            }))}
          />
        }
      />

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
            currencyCode={currencyCode}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProviderPerformanceReport
              providers={data?.topProviders || []}
              isLoading={isLoading}
              currencyCode={currencyCode}
            />
            <ProcedureReport
              procedures={data?.topProcedures || []}
              isLoading={isLoading}
              currencyCode={currencyCode}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

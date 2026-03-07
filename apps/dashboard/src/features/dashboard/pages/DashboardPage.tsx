import { useClinicStore } from '@/store/clinic-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { RevenueChart } from '@/features/dashboard/components/RevenueChart';
import { TopProceduresCard } from '@/features/dashboard/components/TopProceduresCard';
import { TopProvidersCard } from '@/features/dashboard/components/TopProvidersCard';
import { SubscriptionStatus } from '@/features/billing/components/SubscriptionStatus';
import { DashboardLayout, PageHeader } from '@/components/layout/DashboardLayout';
import { QueryErrorAlert } from '@/components/system/ErrorAlert';

export function DashboardPage() {
  const clinicId = useClinicStore((state) => state.clinicId);
  const { data, isLoading, error, refetch } = useDashboardStats(clinicId);

  if (!clinicId) {
    return (
      <DashboardLayout>
        <PageHeader title="Dashboard" />
        <p className="text-gray-500">Please select a clinic to view the dashboard.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Dashboard" subtitle="Overview of your clinic's performance" />

      <div className="mb-6">
        <SubscriptionStatus />
      </div>

      {error && (
        <div className="mb-6">
          <QueryErrorAlert error={error} onRetry={() => refetch()} />
        </div>
      )}

      {!error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Today's Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {isLoading ? '—' : data?.totalVisits || 0}
                </div>
                <CardDescription className="mt-1 text-xs">Completed today</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Today's Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {isLoading
                    ? '—'
                    : `$${(data?.totalRevenue || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}`}
                </div>
                <CardDescription className="mt-1 text-xs">Payments received</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Outstanding Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  {isLoading
                    ? '—'
                    : `$${(data?.outstandingInvoices || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}`}
                </div>
                <CardDescription className="mt-1 text-xs">Unpaid invoices</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  New Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {isLoading ? '—' : data?.newPatients || 0}
                </div>
                <CardDescription className="mt-1 text-xs">Registered today</CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6 pb-6">
                  <p className="text-center text-muted-foreground text-sm">Loading revenue data...</p>
                </CardContent>
              </Card>
            ) : (
              <RevenueChart data={data?.monthlyRevenue || []} />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground text-sm">Loading procedures...</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground text-sm">Loading providers...</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <TopProceduresCard procedures={data?.topProcedures || []} />
                <TopProvidersCard providers={data?.topProviders || []} />
              </>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

import { useClinicStore } from '@/store/clinic-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { RevenueChart } from '@/features/dashboard/components/RevenueChart';
import { TopProceduresCard } from '@/features/dashboard/components/TopProceduresCard';
import { TopProvidersCard } from '@/features/dashboard/components/TopProvidersCard';
import { SubscriptionStatus } from '@/features/billing/components/SubscriptionStatus';
import { AppLayout } from '@/components/layout/AppLayout';
import { QueryErrorAlert } from '@/components/system/ErrorAlert';

export function DashboardPage() {
  const clinicId = useClinicStore((state) => state.clinicId);
  const { data, isLoading, error, refetch } = useDashboardStats(clinicId);

  if (!clinicId) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-4 text-gray-600">Please select a clinic to view dashboard.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {error && (
          <div className="mb-6">
            <QueryErrorAlert error={error} onRetry={() => refetch()} />
          </div>
        )}

        {!error && (
        <>

        <div className="mb-8">
          <SubscriptionStatus />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Today's Visits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {isLoading ? '...' : data?.totalVisits || 0}
              </div>
              <CardDescription className="mt-2">
                Completed today
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Today's Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {isLoading
                  ? '...'
                  : `$${(data?.totalRevenue || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}`}
              </div>
              <CardDescription className="mt-2">
                Payments received
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Outstanding Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {isLoading
                  ? '...'
                  : `$${(data?.outstandingInvoices || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}`}
              </div>
              <CardDescription className="mt-2">
                Unpaid invoices
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                New Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900">
                {isLoading ? '...' : data?.newPatients || 0}
              </div>
              <CardDescription className="mt-2">
                Registered today
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading revenue data...</p>
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
                  <p className="text-center text-muted-foreground">Loading procedures...</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading providers...</p>
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
      </div>
    </AppLayout>
  );
}

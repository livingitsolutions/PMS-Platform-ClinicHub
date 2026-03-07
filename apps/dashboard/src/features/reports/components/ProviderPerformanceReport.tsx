import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/currency';
import type { TopProvider } from '@/features/dashboard/api/dashboardApi';

interface ProviderPerformanceReportProps {
  providers: TopProvider[];
  isLoading: boolean;
  currencyCode?: string;
}

export function ProviderPerformanceReport({
  providers,
  isLoading,
  currencyCode = 'PHP',
}: ProviderPerformanceReportProps) {
  const chartData = providers.map((p) => ({
    name: p.provider_name,
    revenue: p.total_revenue,
    visits: p.visit_count,
  }));

  const totalVisits = providers.reduce((sum, p) => sum + p.visit_count, 0);
  const totalRevenue = providers.reduce((sum, p) => sum + p.total_revenue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Performance — Last 30 Days</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Visits</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {isLoading ? '—' : totalVisits.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Revenue</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {isLoading ? '—' : formatCurrency(totalRevenue, currencyCode)}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading provider data...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No provider data for this period.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatCurrency(v, currencyCode)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number | undefined, name: string | undefined) => {
                  const v = value ?? 0;
                  return name === 'revenue'
                    ? [formatCurrency(v, currencyCode), 'Revenue']
                    : [v, 'Visits'];
                }}
              />
              <Bar dataKey="revenue" fill="#16a34a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {!isLoading && providers.length > 0 && (
          <div className="divide-y divide-gray-100">
            {providers.map((provider) => (
              <div key={provider.provider_id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{provider.provider_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {provider.visit_count} {provider.visit_count === 1 ? 'visit' : 'visits'}
                  </p>
                </div>
                <p className="font-semibold text-sm">
                  {formatCurrency(provider.total_revenue, currencyCode)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

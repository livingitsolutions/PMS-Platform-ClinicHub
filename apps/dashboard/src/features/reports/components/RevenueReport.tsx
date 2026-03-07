import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { formatCurrency } from '@/lib/currency';
import type { MonthlyRevenue } from '@/features/dashboard/api/dashboardApi';

interface RevenueReportProps {
  data: MonthlyRevenue[];
  isLoading: boolean;
  currencyCode?: string;
}

export function RevenueReport({ data, isLoading, currencyCode = 'PHP' }: RevenueReportProps) {
  const formattedData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    revenue: item.revenue,
  }));

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgDaily = data.length > 0 ? totalRevenue / data.length : 0;
  const maxDay = data.reduce(
    (best, item) => (item.revenue > best.revenue ? item : best),
    { date: '', revenue: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue — Last 30 Days</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {isLoading ? '—' : formatCurrency(totalRevenue, currencyCode)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg / Day</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {isLoading ? '—' : formatCurrency(avgDaily, currencyCode)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Best Day</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {isLoading
                ? '—'
                : maxDay.revenue > 0
                  ? formatCurrency(maxDay.revenue, currencyCode)
                  : '—'}
            </p>
            {!isLoading && maxDay.date && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(maxDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading revenue data...</p>
          </div>
        ) : formattedData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No revenue data for this period.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatCurrency(v, currencyCode)}
              />
              <Tooltip
                formatter={(value: number | undefined) =>
                  value !== undefined
                    ? formatCurrency(value, currencyCode)
                    : formatCurrency(0, currencyCode)
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={{ fill: '#2563eb', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

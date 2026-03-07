import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyRevenue } from '../api/dashboardApi';

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formattedData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    revenue: item.revenue,
  }));

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
        <p className="text-2xl font-bold">
          ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-muted-foreground">Total revenue</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number | undefined) =>
                value !== undefined
                  ? `$${value.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}`
                  : '$0.00'
              }
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: '#2563eb', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

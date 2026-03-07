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
import type { TopProcedure } from '@/features/dashboard/api/dashboardApi';

interface ProcedureReportProps {
  procedures: TopProcedure[];
  isLoading: boolean;
}

export function ProcedureReport({ procedures, isLoading }: ProcedureReportProps) {
  const chartData = procedures.map((p) => ({
    name: p.procedure_name,
    count: p.count,
    revenue: p.total_revenue,
  }));

  const totalCount = procedures.reduce((sum, p) => sum + p.count, 0);
  const totalRevenue = procedures.reduce((sum, p) => sum + p.total_revenue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Procedure Breakdown — Last 30 Days</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Procedures Performed</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {isLoading ? '—' : totalCount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Revenue Generated</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {isLoading
                ? '—'
                : `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading procedure data...</p>
          </div>
        ) : procedures.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No procedure data for this period.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number | undefined, name: string | undefined) => {
                  const v = value ?? 0;
                  return name === 'count' ? [v, 'Times performed'] : [v, 'Revenue'];
                }}
              />
              <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {!isLoading && procedures.length > 0 && (
          <div className="divide-y divide-gray-100">
            {procedures.map((procedure) => {
              const share = totalRevenue > 0
                ? (procedure.total_revenue / totalRevenue) * 100
                : 0;

              return (
                <div key={procedure.procedure_id} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{procedure.procedure_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {procedure.count} {procedure.count === 1 ? 'time' : 'times'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        ${procedure.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">{share.toFixed(1)}% of revenue</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

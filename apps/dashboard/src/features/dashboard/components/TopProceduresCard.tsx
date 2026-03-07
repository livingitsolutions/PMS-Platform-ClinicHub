import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TopProcedure } from '../api/dashboardApi';

interface TopProceduresCardProps {
  procedures: TopProcedure[];
}

export function TopProceduresCard({ procedures }: TopProceduresCardProps) {
  if (procedures.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Procedures</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No procedure data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...procedures.map((p) => p.total_revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Procedures (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {procedures.map((procedure) => {
            const percentage = (procedure.total_revenue / maxRevenue) * 100;

            return (
              <div key={procedure.procedure_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{procedure.procedure_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {procedure.count} {procedure.count === 1 ? 'time' : 'times'}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ${procedure.total_revenue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

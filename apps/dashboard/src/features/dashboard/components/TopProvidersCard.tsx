import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TopProvider } from '../api/dashboardApi';

interface TopProvidersCardProps {
  providers: TopProvider[];
}

export function TopProvidersCard({ providers }: TopProvidersCardProps) {
  if (providers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No provider data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...providers.map((p) => p.total_revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Providers (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {providers.map((provider) => {
            const percentage = (provider.total_revenue / maxRevenue) * 100;

            return (
              <div key={provider.provider_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{provider.provider_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {provider.visit_count} {provider.visit_count === 1 ? 'visit' : 'visits'}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ${provider.total_revenue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all"
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

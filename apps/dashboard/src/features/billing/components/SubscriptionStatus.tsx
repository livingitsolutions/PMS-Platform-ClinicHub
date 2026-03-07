import { CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock, Circle as XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '../hooks/useSubscription';

export function SubscriptionStatus() {
  const { subscription, isActive } = useSubscription();

  if (!subscription) {
    return null;
  }

  const statusConfig = {
    active: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Active',
    },
    trialing: {
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Trial',
    },
    past_due: {
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      label: 'Past Due',
    },
    canceled: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Canceled',
    },
    incomplete: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Incomplete',
    },
  };

  const config = statusConfig[subscription.status as keyof typeof statusConfig] || statusConfig.incomplete;
  const Icon = config.icon;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className={`border-2 ${config.borderColor}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className={`size-5 ${config.color}`} />
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor}`}>
          <Icon className={`size-4 ${config.color}`} />
          <span className={`font-medium ${config.color}`}>{config.label}</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="font-medium capitalize">{subscription.plan}</span>
          </div>

          {subscription.current_period_end && (
            <div className="flex justify-between">
              <span className="text-gray-600">
                {isActive ? 'Renews on:' : 'Ended on:'}
              </span>
              <span className="font-medium">{formatDate(subscription.current_period_end)}</span>
            </div>
          )}
        </div>

        {!isActive && subscription.status === 'past_due' && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-800">
              Your payment is past due. Please update your payment method to continue using the service.
            </p>
          </div>
        )}

        {!isActive && subscription.status === 'incomplete' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Your subscription setup is incomplete. Please complete the checkout process.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

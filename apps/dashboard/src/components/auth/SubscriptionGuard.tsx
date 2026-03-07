import { Navigate } from 'react-router-dom';
import { useSubscription } from '@/features/billing/hooks/useSubscription';
import type { ReactNode } from 'react';

interface SubscriptionGuardProps {
  children: ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { isActive, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return <Navigate to="/billing" replace />;
  }

  return <>{children}</>;
};

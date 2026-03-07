import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useClinicStore } from '@/store/clinic-store';
import { useSubscription } from '@/features/billing/hooks/useSubscription';
import type { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  requireClinic?: boolean;
  requireSubscription?: boolean;
}

export const AuthGuard = ({
  children,
  requireClinic = true,
  requireSubscription = true
}: AuthGuardProps) => {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const clinicId = useClinicStore((state) => state.clinicId);
  const location = useLocation();
  const { isActive: isSubscriptionActive, isLoading: subscriptionLoading } = useSubscription();

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireClinic && !clinicId && location.pathname !== '/create-clinic') {
    return <Navigate to="/create-clinic" replace />;
  }

  if (
    requireSubscription &&
    clinicId &&
    !isSubscriptionActive &&
    location.pathname !== '/select-plan' &&
    location.pathname !== '/create-clinic'
  ) {
    return <Navigate to="/select-plan" replace />;
  }

  return <>{children}</>;
};
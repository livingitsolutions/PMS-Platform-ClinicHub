import { useQuery } from '@tanstack/react-query';
import { useClinicStore } from '@/store/clinic-store';
import { getClinicSubscription } from '../api/subscriptionApi';

export function useSubscription() {
  const clinicId = useClinicStore((s) => s.clinicId);

  const { data: subscription, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription', clinicId],
    enabled: !!clinicId,
    queryFn: () => {
      if (!clinicId) return null;
      return getClinicSubscription(clinicId);
    },
  });

  const status = subscription?.status ?? null;
  const isActive = status === 'active' || status === 'trialing';

  return {
    plan: subscription?.plan ?? null,
    status,
    current_period_end: subscription?.current_period_end ?? null,
    isActive,
    isLoading,
    error,
    refetch,
  };
}

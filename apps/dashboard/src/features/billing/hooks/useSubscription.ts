import { useQuery } from '@tanstack/react-query';
import { useClinicStore } from '@/store/clinic-store';
import { getClinicSubscription, isSubscriptionActive } from '../api/subscriptionApi';

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

  const isActive = isSubscriptionActive(subscription ?? null);

  return {
    subscription,
    isLoading,
    error,
    isActive,
    refetch,
  };
}

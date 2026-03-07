import { useQuery } from '@tanstack/react-query';
import { getProviders } from '../api/appointments';
import { getProviderAvailability } from '@/features/providers/api/providerAvailability';

export function useProviders(clinicId: string | null) {
  return useQuery({
    queryKey: ['providers', clinicId],
    queryFn: () => getProviders(clinicId!),
    enabled: !!clinicId,
  });
}

export function useProviderAvailability(providerId: string | null) {
  return useQuery({
    queryKey: ['provider-availability', providerId],
    queryFn: () => getProviderAvailability(providerId!),
    enabled: !!providerId,
  });
}

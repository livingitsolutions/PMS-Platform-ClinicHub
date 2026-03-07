import { useQuery } from '@tanstack/react-query';
import { getProcedures } from '@/features/procedures/api/proceduresApi';

export function useProcedures(clinicId: string) {
  return useQuery({
    queryKey: ['procedures', clinicId],
    queryFn: () => getProcedures(clinicId),
    enabled: !!clinicId,
  });
}

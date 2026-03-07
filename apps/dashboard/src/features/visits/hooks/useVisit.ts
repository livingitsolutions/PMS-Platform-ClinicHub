import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVisit, updateVisit, type UpdateVisitPayload } from '../api/visitsApi';

export function useVisit(visitId: string) {
  return useQuery({
    queryKey: ['visit', visitId],
    queryFn: () => getVisit(visitId),
    enabled: !!visitId,
  });
}

export function useUpdateVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitId, payload }: { visitId: string; payload: UpdateVisitPayload }) =>
      updateVisit(visitId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['visit', data.id],
      });
    },
  });
}

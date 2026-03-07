import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVisitProcedures,
  createVisitProcedure,
  updateVisitProcedure,
  deleteVisitProcedure,
  type CreateVisitProcedurePayload,
  type UpdateVisitProcedurePayload,
} from '../api/visitProceduresApi';

export function useVisitProcedures(visitId: string) {
  return useQuery({
    queryKey: ['visit-procedures', visitId],
    queryFn: () => getVisitProcedures(visitId),
    enabled: !!visitId,
  });
}

export function useCreateVisitProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVisitProcedurePayload) =>
      createVisitProcedure(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['visit-procedures', variables.visit_id],
      });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.visit_id] });
    },
  });
}

export function useUpdateVisitProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVisitProcedurePayload }) =>
      updateVisitProcedure(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['visit-procedures', data.visit_id],
      });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.visit_id] });
    },
  });
}

export function useDeleteVisitProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; visitId: string }) =>
      deleteVisitProcedure(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['visit-procedures', variables.visitId],
      });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.visitId] });
    },
  });
}

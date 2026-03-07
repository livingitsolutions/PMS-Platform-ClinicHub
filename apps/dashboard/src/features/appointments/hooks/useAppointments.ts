import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  type CreateAppointmentPayload,
  type UpdateAppointmentPayload,
} from '../api/appointments';

export function useAppointments(
  clinicId: string | null,
  filters?: {
    startDate?: string;
    endDate?: string;
    providerId?: string;
    patientId?: string;
  }
) {
  return useQuery({
    queryKey: [
      'appointments',
      clinicId,
      filters?.startDate,
      filters?.endDate,
      filters?.providerId,
      filters?.patientId,
    ],
    queryFn: () => getAppointments(clinicId!, filters),
    enabled: !!clinicId,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clinicId,
      payload,
    }: {
      clinicId: string;
      payload: CreateAppointmentPayload;
    }) => createAppointment(clinicId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['appointments', variables.clinicId],
      });
    },
  });
}

export function useUpdateAppointment(clinicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: UpdateAppointmentPayload;
    }) => updateAppointment(appointmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['appointments', clinicId]
      });
    },
  });
}

export function useDeleteAppointment(clinicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => deleteAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['appointments', clinicId]
      });
    },
  });
}

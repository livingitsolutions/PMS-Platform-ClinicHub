import { useQuery } from '@tanstack/react-query';
import { getOrCreateVisitByAppointment } from '../api/visitsApi';

export function useVisitByAppointment(appointmentId: string | null | undefined) {
  return useQuery({
    queryKey: ['visit', 'appointment', appointmentId],
    queryFn: () => {
      if (!appointmentId) {
        throw new Error('Appointment ID is required');
      }
      return getOrCreateVisitByAppointment(appointmentId);
    },
    enabled: !!appointmentId,
    staleTime: 1000 * 60 * 5,
  });
}

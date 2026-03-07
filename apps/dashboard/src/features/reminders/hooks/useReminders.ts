import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useClinicStore } from '@/store/clinic-store';
import { supabase } from '@/lib/supabase';
import {
  getPendingReminders,
  getClinicReminders,
  markReminderAsSent,
  createManualReminder,
  deleteReminder,
} from '../api/remindersApi';

export function usePendingReminders() {
  const clinicId = useClinicStore((state) => state.clinicId);

  return useQuery({
    queryKey: ['reminders', 'pending', clinicId],
    queryFn: () => getPendingReminders(clinicId || undefined),
    enabled: !!clinicId,
    refetchInterval: 60000,
  });
}

export function useClinicReminders(includeAll: boolean = false) {
  const clinicId = useClinicStore((state) => state.clinicId);

  return useQuery({
    queryKey: ['reminders', 'clinic', clinicId, includeAll],
    queryFn: () => {
      if (!clinicId) throw new Error('No clinic selected');
      return getClinicReminders(clinicId, includeAll);
    },
    enabled: !!clinicId,
  });
}

export function useMarkReminderSent() {
  const queryClient = useQueryClient();
  const clinicId = useClinicStore((state) => state.clinicId);

  return useMutation({
    mutationFn: markReminderAsSent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', 'pending', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['reminders', 'clinic', clinicId] });
    },
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  const clinicId = useClinicStore((state) => state.clinicId);

  return useMutation({
    mutationFn: ({
      appointmentId,
      reminderTime,
    }: {
      appointmentId: string;
      reminderTime: string;
    }) => {
      if (!clinicId) throw new Error('No clinic selected');
      return createManualReminder(appointmentId, clinicId, reminderTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', 'pending', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['reminders', 'clinic', clinicId] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  const clinicId = useClinicStore((state) => state.clinicId);

  return useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', 'pending', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['reminders', 'clinic', clinicId] });
    },
  });
}

export function useProcessReminders() {
  const queryClient = useQueryClient();
  const clinicId = useClinicStore((state) => state.clinicId);

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/process-appointment-reminders`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process reminders');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', 'pending', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['reminders', 'clinic', clinicId] });
    },
  });
}

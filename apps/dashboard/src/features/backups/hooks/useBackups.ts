import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useClinicStore } from '@/store/clinic-store';
import {
  getClinicBackups,
  getLatestBackupByClinic,
  getBackupStats,
  createBackup,
  deleteBackup,
  type CreateBackupPayload,
} from '../api/backupsApi';

export function useClinicBackups(clinicId: string | null) {
  return useQuery({
    queryKey: ['backups', 'clinic', clinicId],
    enabled: !!clinicId,
    queryFn: () => {
      if (!clinicId) return [];
      return getClinicBackups(clinicId);
    },
  });
}

export function useLatestBackup(clinicId: string | null) {
  return useQuery({
    queryKey: ['backups', 'latest', clinicId],
    enabled: !!clinicId,
    queryFn: () => {
      if (!clinicId) return null;
      return getLatestBackupByClinic(clinicId);
    },
  });
}

export function useBackupStats() {
  const clinicId = useClinicStore((s) => s.clinicId);

  return useQuery({
    queryKey: ['backups', 'stats', clinicId],
    enabled: !!clinicId,
    queryFn: () => {
      if (!clinicId) throw new Error('No clinic selected');
      return getBackupStats(clinicId);
    },
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBackupPayload) => createBackup(payload),
    onSuccess: (_data, variables) => {
      if (variables.clinic_id) {
        queryClient.invalidateQueries({ queryKey: ['backups', 'clinic', variables.clinic_id] });
        queryClient.invalidateQueries({ queryKey: ['backups', 'latest', variables.clinic_id] });
        queryClient.invalidateQueries({ queryKey: ['backups', 'stats', variables.clinic_id] });
      }
    },
  });
}

export function useDeleteBackup(clinicId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (backupId: string) => deleteBackup(backupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups', 'clinic', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['backups', 'latest', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['backups', 'stats', clinicId] });
    },
  });
}

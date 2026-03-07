import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllBackups,
  getClinicBackups,
  getLatestBackupByClinic,
  getBackupStats,
  createBackup,
  type CreateBackupPayload,
} from '../api/backupsApi';

export function useAllBackups() {
  return useQuery({
    queryKey: ['backups'],
    queryFn: getAllBackups,
  });
}

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
  return useQuery({
    queryKey: ['backups', 'stats'],
    queryFn: getBackupStats,
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
      }
      queryClient.invalidateQueries({ queryKey: ['backups', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });
}

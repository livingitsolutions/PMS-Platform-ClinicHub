import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useClinicStore } from '@/store/clinic-store';
import {
  getStaffMembers,
  inviteStaffMember,
  updateStaffRole,
  removeStaffMember,
  InviteStaffPayload,
} from '../api/staffApi';
import { UserRole } from '@/store/clinic-store';

export function useStaff() {
  const clinicId = useClinicStore((s) => s.clinicId);
  const queryClient = useQueryClient();

  const staffQuery = useQuery({
    queryKey: ['staff', clinicId],
    queryFn: () => getStaffMembers(clinicId!),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 2,
  });

  const inviteMutation = useMutation({
    mutationFn: (payload: InviteStaffPayload) =>
      inviteStaffMember(clinicId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', clinicId] });
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ membershipId, role }: { membershipId: string; role: UserRole }) =>
      updateStaffRole(membershipId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', clinicId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (membershipId: string) => removeStaffMember(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', clinicId] });
    },
  });

  return {
    staff: staffQuery.data || [],
    isLoading: staffQuery.isLoading,
    isError: staffQuery.isError,
    error: staffQuery.error,
    refetch: staffQuery.refetch,
    inviteMutation,
    changeRoleMutation,
    removeMutation,
  };
}

import { useState } from 'react';
import { useClinicStore } from '@/store/clinic-store';
import { useAuthStore } from '@/store/auth-store';
import { usePermissions } from '@/hooks/usePermissions';
import { useStaff } from '../hooks/useStaff';
import { StaffTable } from '../components/StaffTable';
import { InviteStaffDialog } from '../components/InviteStaffDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function StaffPage() {
  const clinicId = useClinicStore((s) => s.clinicId);
  const user = useAuthStore((s) => s.user);
  const { canManageStaff } = usePermissions();
  const [inviteOpen, setInviteOpen] = useState(false);

  const { staff, isLoading, isError, error, removeMutation } = useStaff();

  if (!clinicId) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Please select a clinic.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Staff Members</CardTitle>
          {canManageStaff && (
            <Button onClick={() => setInviteOpen(true)}>Invite Staff</Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading staff...</p>
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center py-12">
              <p className="text-destructive text-sm">
                {error instanceof Error ? error.message : 'Failed to load staff members.'}
              </p>
            </div>
          )}

          {!isLoading && !isError && (
            <StaffTable
              staff={staff}
              currentUserId={user?.id || ''}
              canManageStaff={canManageStaff}
              onRemove={(membershipId) => removeMutation.mutate(membershipId)}
              isRemoving={removeMutation.isPending}
            />
          )}
        </CardContent>
      </Card>

      <InviteStaffDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}

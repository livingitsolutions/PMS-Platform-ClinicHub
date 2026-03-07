import { useState } from 'react';
import { useClinicStore } from '@/store/clinic-store';
import { useAuthStore } from '@/store/auth-store';
import { usePermissions } from '@/hooks/usePermissions';
import { useStaff } from '../hooks/useStaff';
import { StaffTable } from '../components/StaffTable';
import { InviteStaffDialog } from '../components/InviteStaffDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout, PageHeader } from '@/components/layout/DashboardLayout';

export function StaffPage() {
  const clinicId = useClinicStore((s) => s.clinicId);
  const user = useAuthStore((s) => s.user);
  const { canManageStaff } = usePermissions();
  const [inviteOpen, setInviteOpen] = useState(false);

  const { staff, isLoading, isError, error, removeMutation } = useStaff();

  if (!clinicId) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Please select a clinic.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Staff Members"
        subtitle="Manage clinic staff and permissions"
        actions={canManageStaff ? <Button onClick={() => setInviteOpen(true)}>Invite Staff</Button> : undefined}
      />

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
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
    </DashboardLayout>
  );
}

import { useState } from 'react';
import { StaffMember } from '../api/staffApi';
import { UserRole } from '@/store/clinic-store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChangeRoleDialog } from './ChangeRoleDialog';

interface StaffTableProps {
  staff: StaffMember[];
  currentUserId: string;
  canManageStaff: boolean;
  onRemove: (membershipId: string) => void;
  isRemoving: boolean;
}

const ROLE_BADGE: Record<UserRole, string> = {
  owner: 'bg-blue-50 text-blue-700 border border-blue-200',
  admin: 'bg-amber-50 text-amber-700 border border-amber-200',
  staff: 'bg-gray-50 text-gray-700 border border-gray-200',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function StaffTable({
  staff,
  currentUserId,
  canManageStaff,
  onRemove,
  isRemoving,
}: StaffTableProps) {
  const [changeRoleTarget, setChangeRoleTarget] = useState<StaffMember | null>(null);

  if (staff.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No staff members found.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            {canManageStaff && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => {
            const isCurrentUser = member.user_id === currentUserId;
            const isOwner = member.role === 'owner';

            return (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <span>{member.email}</span>
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${ROLE_BADGE[member.role]}`}
                  >
                    {member.role}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {member.created_at ? formatDate(member.created_at) : '—'}
                </TableCell>
                {canManageStaff && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!isOwner && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setChangeRoleTarget(member)}
                        >
                          Change Role
                        </Button>
                      )}
                      {!isCurrentUser && !isOwner && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isRemoving}
                          onClick={() => onRemove(member.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {changeRoleTarget && (
        <ChangeRoleDialog
          member={changeRoleTarget}
          open={!!changeRoleTarget}
          onOpenChange={(open) => {
            if (!open) setChangeRoleTarget(null);
          }}
        />
      )}
    </>
  );
}

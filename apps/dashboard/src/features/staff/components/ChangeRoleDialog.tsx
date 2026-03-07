import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserRole } from '@/store/clinic-store';
import { StaffMember } from '../api/staffApi';
import { useStaff } from '../hooks/useStaff';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ChangeRoleDialogProps {
  member: StaffMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RoleFormData {
  role: UserRole;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
];

export function ChangeRoleDialog({ member, open, onOpenChange }: ChangeRoleDialogProps) {
  const { changeRoleMutation } = useStaff();
  const [error, setError] = useState<string | null>(null);

  const { setValue, watch, handleSubmit, reset } = useForm<RoleFormData>({
    defaultValues: { role: member.role === 'owner' ? 'admin' : member.role },
  });

  const selectedRole = watch('role');

  const onSubmit = (data: RoleFormData) => {
    setError(null);
    changeRoleMutation.mutate(
      { membershipId: member.id, role: data.role },
      {
        onSuccess: () => {
          reset();
          setError(null);
          onOpenChange(false);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Failed to update role.');
        },
      }
    );
  };

  const handleClose = () => {
    reset();
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Update the role for <span className="font-medium">{member.email}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">New Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setValue('role', value as UserRole)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={changeRoleMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={changeRoleMutation.isPending}>
              {changeRoleMutation.isPending ? 'Saving...' : 'Save Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

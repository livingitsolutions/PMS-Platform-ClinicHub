import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserRole } from '@/store/clinic-store';
import { InviteStaffPayload } from '../api/staffApi';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InviteStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InviteFormData {
  email: string;
  role: UserRole;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
];

export function InviteStaffDialog({ open, onOpenChange }: InviteStaffDialogProps) {
  const { inviteMutation } = useStaff();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<InviteFormData>({
    defaultValues: { role: 'staff' },
  });

  const selectedRole = watch('role');

  const onSubmit = (data: InviteFormData) => {
    setError(null);
    const payload: InviteStaffPayload = { email: data.email, role: data.role };
    inviteMutation.mutate(payload, {
      onSuccess: () => {
        reset();
        setError(null);
        onOpenChange(false);
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'Failed to invite staff member.');
      },
    });
  };

  const handleClose = () => {
    reset();
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Invite Staff Member</DialogTitle>
          <DialogDescription>
            Enter the email address of a registered user to add them to this clinic.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
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
              disabled={inviteMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? 'Inviting...' : 'Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProvider, CreateProviderPayload } from '../api/providersApi';
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

interface CreateProviderDialogProps {
  clinicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

interface ProviderFormData {
  name: string;
  specialization: string;
}

export function CreateProviderDialog({
  clinicId,
  open,
  onOpenChange,
  onCreated,
}: CreateProviderDialogProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProviderFormData>();

  const createMutation = useMutation({
    mutationFn: (payload: CreateProviderPayload) =>
      createProvider(clinicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers', clinicId] });
      reset();
      setError(null);
      onOpenChange(false);
      onCreated?.();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create provider');
    },
  });

  const onSubmit = (data: ProviderFormData) => {
    setError(null);
    createMutation.mutate({
      name: data.name,
      specialization: data.specialization,
    });
  };

  const handleClose = () => {
    reset();
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Provider</DialogTitle>
          <DialogDescription>
            Enter the provider's information to create a new record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name', {
                  required: 'Name is required',
                })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">
                Specialization <span className="text-destructive">*</span>
              </Label>
              <Input
                id="specialization"
                {...register('specialization', {
                  required: 'Specialization is required',
                })}
              />
              {errors.specialization && (
                <p className="text-sm text-destructive">
                  {errors.specialization.message}
                </p>
              )}
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
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Provider'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

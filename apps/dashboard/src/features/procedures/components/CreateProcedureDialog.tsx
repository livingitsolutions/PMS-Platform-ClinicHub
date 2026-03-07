import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProcedure, CreateProcedurePayload } from '../api/proceduresApi';
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

interface CreateProcedureDialogProps {
  clinicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProcedureFormData {
  name: string;
  description: string;
  base_cost: string;
}

export function CreateProcedureDialog({
  clinicId,
  open,
  onOpenChange,
}: CreateProcedureDialogProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProcedureFormData>();

  const createMutation = useMutation({
    mutationFn: (payload: CreateProcedurePayload) =>
      createProcedure(clinicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures', clinicId] });
      reset();
      setError(null);
      onOpenChange(false);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to create procedure');
    },
  });

  const onSubmit = (data: ProcedureFormData) => {
    setError(null);
    createMutation.mutate({
      name: data.name,
      description: data.description || null,
      base_cost: Number(data.base_cost) || 0
    });
  };

  const handleClose = () => {
    reset();
    setError(null);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) setError(null)
    if (!open) reset()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Procedure</DialogTitle>
          <DialogDescription>
            Enter the procedure's information to create a new record.
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
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_cost">
                Base Cost <span className="text-destructive">*</span>
              </Label>
              <Input
                id="base_cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('base_cost', {
                  required: 'Base cost is required',
                  min: {
                    value: 0,
                    message: 'Base cost must be a positive number',
                  },
                })}
              />
              {errors.base_cost && (
                <p className="text-sm text-destructive">
                  {errors.base_cost.message}
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
              {createMutation.isPending ? 'Creating...' : 'Create Procedure'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

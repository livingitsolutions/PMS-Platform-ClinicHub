import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useCreatePayment } from '../hooks/useInvoice';
import type { CreatePaymentPayload } from '../api/invoicesApi';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  visitId: string;
  maxAmount?: number;
}

interface PaymentFormData {
  amount: string;
  method: 'cash' | 'card' | 'bank_transfer' | 'other';
  notes: string;
}

export function PaymentDialog({
  open,
  onOpenChange,
  invoiceId,
  visitId,
  maxAmount,
}: PaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createPayment = useCreatePayment();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    defaultValues: {
      amount: '',
      method: 'cash',
      notes: '',
    },
  });

  const method = watch('method');

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);

    try {
      const payload: CreatePaymentPayload & { visitId: string } = {
        invoice_id: invoiceId,
        visitId: visitId,
        amount: parseFloat(data.amount),
        method: data.method,
        notes: data.notes,
      };

      await createPayment.mutateAsync(payload);

      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount}
              placeholder="0.00"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
                max: maxAmount
                  ? { value: maxAmount, message: `Amount cannot exceed $${maxAmount}` }
                  : undefined,
              })}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method *</Label>
            <Select
              value={method}
              onValueChange={(value) =>
                setValue('method', value as PaymentFormData['method'])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Optional notes"
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

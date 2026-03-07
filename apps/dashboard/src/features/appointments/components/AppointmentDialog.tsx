import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateAppointment } from '../hooks/useAppointments';
import type { CreateAppointmentPayload } from '../api/appointments';

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  providerId: string;
  selectedSlot: { start: string; end: string } | null;
  patients: Array<{ id: string; first_name: string; last_name: string }>;
}

interface FormData {
  patient_id: string;
  notes: string;
}

export function AppointmentDialog({
  open,
  onOpenChange,
  clinicId,
  providerId,
  selectedSlot,
  patients,
}: AppointmentDialogProps) {
  const createAppointment = useCreateAppointment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      patient_id: '',
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload: CreateAppointmentPayload = {
        patient_id: data.patient_id,
        provider_id: providerId,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        notes: data.notes || null,
      };

      await createAppointment.mutateAsync({ clinicId, payload });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create appointment:', error);
      setSubmitError('Failed to schedule appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patient_id"
              rules={{ required: 'Patient is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Appointment notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedSlot && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium">Selected Time</p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedSlot.start).toLocaleString()} -{' '}
                  {new Date(selectedSlot.end).toLocaleTimeString()}
                </p>
              </div>
            )}

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Scheduling...' : 'Schedule'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

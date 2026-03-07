import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProviderAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  type CreateAvailabilityPayload,
  type UpdateAvailabilityPayload,
} from '@/features/providers/api/providerAvailability';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AvailabilityEditorProps {
  providerId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface EditDialogState {
  open: boolean;
  mode: 'create' | 'edit';
  availabilityId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export function AvailabilityEditor({ providerId }: AvailabilityEditorProps) {
  const queryClient = useQueryClient();
  const [dialogState, setDialogState] = useState<EditDialogState>({
    open: false,
    mode: 'create',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
  });

  const { data: availabilities, isLoading } = useQuery({
    queryKey: ['provider-availability', providerId],
    queryFn: () => getProviderAvailability(providerId),
    enabled: !!providerId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAvailabilityPayload) =>
      createAvailability(providerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['provider-availability', providerId],
      });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAvailabilityPayload;
    }) => updateAvailability(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['provider-availability', providerId],
      });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['provider-availability', providerId],
      });
    },
  });

  const closeDialog = () => {
    setDialogState({
      open: false,
      mode: 'create',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
    });
  };

  const handleAdd = (dayOfWeek: number) => {
    setDialogState({
      open: true,
      mode: 'create',
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
    });
  };

  const handleEdit = (availability: {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }) => {
    setDialogState({
      open: true,
      mode: 'edit',
      availabilityId: availability.id,
      dayOfWeek: availability.day_of_week,
      startTime: availability.start_time,
      endTime: availability.end_time,
    });
  };

  const handleDelete = (availabilityId: string) => {
    if (confirm('Are you sure you want to delete this availability?')) {
      deleteMutation.mutate(availabilityId);
    }
  };

  const handleSave = () => {
    const payload = {
      day_of_week: dialogState.dayOfWeek,
      start_time: dialogState.startTime,
      end_time: dialogState.endTime,
    };

    if (dialogState.mode === 'create') {
      createMutation.mutate(payload);
    } else if (dialogState.availabilityId) {
      updateMutation.mutate({
        id: dialogState.availabilityId,
        payload,
      });
    }
  };

  const getAvailabilitiesForDay = (day: number) => {
    return availabilities?.filter((a) => a.day_of_week === day) || [];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-500">Loading schedule...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DAYS_OF_WEEK.map((day) => {
                const dayAvailabilities = getAvailabilitiesForDay(day.value);

                if (dayAvailabilities.length === 0) {
                  return (
                    <TableRow key={day.value}>
                      <TableCell className="font-medium">
                        {day.label}
                      </TableCell>
                      <TableCell colSpan={2} className="text-gray-500">
                        OFF
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdd(day.value)}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }

                return dayAvailabilities.map((availability, index) => (
                  <TableRow key={availability.id}>
                    {index === 0 && (
                      <TableCell
                        className="font-medium"
                        rowSpan={dayAvailabilities.length}
                      >
                        {day.label}
                      </TableCell>
                    )}
                    <TableCell>{availability.start_time}</TableCell>
                    <TableCell>{availability.end_time}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(availability)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(availability.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ));
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogState.open} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState.mode === 'create'
                ? 'Add Availability'
                : 'Edit Availability'}
            </DialogTitle>
            <DialogDescription>
              Set the working hours for this day.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select
                value={dialogState.dayOfWeek.toString()}
                onValueChange={(value) =>
                  setDialogState((prev) => ({
                    ...prev,
                    dayOfWeek: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={dialogState.startTime}
                onChange={(e) =>
                  setDialogState((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={dialogState.endTime}
                onChange={(e) =>
                  setDialogState((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                createMutation.isPending || updateMutation.isPending
              }
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

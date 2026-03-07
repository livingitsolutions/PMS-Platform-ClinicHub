import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TimeSlot } from '../hooks/useAvailableSlots';

interface TimeSlotsProps {
  slots: TimeSlot[];
  isLoading: boolean;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedDate: Date | null;
}

export function TimeSlots({
  slots,
  isLoading,
  onSlotSelect,
  selectedDate,
}: TimeSlotsProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!selectedDate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Times</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Please select a date to view available time slots
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Times</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">Loading slots...</p>
        </CardContent>
      </Card>
    );
  }

  if (slots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Times</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No available time slots for this date
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Times</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {slots.map((slot, index) => (
            <Button
              key={index}
              variant={slot.available ? 'outline' : 'secondary'}
              disabled={!slot.available}
              onClick={() => slot.available && onSlotSelect(slot)}
              className="text-sm"
            >
              {formatTime(slot.start)}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { Bell, Send, Clock, CircleCheck as CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePendingReminders, useProcessReminders } from '../hooks/useReminders';

export function RemindersPanel() {
  const { data: reminders = [], isLoading } = usePendingReminders();
  const processReminders = useProcessReminders();

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  const handleProcessReminders = async () => {
    try {
      await processReminders.mutateAsync();
    } catch (error) {
      console.error('Failed to process reminders:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5" />
              Appointment Reminders
            </CardTitle>
            <CardDescription>
              Pending reminders ready to be sent to patients
            </CardDescription>
          </div>
          <Button
            onClick={handleProcessReminders}
            disabled={processReminders.isPending || reminders.length === 0}
          >
            <Send className="size-4 mr-2" />
            {processReminders.isPending ? 'Processing...' : 'Process Reminders'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading reminders...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="size-12 text-green-500 mb-3" />
            <p className="text-muted-foreground font-medium">No pending reminders</p>
            <p className="text-sm text-muted-foreground mt-1">
              All appointment reminders have been sent
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Appointment Date</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Reminder Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.map((reminder) => {
                const appointment = reminder.appointments;
                const patient = appointment?.patients;
                const provider = appointment?.providers;

                if (!appointment || !patient) return null;

                const appointmentDateTime = formatDateTime(appointment.start_time);
                const reminderDateTime = formatDateTime(reminder.reminder_time);
                const isPastDue = new Date(reminder.reminder_time) < new Date();

                return (
                  <TableRow key={reminder.id}>
                    <TableCell className="font-medium">
                      {patient.first_name} {patient.last_name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {patient.email || 'No email'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {appointmentDateTime.date}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {appointmentDateTime.time}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{provider?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="size-3 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {reminderDateTime.date}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {reminderDateTime.time}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isPastDue ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Ready to send
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Scheduled
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

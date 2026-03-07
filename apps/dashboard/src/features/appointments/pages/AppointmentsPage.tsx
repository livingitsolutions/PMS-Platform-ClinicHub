import { useState } from 'react';
import { useClinicStore } from '@/store/clinic-store';
import { useProviders } from '../hooks/useProviderAvailability';
import { useAvailableSlots } from '../hooks/useAvailableSlots';
import { CalendarView } from '../components/CalendarView';
import { ProviderSelector } from '../components/ProviderSelector';
import { TimeSlots } from '../components/TimeSlots';
import { AppointmentDialog } from '../components/AppointmentDialog';
import { DayTimeline } from '../components/DayTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getPatients } from '@/features/patients/api/patientsApi';
import type { TimeSlot } from '../hooks/useAvailableSlots';
import { QueryErrorAlert } from '@/components/system/ErrorAlert';

export function AppointmentsPage() {
  const { clinicId } = useClinicStore();
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');

  const { data: providers, isLoading: providersLoading, error: providersError, refetch: refetchProviders } =
    useProviders(clinicId);

  const { data: patientsData, error: patientsError, refetch: refetchPatients } = useQuery({
    queryKey: ['patients', clinicId],
    queryFn: () => getPatients(clinicId!),
    enabled: !!clinicId,
  });

  const patients = patientsData?.data || [];

  const { slots, isLoading: slotsLoading } = useAvailableSlots(
    clinicId,
    selectedProviderId,
    selectedDate,
    30
  );

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setDialogOpen(true);
  };

  if (!clinicId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-center">
              Please select a clinic to view appointments
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-gray-600 mt-1">Schedule and manage appointments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            onClick={() => setViewMode('timeline')}
          >
            Timeline View
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </Button>
        </div>
      </div>

      {providersError && (
        <div className="mb-6">
          <QueryErrorAlert error={providersError} onRetry={() => refetchProviders()} />
        </div>
      )}

      {patientsError && (
        <div className="mb-6">
          <QueryErrorAlert error={patientsError} onRetry={() => refetchPatients()} />
        </div>
      )}

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CalendarView
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Provider</CardTitle>
              </CardHeader>
              <CardContent>
                {providersLoading ? (
                  <p className="text-gray-500">Loading providers...</p>
                ) : providers && providers.length > 0 ? (
                  <ProviderSelector
                    providers={providers}
                    selectedProviderId={selectedProviderId}
                    onProviderSelect={setSelectedProviderId}
                  />
                ) : (
                  <p className="text-gray-500">No providers available</p>
                )}
              </CardContent>
            </Card>

            {selectedProviderId && (
              <TimeSlots
                slots={slots}
                isLoading={slotsLoading}
                onSlotSelect={handleSlotSelect}
                selectedDate={selectedDate}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Provider</CardTitle>
              </CardHeader>
              <CardContent>
                {providersLoading ? (
                  <p className="text-gray-500">Loading providers...</p>
                ) : providers && providers.length > 0 ? (
                  <ProviderSelector
                    providers={providers}
                    selectedProviderId={selectedProviderId}
                    onProviderSelect={setSelectedProviderId}
                  />
                ) : (
                  <p className="text-gray-500">No providers available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarView
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedProviderId && selectedDate ? (
              <DayTimeline
                providerId={selectedProviderId}
                selectedDate={selectedDate}
                clinicId={clinicId}
                patients={patients || []}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-500 text-center">
                    Please select a provider and date to view timeline
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {selectedSlot && clinicId && selectedProviderId && (
        <AppointmentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          clinicId={clinicId}
          providerId={selectedProviderId}
          selectedSlot={selectedSlot}
          patients={patients || []}
        />
      )}
    </div>
  );
}

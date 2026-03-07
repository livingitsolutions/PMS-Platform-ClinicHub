import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAvailableSlots } from '../hooks/useAvailableSlots';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentDialog } from './AppointmentDialog';
import { useVisitByAppointment } from '@/features/visits/hooks/useVisitByAppointment';
import type { TimeSlot } from '../hooks/useAvailableSlots';

interface DayTimelineProps {
  providerId: string;
  selectedDate: Date;
  clinicId: string;
  patients: Array<{ id: string; first_name: string; last_name: string }>;
}

export function DayTimeline({
  providerId,
  selectedDate,
  clinicId,
  patients,
}: DayTimelineProps) {
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clickedAppointmentId, setClickedAppointmentId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: visit, isLoading: visitLoading } = useVisitByAppointment(clickedAppointmentId);

  const { slots, isLoading: slotsLoading } = useAvailableSlots(
    clinicId,
    providerId,
    selectedDate,
    30
  );

  const startDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    0,
    0,
    0,
    0
  ).toISOString();

  const endDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    23,
    59,
    59,
    999
  ).toISOString();

  const { data: appointments } = useAppointments(clinicId, {
    startDate,
    endDate,
    providerId,
  });

  const patientMap = useMemo(() => {
    const map: Record<string, { first_name: string; last_name: string }> = {};
    patients.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [patients]);

  const appointmentMap = useMemo(() => {
    const map: Record<string, any> = {};
    if (!appointments) return map;

    appointments.forEach((a) => {
      map[a.start_time] = a;
    });

    return map;
  }, [appointments]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getPatientName = (patientId: string) => {
    const patient = patientMap[patientId];
    if (!patient) return 'Unknown Patient';
    return `${patient.first_name} ${patient.last_name}`;
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
      setDialogOpen(true);
    }
  };

  const handleAppointmentClick = (appointment: any) => {
    setClickedAppointmentId(appointment.id);
  };

  useEffect(() => {
    if (visit && !visitLoading) {
      navigate(`/visits/${visit.id}`);
      setClickedAppointmentId(null);
    }
  }, [visit, visitLoading, navigate]);

  useEffect(() => {
    if (!scrollContainerRef.current || slots.length === 0) return;

    const now = new Date();
    const currentTime = now.getTime();

    const nearestSlotIndex = slots.findIndex((slot) => {
      const slotTime = new Date(slot.start).getTime();
      return slotTime >= currentTime;
    });

    if (nearestSlotIndex !== -1) {
      const targetElement = scrollContainerRef.current.querySelector(
        `[data-start-time="${slots[nearestSlotIndex].start}"]`
      );

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  }, [slots]);

  if (slotsLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-500 text-center">Loading timeline...</p>
        </CardContent>
      </Card>
    );
  }

  if (slots.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-500 text-center">
            No availability for this date
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div
            ref={scrollContainerRef}
            className="max-h-[600px] overflow-y-auto"
          >
            <div className="divide-y">
              {slots.map((slot) => {
                const appointment = appointmentMap[slot.start];
                const isAvailable = slot.available;

                return (
                  <div
                    key={slot.start}
                    data-start-time={slot.start}
                    className="flex items-stretch h-[60px] hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-20 flex-shrink-0 flex items-center justify-center bg-gray-100 border-r font-medium text-sm">
                      {formatTime(slot.start)}
                    </div>
                    <div className="flex-1 flex items-center px-4">
                      {isAvailable ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSlotClick(slot)}
                          className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                        >
                          Available
                        </Button>
                      ) : appointment ? (
                        <div
                          className="flex-1 cursor-pointer hover:opacity-80"
                          onClick={() => handleAppointmentClick(appointment)}
                        >
                          <p className="font-medium text-sm">
                            {getPatientName(appointment.patient_id)}
                          </p>
                          {appointment.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">Booked</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSlot && (
        <AppointmentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          clinicId={clinicId}
          providerId={providerId}
          selectedSlot={selectedSlot}
          patients={patients}
        />
      )}
    </>
  );
}

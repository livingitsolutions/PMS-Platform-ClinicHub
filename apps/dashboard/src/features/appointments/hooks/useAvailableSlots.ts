import { useMemo } from 'react';
import { useProviderAvailability } from './useProviderAvailability';
import { useAppointments } from './useAppointments';
import type { ProviderAvailability } from '@/features/providers/api/providerAvailability';

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

function parseTime(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function formatTimeSlot(date: Date): string {
  return date.toISOString();
}

function generateSlotsForDay(
  date: Date,
  availability: ProviderAvailability,
  slotDuration: number = 30
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startTime = parseTime(availability.start_time);
  const endTime = parseTime(availability.end_time);

  const slotStart = new Date(date);
  slotStart.setHours(startTime.hours, startTime.minutes, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(endTime.hours, endTime.minutes, 0, 0);

  let currentSlot = new Date(slotStart);

  while (currentSlot < dayEnd) {
    const slotEnd = addMinutes(currentSlot, slotDuration);

    if (slotEnd <= dayEnd) {
      slots.push({
        start: formatTimeSlot(currentSlot),
        end: formatTimeSlot(slotEnd),
        available: true,
      });
    }

    currentSlot = slotEnd;
  }

  return slots;
}

function isSlotBooked(
  slot: TimeSlot,
  appointments: Array<{ start_time: string; end_time: string }>
): boolean {
  const slotStart = new Date(slot.start);
  const slotEnd = new Date(slot.end);

  return appointments.some((appointment) => {
    const appointmentStart = new Date(appointment.start_time);
    const appointmentEnd = new Date(appointment.end_time);

    return (
      (slotStart >= appointmentStart && slotStart < appointmentEnd) ||
      (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
      (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
    );
  });
}

export function useAvailableSlots(
  clinicId: string | null,
  providerId: string | null,
  selectedDate: Date | null,
  slotDuration: number = 30
) {
  const { data: availabilityData } = useProviderAvailability(providerId);

  const startDate = selectedDate
    ? new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        0, 0, 0, 0
      ).toISOString()
    : undefined;
  const endDate = selectedDate
    ? new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        23, 59, 59, 999
      ).toISOString()
    : undefined;

  const { data: appointments } = useAppointments(clinicId, {
    startDate,
    endDate,
    providerId: providerId || undefined,
  });

  const slots = useMemo(() => {
    if (!selectedDate || !availabilityData || !appointments) {
      return [];
    }

    const dayOfWeek = selectedDate.getDay();
    const dayAvailability = availabilityData.find(
      (av) => av.day_of_week === dayOfWeek
    );

    if (!dayAvailability) {
      return [];
    }

    const generatedSlots = generateSlotsForDay(
      selectedDate,
      dayAvailability,
      slotDuration
    );

    return generatedSlots.map((slot) => ({
      ...slot,
      available: !isSlotBooked(slot, appointments),
    }));
  }, [selectedDate, availabilityData, appointments, slotDuration]);

  return { slots, isLoading: !availabilityData || !appointments };
}

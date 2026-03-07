import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useClinicStore } from '@/store/clinic-store';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimelineVisit {
  id: string;
  visit_date: string;
  diagnosis: string | null;
  chief_complaint: string | null;
}

interface TimelineAppointment {
  id: string;
  start_time: string;
  status: string;
}

interface TimelineInvoice {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface TimelinePayment {
  id: string;
  amount: number;
  method: string;
  created_at: string;
}

type TimelineEventType = 'visit' | 'appointment' | 'invoice' | 'payment';

interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: Date;
  label: string;
  sublabel: string | null;
  badge: string;
}

async function getPatientTimelineData(
  patientId: string,
  clinicId: string,
  currencyCode: string
): Promise<TimelineEvent[]> {
  const [visitsRes, appointmentsRes] = await Promise.all([
    supabase
      .from('visits')
      .select('id, visit_date, diagnosis, chief_complaint')
      .eq('patient_id', patientId)
      .eq('clinic_id', clinicId)
      .order('visit_date', { ascending: false })
      .limit(50),
    supabase
      .from('appointments')
      .select('id, start_time, status')
      .eq('patient_id', patientId)
      .eq('clinic_id', clinicId)
      .order('start_time', { ascending: false })
      .limit(50),
  ]);

  if (visitsRes.error) throw visitsRes.error;
  if (appointmentsRes.error) throw appointmentsRes.error;

  const visits = (visitsRes.data as TimelineVisit[]) || [];
  const appointments = (appointmentsRes.data as TimelineAppointment[]) || [];

  const visitIds = visits.map((v) => v.id);

  let invoices: TimelineInvoice[] = [];
  let payments: TimelinePayment[] = [];

  if (visitIds.length > 0) {
    const invoicesRes = await supabase
      .from('invoices')
      .select('id, total_amount, status, created_at')
      .in('visit_id', visitIds)
      .order('created_at', { ascending: false });

    if (invoicesRes.error) throw invoicesRes.error;
    invoices = (invoicesRes.data as TimelineInvoice[]) || [];

    const invoiceIds = invoices.map((i) => i.id);

    if (invoiceIds.length > 0) {
      const paymentsRes = await supabase
        .from('payments')
        .select('id, amount, method, created_at')
        .in('invoice_id', invoiceIds)
        .order('created_at', { ascending: false });

      if (paymentsRes.error) throw paymentsRes.error;
      payments = (paymentsRes.data as TimelinePayment[]) || [];
    }
  }

  const events: TimelineEvent[] = [
    ...visits.map((v): TimelineEvent => ({
      id: v.id,
      type: 'visit',
      date: new Date(v.visit_date),
      label: v.chief_complaint || 'Visit',
      sublabel: v.diagnosis || null,
      badge: 'Visit',
    })),
    ...appointments.map((a): TimelineEvent => ({
      id: a.id,
      type: 'appointment',
      date: new Date(a.start_time),
      label: 'Appointment',
      sublabel: a.status.charAt(0).toUpperCase() + a.status.slice(1),
      badge: 'Appointment',
    })),
    ...invoices.map((i): TimelineEvent => ({
      id: i.id,
      type: 'invoice',
      date: new Date(i.created_at),
      label: `Invoice — ${formatCurrency(Number(i.total_amount), currencyCode)}`,
      sublabel: i.status.charAt(0).toUpperCase() + i.status.slice(1),
      badge: 'Invoice',
    })),
    ...payments.map((p): TimelineEvent => ({
      id: p.id,
      type: 'payment',
      date: new Date(p.created_at),
      label: `Payment — ${formatCurrency(Number(p.amount), currencyCode)}`,
      sublabel: p.method.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      badge: 'Payment',
    })),
  ];

  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  return events;
}

const TYPE_STYLES: Record<TimelineEventType, { dot: string; badge: string }> = {
  visit: {
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  appointment: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  invoice: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  payment: {
    dot: 'bg-teal-500',
    badge: 'bg-teal-50 text-teal-700 border border-teal-200',
  },
};

function formatEventDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatEventTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface PatientTimelineProps {
  patientId: string;
  clinicId: string;
}

export function PatientTimeline({ patientId, clinicId }: PatientTimelineProps) {
  const { clinics } = useClinicStore();
  const selectedClinic = clinics.find((c) => c.id === clinicId);
  const currencyCode = selectedClinic?.currency_code ?? 'PHP';

  const { data: events, isLoading, isError } = useQuery({
    queryKey: ['patient-timeline', patientId, clinicId],
    queryFn: () => getPatientTimelineData(patientId, clinicId, currencyCode),
    enabled: !!patientId && !!clinicId,
    staleTime: 1000 * 60 * 2,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading timeline...</p>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-12">
            <p className="text-destructive text-sm">Failed to load timeline data.</p>
          </div>
        )}

        {!isLoading && !isError && (!events || events.length === 0) && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No activity recorded yet.</p>
          </div>
        )}

        {!isLoading && !isError && events && events.length > 0 && (
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            <ul className="space-y-6">
              {events.map((event) => {
                const styles = TYPE_STYLES[event.type];
                const showTime = event.type === 'appointment';
                return (
                  <li key={`${event.type}-${event.id}`} className="flex gap-4">
                    <div className="relative mt-1 flex-shrink-0">
                      <span
                        className={`block h-[15px] w-[15px] rounded-full ring-2 ring-background ${styles.dot}`}
                      />
                    </div>
                    <div className="flex flex-1 flex-wrap items-start justify-between gap-2 pb-2">
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                          >
                            {event.badge}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {event.label}
                          </span>
                        </div>
                        {event.sublabel && (
                          <p className="text-xs text-muted-foreground">{event.sublabel}</p>
                        )}
                      </div>
                      <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                        <p>{formatEventDate(event.date)}</p>
                        {showTime && (
                          <p>{formatEventTime(event.date)}</p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

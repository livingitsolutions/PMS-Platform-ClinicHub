import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Calendar, Stethoscope, FileText, ArrowRight, ClipboardList, Activity, PlusCircle } from 'lucide-react';
import type { Patient } from '../api/patientsApi';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { CreateVisitForPatientDialog } from '@/features/visits/components/CreateVisitForPatientDialog';

interface Visit {
  id: string;
  visit_date: string;
  status: string;
  chief_complaint: string | null;
  diagnosis: string | null;
  providers: { name: string } | null;
}

interface Invoice {
  id: string;
  total_amount: number;
  amount_paid: number;
  status: string;
}

interface VisitWithInvoice extends Visit {
  invoice: Invoice | null;
}

async function getPatientVisitsWithInvoices(
  patientId: string,
  clinicId: string
): Promise<VisitWithInvoice[]> {
  const { data: visits, error } = await supabase
    .from('visits')
    .select('id, visit_date, status, chief_complaint, diagnosis, providers(name)')
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .order('visit_date', { ascending: false })
    .limit(10);

  if (error) throw error;
  if (!visits || visits.length === 0) return [];

  const visitIds = visits.map((v) => v.id);
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, visit_id, total_amount, amount_paid, status')
    .in('visit_id', visitIds);

  const invoiceMap = new Map((invoices || []).map((inv: Invoice & { visit_id: string }) => [inv.visit_id, inv]));

  return visits.map((v) => ({
    ...(v as unknown as Visit),
    invoice: (invoiceMap.get(v.id) as Invoice) || null,
  }));
}

function getStatusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
    scheduled: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Scheduled' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-600', label: 'Cancelled' },
  };
  const s = map[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function getInvoiceBadge(status: string) {
  const map: Record<string, { bg: string; text: string }> = {
    paid: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    partial: { bg: 'bg-amber-100', text: 'text-amber-700' },
    unpaid: { bg: 'bg-red-100', text: 'text-red-600' },
    void: { bg: 'bg-gray-100', text: 'text-gray-500' },
  };
  const s = map[status] || { bg: 'bg-gray-100', text: 'text-gray-500' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

interface PatientDetailPanelProps {
  patient: Patient;
  clinicId: string;
  currencyCode: string;
}

export function PatientDetailPanel({ patient, clinicId, currencyCode }: PatientDetailPanelProps) {
  const navigate = useNavigate();
  const [newVisitOpen, setNewVisitOpen] = useState(false);

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['patient-visits-detail', patient.id, clinicId],
    queryFn: () => getPatientVisitsWithInvoices(patient.id, clinicId),
    enabled: !!patient.id && !!clinicId,
    staleTime: 60_000,
  });

  const completedVisits = visits.filter((v) => v.status === 'completed').length;
  const totalBilled = visits.reduce((sum, v) => sum + (v.invoice ? Number(v.invoice.total_amount) : 0), 0);
  const totalPaid = visits.reduce((sum, v) => sum + (v.invoice ? Number(v.invoice.amount_paid) : 0), 0);

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {patient.first_name} {patient.last_name}
            </h2>
            <p className="text-sm text-gray-500">Patient visit history and billing overview</p>
          </div>
          <Button size="sm" onClick={() => setNewVisitOpen(true)} className="shrink-0">
            <PlusCircle className="size-3.5 mr-1.5" />
            New Visit
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar className="size-4 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Visits</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Activity className="size-4 text-emerald-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{completedVisits}</p>
            <p className="text-xs text-gray-500 mt-0.5">Completed</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <ClipboardList className="size-4 text-amber-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBilled - totalPaid, currencyCode)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Outstanding</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Visit History</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 -mr-1"
            >
              View Full Profile
              <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>

          {isLoading && (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && visits.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <FileText className="size-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No visits recorded yet</p>
            </div>
          )}

          {!isLoading && visits.length > 0 && (
            <div className="divide-y divide-gray-50">
              {visits.map((visit) => {
                const date = new Date(visit.visit_date);
                return (
                  <div
                    key={visit.id}
                    onClick={() => navigate(`/visits/${visit.id}`)}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <div className="size-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Stethoscope className="size-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900">
                          {visit.chief_complaint || 'Visit'}
                        </p>
                        {getStatusBadge(visit.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {visit.providers?.name && (
                          <>
                            <span className="text-gray-300">·</span>
                            <p className="text-xs text-gray-400">{visit.providers.name}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {visit.invoice && getInvoiceBadge(visit.invoice.status)}
                      {visit.invoice && visit.invoice.total_amount > 0 && (
                        <span className="text-xs font-medium text-gray-700">
                          {formatCurrency(Number(visit.invoice.total_amount), currencyCode)}
                        </span>
                      )}
                      <ArrowRight className="size-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateVisitForPatientDialog
        patientId={patient.id}
        patientName={`${patient.first_name} ${patient.last_name}`}
        open={newVisitOpen}
        onOpenChange={setNewVisitOpen}
      />
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Stethoscope, FileText, CreditCard, Download } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVisit } from '../hooks/useVisit';
import { VisitProceduresTable } from '../components/VisitProceduresTable';
import { AddProcedureDialog } from '../components/AddProcedureDialog';
import { EditVisitNotesDialog } from '../components/EditVisitNotesDialog';
import { useInvoice, usePayments } from '@/features/invoices/hooks/useInvoice';
import { InvoiceSummary } from '@/features/invoices/components/InvoiceSummary';
import { PaymentDialog } from '@/features/invoices/components/PaymentDialog';
import { PaymentHistoryTable } from '@/features/invoices/components/PaymentHistoryTable';
import { useGeneratePDF } from '@/features/documents/hooks/useGeneratePDF';
import { VisitSummaryPDF } from '@/features/documents/components/VisitSummaryPDF';
import { InvoicePDF } from '@/features/documents/components/InvoicePDF';
import { getVisitProceduresForPDF } from '@/features/documents/api/documentDataApi';
import { useClinicStore } from '@/store/clinic-store';
import { DashboardLayout, PageHeader } from '@/components/layout/DashboardLayout';

export function VisitPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const { data: visit, isLoading, error } = useVisit(visitId || '');
  const { data: invoice, isLoading: invoiceLoading } = useInvoice(visitId);
  const { data: payments, isLoading: paymentsLoading } = usePayments(invoice?.id);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { generatePDF } = useGeneratePDF();
  const { clinicId, clinics } = useClinicStore();
  const selectedClinic = clinics.find(c => c.id === clinicId);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-muted-foreground">Loading visit...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !visit) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="text-lg text-destructive">Failed to load visit</div>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const visitDate = new Date(visit.visit_date);
  const patientName = `${visit.patients.first_name} ${visit.patients.last_name}`;
  const providerName = visit.providers.name;

  const handleDownloadVisitSummary = async () => {
    if (!visit || !invoice) return;

    setIsGeneratingPDF(true);
    try {
      const procedures = await getVisitProceduresForPDF(visit.id);

      const pdfDocument = (
        <VisitSummaryPDF
          data={{
            clinicName: selectedClinic?.name || 'Clinic',
            patientName,
            providerName,
            visitDate: visitDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            chiefComplaint: visit.chief_complaint || '',
            diagnosis: visit.diagnosis || '',
            notes: visit.notes || '',
            procedures,
            totalAmount: Number(invoice.total_amount),
          }}
        />
      );

      const filename = `visit-summary-${patientName.replace(/\s+/g, '-')}-${visitDate.toISOString().split('T')[0]}.pdf`;
      await generatePDF(pdfDocument, filename);
    } catch (error) {
      console.error('Failed to generate visit summary PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!visit || !invoice) return;

    setIsGeneratingPDF(true);
    try {
      const procedures = await getVisitProceduresForPDF(visit.id);

      const pdfDocument = (
        <InvoicePDF
          data={{
            invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
            clinicName: selectedClinic?.name || 'Clinic',
            patientName,
            visitDate: visitDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            procedures,
            totalAmount: Number(invoice.total_amount),
            amountPaid: Number(invoice.amount_paid),
            status: invoice.status,
          }}
        />
      );

      const filename = `invoice-${invoice.id.slice(0, 8)}-${patientName.replace(/\s+/g, '-')}.pdf`;
      await generatePDF(pdfDocument, filename);
    } catch (error) {
      console.error('Failed to generate invoice PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <DashboardLayout>
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="size-4 mr-2" />
        Back
      </Button>

      <PageHeader
        title="Visit Details"
        subtitle={visitDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        actions={
          <>
            <Button
              variant="outline"
              onClick={handleDownloadVisitSummary}
              disabled={isGeneratingPDF || !invoice}
            >
              <Download className="size-4 mr-2" />
              Download Visit Summary
            </Button>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                visit.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : visit.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-700'
                  : visit.status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {visit.status.replace('_', ' ').toUpperCase()}
            </div>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Patient
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{patientName}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Patient ID: {visit.patient_id.slice(0, 8)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="size-5" />
              Provider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{providerName}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Provider ID: {visit.provider_id.slice(0, 8)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Clinical Notes
            </CardTitle>
            <EditVisitNotesDialog visit={visit} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {visit.chief_complaint ? (
            <div>
              <div className="text-sm font-semibold mb-1">Chief Complaint</div>
              <p className="text-sm text-muted-foreground">{visit.chief_complaint}</p>
            </div>
          ) : null}

          {visit.diagnosis ? (
            <div>
              <div className="text-sm font-semibold mb-1">Diagnosis</div>
              <p className="text-sm text-muted-foreground">{visit.diagnosis}</p>
            </div>
          ) : null}

          {visit.notes ? (
            <div>
              <div className="text-sm font-semibold mb-1">Notes</div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{visit.notes}</p>
            </div>
          ) : null}

          {!visit.chief_complaint && !visit.diagnosis && !visit.notes && (
            <p className="text-sm text-muted-foreground">
              No clinical notes yet. Click "Edit Notes" to add them or use AI to generate structured notes.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Procedures</CardTitle>
              <CardDescription>
                Procedures performed during this visit
              </CardDescription>
            </div>
            <AddProcedureDialog visitId={visit.id} clinicId={visit.clinic_id} />
          </div>
        </CardHeader>
        <CardContent>
          <VisitProceduresTable visitId={visit.id} clinicId={visit.clinic_id} />
        </CardContent>
      </Card>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="size-5" />
          <h2 className="text-2xl font-bold">Billing</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <InvoiceSummary invoice={invoice} currencyCode={selectedClinic?.currency_code} />
            <div className="mt-4 space-y-2">
              <Button
                onClick={() => setPaymentDialogOpen(true)}
                disabled={
                  !invoice ||
                  invoice.status === 'paid' ||
                  invoice.status === 'void' ||
                  invoiceLoading
                }
                className="w-full"
              >
                Add Payment
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadInvoice}
                disabled={isGeneratingPDF || !invoice}
                className="w-full"
              >
                <Download className="size-4 mr-2" />
                Download Invoice
              </Button>
            </div>
          </div>

          <div>
            <PaymentHistoryTable
              payments={payments || []}
              isLoading={paymentsLoading}
              currencyCode={selectedClinic?.currency_code}
            />
          </div>
        </div>
      </div>

      {invoice && visitId && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          invoiceId={invoice.id}
          visitId={visitId}
          maxAmount={Number(invoice.total_amount) - Number(invoice.amount_paid)}
        />
      )}
    </DashboardLayout>
  );
}

import { supabase } from '@/lib/supabase';
import { logAuditEvent, AuditActions, EntityTypes } from '@/lib/audit';
import { createNotification } from '@/features/notifications/api/notificationsApi';

const INVOICE_SELECT = `
  id,
  clinic_id,
  visit_id,
  status,
  total_amount,
  amount_paid,
  created_at,
  updated_at
`;

const PAYMENT_SELECT = `
  id,
  clinic_id,
  invoice_id,
  amount,
  method,
  notes,
  created_at
`;

export interface Invoice {
  id: string;
  clinic_id: string;
  visit_id: string;
  status: 'unpaid' | 'partial' | 'paid' | 'void';
  total_amount: number;
  amount_paid: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  clinic_id: string;
  invoice_id: string;
  amount: number;
  method: 'cash' | 'card' | 'bank_transfer' | 'other';
  notes: string;
  created_at: string;
}

export interface CreatePaymentPayload {
  invoice_id: string;
  amount: number;
  method: 'cash' | 'card' | 'bank_transfer' | 'other';
  notes?: string;
}

export async function getInvoiceByVisit(visitId: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select(INVOICE_SELECT)
    .eq('visit_id', visitId)
    .maybeSingle();

  if (error) throw error;

  return data as Invoice | null;
}

export async function getOrCreateInvoice(visitId: string): Promise<Invoice> {
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .select('clinic_id')
    .eq('id', visitId)
    .single();

  if (visitError) throw visitError;
  if (!visit) throw new Error('Visit not found');

  const { data: procedures, error: proceduresError } = await supabase
    .from('visit_procedures')
    .select('quantity, price')
    .eq('visit_id', visitId);

  if (proceduresError) throw proceduresError;

  const totalAmount = procedures?.reduce(
    (sum, proc) => sum + proc.quantity * proc.price,
    0
  ) || 0;

  const { data: upsertedInvoice, error: upsertError } = await supabase
    .from('invoices')
    .upsert(
      {
        clinic_id: visit.clinic_id,
        visit_id: visitId,
        status: 'unpaid',
        total_amount: totalAmount,
        amount_paid: 0,
      },
      {
        onConflict: 'visit_id',
        ignoreDuplicates: false,
      }
    )
    .select(INVOICE_SELECT)
    .single();

  if (upsertError) throw upsertError;

  const invoice = upsertedInvoice as Invoice;

  const { data: existingInvoice } = await supabase
    .from('invoices')
    .select('created_at')
    .eq('id', invoice.id)
    .single();

  const isNewInvoice = existingInvoice &&
    new Date(existingInvoice.created_at).getTime() === new Date(invoice.created_at).getTime();

  if (isNewInvoice) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await logAuditEvent({
        clinicId: visit.clinic_id,
        userId: user.id,
        action: AuditActions.INVOICE_CREATED,
        entityType: EntityTypes.INVOICE,
        entityId: invoice.id,
        metadata: {
          visit_id: visitId,
          total_amount: totalAmount,
        },
      });
    }
  }

  return invoice;
}

export async function getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(PAYMENT_SELECT)
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data as Payment[]) || [];
}

export async function createPayment(payload: CreatePaymentPayload): Promise<Payment> {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('clinic_id, amount_paid, total_amount')
    .eq('id', payload.invoice_id)
    .single();

  if (invoiceError) throw invoiceError;
  if (!invoice) throw new Error('Invoice not found');

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      clinic_id: invoice.clinic_id,
      invoice_id: payload.invoice_id,
      amount: payload.amount,
      method: payload.method,
      notes: payload.notes || '',
    })
    .select(PAYMENT_SELECT)
    .single();

  if (paymentError) throw paymentError;

  const newAmountPaid = Number(invoice.amount_paid) + Number(payload.amount);
  const totalAmount = Number(invoice.total_amount);

  let newStatus: 'unpaid' | 'partial' | 'paid' | 'void';
  if (newAmountPaid >= totalAmount) {
    newStatus = 'paid';
  } else if (newAmountPaid > 0) {
    newStatus = 'partial';
  } else {
    newStatus = 'unpaid';
  }

  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      amount_paid: newAmountPaid,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.invoice_id);

  if (updateError) throw updateError;

  const createdPayment = payment as Payment;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await logAuditEvent({
      clinicId: invoice.clinic_id,
      userId: user.id,
      action: AuditActions.PAYMENT_ADDED,
      entityType: EntityTypes.PAYMENT,
      entityId: createdPayment.id,
      metadata: {
        invoice_id: payload.invoice_id,
        amount: payload.amount,
        method: payload.method,
        new_status: newStatus,
        new_amount_paid: newAmountPaid,
      },
    });
  }

  const { data: clinicUsers } = await supabase
    .from('user_clinics')
    .select('user_id')
    .eq('clinic_id', invoice.clinic_id);

  if (clinicUsers) {
    const formattedAmount = payload.amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    const message = `Payment of ${formattedAmount} received`;

    for (const clinicUser of clinicUsers) {
      try {
        await createNotification(
          invoice.clinic_id,
          clinicUser.user_id,
          'payment_received',
          message,
          { paymentId: createdPayment.id, invoiceId: payload.invoice_id }
        );
      } catch (err) {
        console.error('Failed to create notification:', err);
      }
    }
  }

  return createdPayment;
}

export async function recalculateInvoiceTotal(visitId: string): Promise<void> {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id')
    .eq('visit_id', visitId)
    .maybeSingle();

  if (invoiceError) throw invoiceError;
  if (!invoice) return;

  const { data: procedures, error: proceduresError } = await supabase
    .from('visit_procedures')
    .select('quantity, price')
    .eq('visit_id', visitId);

  if (proceduresError) throw proceduresError;

  const totalAmount = procedures?.reduce(
    (sum, proc) => sum + proc.quantity * proc.price,
    0
  ) || 0;

  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      total_amount: totalAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoice.id);

  if (updateError) throw updateError;
}

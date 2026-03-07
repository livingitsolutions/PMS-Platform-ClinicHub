import { useState } from 'react';
import { Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useSubscriptionInvoices } from '../hooks/useSubscriptionInvoices';
import type { SubscriptionInvoice } from '../api/subscriptionInvoicesApi';
import { payInvoice } from '../api/payInvoiceApi';

interface SubscriptionInvoicesTableProps {
  clinicId: string | null;
}

const PAYABLE_STATUSES = new Set(['open', 'past_due']);

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    open: 'bg-yellow-100 text-yellow-700',
    past_due: 'bg-red-100 text-red-700',
    unpaid: 'bg-red-100 text-red-700',
    void: 'bg-gray-100 text-gray-500',
    uncollectible: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-500',
  };

  const className = styles[status] ?? 'bg-gray-100 text-gray-500';
  const label = status === 'past_due' ? 'Past Due' : status;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${className}`}>
      {label}
    </span>
  );
}

function PayInvoiceButton({ invoice }: { invoice: SubscriptionInvoice }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const url = await payInvoice(invoice.stripe_invoice_id);
      window.location.href = url;
    } catch (err) {
      console.error('Failed to create payment session:', err);
      setLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      className="h-8 text-xs"
      onClick={handlePay}
      disabled={loading}
    >
      {loading ? 'Redirecting...' : 'Pay Invoice'}
    </Button>
  );
}

export function SubscriptionInvoicesTable({ clinicId }: SubscriptionInvoicesTableProps) {
  const { data: invoices, isLoading } = useSubscriptionInvoices(clinicId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading billing history...</p>;
  }

  if (!invoices || invoices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No billing history available yet. Invoices will appear here after your first subscription payment.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Invoice</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="text-sm">
              {formatDate(invoice.created_at)}
            </TableCell>
            <TableCell className="text-sm">
              Subscription
            </TableCell>
            <TableCell className="text-sm font-medium">
              {formatCurrency(invoice.amount_due, invoice.currency)}
            </TableCell>
            <TableCell>
              <StatusBadge status={invoice.status} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {PAYABLE_STATUSES.has(invoice.status) && (
                  <PayInvoiceButton invoice={invoice} />
                )}
                {invoice.invoice_pdf_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    asChild
                  >
                    <a href={invoice.invoice_pdf_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  </Button>
                )}
                {!PAYABLE_STATUSES.has(invoice.status) && !invoice.invoice_pdf_url && (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

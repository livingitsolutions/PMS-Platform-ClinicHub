import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import type { Invoice } from '../api/invoicesApi';

interface InvoiceSummaryProps {
  invoice: Invoice | null | undefined;
  currencyCode?: string;
}

export function InvoiceSummary({ invoice, currencyCode = 'PHP' }: InvoiceSummaryProps) {
  if (!invoice) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No invoice found</p>
        </CardContent>
      </Card>
    );
  }

  const balance = Number(invoice.total_amount) - Number(invoice.amount_paid);
  const statusColors = {
    unpaid: 'text-red-600',
    partial: 'text-yellow-600',
    paid: 'text-green-600',
    void: 'text-gray-600',
  };

  const statusLabels = {
    unpaid: 'Unpaid',
    partial: 'Partially Paid',
    paid: 'Paid',
    void: 'Void',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Invoice Summary</span>
          <span className={`text-sm font-semibold ${statusColors[invoice.status]}`}>
            {statusLabels[invoice.status]}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-sm font-medium text-gray-600">Total</span>
            <span className="text-lg font-semibold">
              {formatCurrency(Number(invoice.total_amount), currencyCode)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-sm font-medium text-gray-600">Paid</span>
            <span className="text-lg font-semibold text-green-600">
              {formatCurrency(Number(invoice.amount_paid), currencyCode)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-medium text-gray-600">Balance</span>
            <span className={`text-xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(balance, currencyCode)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

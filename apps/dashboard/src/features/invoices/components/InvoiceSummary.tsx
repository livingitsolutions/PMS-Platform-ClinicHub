import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Invoice } from '../api/invoicesApi';

interface InvoiceSummaryProps {
  invoice: Invoice | null | undefined;
}

export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
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
              ${Number(invoice.total_amount).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-sm font-medium text-gray-600">Paid</span>
            <span className="text-lg font-semibold text-green-600">
              ${Number(invoice.amount_paid).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-medium text-gray-600">Balance</span>
            <span className={`text-xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

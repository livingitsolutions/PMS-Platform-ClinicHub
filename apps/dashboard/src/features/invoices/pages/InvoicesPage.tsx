import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useClinicStore } from '@/store/clinic-store';
import { usePermissions } from '@/hooks/usePermissions';
import { Pagination } from '@/components/ui/pagination';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { QueryErrorAlert } from '@/components/system/ErrorAlert';

interface InvoiceWithDetails {
  id: string;
  visit_id: string;
  status: 'unpaid' | 'partial' | 'paid' | 'void';
  total_amount: number;
  amount_paid: number;
  created_at: string;
  visits: {
    visit_date: string;
    patients: {
      first_name: string;
      last_name: string;
    };
  } | null;
}

async function getInvoices(
  clinicId: string,
  page: number,
  pageSize: number
): Promise<{ data: InvoiceWithDetails[]; totalCount: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId);

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      id,
      visit_id,
      status,
      total_amount,
      amount_paid,
      created_at,
      visits!inner (
        visit_date,
        patients!inner (
          first_name,
          last_name
        )
      )
    `)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data as unknown as InvoiceWithDetails[],
    totalCount: count || 0,
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'partial':
      return 'bg-yellow-100 text-yellow-800';
    case 'unpaid':
      return 'bg-red-100 text-red-800';
    case 'void':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function InvoicesPage() {
  const clinicId = useClinicStore((state) => state.clinicId);
  const { canEditBilling } = usePermissions();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['invoices', clinicId, currentPage],
    queryFn: () => getInvoices(clinicId!, currentPage, pageSize),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 2,
  });

  const invoices = data?.data || [];
  const totalCount = data?.totalCount || 0;

  if (!clinicId) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Please select a clinic to view invoices</p>
      </div>
    );
  }

  if (!canEditBilling) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">You do not have permission to view invoices</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {error && (
        <div className="mb-6">
          <QueryErrorAlert error={error} onRetry={() => refetch()} />
        </div>
      )}

      {!error && (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            View and manage invoices for your clinic
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading invoices...</p>
            </div>
          ) : !invoices || invoices.length === 0 ? (
            <p className="text-muted-foreground">No invoices found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      {invoice.visits?.patients.first_name}{' '}
                      {invoice.visits?.patients.last_name}
                    </TableCell>
                    <TableCell>
                      {invoice.visits ? formatDate(invoice.visits.visit_date) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(invoice.total_amount)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(invoice.amount_paid)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && invoices.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}

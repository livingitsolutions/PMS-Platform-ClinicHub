import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useClinicStore } from '@/store/clinic-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { QueryErrorAlert } from '@/components/system/ErrorAlert';
import { ExportCSVButton } from '@/components/system/ExportCSVButton';
import { CreateWalkInVisitDialog } from '../components/CreateWalkInVisitDialog';

interface VisitListItem {
  id: string;
  visit_date: string;
  status: string;
  patients: {
  first_name: string;
  last_name: string;
  } | null;
  
  providers: {
    name: string;
  } | null;
  invoices: {
    status: string;
  }[] | null;
}

export function VisitsListPage() {
  const clinicId = useClinicStore((state) => state.clinicId);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['visits', clinicId, currentPage],
    queryFn: async () => {
      if (!clinicId) throw new Error('No clinic selected');

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { count } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId);

      const { data, error } = await supabase
        .from('visits')
        .select(`
          id,
          visit_date,
          status,
          patients (
            first_name,
            last_name
          ),
          providers (
            name
          ),
          invoices (
            status
          )
        `)
        .eq('clinic_id', clinicId)
        .order('visit_date', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data: data as unknown as VisitListItem[],
        totalCount: count || 0,
      };
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false
  });

  const visits = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const exportData = visits.map((v) => ({
    visit_id: v.id,
    patient_name: v.patients ? `${v.patients.first_name} ${v.patients.last_name}` : '',
    provider_name: v.providers?.name ?? '',
    visit_date: v.visit_date,
    status: v.status,
    diagnosis: '',
  }));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50';
      case 'in_progress':
        return 'text-blue-700 bg-blue-50';
      case 'scheduled':
        return 'text-gray-700 bg-gray-50';
      case 'cancelled':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const getInvoiceStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-700 bg-green-50';
      case 'partial':
        return 'text-orange-700 bg-orange-50';
      case 'unpaid':
        return 'text-red-700 bg-red-50';
      case 'void':
        return 'text-gray-700 bg-gray-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleRowClick = (visitId: string) => {
    navigate(`/visits/${visitId}`);
  };

  if (!clinicId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please select a clinic first</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {error && (
        <div className="mb-6">
          <QueryErrorAlert error={error} onRetry={() => refetch()} />
        </div>
      )}

      {!error && (
        <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Visits</h1>
        <p className="text-muted-foreground mt-1">
          View and manage patient visits
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Visits</CardTitle>
              <CardDescription>
                Click on any visit to view details
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <CreateWalkInVisitDialog onCreated={() => refetch()} />
              <ExportCSVButton label="Export Visits" filename="visits" data={exportData} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading visits...</p>
            </div>
          ) : visits && visits.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No visits found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits?.map((visit) => (
                  <TableRow
                    key={visit.id}
                    onClick={() => handleRowClick(visit.id)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {formatDate(visit.visit_date)}
                    </TableCell>
                    <TableCell>
                      {formatTime(visit.visit_date)}
                    </TableCell>
                    <TableCell>
                      {visit.patients
  ? `${visit.patients.first_name} ${visit.patients.last_name}`
  : 'Unknown'}
                    </TableCell>
                    <TableCell>
                     {visit.providers
  ? visit.providers.name
  : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          visit.status
                        )}`}
                      >
                        {formatStatus(visit.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {visit.invoices && visit.invoices.length > 0 ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInvoiceStatusBadgeClass(
                            visit.invoices[0].status
                          )}`}
                        >
                          {formatStatus(visit.invoices[0].status)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No invoice
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && visits.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
}

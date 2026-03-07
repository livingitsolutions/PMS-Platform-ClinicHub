import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useClinicStore } from '@/store/clinic-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CreateProcedureDialog } from '../components/CreateProcedureDialog';
import { QueryErrorAlert } from '@/components/system/ErrorAlert';

interface Procedure {
  id: string;
  name: string;
  description: string | null;
  base_cost: number;
}

export function ProceduresPage() {
  const clinicId = useClinicStore((state) => state.clinicId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const { canManageProcedures } = usePermissions();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['procedures', clinicId, currentPage],
    queryFn: async () => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { count } = await supabase
        .from('procedures')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId);

      const { data, error } = await supabase
        .from('procedures')
        .select('id, name, description, base_cost')
        .eq('clinic_id', clinicId)
        .order('name', { ascending: true })
        .range(from, to);

      if (error) {
        throw error;
      }

      return {
        data: data as Procedure[],
        totalCount: count || 0,
      };
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 2,
  });

  const procedures = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Procedures</h1>
          <p className="text-muted-foreground mt-1">
            Manage clinic procedures and pricing
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          disabled={!canManageProcedures}
        >
          Create Procedure
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Procedures</CardTitle>
          <CardDescription>
            View and manage available procedures for this clinic
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading procedures...</p>
            </div>
          ) : procedures && procedures.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                No procedures found. Create your first procedure to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Base Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedures?.map((procedure) => (
                  <TableRow key={procedure.id}>
                    <TableCell className="font-medium">
                      {procedure.name}
                    </TableCell>
                    <TableCell className="max-w-md">
                      {procedure.description || (
                        <span className="text-muted-foreground italic">
                          No description
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(procedure.base_cost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && procedures.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      <CreateProcedureDialog
        clinicId={clinicId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      </>
      )}
    </div>
  );
}

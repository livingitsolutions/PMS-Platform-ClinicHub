import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClinicStore } from '@/store/clinic-store';
import { getProviders } from '../api/providersApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { CreateProviderDialog } from '../components/CreateProviderDialog';
import { QueryErrorAlert } from '@/components/system/ErrorAlert';

export function ProvidersPage() {
  const { clinicId } = useClinicStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const { canManageProviders } = usePermissions();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['providers', clinicId, currentPage],
    queryFn: () => getProviders(clinicId!, currentPage, pageSize),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 2,
  });

  const providers = data?.data || [];
  const totalCount = data?.totalCount || 0;

  if (!clinicId) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Please select a clinic</p>
      </div>
    );
  }

  if (!canManageProviders) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">You do not have permission to manage providers</p>
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
      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Providers</CardTitle>
            <Button onClick={() => setDialogOpen(true)}>
              Create Provider
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading providers...</p>
            ) : providers.length === 0 ? (
              <p className="text-muted-foreground">No providers found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>{provider.name}</TableCell>
                      <TableCell>{provider.specialization}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!isLoading && providers.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            )}
          </CardContent>
        </Card>

        <CreateProviderDialog
          clinicId={clinicId!}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </>
      )}
    </div>
  );
}

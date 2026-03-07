import { useQuery } from '@tanstack/react-query';
import { useClinicStore } from '@/store/clinic-store';
import { PatientsTable } from '@/features/patients/components/PatientsTable';
import { CreatePatientDialog } from '@/features/patients/components/CreatePatientDialog';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { getPatients } from '../api/patientsApi';
import { QueryErrorAlert } from '@/components/system/ErrorAlert';

export function PatientsPage() {
  const clinicId = useClinicStore((state) => state.clinicId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const permissions = usePermissions();
  const pageSize = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['patients', clinicId, currentPage],
    queryFn: async () => {
      if (!clinicId) {
        throw new Error('No clinic selected');
      }

      return getPatients(clinicId, currentPage, pageSize);
    },
    enabled: !!clinicId,
  });

  const patients = data?.data || [];
  const totalCount = data?.totalCount || 0;

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your clinic's patient records
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={permissions.role === 'staff'}
        >
          Add Patient
        </Button>
      </div>

      <PatientsTable patients={patients} isLoading={isLoading} clinicId={clinicId} />

      {!isLoading && patients.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}

      <CreatePatientDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          setCurrentPage(1);
          refetch();
          setIsCreateDialogOpen(false);
        }}
      />
      </>
      )}
    </div>
  );
}

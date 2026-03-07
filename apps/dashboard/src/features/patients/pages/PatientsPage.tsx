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
import { ExportCSVButton } from '@/components/system/ExportCSVButton';
import { DashboardLayout, PageHeader } from '@/components/layout/DashboardLayout';

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

  const exportData = patients.map((p) => ({
    first_name: p.first_name,
    last_name: p.last_name,
    email: p.email,
    phone: p.phone,
    date_of_birth: p.date_of_birth,
    gender: p.gender,
    created_at: p.created_at,
  }));

  if (!clinicId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Please select a clinic first</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {error && (
        <div className="mb-6">
          <QueryErrorAlert error={error} onRetry={() => refetch()} />
        </div>
      )}

      {!error && (
        <>
          <PageHeader
            title="Patients"
            subtitle="Manage your clinic's patient records"
            actions={
              <>
                <ExportCSVButton label="Export Patients" filename="patients" data={exportData} />
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  disabled={permissions.role === 'staff'}
                >
                  Add Patient
                </Button>
              </>
            }
          />

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
    </DashboardLayout>
  );
}

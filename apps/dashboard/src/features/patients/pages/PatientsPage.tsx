import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useClinicStore } from '@/store/clinic-store';
import { getPatients, type Patient } from '../api/patientsApi';
import { CreatePatientDialog } from '@/features/patients/components/CreatePatientDialog';
import { PatientListPanel } from '@/features/patients/components/PatientListPanel';
import { PatientDetailPanel } from '@/features/patients/components/PatientDetailPanel';
import { PatientInfoPanel } from '@/features/patients/components/PatientInfoPanel';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users } from 'lucide-react';

export function PatientsPage() {
  const clinicId = useClinicStore((state) => state.clinicId);
  const { clinics } = useClinicStore();
  const currentClinic = clinics.find((c) => c.id === clinicId);
  const currencyCode = currentClinic?.currency_code ?? 'PHP';

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['patients', clinicId, 1],
    queryFn: async () => {
      if (!clinicId) throw new Error('No clinic selected');
      return getPatients(clinicId, 1, 100);
    },
    enabled: !!clinicId,
  });

  const patients = data?.data || [];

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
      <div className="flex h-[calc(100vh-56px-48px)] -m-6 overflow-hidden rounded-none">
        <div className="w-[280px] shrink-0 flex flex-col border-r border-gray-100">
          <PatientListPanel
            patients={patients}
            isLoading={isLoading}
            selectedPatientId={selectedPatient?.id}
            onSelectPatient={setSelectedPatient}
            onAddPatient={() => setIsCreateDialogOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="flex-1 min-w-0">
          {selectedPatient ? (
            <PatientDetailPanel
              patient={selectedPatient}
              clinicId={clinicId}
              currencyCode={currencyCode}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50">
              <div className="size-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-4">
                <Users className="size-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">Select a patient to view details</p>
              <p className="text-xs text-gray-400 mt-1">Click on any patient from the list on the left</p>
            </div>
          )}
        </div>

        {selectedPatient && (
          <div className="w-[280px] shrink-0 border-l border-gray-100">
            <PatientInfoPanel
              patient={selectedPatient}
              clinicId={clinicId}
              onPatientUpdated={() => {
                refetch();
                queryClient.invalidateQueries({ queryKey: ['patients', clinicId] });
              }}
            />
          </div>
        )}
      </div>

      <CreatePatientDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setIsCreateDialogOpen(false);
        }}
      />
    </DashboardLayout>
  );
}

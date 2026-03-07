import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Patient } from '../api/patientsApi';
import { deletePatient } from '../api/patientsApi';
import { usePermissions } from '@/hooks/usePermissions';
import { EditPatientDialog } from './EditPatientDialog';
import { CreditCard as Edit } from 'lucide-react';

interface PatientsTableProps {
  patients: Patient[];
  isLoading: boolean;
  clinicId: string;
}

export function PatientsTable({ patients, isLoading, clinicId }: PatientsTableProps) {
  const { canDeletePatients } = usePermissions();
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (patientId: string) => deletePatient(patientId, clinicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', clinicId] });
    },
  });

  const handleDelete = (patient: Patient) => {
    if (confirm(`Are you sure you want to delete ${patient.first_name} ${patient.last_name}?`)) {
      deleteMutation.mutate(patient.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading patients...</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No patients found. Add your first patient to get started.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">
                  {patient.first_name} {patient.last_name}
                </TableCell>
                <TableCell>{formatDate(patient.date_of_birth)}</TableCell>
                <TableCell className="capitalize">{patient.gender}</TableCell>
                <TableCell>{patient.phone || '-'}</TableCell>
                <TableCell>{patient.email || '-'}</TableCell>
                <TableCell>{formatDate(patient.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPatient(patient)}
                    >
                      <Edit className="size-4 mr-1" />
                      Edit
                    </Button>
                    {canDeletePatients && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(patient)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingPatient && (
        <EditPatientDialog
          patient={editingPatient}
          open={!!editingPatient}
          onOpenChange={(open) => !open && setEditingPatient(null)}
          clinicId={clinicId}
        />
      )}
    </>
  );
}

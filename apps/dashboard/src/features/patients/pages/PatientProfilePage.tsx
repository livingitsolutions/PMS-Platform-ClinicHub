import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useClinicStore } from '@/store/clinic-store';
import { Patient } from '../api/patientsApi';
import { PatientTimeline } from '../components/PatientTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DashboardLayout, PageHeader } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CirclePlus as PlusCircle } from 'lucide-react';
import { CreateVisitForPatientDialog } from '@/features/visits/components/CreateVisitForPatientDialog';

interface Visit {
  id: string;
  visit_date: string;
  status: string;
  providers: {
    name: string;
  } | null;
}

async function getPatient(patientId: string, clinicId: string): Promise<Patient> {
  const { data, error } = await supabase
    .from('patients')
    .select(`
      id,
      clinic_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      created_at,
      updated_at
    `)
    .eq('id', patientId)
    .eq('clinic_id', clinicId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Patient not found');

  return data as Patient;
}

async function getPatientVisits(patientId: string, clinicId: string): Promise<Visit[]> {
  const { data, error } = await supabase
    .from('visits')
    .select(`
      id,
      visit_date,
      status,
      providers (
        name
      )
    `)
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .order('visit_date', { ascending: false })
    .limit(50);

  if (error) throw error;

  return data as unknown as Visit[];
}

export function PatientProfilePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { clinicId } = useClinicStore();
  const [newVisitOpen, setNewVisitOpen] = useState(false);

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', patientId, clinicId],
    queryFn: () => getPatient(patientId!, clinicId!),
    enabled: !!patientId && !!clinicId,
    staleTime: 1000 * 60 * 2,
  });

  const { data: visits, isLoading: isLoadingVisits } = useQuery({
    queryKey: ['patient-visits', patientId, clinicId],
    queryFn: () => getPatientVisits(patientId!, clinicId!),
    enabled: !!patientId && !!clinicId,
    staleTime: 1000 * 60 * 2,
  });

  if (!patientId || !clinicId) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Invalid patient ID</p>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Loading patient...</p>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Patient not found</p>
      </DashboardLayout>
    );
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <DashboardLayout>
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="size-4 mr-2" />
        Back
      </Button>

      <PageHeader
        title={`${patient.first_name} ${patient.last_name}`}
        actions={
          <Button onClick={() => setNewVisitOpen(true)}>
            <PlusCircle className="size-4 mr-2" />
            New Visit
          </Button>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">First Name</p>
                <p className="text-base">{patient.first_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                <p className="text-base">{patient.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-base">{patient.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{patient.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p className="text-base">{patient.date_of_birth}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="text-base">{patient.gender}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-base">{patient.address || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visit History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingVisits ? (
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
                    <TableHead>Visit Date</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits?.map((visit) => (
                    <TableRow
                      key={visit.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/visits/${visit.id}`)}
                    >
                      <TableCell>
                        {formatDate(visit.visit_date)}
                      </TableCell>
                      <TableCell>
                        {visit.providers?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="capitalize">
                        {visit.status.replace('_', ' ')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <PatientTimeline patientId={patientId} clinicId={clinicId} />
      </div>

      <CreateVisitForPatientDialog
        patientId={patientId}
        patientName={`${patient.first_name} ${patient.last_name}`}
        open={newVisitOpen}
        onOpenChange={setNewVisitOpen}
      />
    </DashboardLayout>
  );
}

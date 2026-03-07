import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Patient } from '../api/patientsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Visit {
  id: string;
  visit_date: string;
  status: string;
  providers: {
    name: string;
  } | null;
}

async function getPatient(patientId: string): Promise<Patient> {
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
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Patient not found');

  return data as Patient;
}

async function getPatientVisits(patientId: string): Promise<Visit[]> {
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
    .order('visit_date', { ascending: false })
    .limit(50);

  if (error) throw error;

  return data as unknown as Visit[];
}

export function PatientProfilePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatient(patientId!),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 2,
  });

  const { data: visits, isLoading: isLoadingVisits } = useQuery({
    queryKey: ['patient-visits', patientId],
    queryFn: () => getPatientVisits(patientId!),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 2,
  });

  if (!patientId) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Invalid patient ID</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading patient...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
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
    <div className="p-8 space-y-6">
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
                  <TableRow key={visit.id}
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
    </div>
  );
}

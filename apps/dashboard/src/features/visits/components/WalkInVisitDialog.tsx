import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClinicStore } from '@/store/clinic-store';
import { supabase } from '@/lib/supabase';
import { createWalkInVisit } from '../api/walkInVisitApi';

interface WalkInVisitDialogProps {
  onCreated?: () => void;
}

export function WalkInVisitDialog({ onCreated }: WalkInVisitDialogProps) {
  const [open, setOpen] = useState(false);
  const clinicId = useClinicStore((s) => s.clinicId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const now = new Date();
  const localDatetime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [patientId, setPatientId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [visitDate, setVisitDate] = useState(localDatetime);

  const { data: patients } = useQuery({
    queryKey: ['patients-list', clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .eq('clinic_id', clinicId!)
        .order('last_name', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId && open,
  });

  const { data: providers } = useQuery({
    queryKey: ['providers-list', clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('id, name')
        .eq('clinic_id', clinicId!)
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId && open,
  });

  const mutation = useMutation({
    mutationFn: createWalkInVisit,
    onSuccess: (visit) => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      onCreated?.();
      setOpen(false);
      navigate(`/visits/${visit.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId || !patientId || !providerId) return;
    mutation.mutate({
      clinic_id: clinicId,
      patient_id: patientId,
      provider_id: providerId,
      chief_complaint: chiefComplaint,
      visit_date: new Date(visitDate).toISOString(),
    });
  };

  const resetForm = () => {
    setPatientId('');
    setProviderId('');
    setChiefComplaint('');
    const now = new Date();
    setVisitDate(
      new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4 mr-2" />
          New Walk-in Visit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Walk-in Visit</DialogTitle>
          <DialogDescription>
            Create a visit without a prior appointment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="patient">Patient</Label>
            <Select value={patientId} onValueChange={setPatientId} required>
              <SelectTrigger id="patient">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.last_name}, {p.first_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="provider">Provider</Label>
            <Select value={providerId} onValueChange={setProviderId} required>
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providers?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="chief-complaint">Chief Complaint</Label>
            <Input
              id="chief-complaint"
              placeholder="Reason for visit"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="visit-date">Visit Date & Time</Label>
            <Input
              id="visit-date"
              type="datetime-local"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              required
            />
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive">
              Failed to create visit. Please try again.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || !patientId || !providerId}
            >
              {mutation.isPending ? 'Creating...' : 'Create Visit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

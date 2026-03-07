import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useClinicStore } from '@/store/clinic-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePermissions } from '@/hooks/usePermissions';

interface Clinic {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
}

async function getClinic(clinicId: string): Promise<Clinic> {
  const { data, error } = await supabase
    .from('clinics')
    .select('id, name, address, phone, email')
    .eq('id', clinicId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Clinic not found');

  return data;
}

export function SettingsPage() {
  const clinicId = useClinicStore((state) => state.clinicId);
  const { canManageSettings } = usePermissions();

  const { data: clinic, isLoading } = useQuery({
    queryKey: ['clinic', clinicId],
    queryFn: () => getClinic(clinicId!),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
  });

  if (!clinicId) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">
          Please select a clinic to view settings
        </p>
      </div>
    );
  }

  if (!canManageSettings) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">
          You do not have permission to access clinic settings
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading clinic information...</p>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Clinic not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Clinic Settings</CardTitle>
          <CardDescription>
            View and manage your clinic information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Clinic Name</Label>
              <Input
                id="name"
                value={clinic.name}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={clinic.address || ''}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={clinic.phone || ''}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={clinic.email || ''}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

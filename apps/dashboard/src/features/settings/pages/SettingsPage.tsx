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
import { useSubscription } from '@/features/billing/hooks/useSubscription';
import { BillingPortalButton } from '@/features/billing/components/BillingPortalButton';
import { DashboardLayout, PageHeader } from '@/components/layout/DashboardLayout';

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

function formatPlanLabel(plan: string | null): string {
  if (!plan) return 'None';
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

function formatStatusLabel(status: string | null): string {
  if (!status) return 'Inactive';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function SettingsPage() {
  const clinicId = useClinicStore((state) => state.clinicId);
  const { canManageSettings } = usePermissions();
  const { plan, status, current_period_end, isLoading: subscriptionLoading } = useSubscription();

  const { data: clinic, isLoading } = useQuery({
    queryKey: ['clinic', clinicId],
    queryFn: () => getClinic(clinicId!),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 5,
  });

  if (!clinicId) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">
          Please select a clinic to view settings
        </p>
      </DashboardLayout>
    );
  }

  if (!canManageSettings) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">
          You do not have permission to access clinic settings
        </p>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Loading clinic information...</p>
      </DashboardLayout>
    );
  }

  if (!clinic) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Clinic not found</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Clinic Settings"
        subtitle="View and manage your clinic information"
      />

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            Manage your subscription and billing details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptionLoading ? (
            <p className="text-muted-foreground text-sm">Loading subscription...</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Plan</p>
                  <p className="text-sm font-medium">{formatPlanLabel(plan)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Status</p>
                  <p className="text-sm font-medium">{formatStatusLabel(status)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Next Billing Date</p>
                  <p className="text-sm font-medium">{formatDate(current_period_end)}</p>
                </div>
              </div>
              <div className="pt-2">
                <BillingPortalButton />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

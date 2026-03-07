import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useClinicStore } from '@/store/clinic-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AvailabilityEditor } from '../components/AvailabilityEditor';
import { Label } from '@/components/ui/label';

interface Provider {
  id: string;
  name: string;
  specialization: string | null;
}

async function getProviders(clinicId: string) {
  const { data, error } = await supabase
    .from('providers')
    .select('id, name, specialization')
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch providers: ${error.message}`);
  }

  return data as Provider[];
}

export function ProviderSchedulePage() {
  const { clinicId } = useClinicStore();
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');

  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['providers', clinicId],
    queryFn: () => getProviders(clinicId!),
    enabled: !!clinicId,
  });

  if (!clinicId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Please select a clinic first.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Provider Schedule</h1>
        <p className="text-gray-600">
          Manage provider availability and working hours
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Provider</Label>
            {providersLoading ? (
              <p className="text-sm text-gray-500">Loading providers...</p>
            ) : providers && providers.length > 0 ? (
              <Select
                value={selectedProviderId}
                onValueChange={setSelectedProviderId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                      {provider.specialization &&
                        ` - ${provider.specialization}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-500">
                No providers found. Please add providers first.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedProviderId && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <AvailabilityEditor providerId={selectedProviderId} />
          </CardContent>
        </Card>
      )}

      {!selectedProviderId && providers && providers.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              Select a provider to manage their schedule
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

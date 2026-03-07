import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Provider } from '../api/appointments';

interface ProviderSelectorProps {
  providers: Provider[];
  selectedProviderId: string | null;
  onProviderSelect: (providerId: string) => void;
}

export function ProviderSelector({
  providers,
  selectedProviderId,
  onProviderSelect,
}: ProviderSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Provider</label>
      <Select value={selectedProviderId || ''} onValueChange={onProviderSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a provider" />
        </SelectTrigger>
        <SelectContent>
          {providers.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              {provider.name}
              {provider.specialization && (
                <span className="text-gray-500 ml-2">
                  ({provider.specialization})
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

import { useClinicStore } from '@/store/clinic-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ClinicSelector() {
  const { clinics, clinicId, setClinicId } = useClinicStore();

  if (clinics.length === 0) {
    return null;
  }

  return (
    <Select value={clinicId || undefined} onValueChange={setClinicId}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select clinic" />
      </SelectTrigger>
      <SelectContent>
        {clinics.map((clinic) => (
          <SelectItem key={clinic.id} value={clinic.id}>
            {clinic.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

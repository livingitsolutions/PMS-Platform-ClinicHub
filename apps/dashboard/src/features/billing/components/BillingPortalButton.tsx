import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useClinicStore } from '@/store/clinic-store';
import { openBillingPortal } from '../api/billingPortalApi';

export function BillingPortalButton() {
  const clinicId = useClinicStore((s) => s.clinicId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!clinicId) return;
    setIsLoading(true);
    setError(null);
    try {
      const portalUrl = await openBillingPortal(clinicId);
      window.location.href = portalUrl;
    } catch {
      setError('Failed to open billing portal. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button onClick={handleClick} disabled={isLoading || !clinicId}>
        {isLoading ? 'Redirecting...' : 'Manage Billing'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

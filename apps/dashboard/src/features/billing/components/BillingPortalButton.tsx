import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useClinicStore } from '@/store/clinic-store';
import { openBillingPortal } from '../api/billingPortalApi';

export function BillingPortalButton() {
  const clinicId = useClinicStore((s) => s.clinicId);
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (!clinicId) return;
    setIsLoading(true);
    try {
      const portalUrl = await openBillingPortal(clinicId);
      window.location.href = portalUrl;
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={isLoading || !clinicId}>
      {isLoading ? 'Redirecting...' : 'Manage Billing'}
    </Button>
  );
}

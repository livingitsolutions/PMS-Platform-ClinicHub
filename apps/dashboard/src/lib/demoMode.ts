import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';

const DEMO_EMAIL = 'demo@clinichub.app';

// export function isDemoMode(): boolean {
//   if (import.meta.env.VITE_DEMO_MODE === 'true') return true;
//   const user = useAuthStore.getState().user;
//   return user?.email === DEMO_EMAIL;
// }

export function isDemoMode(): boolean {
  const user = useAuthStore.getState().user;

  if (!user?.email) return false;

  return user.email.toLowerCase() === DEMO_EMAIL.toLowerCase();
}

export class DemoModeError extends Error {
  constructor() {
    super('Demo Mode: Changes are disabled.');
    this.name = 'DemoModeError';
  }
}

export function assertNotDemoMode(): void {
  if (isDemoMode()) {
    toast.warning('Demo Mode: Changes are disabled.');
    throw new DemoModeError();
  }
}

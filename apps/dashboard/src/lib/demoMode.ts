import { toast } from 'sonner';

export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true';
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

import { useClinicStore, type UserRole } from '@/store/clinic-store';

export interface Permissions {
  role: UserRole | null;
  canManageStaff: boolean;
  canEditBilling: boolean;
  canDeletePatients: boolean;
  canManageProviders: boolean;
  canManageProcedures: boolean;
  canManageSettings: boolean;
}

export function usePermissions(): Permissions {
  const currentRole = useClinicStore((s) => s.currentRole);

  if (!currentRole) {
    return {
      role: null,
      canManageStaff: false,
      canEditBilling: false,
      canDeletePatients: false,
      canManageProviders: false,
      canManageProcedures: false,
      canManageSettings: false,
    };
  }

  if (currentRole === 'owner') {
    return {
      role: currentRole,
      canManageStaff: true,
      canEditBilling: true,
      canDeletePatients: true,
      canManageProviders: true,
      canManageProcedures: true,
      canManageSettings: true,
    };
  }

  if (currentRole === 'admin') {
    return {
      role: currentRole,
      canManageStaff: false,
      canEditBilling: true,
      canDeletePatients: true,
      canManageProviders: true,
      canManageProcedures: true,
      canManageSettings: false,
    };
  }

  return {
    role: currentRole,
    canManageStaff: false,
    canEditBilling: false,
    canDeletePatients: false,
    canManageProviders: false,
    canManageProcedures: false,
    canManageSettings: false,
  };
}

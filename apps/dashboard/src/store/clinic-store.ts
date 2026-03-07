import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Clinic {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'owner' | 'admin' | 'staff';

export interface ClinicMembership {
  clinic: Clinic;
  role: UserRole;
}

interface ClinicStore {
  clinicId: string | null;
  clinics: Clinic[];
  clinicMemberships: ClinicMembership[];
  currentRole: UserRole | null;
  setClinicId: (clinicId: string | null) => void;
  setClinics: (clinics: Clinic[]) => void;
  setClinicMemberships: (memberships: ClinicMembership[]) => void;
}

export const useClinicStore = create<ClinicStore>()(
  persist(
    (set, get) => ({
      clinicId: null,
      clinics: [],
      clinicMemberships: [],
      currentRole: null,
      setClinicId: (clinicId) => {
        const membership = get().clinicMemberships.find(m => m.clinic.id === clinicId);
        set({ clinicId, currentRole: membership?.role || null });
      },
      setClinics: (clinics) => set({ clinics }),
      setClinicMemberships: (memberships) => {
        const clinics = memberships.map(m => m.clinic);
        const currentClinicId = get().clinicId;
        const currentMembership = memberships.find(m => m.clinic.id === currentClinicId);
        set({
          clinicMemberships: memberships,
          clinics,
          currentRole: currentMembership?.role || null
        });
      },
    }),
    {
      name: 'clinic-storage',
    }
  )
);

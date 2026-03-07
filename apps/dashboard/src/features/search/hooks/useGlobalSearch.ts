import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useClinicStore } from '@/store/clinic-store';
import { useState, useEffect } from 'react';

export interface PatientResult {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
}

export interface VisitResult {
  id: string;
  visit_date: string;
  status: string;
  patients: {
    first_name: string;
    last_name: string;
  } | null;
}

export interface AppointmentResult {
  id: string;
  start_time: string;
  status: string;
  patients: {
    first_name: string;
    last_name: string;
  } | null;
}

export interface ProviderResult {
  id: string;
  name: string;
  specialization: string | null;
}

export interface SearchResults {
  patients: PatientResult[];
  visits: VisitResult[];
  appointments: AppointmentResult[];
  providers: ProviderResult[];
}

export function useGlobalSearch(searchQuery: string) {
  const clinicId = useClinicStore((state) => state.clinicId);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['global-search', clinicId, debouncedQuery],
    queryFn: async () => {
      if (!clinicId || !debouncedQuery || debouncedQuery.trim().length < 2) {
        return {
          patients: [],
          visits: [],
          appointments: [],
          providers: [],
        };
      }

      const searchTerm = `%${debouncedQuery.trim()}%`;

      const [patientsResult, visitsResult, appointmentsResult, providersResult] =
        await Promise.all([
          supabase
            .from('patients')
            .select('id, first_name, last_name, phone, email')
            .eq('clinic_id', clinicId)
            .or(
              `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`
            )
            .limit(5),

          supabase
            .from('visits')
            .select(
              `
              id,
              visit_date,
              status,
              patients!inner (
                first_name,
                last_name
              )
            `
            )
            .eq('clinic_id', clinicId)
            .or(
              `patients.first_name.ilike.${searchTerm},patients.last_name.ilike.${searchTerm}`,
              { foreignTable: 'patients' }
            )
            .order('visit_date', { ascending: false })
            .limit(5),

          supabase
            .from('appointments')
            .select(
              `
              id,
              start_time,
              status,
              patients!inner (
                first_name,
                last_name
              )
            `
            )
            .eq('clinic_id', clinicId)
            .or(
              `patients.first_name.ilike.${searchTerm},patients.last_name.ilike.${searchTerm}`,
              { foreignTable: 'patients' }
            )
            .order('start_time', { ascending: false })
            .limit(5),

          supabase
            .from('providers')
            .select('id, name, specialization')
            .eq('clinic_id', clinicId)
            .or(`name.ilike.${searchTerm},specialization.ilike.${searchTerm}`)
            .limit(5),
        ]);

      if (patientsResult.error) throw patientsResult.error;
      if (visitsResult.error) throw visitsResult.error;
      if (appointmentsResult.error) throw appointmentsResult.error;
      if (providersResult.error) throw providersResult.error;

      return {
        patients: (patientsResult.data || []) as PatientResult[],
        visits: (visitsResult.data || []) as unknown as VisitResult[],
        appointments: (appointmentsResult.data || []) as unknown as AppointmentResult[],
        providers: (providersResult.data || []) as ProviderResult[],
      };
    },
    enabled: !!clinicId && debouncedQuery.trim().length >= 2,
  });

  return {
    results: data || {
      patients: [],
      visits: [],
      appointments: [],
      providers: [],
    },
    isLoading,
    error,
  };
}

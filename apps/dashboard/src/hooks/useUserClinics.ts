import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import { useClinicStore, type Clinic, type UserRole, type ClinicMembership } from '@/store/clinic-store'

interface ClinicUserRow {
  clinics: Clinic;
  role: UserRole;
}

export function useUserClinics() {
  const user = useAuthStore((s) => s.user)

  const clinics = useClinicStore((s) => s.clinics)
  const setClinicMemberships = useClinicStore((s) => s.setClinicMemberships)
  const setClinicId = useClinicStore((s) => s.setClinicId)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-clinics', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('user_clinics')
        .select('clinics(*), role')
        .eq('user_id', user.id)

      if (error) throw error

      return (data || []) as unknown as ClinicUserRow[]
    },
  })

  useEffect(() => {
    if (!data) return

    const memberships: ClinicMembership[] = data.map((row) => ({
      clinic: row.clinics,
      role: row.role
    }))

    setClinicMemberships(memberships)

    const currentClinicId = useClinicStore.getState().clinicId
    if (!currentClinicId || !memberships.find((m) => m.clinic.id === currentClinicId)) {
      if (memberships.length > 0) {
        setClinicId(memberships[0].clinic.id)
      }
    }
  }, [data, setClinicMemberships, setClinicId])

  return {
    clinics,
    isLoading,
    error,
    refetch,
  }
}
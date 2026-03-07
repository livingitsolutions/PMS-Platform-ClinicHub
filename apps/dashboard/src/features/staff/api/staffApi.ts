import { supabase } from '@/lib/supabase';
import { UserRole } from '@/store/clinic-store';

export interface StaffMember {
  id: string;
  user_id: string;
  clinic_id: string;
  role: UserRole;
  created_at: string;
  email: string;
}

export interface InviteStaffPayload {
  email: string;
  role: UserRole;
}

export async function getStaffMembers(clinicId: string): Promise<StaffMember[]> {
  const { data, error } = await supabase
    .from('user_clinics')
    .select('id, user_id, clinic_id, role, created_at')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const rows = data || [];

  const userIds = rows.map((r) => r.user_id);

  if (userIds.length === 0) return [];

  const { data: usersData, error: usersError } = await supabase
    .from('auth_users_view')
    .select('id, email')
    .in('id', userIds);

  if (usersError) {
    const { data: profilesData, error: profilesError } = await supabase
      .rpc('get_users_by_ids', { user_ids: userIds });

    if (profilesError) {
      return rows.map((r) => ({
        ...r,
        email: r.user_id,
      }));
    }

    const emailMap = new Map<string, string>(
      (profilesData || []).map((u: { id: string; email: string }) => [u.id, u.email])
    );

    return rows.map((r) => ({
      ...r,
      email: emailMap.get(r.user_id) || r.user_id,
    }));
  }

  const emailMap = new Map<string, string>(
    (usersData || []).map((u: { id: string; email: string }) => [u.id, u.email])
  );

  return rows.map((r) => ({
    ...r,
    email: emailMap.get(r.user_id) || r.user_id,
  }));
}

export async function inviteStaffMember(
  clinicId: string,
  payload: InviteStaffPayload
): Promise<void> {
  const { data: authData, error: authError } = await supabase
    .rpc('get_user_id_by_email', { email_input: payload.email });

  if (authError) throw new Error('Could not look up user. Make sure the email is registered.');

  const userId: string | null = authData;
  if (!userId) throw new Error('No user found with that email address.');

  const { data: existing } = await supabase
    .from('user_clinics')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) throw new Error('This user is already a member of this clinic.');

  const { error } = await supabase.from('user_clinics').insert({
    clinic_id: clinicId,
    user_id: userId,
    role: payload.role,
  });

  if (error) throw error;
}

export async function updateStaffRole(
  membershipId: string,
  role: UserRole
): Promise<void> {
  const { error } = await supabase
    .from('user_clinics')
    .update({ role })
    .eq('id', membershipId);

  if (error) throw error;
}

export async function removeStaffMember(membershipId: string): Promise<void> {
  const { error } = await supabase
    .from('user_clinics')
    .delete()
    .eq('id', membershipId);

  if (error) throw error;
}

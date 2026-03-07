import { supabase } from '@/lib/supabase';
import { assertNotDemoMode } from '@/lib/demoMode';

export interface Backup {
  id: string;
  clinic_id: string | null;
  backup_time: string;
  backup_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  storage_url: string | null;
  backup_size: number;
  backup_type: 'full' | 'incremental' | 'differential';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackupWithClinic extends Backup {
  clinics?: {
    id: string;
    name: string;
  } | null;
}

export async function getAllBackups(): Promise<BackupWithClinic[]> {
  const { data, error } = await supabase
    .from('backups')
    .select(`
      *,
      clinics (
        id,
        name
      )
    `)
    .order('backup_time', { ascending: false });

  if (error) throw error;

  return (data as BackupWithClinic[]) || [];
}

export async function getClinicBackups(clinicId: string): Promise<Backup[]> {
  const { data, error } = await supabase
    .from('backups')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('backup_time', { ascending: false });

  if (error) throw error;

  return (data as Backup[]) || [];
}

export async function getLatestBackupByClinic(clinicId: string): Promise<Backup | null> {
  const { data, error } = await supabase
    .from('backups')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('backup_status', 'completed')
    .order('backup_time', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data as Backup | null;
}

export async function getBackupStats(clinicId: string): Promise<{
  totalBackups: number;
  completedBackups: number;
  failedBackups: number;
  totalSize: number;
}> {
  const { data: allBackups, error: allError } = await supabase
    .from('backups')
    .select('backup_status, backup_size')
    .eq('clinic_id', clinicId);

  if (allError) throw allError;

  const totalBackups = allBackups?.length || 0;
  const completedBackups = allBackups?.filter(b => b.backup_status === 'completed').length || 0;
  const failedBackups = allBackups?.filter(b => b.backup_status === 'failed').length || 0;
  const totalSize = allBackups?.reduce((sum, b) => sum + (b.backup_size || 0), 0) || 0;

  return {
    totalBackups,
    completedBackups,
    failedBackups,
    totalSize,
  };
}

export async function deleteBackup(backupId: string): Promise<void> {
  assertNotDemoMode();
  const { error } = await supabase
    .from('backups')
    .delete()
    .eq('id', backupId);

  if (error) throw error;
}

export interface CreateBackupPayload {
  clinic_id?: string | null;
  backup_type?: 'full' | 'incremental' | 'differential';
}

export async function createBackup(payload: CreateBackupPayload): Promise<Backup> {
  assertNotDemoMode();
  const { data, error } = await supabase
    .from('backups')
    .insert({
      clinic_id: payload.clinic_id || null,
      backup_type: payload.backup_type || 'full',
      backup_status: 'pending',
      backup_time: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  const backup = data as Backup;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token || supabaseAnonKey;

  fetch(`${supabaseUrl}/functions/v1/perform-backup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Apikey: supabaseAnonKey,
    },
    body: JSON.stringify({ backup_id: backup.id, clinic_id: backup.clinic_id }),
  }).catch((err) => console.error('Backup edge function error:', err));

  return backup;
}

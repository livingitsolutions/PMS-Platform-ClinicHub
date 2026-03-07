import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  clinic_id: string;
  user_id: string;
  type: string;
  message: string;
  read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data || [];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;

  return count || 0;
}

export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
}

export async function createNotification(
  clinicId: string,
  userId: string,
  type: string,
  message: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .insert({
      clinic_id: clinicId,
      user_id: userId,
      type,
      message,
      metadata,
    });

  if (error) throw error;
}

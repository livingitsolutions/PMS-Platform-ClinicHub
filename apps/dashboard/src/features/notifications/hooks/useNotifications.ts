import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../api/notificationsApi';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export function useNotifications() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    enabled: !!user?.id,
    queryFn: () => {
      if (!user?.id) return [];
      return getUserNotifications(user.id);
    },
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count', user?.id],
    enabled: !!user?.id,
    queryFn: () => {
      if (!user?.id) return 0;
      return getUnreadCount(user.id);
    },
  });

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', user?.id] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error('No user ID');
      return markAllAsRead(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', user?.id] });
    },
  });

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
  };
}

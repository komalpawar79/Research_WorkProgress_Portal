import { fetchApi } from './apiClient';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mockNotifications } from './mockData';
import { Notification } from '../types/database.types';

// In-memory or local storage cache for mock notifications
let localNotifs = [...mockNotifications];

export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const data = await fetchApi<any[]>('/api/user/notifications');
      if (Array.isArray(data) && data.length > 0) {
        return data.map((n) => ({
          id: n.id,
          user_id: n.user_id,
          project_id: n.project_id,
          title: n.title,
          message: n.message,
          type: n.type || 'general_update',
          read: Boolean(n.is_read || n.read),
          created_at: n.created_at,
        })) as Notification[];
      }
    } catch (e) {
      // Backend request fallback
    }

    if (!isSupabaseConfigured || !supabase) {
      return localNotifs;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return localNotifs;
      }
      return data as Notification[];
    } catch {
      return localNotifs;
    }
  },

  async markAsRead(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      localNotifs = localNotifs.map((n) => (n.id === id ? { ...n, read: true } : n));
      return;
    }

    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    } catch (err) {
      console.warn('Error updating notification', err);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      localNotifs = localNotifs.map((n) => ({ ...n, read: true }));
      return;
    }

    try {
      await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
    } catch (err) {
      console.warn('Error marking all notifications read', err);
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    const all = await this.getNotifications(userId);
    return all.filter((n) => !n.read).length;
  }
};


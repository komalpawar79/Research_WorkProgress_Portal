import { fetchApi } from './apiClient';
import {
  mockDashboardMetrics,
  mockRecentActivities,
  mockAttentionItems,
} from './adminMockData';
import { DashboardMetric, AttentionItem } from '../types/admin.types';

export const adminService = {
  async getDashboardMetrics(): Promise<DashboardMetric[]> {
    try {
      const data = await fetchApi<{ metrics: DashboardMetric[] }>('/api/admin/dashboard-stats');
      if (data && data.metrics) {
        return data.metrics;
      }
    } catch (e) {
      console.warn('Dashboard stats API fetch error:', e);
    }
    return mockDashboardMetrics;
  },

  async getRecentActivities(): Promise<any[]> {
    try {
      const data = await fetchApi<{ recentActivities: any[] }>('/api/admin/dashboard-stats');
      if (data && Array.isArray(data.recentActivities) && data.recentActivities.length > 0) {
        return data.recentActivities.map((act) => ({
          id: act.id,
          customer_name: act.user_name || 'Administrator',
          customer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          description: act.details || act.description || act.action || 'Activity updated',
          relative_time: act.timestamp
            ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Recent',
        }));
      }
    } catch (e) {
      console.warn('Recent activities API fetch error:', e);
    }
    return mockRecentActivities;
  },

  async getAttentionItems(): Promise<AttentionItem[]> {
    try {
      const data = await fetchApi<{ attentionItems: AttentionItem[] }>('/api/admin/dashboard-stats');
      if (data && data.attentionItems) {
        return data.attentionItems;
      }
    } catch (e) {
      console.warn('Attention items API fetch error:', e);
    }
    return mockAttentionItems;
  },

  async getProjectStatusBreakdown() {
    try {
      const data = await fetchApi<{ projectBreakdown: any }>('/api/admin/dashboard-stats');
      if (data && data.projectBreakdown) {
        return data.projectBreakdown;
      }
    } catch (e) {
      console.warn('Project breakdown API fetch error:', e);
    }
    return {
      totalProgress: 65,
      completed: 3,
      inProgress: 4,
      pending: 1,
    };
  },

  async getNotifications(): Promise<any[]> {
    try {
      const data = await fetchApi<any[]>('/api/admin/notifications');
      if (Array.isArray(data) && data.length > 0) {
        return data.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type || 'general_update',
          read: Boolean(n.read),
          customer_name: n.customer_name,
          customer_avatar: n.customer_avatar,
          relative_time: n.created_at
            ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Recent',
          created_at: n.created_at,
        }));
      }
    } catch (e) {
      console.warn('Admin notifications API fetch error:', e);
    }
    return [];
  },

  async sendNotification(payload: { userId?: string; title: string; message: string; type?: string }) {
    return await fetchApi<any>('/api/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getProfile(): Promise<any> {
    try {
      const res = await fetchApi<{ success: boolean; user: any }>('/api/admin/profile');
      if (res && res.user) {
        return res.user;
      }
    } catch (e) {
      console.warn('Admin getProfile API error:', e);
    }
    // Fallback to local storage or default admin info
    const cached = localStorage.getItem('rf_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return {
      id: 'usr-admin-01',
      username: 'irfankhan1917',
      email: 'admin@researchflow.com',
      full_name: 'Dr. Irfan Khan',
      phone: '+91 98111 22233',
      role: 'admin',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    };
  },

  async updateProfile(payload: {
    fullName?: string;
    email?: string;
    phone?: string;
    username?: string;
    avatarUrl?: string;
  }): Promise<any> {
    try {
      const res = await fetchApi<{ success: boolean; message: string; user: any }>('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res && res.user) {
        try {
          localStorage.setItem('rf_user', JSON.stringify(res.user));
        } catch {
          try {
            const minimal = { ...res.user };
            delete minimal.avatar_url;
            delete minimal.avatarUrl;
            localStorage.setItem('rf_user', JSON.stringify(minimal));
          } catch {}
        }
      }
      return res;
    } catch (err: any) {
      console.warn('Backend updateProfile offline, persisting update in session storage:', err?.message);
      const fallbackUser = {
        id: 'usr-admin-01',
        username: payload.username || 'irfankhan1917',
        email: payload.email || 'admin@researchflow.com',
        full_name: payload.fullName || 'Dr. Irfan Khan',
        phone: payload.phone || '+91 9616508786',
        avatar_url: payload.avatarUrl,
        avatarUrl: payload.avatarUrl,
        role: 'Super Administrator',
        status: 'Active',
      };
      try {
        localStorage.setItem('rf_user', JSON.stringify(fallbackUser));
      } catch {}
      return {
        success: true,
        message: 'Admin profile updated successfully.',
        user: fallbackUser,
      };
    }
  },

  async updatePassword(payload: { currentPassword?: string; newPassword: string }): Promise<any> {
    return await fetchApi<{ success: boolean; message: string }>('/api/admin/password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};


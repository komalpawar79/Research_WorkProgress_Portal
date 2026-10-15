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
};

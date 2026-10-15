import { fetchApi } from './apiClient';
import { mockActivityLogs } from './adminMockData';
import { ActivityLog } from '../types/admin.types';

let localActivityLogs = [...mockActivityLogs];

export const activityLogService = {
  async getActivityLogs(filters?: { action?: string; user?: string }): Promise<ActivityLog[]> {
    try {
      const data = await fetchApi<any[]>('/api/activity');
      if (Array.isArray(data) && data.length > 0) {
        let list: ActivityLog[] = data.map((a) => ({
          id: a.id,
          action: a.action,
          user_name: a.user_name || a.actor_name || 'Admin',
          user_role: a.user_role || 'Admin',
          target_name: a.target_name || 'Research Project',
          target_type: (a.target_type as any) || 'Project',
          timestamp: a.timestamp
            ? new Date(a.timestamp).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Recent',
          details: a.details || a.description || '',
        }));

        if (filters?.action && filters.action !== 'All Actions') {
          list = list.filter((l) => l.action.toLowerCase().includes(filters.action!.toLowerCase()));
        }
        if (filters?.user && filters.user !== 'All Users') {
          list = list.filter((l) => l.user_name === filters.user);
        }
        return list;
      }
    } catch (e) {
      console.warn('Live activity logs API error:', e);
    }

    let list = [...localActivityLogs];
    if (filters?.action && filters.action !== 'All Actions') {
      list = list.filter((l) => l.action.toLowerCase().includes(filters.action!.toLowerCase()));
    }
    if (filters?.user && filters.user !== 'All Users') {
      list = list.filter((l) => l.user_name === filters.user);
    }
    return list;
  },

  async logActivity(data: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
    try {
      await fetchApi('/api/activity', {
        method: 'POST',
        body: JSON.stringify({
          action: data.action,
          actorName: data.user_name,
          details: data.details,
        }),
      });
    } catch (e) {
      console.warn('API logActivity failed:', e);
    }

    const newEntry: ActivityLog = {
      ...data,
      id: `act-log-${Date.now()}`,
      timestamp: 'Just now',
    };
    localActivityLogs.unshift(newEntry);
    return newEntry;
  },
};

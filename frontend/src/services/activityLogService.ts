import { mockActivityLogs } from './adminMockData';
import { ActivityLog } from '../types/admin.types';

let localActivityLogs = [...mockActivityLogs];

export const activityLogService = {
  async getActivityLogs(filters?: { action?: string; user?: string }): Promise<ActivityLog[]> {
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
    const newEntry: ActivityLog = {
      ...data,
      id: `act-log-${Date.now()}`,
      timestamp: 'Just now',
    };
    localActivityLogs.unshift(newEntry);
    return newEntry;
  },
};


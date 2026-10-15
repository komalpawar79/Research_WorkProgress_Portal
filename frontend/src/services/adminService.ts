import {
  mockDashboardMetrics,
  mockRecentActivities,
  mockAttentionItems,
} from './adminMockData';
import { DashboardMetric, AttentionItem } from '../types/admin.types';

export const adminService = {
  async getDashboardMetrics(): Promise<DashboardMetric[]> {
    return mockDashboardMetrics;
  },

  async getRecentActivities() {
    return mockRecentActivities;
  },

  async getAttentionItems(): Promise<AttentionItem[]> {
    return mockAttentionItems;
  },

  async getProjectStatusBreakdown() {
    return {
      totalProgress: 78,
      completed: 71,
      inProgress: 42,
      pending: 15,
    };
  },
};


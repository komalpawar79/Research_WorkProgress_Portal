import { mockEmailLogs } from './adminMockData';
import { EmailLog } from '../types/admin.types';

let localEmailLogs = [...mockEmailLogs];

export const emailLogService = {
  async getEmailLogs(): Promise<EmailLog[]> {
    return localEmailLogs;
  },

  async triggerEmail(data: Omit<EmailLog, 'id' | 'sent_at'>): Promise<EmailLog> {
    const newLog: EmailLog = {
      ...data,
      id: `em-${Date.now()}`,
      sent_at: 'Just now',
    };
    localEmailLogs.unshift(newLog);
    return newLog;
  },
};


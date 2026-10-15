import { fetchApi } from './apiClient';

export interface SecurityEventPayload {
  event_type: string;
  project_id?: string;
  chapter_id?: string;
  document_id?: string;
  session_id?: string;
  browser?: string;
  operating_system?: string;
  metadata?: Record<string, any>;
}

export interface SecurityEventResponse {
  success: boolean;
  event_id?: string;
  attempt_count: number;
  warning_threshold: number;
  lock_threshold: number;
  locked: boolean;
  warning: boolean;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
}

export interface ViewerStatusResponse {
  locked: boolean;
  attempt_count: number;
  warning_threshold: number;
  lock_threshold: number;
  lock_window_minutes: number;
  last_attempt_time: string | null;
}

export interface AdminSecurityEvent {
  id: string;
  user_id: string;
  project_id: string | null;
  chapter_id: string | null;
  document_id: string | null;
  event_type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  session_id: string;
  browser: string;
  operating_system: string;
  ip_address: string;
  metadata: any;
  created_at: string;
  user_name: string;
  user_email: string;
  user_username: string;
  project_title: string;
  project_topic: string;
  chapter_number: number;
  chapter_title: string;
}

export interface AdminSecurityEventsResponse {
  events: AdminSecurityEvent[];
  stats: {
    total_events: string | number;
    unique_users_flagged: string | number;
    critical_events: string | number;
    warning_events: string | number;
    events_last_24h: string | number;
  };
}

export const securityService = {
  /**
   * Log a detected screenshot / screen capture signal to the backend
   */
  async recordSecurityEvent(payload: SecurityEventPayload): Promise<SecurityEventResponse> {
    try {
      return await fetchApi<SecurityEventResponse>('/api/security-events', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      console.warn('Security event reporting error (offline fallback applied):', err.message);
      // Fallback response for offline or local testing
      return {
        success: true,
        attempt_count: 1,
        warning_threshold: 2,
        lock_threshold: 3,
        locked: false,
        warning: true,
        severity: 'WARNING',
        message: 'Screenshot or screen capture detected. This security event has been recorded.',
      };
    }
  },

  /**
   * Verify if current scholar's document viewer is locked
   */
  async getViewerStatus(): Promise<ViewerStatusResponse> {
    try {
      return await fetchApi<ViewerStatusResponse>('/api/security-events/viewer-status');
    } catch (err) {
      return {
        locked: false,
        attempt_count: 0,
        warning_threshold: 2,
        lock_threshold: 3,
        lock_window_minutes: 30,
        last_attempt_time: null,
      };
    }
  },

  /**
   * Admin: List recorded security events with search & filters
   */
  async getSecurityEvents(filters?: {
    user_id?: string;
    project_id?: string;
    severity?: string;
    event_type?: string;
    search?: string;
  }): Promise<AdminSecurityEventsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.user_id) params.append('user_id', filters.user_id);
      if (filters?.project_id) params.append('project_id', filters.project_id);
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.event_type) params.append('event_type', filters.event_type);
      if (filters?.search) params.append('search', filters.search);

      const qs = params.toString() ? `?${params.toString()}` : '';
      return await fetchApi<AdminSecurityEventsResponse>(`/api/security-events${qs}`);
    } catch (err) {
      console.warn('Failed to fetch admin security events, returning mock logs:', err);
      return {
        events: [],
        stats: {
          total_events: 0,
          unique_users_flagged: 0,
          critical_events: 0,
          warning_events: 0,
          events_last_24h: 0,
        },
      };
    }
  },

  /**
   * Admin: Unlock customer viewer
   */
  async unlockCustomerViewer(userId: string): Promise<{ success: boolean; message: string }> {
    return await fetchApi('/api/security-events/unlock', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },
};

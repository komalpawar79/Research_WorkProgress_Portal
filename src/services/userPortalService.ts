import { fetchApi } from './apiClient';
import { mockProject, mockChapters } from './mockData';

export interface UserDashboardData {
  user: {
    id: string;
    name: string;
    firstName: string;
    email: string;
    username: string;
    university: string;
    greeting: string;
  };
  project: {
    id: string;
    title: string;
    topic: string;
    research_type: string;
    domain: string;
    supervisor: string;
    status: string;
    overall_progress: number;
    start_date: string;
    expected_completion_date: string;
    description: string;
    total_fee: number;
    paid_amount: number;
    remaining_amount: number;
  };
  chapters: Array<{
    id: string;
    chapter_number: number;
    title: string;
    status: string;
    progress: number;
    word_count: number;
    document_released: boolean;
    latest_update?: string;
    description?: string;
  }>;
  latest_update: {
    message?: string;
    chapter_number?: number;
    chapter_title?: string;
    progress?: number;
    created_at?: string;
  } | string;
  documents: any[];
  payments: any[];
  notifications: any[];
}

export const userPortalService = {
  async getDashboardData(): Promise<UserDashboardData | null> {
    try {
      const data = await fetchApi<UserDashboardData>('/api/user/dashboard');
      if (data && data.project) {
        return data;
      }
    } catch (err) {
      console.warn('Failed to fetch user dashboard from backend API:', err);
    }

    // Fallback if offline
    return {
      user: {
        id: 'usr-rahul-01',
        name: 'Rahul Sharma',
        firstName: 'Rahul',
        email: 'rahul.sharma@gmail.com',
        username: 'rahul.sharma',
        university: 'IIT Delhi',
        greeting: 'Good Morning, Rahul',
      },
      project: {
        id: mockProject.id,
        title: mockProject.topic,
        topic: mockProject.topic,
        research_type: mockProject.research_type,
        domain: 'Computer Science & AI',
        supervisor: 'Dr. Arvind Mehra',
        status: mockProject.status,
        overall_progress: mockProject.overall_progress,
        start_date: mockProject.started_at,
        expected_completion_date: mockProject.expected_completion,
        description: mockProject.description || '',
        total_fee: 50000,
        paid_amount: 35000,
        remaining_amount: 15000,
      },
      chapters: mockChapters.map((c) => ({
        id: c.id,
        chapter_number: c.chapter_number,
        title: c.title,
        status: c.status,
        progress: c.progress_percent,
        word_count: 5000,
        document_released: c.document_released,
        latest_update: 'Chapter update on track',
      })),
      latest_update: {
        message: 'Literature Review chapter has been completed.',
        chapter_number: 2,
        chapter_title: 'Literature Review',
        progress: 100,
      },
      documents: [],
      payments: [],
      notifications: [],
    };
  },
};

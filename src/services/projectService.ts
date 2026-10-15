import { fetchApi } from './apiClient';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mockProject, mockTimelineSteps } from './mockData';
import { ResearchProject, TimelineStep } from '../types/database.types';

export const projectService = {
  async getProjectByUserId(userId: string): Promise<ResearchProject | null> {
    // 1. First attempt backend PostgreSQL API
    try {
      const res = await fetchApi<any>('/api/user/project');
      if (res && res.project) {
        return {
          id: res.project.id,
          user_id: userId,
          topic: res.project.topic || res.project.title || 'Research Project',
          research_type: res.project.research_type || 'Thesis',
          started_at: res.project.start_date || new Date().toISOString(),
          expected_completion: res.project.expected_completion_date || '2026-12-31',
          overall_progress: Number(res.project.overall_progress || 0),
          status: res.project.status || 'In Progress',
          description: res.project.description || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as ResearchProject;
      }
    } catch {
      // Backend request may fail if not scholar auth
    }

    // 2. Supabase fallback
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('research_projects')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          return data as ResearchProject;
        }
      } catch (err) {
        console.warn('Error fetching project from Supabase, using fallback', err);
      }
    }

    return mockProject;
  },

  async getTimelineSteps(_projectId: string): Promise<TimelineStep[]> {
    return mockTimelineSteps;
  },
};

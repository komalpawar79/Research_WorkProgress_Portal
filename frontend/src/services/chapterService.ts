import { fetchApi } from './apiClient';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mockChapters } from './mockData';
import { Chapter } from '../types/database.types';

export const chapterService = {
  async getChaptersByProjectId(projectId: string): Promise<Chapter[]> {
    // 1. Query PostgreSQL Backend API first
    try {
      const data = await fetchApi<any>(`/api/chapters/project/${projectId}`);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          project_id: c.project_id || projectId,
          chapter_number: c.chapter_number,
          title: c.title,
          status: c.status,
          progress_percent: Number(c.progress || c.progress_percent || 0),
          document_released: Boolean(c.document_released),
          updated_date: c.updated_at
            ? new Date(c.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Recent',
          created_at: c.created_at || new Date().toISOString(),
          updated_at: c.updated_at || new Date().toISOString(),
        }));
      }
    } catch {
      // Fallback: check /api/user/chapters if logged in as scholar
      try {
        const uRes = await fetchApi<any>('/api/user/chapters');
        if (uRes && Array.isArray(uRes.chapters) && uRes.chapters.length > 0) {
          return uRes.chapters.map((c: any) => ({
            id: c.id,
            project_id: c.project_id || projectId,
            chapter_number: c.chapter_number,
            title: c.title,
            status: c.status,
            progress_percent: Number(c.progress || 0),
            document_released: Boolean(c.document_released),
            updated_date: 'Recent',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
        }
      } catch (e) {
        console.warn('Backend chapters fetch failed:', e);
      }
    }

    // 2. Supabase fallback if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('*')
          .eq('project_id', projectId)
          .order('chapter_number', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as Chapter[];
        }
      } catch (err) {
        console.warn('Error fetching chapters from Supabase:', err);
      }
    }

    return mockChapters;
  },

  async getLatestCompletedChapter(projectId: string): Promise<Chapter | null> {
    const chapters = await this.getChaptersByProjectId(projectId);
    const completed = chapters
      .filter((c) => (c.status === 'Completed' || (c.status as string) === 'Released') && c.document_released)
      .sort((a, b) => b.chapter_number - a.chapter_number);
    return completed.length > 0 ? completed[0] : null;
  },

  // Helper evaluating chapter release eligibility
  canAccessDocument(chapter: Chapter): { allowed: boolean; reason?: string } {
    if ((chapter.status === 'Completed' || (chapter.status as string) === 'Released') && chapter.document_released) {
      return { allowed: true };
    }
    if (chapter.status === 'In Progress') {
      return { allowed: false, reason: 'Document will be available once this chapter is completed.' };
    }
    return { allowed: false, reason: 'This chapter has not been released yet.' };
  },
};

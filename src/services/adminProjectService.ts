import { fetchApi } from './apiClient';
import { mockAdminProjects, mockAdminChapters } from './adminMockData';
import { AdminProject, AdminChapterProgress } from '../types/admin.types';

let localProjects = [...mockAdminProjects];
let localChapters = [...mockAdminChapters];

export interface SaveProgressPayload {
  chapterId: string;
  progress: number;
  status?: string;
  message?: string;
  documentReleased?: boolean;
  fileName?: string;
  fileUrl?: string;
  version?: string;
  pageCount?: number;
}

export interface AddChapterPayload {
  projectId: string;
  title: string;
  chapterNumber?: number;
  description?: string;
  wordCount?: number;
}

export interface EditChapterPayload {
  title?: string;
  chapterNumber?: number;
  description?: string;
  status?: string;
  progress?: number;
  wordCount?: number;
  documentReleased?: boolean;
}

export const adminProjectService = {
  async getProjects(): Promise<AdminProject[]> {
    try {
      const data = await fetchApi<any[]>('/api/projects');
      if (Array.isArray(data) && data.length > 0) {
        return data.map((p) => ({
          id: p.id,
          customer_id: p.customer_id || p.user_id,
          customer_name: p.customer_name || 'Scholar',
          customer_email: p.customer_email || '',
          customer_avatar: p.customer_avatar,
          topic: p.topic || p.title,
          research_type: p.research_type || 'Thesis',
          status: p.status || 'In Progress',
          overall_progress: Number(p.overall_progress || p.progress_pct || 0),
          started_at: p.start_date || (p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : 'Recent'),
          expected_completion: p.expected_completion_date || '2026-12-15',
          chapter_count: Number(p.chapter_count || 5),
          description: p.description,
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch projects from API:', e);
    }
    return localProjects;
  },

  async getProjectById(id: string): Promise<AdminProject | null> {
    try {
      const p = await fetchApi<any>(`/api/projects/${id}`);
      if (p && p.id) {
        return {
          id: p.id,
          customer_id: p.customer_id || p.user_id,
          customer_name: p.customer_name || 'Scholar',
          customer_email: p.customer_email || '',
          customer_avatar: p.customer_avatar,
          topic: p.topic || p.title,
          research_type: p.research_type || 'Thesis',
          status: p.status || 'In Progress',
          overall_progress: Number(p.overall_progress || p.progress_pct || 0),
          started_at: p.start_date || (p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : 'Recent'),
          expected_completion: p.expected_completion_date || '2026-12-15',
          chapter_count: Number(p.chapter_count || p.chapters?.length || 5),
          description: p.description,
        };
      }
    } catch (e) {
      console.warn('Failed to fetch project by ID from API:', e);
    }
    return localProjects.find((p) => p.id === id) || localProjects[0] || null;
  },

  /**
   * Fetch chapters for a specific customer from PostgreSQL
   */
  async getChaptersByCustomerId(customerId: string): Promise<{
    project: any;
    chapters: (AdminChapterProgress & { file_name?: string; doc_id?: string; doc_version?: string })[];
  }> {
    try {
      const data = await fetchApi<any>(`/api/admin/users/${customerId}`);
      if (data && data.chapters) {
        const mappedChapters = data.chapters.map((ch: any) => ({
          id: ch.id,
          project_id: ch.project_id,
          customer_id: customerId,
          customer_name: data.user?.full_name || 'Scholar',
          chapter_number: ch.chapter_number,
          title: ch.title,
          status: ch.status,
          progress_percent: Number(ch.progress || 0),
          document_released: Boolean(ch.document_released),
          document_version: ch.doc_version || ch.version || 'v1.0',
          file_name: ch.file_name,
          doc_id: ch.doc_id,
          doc_version: ch.doc_version,
          updated_date: ch.updated_at
            ? new Date(ch.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Recent',
          update_message: ch.latest_update || '',
        }));

        return {
          project: data.project,
          chapters: mappedChapters,
        };
      }
    } catch (err) {
      console.warn('Failed to fetch chapters for customer:', err);
    }

    return {
      project: null,
      chapters: localChapters.filter((c) => c.customer_id === customerId),
    };
  },

  async getAllChapters(): Promise<AdminChapterProgress[]> {
    return localChapters;
  },

  async getChapterById(chapterId: string): Promise<AdminChapterProgress | null> {
    return localChapters.find((c) => c.id === chapterId) || localChapters[0] || null;
  },

  /**
   * Add a new Chapter (Chapter N) to a project
   */
  async addChapter(payload: AddChapterPayload): Promise<any> {
    try {
      return await fetchApi<any>('/api/chapters', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('API addChapter failed, falling back locally:', err);
      const newCh: AdminChapterProgress = {
        id: `adm-ch-${Date.now()}`,
        project_id: payload.projectId,
        customer_id: '',
        customer_name: '',
        chapter_number: payload.chapterNumber || localChapters.length + 1,
        title: payload.title,
        status: 'Not Started',
        progress_percent: 0,
        document_released: false,
        updated_date: 'Today',
        update_message: payload.description || 'Chapter added.',
      };
      localChapters.push(newCh);
      return { success: true, chapter: newCh };
    }
  },

  /**
   * Edit existing Chapter details (title, number, description, etc.)
   */
  async editChapter(chapterId: string, payload: EditChapterPayload): Promise<any> {
    try {
      return await fetchApi<any>(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('API editChapter failed, falling back locally:', err);
      const idx = localChapters.findIndex((c) => c.id === chapterId);
      if (idx !== -1) {
        localChapters[idx] = {
          ...localChapters[idx],
          ...payload,
          status: (payload.status as any) || localChapters[idx].status,
          chapter_number: payload.chapterNumber || localChapters[idx].chapter_number,
          title: payload.title || localChapters[idx].title,
          progress_percent: payload.progress !== undefined ? payload.progress : localChapters[idx].progress_percent,
        };
        return { success: true, chapter: localChapters[idx] };
      }
    }
  },

  /**
   * Delete Chapter and re-sequence remaining 1..N
   */
  async deleteChapter(chapterId: string): Promise<any> {
    try {
      return await fetchApi<any>(`/api/chapters/${chapterId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('API deleteChapter failed, falling back locally:', err);
      localChapters = localChapters.filter((c) => c.id !== chapterId);
      return { success: true };
    }
  },

  /**
   * Reorder Chapters
   */
  async reorderChapters(projectId: string, orderedIds: string[]): Promise<any> {
    try {
      return await fetchApi<any>('/api/chapters/reorder', {
        method: 'POST',
        body: JSON.stringify({ projectId, orderedIds }),
      });
    } catch (err) {
      console.warn('API reorderChapters failed:', err);
      return { success: true };
    }
  },

  /**
   * Real PostgreSQL Progress Update & Document Attachment
   */
  async updateChapterProgress(
    chapterId: string,
    updates: {
      status?: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed' | 'Released';
      progress_percent: number;
      update_message?: string;
      document_released?: boolean;
      document_version?: string;
      fileName?: string;
      fileUrl?: string;
      version?: string;
    }
  ): Promise<any> {
    try {
      const res = await fetchApi<any>('/api/admin/progress-updates', {
        method: 'POST',
        body: JSON.stringify({
          chapterId,
          progress: updates.progress_percent,
          status: updates.status === 'Released' ? 'Completed' : updates.status,
          message: updates.update_message,
          documentReleased:
            updates.document_released !== undefined
              ? updates.document_released
              : updates.status === 'Released',
          fileName: updates.fileName,
          fileUrl: updates.fileUrl,
          version: updates.version || updates.document_version || 'v1.0',
        }),
      });

      if (res && res.success) {
        return res.updated;
      }
    } catch (err) {
      console.warn('Backend update failed, applying local fallback:', err);
    }

    const idx = localChapters.findIndex((c) => c.id === chapterId);
    if (idx !== -1) {
      localChapters[idx] = {
        ...localChapters[idx],
        ...updates,
        status: (updates.status as any) || localChapters[idx].status,
        updated_date: 'Today',
      };
      return localChapters[idx];
    }
    return localChapters[0];
  },

  async createProject(project: Omit<AdminProject, 'id'>): Promise<AdminProject> {
    try {
      const res = await fetchApi<any>('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          customerId: project.customer_id,
          userId: project.customer_id,
          title: project.topic,
          topic: project.topic,
          researchType: project.research_type,
          expectedCompletionDate: project.expected_completion,
          description: project.description,
        }),
      });
      if (res && res.id) {
        return {
          ...project,
          id: res.id,
        };
      }
    } catch (err) {
      console.warn('API createProject failed, saving locally:', err);
    }

    const newProj: AdminProject = {
      ...project,
      id: `proj-${Date.now()}`,
    };
    localProjects.unshift(newProj);
    return newProj;
  },
};

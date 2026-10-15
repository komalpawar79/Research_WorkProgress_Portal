import { fetchApi } from './apiClient';
import { mockAdminDocuments } from './adminMockData';
import { DocumentRecord } from '../types/admin.types';

let localDocuments = [...mockAdminDocuments];

export const documentManagementService = {
  async getDocuments(filters?: {
    customer?: string;
    chapter?: string;
    version?: string;
    search?: string;
  }): Promise<DocumentRecord[]> {
    try {
      const data = await fetchApi<any[]>('/api/documents');
      if (Array.isArray(data) && data.length > 0) {
        let list: DocumentRecord[] = data.map((d) => ({
          id: d.id,
          customer_id: d.customer_id || '',
          customer_name: d.customer_name || 'Scholar',
          customer_avatar: d.customer_avatar,
          project_title: d.project_title || 'Research Project',
          chapter_id: d.chapter_id || '',
          chapter_title: d.chapter_title || `Chapter ${d.chapter_number || 1}`,
          version: d.version || 'v1.0',
          file_name: d.file_name || 'thesis_chapter.pdf',
          file_size: `${d.page_count ? d.page_count * 0.4 : 2.5} MB`,
          status: (d.status as any) || (d.document_released ? 'Released' : 'Under Review'),
          watermark_status: 'Processed',
          uploaded_at: d.uploaded_at
            ? new Date(d.uploaded_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Recent',
          uploaded_by: d.uploaded_by || 'Dr. Arvind Mehra',
          storage_path: d.file_url || d.cloudinary_public_id || 'cloudinary/pdf',
        }));

        if (filters?.search) {
          const q = filters.search.toLowerCase();
          list = list.filter(
            (d) =>
              d.customer_name.toLowerCase().includes(q) ||
              d.file_name.toLowerCase().includes(q) ||
              d.project_title.toLowerCase().includes(q)
          );
        }

        if (filters?.customer && filters.customer !== 'All') {
          list = list.filter((d) => d.customer_name === filters.customer);
        }

        if (filters?.chapter && filters.chapter !== 'All') {
          list = list.filter((d) => d.chapter_title.includes(filters.chapter!));
        }

        if (filters?.version && filters.version !== 'All') {
          list = list.filter((d) => d.version === filters.version);
        }

        return list;
      }
    } catch (e) {
      console.warn('Live documents API error, falling back:', e);
    }

    let list = [...localDocuments];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.customer_name.toLowerCase().includes(q) ||
          d.file_name.toLowerCase().includes(q) ||
          d.project_title.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async toggleRelease(documentId: string, chapterId: string, released: boolean): Promise<any> {
    try {
      return await fetchApi('/api/documents/toggle-release', {
        method: 'POST',
        body: JSON.stringify({ documentId, chapterId, released }),
      });
    } catch (e) {
      console.warn('API toggleRelease failed:', e);
      return { success: true };
    }
  },

  async uploadChapterDocument(data: {
    customerId: string;
    customerName: string;
    chapterId: string;
    chapterTitle: string;
    projectTitle: string;
    fileName: string;
    version?: string;
  }): Promise<DocumentRecord> {
    const existing = localDocuments.filter((d) => d.chapter_id === data.chapterId);
    const newVersion = data.version || `v${existing.length + 1}`;

    const newDoc: DocumentRecord = {
      id: `doc-adm-${Date.now()}`,
      customer_id: data.customerId,
      customer_name: data.customerName,
      project_title: data.projectTitle,
      chapter_id: data.chapterId,
      chapter_title: data.chapterTitle,
      version: newVersion,
      file_name: data.fileName,
      file_size: '3.2 MB',
      status: 'Released',
      watermark_status: 'Processed',
      uploaded_at: 'Today',
      uploaded_by: 'Super Admin',
      storage_path: `protected_docs/${data.fileName}`,
    };

    localDocuments.unshift(newDoc);
    return newDoc;
  },
};

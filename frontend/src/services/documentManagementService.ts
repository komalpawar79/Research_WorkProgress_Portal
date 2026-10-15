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
    // Check existing version count for this chapter
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


import { mockDocumentMap } from './mockData';
import { ChapterDocument } from '../types/database.types';
import { fetchApi } from './apiClient';

export const documentService = {
  /**
   * Protected Document Access via Cloud Function / Express Backend:
   * 1. Sends request to backend /api/documents/secure-access
   * 2. Backend queries Firestore to check if chapter is RELEASED
   * 3. Backend generates Cloudinary dynamic watermark URL
   * 4. Returns protected document payload
   */
  async getDocumentByChapterId(
    chapterId: string,
    userId: string,
    userName: string
  ): Promise<ChapterDocument | null> {
    try {
      // 1. Attempt secure access through Backend / Cloud Function
      const data = await fetchApi<{
        success: boolean;
        chapter_id: string;
        chapter_title: string;
        page_count: number;
        signed_cloudinary_url: string;
        watermark: {
          customer_name: string;
          text: string;
        };
      }>('/api/documents/secure-access', {
        method: 'POST',
        body: JSON.stringify({ chapterId, userId }),
      });

      if (data && data.success) {
        const fallback = mockDocumentMap[chapterId];
        return {
          id: `doc-${data.chapter_id}`,
          chapter_id: data.chapter_id,
          user_id: userId,
          file_title: data.chapter_title,
          page_count: data.page_count,
          storage_path: 'cloudinary',
          signed_cloudinary_url: data.signed_cloudinary_url,
          watermark_text: data.watermark?.text || `CONFIDENTIAL\n${userName}\nFOR REVIEW ONLY`,
          is_active: true,
          created_at: new Date().toISOString(),
          pages: fallback?.pages || [],
        };
      }
    } catch (apiError: any) {
      // If server explicitly denied access (e.g. Chapter not released)
      if (apiError.message && apiError.message.includes('Restricted')) {
        throw apiError;
      }
      console.warn('Backend server offline or unreachable, using local protected fallback:', apiError);
    }

    // 2. Fallback in case backend is not running locally yet
    const fallbackDoc = mockDocumentMap[chapterId];
    if (!fallbackDoc) return null;

    return {
      ...fallbackDoc,
      watermark_text: `CONFIDENTIAL\n${userName}\nFOR REVIEW ONLY`,
      signed_cloudinary_url: `https://res.cloudinary.com/demo-researchflow/image/upload/fl_attachment:false/l_text:Arial_24_bold:CONFIDENTIAL%0A${encodeURIComponent(
        userName
      )}%0AFOR%20REVIEW%20ONLY,o_20,a_-30/researchflow/docs/${chapterId}.pdf`,
    };
  },
};

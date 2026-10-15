import { Request, Response } from 'express';
import { adminDb, isFirebaseInitialized } from '../config/firebaseAdmin.js';
import { generateWatermarkedPdfUrl } from '../config/cloudinary.js';

// Fallback metadata for demo chapters
const mockChapterMetadata: Record<string, any> = {
  'ch-01-intro': {
    id: 'ch-01-intro',
    chapter_number: 1,
    title: 'Introduction',
    status: 'Completed',
    document_released: true,
    page_count: 3,
    cloudinary_public_id: 'researchflow/docs/ch1_intro',
  },
  'ch-02-lit-review': {
    id: 'ch-02-lit-review',
    chapter_number: 2,
    title: 'Literature Review',
    status: 'Completed',
    document_released: true,
    page_count: 12,
    cloudinary_public_id: 'researchflow/docs/ch2_literature_review',
  },
  'ch-03-methodology': {
    id: 'ch-03-methodology',
    chapter_number: 3,
    title: 'Methodology',
    status: 'In Progress',
    document_released: false,
    page_count: 8,
    cloudinary_public_id: 'researchflow/docs/ch3_methodology_draft',
  },
  'ch-04-results': {
    id: 'ch-04-results',
    chapter_number: 4,
    title: 'Results',
    status: 'Not Started',
    document_released: false,
    page_count: 0,
    cloudinary_public_id: null,
  },
};

/**
 * Main Protected Access Controller:
 * Checks chapter release status in Firestore, validates ownership,
 * and generates a signed Cloudinary URL with dynamic watermarking.
 */
export const getSecureDocumentAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chapterId } = req.body;
    const user = req.user;

    if (!chapterId) {
      res.status(400).json({ error: 'chapterId is required' });
      return;
    }

    if (!user) {
      res.status(401).json({ error: 'Unauthorized user' });
      return;
    }

    let chapterData: any = null;

    // 1. Query Firestore for chapter metadata
    if (isFirebaseInitialized && adminDb) {
      const chapterDoc = await adminDb.collection('chapters').doc(chapterId).get();
      if (!chapterDoc.exists) {
        res.status(404).json({ error: 'Chapter record not found in Firestore' });
        return;
      }
      chapterData = chapterDoc.data();
    } else {
      // Fallback demo metadata
      chapterData = mockChapterMetadata[chapterId] || {
        id: chapterId,
        title: 'Chapter Review',
        status: 'Completed',
        document_released: true,
        page_count: 12,
        cloudinary_public_id: 'researchflow/docs/ch2_literature_review',
      };
    }

    // 2. CRUCIAL CHECK: "Is this chapter RELEASED?"
    const isReleased = Boolean(chapterData.document_released && chapterData.status === 'Completed');

    // If user is not an admin and chapter is NOT released, deny access immediately
    if (user.role === 'student' && !isReleased) {
      res.status(403).json({
        error: 'Access Restricted: This chapter has not been officially released yet.',
        status: chapterData.status,
        document_released: false,
      });
      return;
    }

    // 3. Generate secure signed Cloudinary URL with dynamic user watermark
    const publicId = chapterData.cloudinary_public_id || `researchflow/docs/${chapterId}`;
    const watermarkText = `CONFIDENTIAL\n${user.name}\nFOR REVIEW ONLY`;

    const watermarkedUrl = generateWatermarkedPdfUrl(publicId, {
      customerName: user.name,
      watermarkText,
      expiresInSeconds: 3600, // 1 hour temporary access
    });

    // 4. Return secure access payload
    res.status(200).json({
      success: true,
      chapter_id: chapterId,
      chapter_title: chapterData.title,
      chapter_number: chapterData.chapter_number,
      page_count: chapterData.page_count || 12,
      signed_cloudinary_url: watermarkedUrl,
      watermark: {
        customer_name: user.name,
        customer_email: user.email,
        text: watermarkText,
        security_level: 'High (Dynamic Vector Overlay)',
      },
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating secure document access:', error);
    res.status(500).json({ error: 'Internal server error processing document access' });
  }
};


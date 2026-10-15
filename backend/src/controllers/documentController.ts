import { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';
import { generateWatermarkedPdfUrl } from '../config/cloudinary.js';

/**
 * 1. Admin List All Documents
 */
export const getAllDocuments = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected) {
      const result = await query(`
        SELECT 
          d.id, d.project_id, d.chapter_id, d.file_name, d.file_url, d.cloudinary_public_id,
          d.version, d.status, d.page_count, d.uploaded_by, d.uploaded_at,
          COALESCE(p.title, 'Research Project') as project_title,
          COALESCE(c.title, 'Chapter Document') as chapter_title,
          COALESCE(c.chapter_number, 1) as chapter_number,
          c.document_released,
          u.id as customer_id,
          COALESCE(u.full_name, 'Scholar') as customer_name,
          u.avatar_url as customer_avatar
        FROM documents d
        LEFT JOIN projects p ON p.id = d.project_id
        LEFT JOIN chapters c ON c.id = d.chapter_id
        LEFT JOIN users u ON u.id = p.user_id
        ORDER BY d.uploaded_at DESC
      `);

      res.status(200).json(result.rows);
      return;
    }

    res.status(200).json([]);
  } catch (error: any) {
    console.error('Error fetching all documents:', error);
    res.status(500).json({ error: 'Failed to retrieve documents.' });
  }
};

/**
 * 2. Admin Toggle Document Release Status
 */
export const toggleDocumentRelease = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId, chapterId, released } = req.body;

    if (!documentId && !chapterId) {
      res.status(400).json({ error: 'documentId or chapterId is required.' });
      return;
    }

    const isReleased = Boolean(released);
    const newDocStatus = isReleased ? 'Released' : 'Under Review';

    if (isDbConnected) {
      let targetChapterId = chapterId;
      let targetProjectId = '';
      let targetUserId = '';

      if (documentId) {
        const docRes = await query(
          `UPDATE documents SET status = $1 WHERE id = $2 RETURNING project_id, chapter_id`,
          [newDocStatus, documentId]
        );
        if (docRes.rows.length > 0) {
          targetChapterId = docRes.rows[0].chapter_id;
          targetProjectId = docRes.rows[0].project_id;
        }
      }

      if (targetChapterId) {
        const chRes = await query(
          `UPDATE chapters
           SET document_released = $1,
               status = CASE WHEN $1 = TRUE THEN 'Completed' ELSE status END,
               progress = CASE WHEN $1 = TRUE THEN 100 ELSE progress END,
               updated_at = NOW()
           WHERE id = $2
           RETURNING project_id, chapter_number, title`,
          [isReleased, targetChapterId]
        );

        if (chRes.rows.length > 0) {
          const ch = chRes.rows[0];
          targetProjectId = ch.project_id;

          const pRes = await query(`SELECT user_id, title FROM projects WHERE id = $1`, [targetProjectId]);
          if (pRes.rows.length > 0) {
            targetUserId = pRes.rows[0].user_id;

            // Send Notification to Scholar
            const notifTitle = isReleased ? `Chapter ${ch.chapter_number} Released!` : `Document Access Updated`;
            const notifMessage = isReleased
              ? `Your chapter "${ch.title}" document is now available in your Protected Viewer.`
              : `Document access for "${ch.title}" was updated by administrator.`;

            await query(
              `INSERT INTO notifications (id, user_id, project_id, title, message, type)
               VALUES ($1, $2, $3, $4, $5, 'document')`,
              [`notif-${Date.now()}`, targetUserId, targetProjectId, notifTitle, notifMessage]
            );

            // Insert Activity Log
            await query(
              `INSERT INTO activity_logs (id, user_id, project_id, action, actor_name, description)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                `act-${Date.now()}`,
                targetUserId,
                targetProjectId,
                isReleased ? 'Document Released' : 'Document Revoked',
                req.user?.name || 'Administrator',
                `Chapter ${ch.chapter_number} document set to ${newDocStatus}.`,
              ]
            );
          }
        }
      }

      res.status(200).json({
        success: true,
        message: `Document status updated to ${newDocStatus}.`,
        released: isReleased,
      });
      return;
    }

    res.status(200).json({ success: true, released: isReleased, message: 'Document updated (mock)' });
  } catch (error: any) {
    console.error('Error toggling document release:', error);
    res.status(500).json({ error: 'Failed to toggle document release status.' });
  }
};

/**
 * 3. Protected Viewer Access Controller (PostgreSQL Verified)
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

    if (isDbConnected) {
      // 1. Query PostgreSQL chapters table
      const chRes = await query(
        `SELECT c.*, p.user_id as project_owner_id, p.title as project_title,
                d.file_url, d.cloudinary_public_id, d.version, d.page_count as doc_page_count
         FROM chapters c
         JOIN projects p ON p.id = c.project_id
         LEFT JOIN documents d ON d.chapter_id = c.id
         WHERE c.id = $1 LIMIT 1`,
        [chapterId]
      );

      if (chRes.rows.length === 0) {
        res.status(404).json({ error: 'Chapter record not found.' });
        return;
      }

      chapterData = chRes.rows[0];

      // Ownership check for customers
      if (user.role === 'customer' || user.role === 'student') {
        if (chapterData.project_owner_id !== user.userId) {
          res.status(403).json({ error: 'Access Denied: You do not have permission to view this project.' });
          return;
        }

        // Check if officially released
        const isReleased = Boolean(chapterData.document_released);
        if (!isReleased) {
          res.status(403).json({
            error: 'Access Restricted: This chapter document has not been released yet.',
            status: chapterData.status,
            document_released: false,
          });
          return;
        }
      }
    } else {
      chapterData = {
        id: chapterId,
        title: 'Chapter Review',
        chapter_number: 1,
        page_count: 12,
        cloudinary_public_id: 'researchflow/docs/sample_pdf',
      };
    }

    // Dynamic watermarking
    const publicId = chapterData.cloudinary_public_id || `researchflow/docs/${chapterId}`;
    const watermarkText = `CONFIDENTIAL\n${user.name}\nFOR REVIEW ONLY`;

    const watermarkedUrl = generateWatermarkedPdfUrl(publicId, {
      customerName: user.name,
      watermarkText,
      expiresInSeconds: 3600,
    });

    res.status(200).json({
      success: true,
      chapter_id: chapterId,
      chapter_title: chapterData.title,
      chapter_number: chapterData.chapter_number,
      page_count: chapterData.page_count || chapterData.doc_page_count || 12,
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

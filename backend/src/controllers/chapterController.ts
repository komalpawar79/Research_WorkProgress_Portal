import { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';

export const getChaptersByProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    if (isDbConnected) {
      const result = await query(
        `SELECT c.*, 
                dv.version_tag, dv.file_name, dv.file_url, dv.cloudinary_public_id, dv.page_count
         FROM chapters c
         LEFT JOIN document_versions dv ON dv.chapter_id = c.id
         WHERE c.project_id = $1
         ORDER BY c.chapter_number ASC`,
        [projectId]
      );
      res.status(200).json(result.rows);
      return;
    }

    res.status(200).json([]);
  } catch (error: any) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: 'Failed to fetch chapters', details: error.message });
  }
};

export const updateChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, wordCount, documentReleased, title } = req.body;

    if (isDbConnected) {
      await query(
        `UPDATE chapters
         SET status = COALESCE($1, status),
             word_count = COALESCE($2, word_count),
             document_released = COALESCE($3, document_released),
             title = COALESCE($4, title),
             completed_at = CASE WHEN $1 = 'Completed' THEN NOW() ELSE completed_at END,
             updated_at = NOW()
         WHERE id = $5`,
        [status, wordCount, documentReleased, title, id]
      );

      res.status(200).json({ success: true, message: 'Chapter updated in PostgreSQL' });
      return;
    }

    res.status(200).json({ success: true, message: 'Chapter updated (mock)' });
  } catch (error: any) {
    console.error('Error updating chapter:', error);
    res.status(500).json({ error: 'Failed to update chapter', details: error.message });
  }
};

export const toggleRelease = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { released, note } = req.body;

    if (isDbConnected) {
      const chResult = await query(
        `UPDATE chapters
         SET document_released = $1,
             status = CASE WHEN $1 = TRUE THEN 'Completed' ELSE status END,
             updated_at = NOW()
         WHERE id = $2
         RETURNING project_id, chapter_number, title`,
        [released, id]
      );

      if (chResult.rows.length > 0) {
        const { project_id, chapter_number, title } = chResult.rows[0];

        // Fetch customer_id for notification
        const proj = await query(`SELECT customer_id FROM projects WHERE id = $1`, [project_id]);
        if (proj.rows.length > 0 && proj.rows[0].customer_id) {
          const customerId = proj.rows[0].customer_id;
          const notifTitle = released ? `Chapter ${chapter_number} Released!` : `Chapter ${chapter_number} Access Updated`;
          const notifMsg = released
            ? `Your thesis chapter "${title}" is now available in your Protected Document Viewer.`
            : `Access to chapter "${title}" was updated.`;

          await query(
            `INSERT INTO notifications (id, user_id, title, message, type)
             VALUES ($1, $2, $3, $4, 'document')`,
            [`notif-${Date.now()}`, customerId, notifTitle, notifMsg]
          );

          await query(
            `INSERT INTO activity_logs (id, project_id, actor_name, action, details)
             VALUES ($1, $2, 'Admin / Research Guide', $3, $4)`,
            [
              `act-${Date.now()}`,
              project_id,
              released ? `Released Chapter ${chapter_number}` : `Revoked Chapter ${chapter_number}`,
              note || `Chapter "${title}" document status updated to ${released ? 'Released' : 'Private'}.`,
            ]
          );
        }
      }

      res.status(200).json({ success: true, released, message: `Chapter release status set to ${released}` });
      return;
    }

    res.status(200).json({ success: true, released, message: 'Toggle release success (mock)' });
  } catch (error: any) {
    console.error('Error toggling release:', error);
    res.status(500).json({ error: 'Failed to toggle release', details: error.message });
  }
};

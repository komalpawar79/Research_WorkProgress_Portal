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

export const createChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      projectId,
      title,
      chapterNumber,
      description = '',
      status = 'Not Started',
      progress = 0,
      wordCount = 0,
      documentReleased = false,
    } = req.body;

    if (!projectId || !title) {
      res.status(400).json({ error: 'projectId and title are required.' });
      return;
    }

    if (isDbConnected) {
      let nextNum = chapterNumber;
      if (!nextNum) {
        const maxRes = await query(
          `SELECT COALESCE(MAX(chapter_number), 0) + 1 AS next_num FROM chapters WHERE project_id = $1`,
          [projectId]
        );
        nextNum = Number(maxRes.rows[0]?.next_num || 1);
      }

      const chapterId = `ch-${projectId}-${Date.now()}`;
      const insertRes = await query(
        `INSERT INTO chapters (id, project_id, chapter_number, title, status, progress, word_count, document_released, description, latest_update, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING *`,
        [
          chapterId,
          projectId,
          nextNum,
          title,
          status,
          Number(progress),
          Number(wordCount),
          Boolean(documentReleased),
          description,
          'Chapter created.',
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Chapter created successfully.',
        chapter: insertRes.rows[0],
      });
      return;
    }

    res.status(201).json({
      success: true,
      chapter: {
        id: `mock-ch-${Date.now()}`,
        project_id: projectId,
        title,
        chapter_number: chapterNumber || 1,
        status,
        progress,
        document_released: documentReleased,
      },
    });
  } catch (error: any) {
    console.error('Error creating chapter:', error);
    res.status(500).json({ error: 'Failed to create chapter.', details: error.message });
  }
};

export const updateChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      status,
      progress,
      wordCount,
      documentReleased,
      title,
      chapterNumber,
      description,
      latestUpdate,
    } = req.body;

    if (isDbConnected) {
      const updateRes = await query(
        `UPDATE chapters
         SET status = COALESCE($1, status),
             progress = COALESCE($2, progress),
             word_count = COALESCE($3, word_count),
             document_released = COALESCE($4, document_released),
             title = COALESCE($5, title),
             chapter_number = COALESCE($6, chapter_number),
             description = COALESCE($7, description),
             latest_update = COALESCE($8, latest_update),
             completed_at = CASE WHEN $1 = 'Completed' OR $2 = 100 THEN NOW() ELSE completed_at END,
             updated_at = NOW()
         WHERE id = $9
         RETURNING *`,
        [
          status,
          progress !== undefined ? Number(progress) : null,
          wordCount !== undefined ? Number(wordCount) : null,
          documentReleased !== undefined ? Boolean(documentReleased) : null,
          title,
          chapterNumber !== undefined ? Number(chapterNumber) : null,
          description,
          latestUpdate,
          id,
        ]
      );

      if (updateRes.rows.length === 0) {
        res.status(404).json({ error: 'Chapter not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Chapter updated', chapter: updateRes.rows[0] });
      return;
    }

    res.status(200).json({ success: true, message: 'Chapter updated (mock)' });
  } catch (error: any) {
    console.error('Error updating chapter:', error);
    res.status(500).json({ error: 'Failed to update chapter', details: error.message });
  }
};

export const deleteChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isDbConnected) {
      const chRes = await query(`SELECT project_id, chapter_number FROM chapters WHERE id = $1`, [id]);
      if (chRes.rows.length === 0) {
        res.status(404).json({ error: 'Chapter not found' });
        return;
      }

      const { project_id } = chRes.rows[0];

      await query(`DELETE FROM chapters WHERE id = $1`, [id]);

      // Re-sequence remaining chapters for this project (1..N)
      const remaining = await query(
        `SELECT id FROM chapters WHERE project_id = $1 ORDER BY chapter_number ASC, created_at ASC`,
        [project_id]
      );

      for (let i = 0; i < remaining.rows.length; i++) {
        await query(`UPDATE chapters SET chapter_number = $1 WHERE id = $2`, [i + 1, remaining.rows[i].id]);
      }

      res.status(200).json({ success: true, message: 'Chapter deleted and sequence renumbered.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Chapter deleted (mock)' });
  } catch (error: any) {
    console.error('Error deleting chapter:', error);
    res.status(500).json({ error: 'Failed to delete chapter', details: error.message });
  }
};

export const reorderChapters = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, orderedIds } = req.body;

    if (!projectId || !Array.isArray(orderedIds)) {
      res.status(400).json({ error: 'projectId and orderedIds array are required.' });
      return;
    }

    if (isDbConnected) {
      for (let i = 0; i < orderedIds.length; i++) {
        await query(
          `UPDATE chapters SET chapter_number = $1, updated_at = NOW() WHERE id = $2 AND project_id = $3`,
          [i + 1, orderedIds[i], projectId]
        );
      }

      res.status(200).json({ success: true, message: 'Chapters reordered successfully.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Chapters reordered (mock)' });
  } catch (error: any) {
    console.error('Error reordering chapters:', error);
    res.status(500).json({ error: 'Failed to reorder chapters', details: error.message });
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
             progress = CASE WHEN $1 = TRUE THEN 100 ELSE progress END,
             updated_at = NOW()
         WHERE id = $2
         RETURNING project_id, chapter_number, title`,
        [released, id]
      );

      if (chResult.rows.length > 0) {
        const { project_id, chapter_number, title } = chResult.rows[0];

        // Fetch customer_id / user_id for notification
        const proj = await query(`SELECT * FROM projects WHERE id = $1`, [project_id]);
        if (proj.rows.length > 0) {
          const customerId = proj.rows[0].customer_id || proj.rows[0].user_id;
          if (customerId) {
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

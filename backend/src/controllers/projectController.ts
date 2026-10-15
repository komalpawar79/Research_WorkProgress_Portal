import { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = (req.query.customer_id || req.query.user_id) as string;

    if (isDbConnected) {
      let sql = `
        SELECT 
          p.id, p.user_id as customer_id, p.user_id, p.title, p.topic, p.topic as thesis_topic,
          p.research_type, p.domain, p.university, p.supervisor, p.supervisor as writer_name,
          p.status, p.overall_progress, p.overall_progress as progress_pct,
          p.start_date, p.expected_completion_date, p.expected_completion_date as target_completion_date,
          p.description, p.total_fee, p.paid_amount, p.created_at, p.updated_at,
          u.full_name as customer_name, u.email as customer_email, u.avatar_url as customer_avatar,
          (SELECT COUNT(*) FROM chapters ch WHERE ch.project_id = p.id) as chapter_count
        FROM projects p
        LEFT JOIN users u ON u.id = p.user_id
      `;
      const params: any[] = [];
      if (customerId) {
        sql += ` WHERE p.user_id = $1`;
        params.push(customerId);
      }
      sql += ` ORDER BY p.created_at DESC`;

      const result = await query(sql, params);
      res.status(200).json(result.rows);
      return;
    }

    res.status(200).json([]);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects', details: error.message });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isDbConnected) {
      const projRes = await query(
        `SELECT 
           p.*, p.user_id as customer_id, p.topic as thesis_topic, p.overall_progress as progress_pct,
           p.supervisor as writer_name, p.expected_completion_date as target_completion_date,
           u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone, u.avatar_url as customer_avatar
         FROM projects p
         LEFT JOIN users u ON u.id = p.user_id
         WHERE p.id = $1`,
        [id]
      );

      if (projRes.rows.length === 0) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      const chaptersRes = await query(
        `SELECT * FROM chapters WHERE project_id = $1 ORDER BY chapter_number ASC`,
        [id]
      );

      const paymentsRes = await query(
        `SELECT * FROM payments WHERE project_id = $1 ORDER BY payment_date ASC`,
        [id]
      );

      res.status(200).json({
        ...projRes.rows[0],
        chapters: chaptersRes.rows,
        payments: paymentsRes.rows,
      });
      return;
    }

    res.status(404).json({ error: 'Project not found' });
  } catch (error: any) {
    console.error('Error fetching project by ID:', error);
    res.status(500).json({ error: 'Failed to fetch project', details: error.message });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerId,
      userId,
      title,
      thesisTopic,
      topic,
      domain = 'Computer Science & AI',
      targetCompletionDate,
      expectedCompletionDate,
      writerName,
      supervisor = 'Dr. Arvind Mehra',
      totalFee = 0,
      paidAmount = 0,
      description = '',
    } = req.body;

    const assignedUserId = userId || customerId;
    const projectTitle = title;
    const projectTopic = topic || thesisTopic || title;
    const projectSupervisor = supervisor || writerName || 'Dr. Arvind Mehra';
    const completionDate = expectedCompletionDate || targetCompletionDate;
    const projectId = `proj-${Date.now()}`;

    if (isDbConnected) {
      await query(
        `INSERT INTO projects (id, user_id, title, topic, domain, status, overall_progress, expected_completion_date, supervisor, total_fee, paid_amount, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'In Progress', 0, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [projectId, assignedUserId, projectTitle, projectTopic, domain, completionDate, projectSupervisor, totalFee, paidAmount, description]
      );

      // Auto-generate standard 5 thesis chapters
      const defaultChapters = [
        { num: 1, title: 'Introduction & Problem Formulation' },
        { num: 2, title: 'Comprehensive Literature Review' },
        { num: 3, title: 'Methodology & Model Architecture' },
        { num: 4, title: 'Experimental Results & Benchmarks' },
        { num: 5, title: 'Conclusion, Limitations & Future Scope' },
      ];

      for (const ch of defaultChapters) {
        await query(
          `INSERT INTO chapters (id, project_id, chapter_number, title, status, progress, word_count, document_released, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'Not Started', 0, 0, FALSE, NOW(), NOW())`,
          [`ch-${projectId}-${ch.num}`, projectId, ch.num, ch.title]
        );
      }

      // Log initial activity
      await query(
        `INSERT INTO activity_logs (id, user_id, project_id, action, actor_name, description)
         VALUES ($1, $2, $3, 'Project Created', $4, $5)`,
        [`act-${Date.now()}`, assignedUserId, projectId, projectSupervisor, `Project "${title}" initiated.`]
      );

      res.status(201).json({ success: true, projectId, message: 'Project and chapters created successfully' });
      return;
    }

    res.status(201).json({ success: true, projectId, message: 'Project created (mock mode)' });
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project', details: error.message });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      thesisTopic,
      topic,
      status,
      progressPct,
      overallProgress,
      targetCompletionDate,
      expectedCompletionDate,
      totalFee,
      paidAmount,
      writerName,
      supervisor,
    } = req.body;

    const pTopic = topic || thesisTopic;
    const pProg = overallProgress !== undefined ? overallProgress : progressPct;
    const pDate = expectedCompletionDate || targetCompletionDate;
    const pSuper = supervisor || writerName;

    if (isDbConnected) {
      await query(
        `UPDATE projects
         SET title = COALESCE($1, title),
             topic = COALESCE($2, topic),
             status = COALESCE($3, status),
             overall_progress = COALESCE($4, overall_progress),
             expected_completion_date = COALESCE($5, expected_completion_date),
             total_fee = COALESCE($6, total_fee),
             paid_amount = COALESCE($7, paid_amount),
             supervisor = COALESCE($8, supervisor),
             updated_at = NOW()
         WHERE id = $9`,
        [title, pTopic, status, pProg, pDate, totalFee, paidAmount, pSuper, id]
      );

      res.status(200).json({ success: true, message: 'Project updated in PostgreSQL' });
      return;
    }

    res.status(200).json({ success: true, message: 'Project updated (mock)' });
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project', details: error.message });
  }
};

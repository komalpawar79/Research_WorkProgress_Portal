import { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.query.customer_id as string;
    
    if (isDbConnected) {
      let sql = `
        SELECT p.*, u.full_name as customer_name, u.email as customer_email
        FROM projects p
        LEFT JOIN users u ON u.id = p.customer_id
      `;
      const params: any[] = [];
      if (customerId) {
        sql += ` WHERE p.customer_id = $1`;
        params.push(customerId);
      }
      sql += ` ORDER BY p.created_at DESC`;
      const result = await query(sql, params);
      res.status(200).json(result.rows);
      return;
    }

    // Fallback demo data
    res.status(200).json([
      {
        id: 'proj-deep-learning-nlp',
        customer_id: 'usr-rahul-01',
        customer_name: 'Rahul Sharma',
        customer_email: 'rahul@gmail.com',
        title: 'Deep Learning for Low-Resource NLP in Indic Languages',
        thesis_topic: 'Neural Machine Translation and Sentiment Analysis for Indic Languages',
        domain: 'Computer Science & Artificial Intelligence',
        status: 'In Progress',
        progress_pct: 65,
        target_completion_date: '2026-11-15',
        writer_name: 'Dr. Arvind Mehra',
        total_fee: 45000,
        paid_amount: 30000,
      },
    ]);
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
        `SELECT p.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
         FROM projects p
         LEFT JOIN users u ON u.id = p.customer_id
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

    res.status(200).json({
      id,
      title: 'Deep Learning for Low-Resource NLP in Indic Languages',
      progress_pct: 65,
      status: 'In Progress',
    });
  } catch (error: any) {
    console.error('Error fetching project by ID:', error);
    res.status(500).json({ error: 'Failed to fetch project', details: error.message });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerId,
      title,
      thesisTopic,
      domain = 'Computer Science & AI',
      targetCompletionDate,
      writerName = 'Dr. Arvind Mehra',
      totalFee = 0,
      paidAmount = 0,
    } = req.body;

    const projectId = `proj-${Date.now()}`;

    if (isDbConnected) {
      await query(
        `INSERT INTO projects (id, customer_id, title, thesis_topic, domain, status, progress_pct, target_completion_date, writer_name, total_fee, paid_amount)
         VALUES ($1, $2, $3, $4, $5, 'In Progress', 0, $6, $7, $8, $9)`,
        [projectId, customerId, title, thesisTopic, domain, targetCompletionDate, writerName, totalFee, paidAmount]
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
          `INSERT INTO chapters (id, project_id, chapter_number, title, status, word_count, document_released, sort_order)
           VALUES ($1, $2, $3, $4, 'Pending', 0, FALSE, $5)`,
          [`ch-${projectId}-${ch.num}`, projectId, ch.num, ch.title, ch.num]
        );
      }

      // Log initial activity
      await query(
        `INSERT INTO activity_logs (id, project_id, actor_name, action, details)
         VALUES ($1, $2, $3, 'Project Created', $4)`,
        [`act-${Date.now()}`, projectId, writerName, `Project "${title}" initiated with 5 standard milestones.`]
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
    const { title, thesisTopic, status, progressPct, targetCompletionDate, totalFee, paidAmount, writerName } = req.body;

    if (isDbConnected) {
      await query(
        `UPDATE projects
         SET title = COALESCE($1, title),
             thesis_topic = COALESCE($2, thesis_topic),
             status = COALESCE($3, status),
             progress_pct = COALESCE($4, progress_pct),
             target_completion_date = COALESCE($5, target_completion_date),
             total_fee = COALESCE($6, total_fee),
             paid_amount = COALESCE($7, paid_amount),
             writer_name = COALESCE($8, writer_name),
             updated_at = NOW()
         WHERE id = $9`,
        [title, thesisTopic, status, progressPct, targetCompletionDate, totalFee, paidAmount, writerName, id]
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

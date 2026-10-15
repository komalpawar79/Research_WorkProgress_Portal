import { Request, Response } from 'express';
import { query } from '../config/db.js';

/**
 * Main User Dashboard Data Aggregator
 * Returns strictly the authenticated customer's own research data
 */
export const getUserDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // 1. Fetch User Profile
    const userRes = await query(`SELECT id, full_name, username, email, university, department FROM users WHERE id = $1`, [userId]);
    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'Customer record not found.' });
      return;
    }
    const user = userRes.rows[0];

    // 2. Fetch Customer's Project
    const projRes = await query(
      `SELECT * FROM projects WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (projRes.rows.length === 0) {
      res.status(200).json({
        user,
        project: null,
        chapters: [],
        payments: [],
        notifications: [],
        message: 'No research project assigned yet.',
      });
      return;
    }

    const project = projRes.rows[0];

    // 3. Fetch Chapters for Project (Ordered 1..4/5)
    const chapRes = await query(
      `SELECT * FROM chapters WHERE project_id = $1 ORDER BY chapter_number ASC`,
      [project.id]
    );
    const chapters = chapRes.rows;

    // 4. Fetch Documents (Only Released)
    const docRes = await query(
      `SELECT * FROM documents WHERE project_id = $1 AND status = 'Released' ORDER BY uploaded_at DESC`,
      [project.id]
    );

    // 5. Fetch Payments
    const payRes = await query(
      `SELECT * FROM payments WHERE project_id = $1 ORDER BY payment_date ASC`,
      [project.id]
    );

    // 6. Fetch Notifications
    const notifRes = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 15`,
      [userId]
    );

    // 7. Fetch Latest Progress Update
    const updateRes = await query(
      `SELECT pu.*, c.title as chapter_title, c.chapter_number
       FROM progress_updates pu
       JOIN chapters c ON c.id = pu.chapter_id
       WHERE pu.project_id = $1
       ORDER BY pu.created_at DESC LIMIT 1`,
      [project.id]
    );

    const latestUpdate = updateRes.rows[0] || null;

    // Compute dynamic greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.full_name,
        firstName: user.full_name.split(' ')[0],
        email: user.email,
        username: user.username,
        university: user.university,
        greeting: `${greeting}, ${user.full_name.split(' ')[0]}`,
      },
      project: {
        id: project.id,
        title: project.title,
        topic: project.topic,
        research_type: project.research_type,
        domain: project.domain,
        supervisor: project.supervisor,
        status: project.status,
        overall_progress: Number(project.overall_progress),
        start_date: project.start_date,
        expected_completion_date: project.expected_completion_date,
        description: project.description,
        total_fee: Number(project.total_fee),
        paid_amount: Number(project.paid_amount),
        remaining_amount: Math.max(0, Number(project.total_fee) - Number(project.paid_amount)),
      },
      chapters: chapters.map((c) => ({
        id: c.id,
        chapter_number: c.chapter_number,
        title: c.title,
        status: c.status,
        progress: Number(c.progress),
        word_count: c.word_count,
        document_released: Boolean(c.document_released),
        latest_update: c.latest_update,
        description: c.description,
      })),
      latest_update: latestUpdate
        ? {
            message: latestUpdate.message,
            chapter_number: latestUpdate.chapter_number,
            chapter_title: latestUpdate.chapter_title,
            progress: latestUpdate.progress,
            created_at: latestUpdate.created_at,
          }
        : chapters.find((c) => c.status === 'In Progress')?.latest_update || 'Research work ongoing as scheduled.',
      documents: docRes.rows,
      payments: payRes.rows,
      notifications: notifRes.rows,
    });
  } catch (error: any) {
    console.error('Error in getUserDashboard:', error);
    res.status(500).json({ error: 'Failed to load user dashboard.', details: error.message });
  }
};

export const getUserProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const projRes = await query(`SELECT * FROM projects WHERE user_id = $1 LIMIT 1`, [userId]);
    if (projRes.rows.length === 0) {
      res.status(404).json({ error: 'No research project found for this user.' });
      return;
    }
    res.status(200).json(projRes.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
};

export const getUserChapters = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const chapRes = await query(
      `SELECT c.* FROM chapters c
       JOIN projects p ON p.id = c.project_id
       WHERE p.user_id = $1
       ORDER BY c.chapter_number ASC`,
      [userId]
    );
    res.status(200).json(chapRes.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch chapters.' });
  }
};

export const getUserDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const docRes = await query(
      `SELECT d.*, c.title as chapter_title, c.chapter_number
       FROM documents d
       JOIN projects p ON p.id = d.project_id
       LEFT JOIN chapters c ON c.id = d.chapter_id
       WHERE p.user_id = $1 AND d.status = 'Released'
       ORDER BY d.uploaded_at DESC`,
      [userId]
    );
    res.status(200).json(docRes.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch documents.' });
  }
};

export const getUserPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const payRes = await query(
      `SELECT * FROM payments WHERE user_id = $1 ORDER BY payment_date ASC`,
      [userId]
    );
    res.status(200).json(payRes.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch payments.' });
  }
};

export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const notifRes = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [userId]
    );
    res.status(200).json(notifRes.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

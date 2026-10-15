import { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';

export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.query.project_id as string;
    const userId = req.query.user_id as string;

    if (isDbConnected) {
      let sql = `
        SELECT 
          a.id, a.user_id, a.project_id, a.action, a.actor_name, a.actor_name as user_name,
          COALESCE(u.role, 'admin') as user_role,
          COALESCE(p.title, 'Research Project') as target_name,
          'Project' as target_type,
          a.description as details,
          a.created_at as timestamp
        FROM activity_logs a
        LEFT JOIN users u ON u.id = a.user_id
        LEFT JOIN projects p ON p.id = a.project_id
      `;
      const params: any[] = [];
      const conditions: string[] = [];

      if (projectId) {
        conditions.push(`a.project_id = $${params.length + 1}`);
        params.push(projectId);
      }
      if (userId) {
        conditions.push(`a.user_id = $${params.length + 1}`);
        params.push(userId);
      }
      if (conditions.length > 0) {
        sql += ` WHERE ` + conditions.join(' AND ');
      }
      sql += ` ORDER BY a.created_at DESC LIMIT 100`;

      const result = await query(sql, params);
      res.status(200).json(result.rows);
      return;
    }

    res.status(200).json([]);
  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs', details: error.message });
  }
};

export const logActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, projectId, action, actorName, details, description } = req.body;
    const id = `act-${Date.now()}`;
    const desc = description || details || 'Action performed';
    const actor = actorName || req.user?.name || 'Administrator';

    if (isDbConnected) {
      await query(
        `INSERT INTO activity_logs (id, user_id, project_id, action, actor_name, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [id, userId || null, projectId || null, action, actor, desc]
      );

      res.status(201).json({ success: true, id, message: 'Activity logged in PostgreSQL' });
      return;
    }

    res.status(201).json({ success: true, id, message: 'Activity logged (mock)' });
  } catch (error: any) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
};

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.query.user_id as string) || req.user?.userId;

    if (isDbConnected) {
      let sql = `SELECT * FROM notifications`;
      const params: any[] = [];
      if (userId) {
        sql += ` WHERE user_id = $1`;
        params.push(userId);
      }
      sql += ` ORDER BY created_at DESC LIMIT 50`;

      const result = await query(sql, params);
      res.status(200).json(result.rows);
      return;
    }

    res.status(200).json([]);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications', details: error.message });
  }
};

import { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';

export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.query.project_id as string;

    if (isDbConnected) {
      let sql = `SELECT * FROM activity_logs`;
      const params: any[] = [];
      if (projectId) {
        sql += ` WHERE project_id = $1`;
        params.push(projectId);
      }
      sql += ` ORDER BY created_at DESC LIMIT 50`;

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

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.query.user_id as string) || 'usr-rahul-01';

    if (isDbConnected) {
      const result = await query(
        `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
        [userId]
      );
      res.status(200).json(result.rows);
      return;
    }

    res.status(200).json([]);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications', details: error.message });
  }
};

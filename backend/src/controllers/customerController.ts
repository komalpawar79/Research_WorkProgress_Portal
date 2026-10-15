import { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';

export const getCustomers = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected) {
      const result = await query(`
        SELECT u.id, u.username, u.email, u.full_name, u.phone, u.role, u.status as account_status, u.created_at,
               p.id as project_id, p.title as project_title, p.topic as research_topic, p.status as project_status,
               p.overall_progress as progress_pct, p.total_fee, p.paid_amount, p.expected_completion_date as target_completion_date
        FROM users u
        LEFT JOIN projects p ON p.user_id = u.id
        WHERE u.role = 'customer'
        ORDER BY u.created_at DESC
      `);
      res.status(200).json(result.rows);
      return;
    }

    res.status(200).json([]);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, fullName, phone, role = 'customer' } = req.body;
    const userId = `usr-${Date.now()}`;

    if (isDbConnected) {
      await query(
        `INSERT INTO users (id, email, full_name, role, phone, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [userId, email, fullName, role, phone]
      );

      res.status(201).json({ success: true, userId, message: 'Customer created in PostgreSQL' });
      return;
    }

    res.status(201).json({ success: true, userId, message: 'Customer created (mock)' });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer', details: error.message });
  }
};

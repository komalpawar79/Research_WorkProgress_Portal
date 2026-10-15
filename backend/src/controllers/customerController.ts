import { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';

export const getCustomers = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected) {
      const result = await query(`
        SELECT u.id, u.email, u.full_name, u.phone, u.role, u.created_at,
               p.id as project_id, p.title as project_title, p.status as project_status,
               p.progress_pct, p.total_fee, p.paid_amount, p.target_completion_date
        FROM users u
        LEFT JOIN projects p ON p.customer_id = u.id
        WHERE u.role = 'customer'
        ORDER BY u.created_at DESC
      `);
      res.status(200).json(result.rows);
      return;
    }

    res.status(200).json([
      {
        id: 'usr-rahul-01',
        email: 'rahul@gmail.com',
        full_name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        project_title: 'Deep Learning for Low-Resource NLP in Indic Languages',
        project_status: 'In Progress',
        progress_pct: 65,
        total_fee: 45000,
        paid_amount: 30000,
      },
    ]);
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
        `INSERT INTO users (id, email, full_name, role, phone)
         VALUES ($1, $2, $3, $4, $5)`,
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

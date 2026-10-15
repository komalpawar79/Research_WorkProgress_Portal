import { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';

export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.query.project_id as string;

    if (isDbConnected) {
      let sql = `
        SELECT pay.*, p.title as project_title, u.full_name as customer_name
        FROM payments pay
        JOIN projects p ON p.id = pay.project_id
        JOIN users u ON u.id = p.customer_id
      `;
      const params: any[] = [];
      if (projectId) {
        sql += ` WHERE pay.project_id = $1`;
        params.push(projectId);
      }
      sql += ` ORDER BY pay.created_at DESC`;

      const result = await query(sql, params);
      res.status(200).json(result.rows);
      return;
    }

    res.status(200).json([]);
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments', details: error.message });
  }
};

export const recordPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, milestoneName, amount, status = 'Paid', invoiceNumber, paymentDate } = req.body;
    const paymentId = `pay-${Date.now()}`;
    const invNum = invoiceNumber || `INV-2026-${Math.floor(100 + Math.random() * 900)}`;

    if (isDbConnected) {
      await query(
        `INSERT INTO payments (id, project_id, milestone_name, amount, status, invoice_number, payment_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [paymentId, projectId, milestoneName, amount, status, invNum, paymentDate || new Date().toISOString().split('T')[0]]
      );

      // If Paid, automatically update project's paid_amount
      if (status === 'Paid') {
        await query(
          `UPDATE projects
           SET paid_amount = paid_amount + $1,
               updated_at = NOW()
           WHERE id = $2`,
          [amount, projectId]
        );
      }

      res.status(201).json({ success: true, paymentId, invoiceNumber: invNum, message: 'Payment recorded in PostgreSQL' });
      return;
    }

    res.status(201).json({ success: true, paymentId, message: 'Payment recorded (mock)' });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment', details: error.message });
  }
};

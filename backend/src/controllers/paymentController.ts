import { Request, Response } from 'express';
import { query, isDbConnected } from '../config/db.js';

export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.query.project_id as string;
    const userId = req.query.user_id as string;

    if (isDbConnected) {
      let sql = `
        SELECT 
          pay.id, pay.user_id, pay.project_id, pay.milestone_name,
          COALESCE(pay.total_amount, pay.paid_amount, 0) as total_amount,
          COALESCE(pay.paid_amount, 0) as paid_amount,
          COALESCE(pay.paid_amount, 0) as amount,
          COALESCE(pay.remaining_amount, 0) as remaining_amount,
          pay.currency, pay.status, pay.invoice_number, pay.payment_date, pay.receipt_url, pay.created_at,
          COALESCE(p.title, 'Research Project') as project_title,
          COALESCE(u.full_name, 'Scholar') as customer_name,
          COALESCE(u.email, '') as customer_email,
          u.avatar_url as customer_avatar
        FROM payments pay
        LEFT JOIN projects p ON p.id = pay.project_id
        LEFT JOIN users u ON u.id = pay.user_id
      `;
      const params: any[] = [];
      const conditions: string[] = [];

      if (projectId) {
        conditions.push(`pay.project_id = $${params.length + 1}`);
        params.push(projectId);
      }
      if (userId) {
        conditions.push(`pay.user_id = $${params.length + 1}`);
        params.push(userId);
      }
      if (conditions.length > 0) {
        sql += ` WHERE ` + conditions.join(' AND ');
      }
      sql += ` ORDER BY pay.created_at DESC`;

      const result = await query(sql, params);

      // Summary
      const summaryRes = await query(`
        SELECT 
          COALESCE(SUM(paid_amount), 0) as total_revenue,
          COALESCE(SUM(remaining_amount), 0) as total_pending
        FROM payments
      `);

      const summary = summaryRes.rows[0] || { total_revenue: 0, total_pending: 0 };

      // Allow frontend to consume either direct list or enveloped object
      if (req.query.enveloped === 'true') {
        res.status(200).json({
          payments: result.rows,
          summary: {
            totalRevenue: Number(summary.total_revenue),
            totalPending: Number(summary.total_pending),
          },
        });
        return;
      }

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
    const {
      projectId,
      userId,
      milestoneName,
      amount,
      totalAmount,
      status = 'Paid',
      invoiceNumber,
      paymentDate,
    } = req.body;

    const paymentId = `pay-${Date.now()}`;
    const invNum = invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const payAmt = Number(amount || 0);
    const totAmt = Number(totalAmount || payAmt);
    const remAmt = Math.max(0, totAmt - (status === 'Paid' ? payAmt : 0));
    const date = paymentDate || new Date().toISOString().split('T')[0];

    if (isDbConnected) {
      // Find userId from project if not provided
      let customerId = userId;
      if (!customerId && projectId) {
        const pRes = await query(`SELECT user_id FROM projects WHERE id = $1`, [projectId]);
        if (pRes.rows.length > 0) customerId = pRes.rows[0].user_id;
      }

      await query(
        `INSERT INTO payments (id, user_id, project_id, milestone_name, total_amount, paid_amount, remaining_amount, status, invoice_number, payment_date, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
        [paymentId, customerId, projectId, milestoneName, totAmt, payAmt, remAmt, status, invNum, date]
      );

      // If Paid, automatically update project's paid_amount in PostgreSQL
      if (status === 'Paid' && projectId) {
        await query(
          `UPDATE projects
           SET paid_amount = paid_amount + $1,
               updated_at = NOW()
           WHERE id = $2`,
          [payAmt, projectId]
        );
      }

      // Log activity
      if (projectId) {
        await query(
          `INSERT INTO activity_logs (id, user_id, project_id, action, actor_name, description)
           VALUES ($1, $2, $3, 'Payment Recorded', $4, $5)`,
          [
            `act-${Date.now()}`,
            customerId,
            projectId,
            req.user?.name || 'Administrator',
            `Payment of ₹${payAmt} recorded for "${milestoneName}" (Invoice: ${invNum}).`,
          ]
        );
      }

      // Send notification to customer
      if (customerId) {
        await query(
          `INSERT INTO notifications (id, user_id, project_id, title, message, type)
           VALUES ($1, $2, $3, 'Payment Received', $4, 'payment')`,
          [
            `notif-${Date.now()}`,
            customerId,
            projectId,
            `Payment of ₹${payAmt.toLocaleString('en-IN')} has been acknowledged. Invoice: ${invNum}.`,
          ]
        );
      }

      res.status(201).json({
        success: true,
        paymentId,
        invoiceNumber: invNum,
        message: 'Payment recorded and synchronized in PostgreSQL',
      });
      return;
    }

    res.status(201).json({ success: true, paymentId, message: 'Payment recorded (mock)' });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment', details: error.message });
  }
};

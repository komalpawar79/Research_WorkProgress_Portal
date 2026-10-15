import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { adminDb, isFirebaseInitialized } from '../config/firebaseAdmin.js';

export const sendTransactionalEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipientEmail, recipientName, subject, emailType, chapterTitle } = req.body;

    if (!recipientEmail || !subject) {
      res.status(400).json({ error: 'recipientEmail and subject are required' });
      return;
    }

    console.log(`📧 [ResearchFlow Email Service] Dispatching "${emailType || 'Notification'}" to ${recipientName} <${recipientEmail}>: "${subject}"`);

    // Record audit in Firestore
    if (isFirebaseInitialized && adminDb) {
      await adminDb.collection('email_logs').add({
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        subject,
        email_type: emailType || 'General Update',
        status: 'Sent',
        sent_at: new Date().toISOString(),
        chapter_title: chapterTitle || null,
      });
    }

    // Optional nodemailer transport if configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.FROM_EMAIL || 'no-reply@researchflow.com',
        to: recipientEmail,
        subject,
        text: `Hello ${recipientName},\n\nYour chapter "${chapterTitle || 'update'}" has been released.\n\nRegards,\nResearchFlow Team`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Email successfully triggered for ${recipientEmail}`,
      status: 'Sent',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send transactional email' });
  }
};


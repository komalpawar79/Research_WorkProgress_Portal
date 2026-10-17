import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userPortalRoutes from './routes/userPortalRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import chapterRoutes from './routes/chapterRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import { testDbConnection } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup to allow frontend requests from Vercel, Localhost, and Render
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('vercel.app') ||
        origin.includes('onrender.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoints
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'ResearchFlow Multi-Tenant Backend (PostgreSQL + JWT + Cloudinary + Security Monitor)',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/db/health', async (_req, res) => {
  const result = await testDbConnection();
  if (result.connected) {
    res.status(200).json(result);
  } else {
    res.status(503).json(result);
  }
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Customer / Scholar User-Specific Portal Routes
app.use('/api/user', userPortalRoutes);

// Admin Management Routes
app.use('/api/admin', adminRoutes);

// Security & Screenshot Monitoring Routes
app.use('/api/security-events', securityRoutes);

// Shared Relational Query Routes
app.use('/api/projects', projectRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/emails', emailRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

const portNumber = Number(PORT) || 5000;
app.listen(portNumber, '0.0.0.0', async () => {
  console.log(`🚀 ResearchFlow Secure Backend running at http://0.0.0.0:${portNumber}`);
  console.log(`📁 Connected: PostgreSQL 18 Multi-Tenant ↔ Dynamic Watermark ↔ Screenshot Monitoring`);
  await testDbConnection();
});


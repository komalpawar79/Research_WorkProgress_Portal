import { Router } from 'express';
import { sendTransactionalEmail } from '../controllers/emailController.js';
import { authenticateFirebaseUser } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/emails/send
router.post('/send', authenticateFirebaseUser, sendTransactionalEmail);

export default router;


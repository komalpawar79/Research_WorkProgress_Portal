import { Router } from 'express';
import {
  getUserDashboard,
  getUserProject,
  getUserChapters,
  getUserDocuments,
  getUserPayments,
  getUserNotifications,
} from '../controllers/userPortalController.js';
import { getCurrentUser } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Protect ALL /api/user routes with JWT verification
router.use(authenticate);

router.get('/dashboard', getUserDashboard);
router.get('/profile', getCurrentUser);
router.get('/project', getUserProject);
router.get('/chapters', getUserChapters);
router.get('/documents', getUserDocuments);
router.get('/payments', getUserPayments);
router.get('/notifications', getUserNotifications);

export default router;

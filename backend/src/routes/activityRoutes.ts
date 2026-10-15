import { Router } from 'express';
import { getActivityLogs, logActivity, getNotifications } from '../controllers/activityController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getActivityLogs);
router.post('/', authenticate, logActivity);
router.get('/notifications', authenticate, getNotifications);

export default router;

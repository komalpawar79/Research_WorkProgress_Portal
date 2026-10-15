import { Router } from 'express';
import { getActivityLogs, getNotifications } from '../controllers/activityController.js';

const router = Router();

router.get('/logs', getActivityLogs);
router.get('/notifications', getNotifications);

export default router;

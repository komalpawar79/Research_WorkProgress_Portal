import { Router } from 'express';
import {
  recordSecurityEvent,
  getViewerStatus,
  getSecurityEvents,
  unlockCustomerViewer,
} from '../controllers/securityController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// 1. Scholar / User detection endpoints (authenticated)
router.post('/', authenticate, recordSecurityEvent);
router.get('/viewer-status', authenticate, getViewerStatus);

// 2. Admin audit & oversight endpoints
router.get('/', authenticate, requireAdmin, getSecurityEvents);
router.post('/unlock', authenticate, requireAdmin, unlockCustomerViewer);

export default router;

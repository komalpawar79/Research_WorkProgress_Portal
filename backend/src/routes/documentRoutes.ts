import { Router } from 'express';
import {
  getAllDocuments,
  getSecureDocumentAccess,
  toggleDocumentRelease,
} from '../controllers/documentController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Admin query for all documents
router.get('/', authenticate, getAllDocuments);

// POST /api/documents/secure-access - Dynamic watermarked PDF viewer
router.post('/secure-access', authenticate, getSecureDocumentAccess);

// POST /api/documents/toggle-release - Admin document release toggle
router.post('/toggle-release', authenticate, requireAdmin, toggleDocumentRelease);

export default router;

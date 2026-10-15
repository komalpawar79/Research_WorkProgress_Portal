import { Router } from 'express';
import { getSecureDocumentAccess } from '../controllers/documentController.js';
import { authenticateFirebaseUser } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/documents/secure-access
// Protected by Firebase Auth middleware -> checks Firestore release flag -> returns signed Cloudinary watermarked URL
router.post('/secure-access', authenticateFirebaseUser, getSecureDocumentAccess);

export default router;


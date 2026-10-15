import { Router } from 'express';
import {
  getChaptersByProject,
  createChapter,
  updateChapter,
  deleteChapter,
  reorderChapters,
  toggleRelease,
} from '../controllers/chapterController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Scholar query
router.get('/project/:projectId', getChaptersByProject);

// Admin-managed Dynamic Chapter Operations (1..N)
router.post('/', authenticate, requireAdmin, createChapter);
router.put('/:id', authenticate, requireAdmin, updateChapter);
router.delete('/:id', authenticate, requireAdmin, deleteChapter);
router.post('/reorder', authenticate, requireAdmin, reorderChapters);
router.post('/:id/toggle-release', authenticate, requireAdmin, toggleRelease);

export default router;


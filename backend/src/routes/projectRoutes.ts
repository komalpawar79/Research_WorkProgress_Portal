import { Router } from 'express';
import { getProjects, getProjectById, createProject, updateProject } from '../controllers/projectController.js';

const router = Router();

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);

export default router;

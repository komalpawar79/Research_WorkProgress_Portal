import { Router } from 'express';
import {
  createCustomer,
  listCustomers,
  getCustomerDetail,
  updateCustomer,
  resetCustomerPassword,
  saveProgressUpdate,
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Protect ALL /api/admin routes with Admin authentication
router.use(authenticate, requireAdmin);

// Customer Management
router.post('/users', createCustomer);
router.get('/users', listCustomers);
router.get('/users/:id', getCustomerDetail);
router.put('/users/:id', updateCustomer);
router.post('/users/:id/reset-password', resetCustomerPassword);

// Dedicated Progress Updates
router.post('/progress-updates', saveProgressUpdate);

export default router;

import { Router } from 'express';
import { createStaff, listStaff, login, me, register, removeStaff, updateStaff } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/staff', authenticate, requireRole('admin'), createStaff);
router.get('/staff', authenticate, requireRole('admin'), listStaff);
router.patch('/staff/:id', authenticate, requireRole('admin'), updateStaff);
router.delete('/staff/:id', authenticate, requireRole('admin'), removeStaff);

export default router;

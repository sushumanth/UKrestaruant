import { Router } from 'express';
import { login, me, register, createStaff } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/staff', authenticate, requireRole('admin'), createStaff);

export default router;

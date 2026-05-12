import { Router } from 'express';
import { addCategory, getCategories } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, requireRole('admin', 'employee'), addCategory);

export default router;
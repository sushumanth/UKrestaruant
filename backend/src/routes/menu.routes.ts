import { Router } from 'express';
import { addMenuItem, editMenuItem, getMenu, getMenuById, removeMenuItem } from '../controllers/menu.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.get('/', getMenu);
router.get('/:id', getMenuById);
router.post('/', authenticate, requireRole('admin', 'employee'), addMenuItem);
router.put('/:id', authenticate, requireRole('admin', 'employee'), editMenuItem);
router.delete('/:id', authenticate, requireRole('admin'), removeMenuItem);

export default router;

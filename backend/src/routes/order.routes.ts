import { Router } from 'express';
import { getOrder, getOrders, placeOrder } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.post('/', placeOrder);
router.get('/', authenticate, requireRole('admin', 'employee', 'customer'), getOrders);
router.get('/:id', authenticate, requireRole('admin', 'employee', 'customer'), getOrder);

export default router;

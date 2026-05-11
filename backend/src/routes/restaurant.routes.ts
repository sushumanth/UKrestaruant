import { Router } from 'express';
import { addTable, getSettings, getTables, patchTableStatus, removeTable, saveSettings } from '../controllers/restaurant.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.get('/settings', getSettings);
router.put('/settings', authenticate, requireRole('admin'), saveSettings);
router.get('/tables', getTables);
router.post('/tables', authenticate, requireRole('admin'), addTable);
router.patch('/tables/:id/status', authenticate, requireRole('admin', 'employee'), patchTableStatus);
router.delete('/tables/:id', authenticate, requireRole('admin'), removeTable);

export default router;

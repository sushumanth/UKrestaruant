import { Router } from 'express';
import { availableSlots, changeBookingStatus, getBooking, getBookings, occupiedTables, placeBooking } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.get('/availability', availableSlots);
router.get('/occupied-tables', occupiedTables);
router.post('/', placeBooking);
router.get('/', authenticate, requireRole('admin', 'employee', 'customer'), getBookings);
router.get('/:id', authenticate, requireRole('admin', 'employee', 'customer'), getBooking);
router.patch('/:id/status', authenticate, requireRole('admin', 'employee'), changeBookingStatus);

export default router;

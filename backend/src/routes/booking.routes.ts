import { Router } from 'express';
import { availableSlots, availableTables, changeBookingStatus, getBooking, getBookings, occupiedTables, placeBooking } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.get('/availability', availableSlots);
router.get('/available-tables', availableTables);
router.get('/occupied-tables', occupiedTables);
router.post('/', placeBooking);
router.get('/', authenticate, requireRole('admin', 'employee', 'customer'), getBookings);
router.get('/:id', authenticate, requireRole('admin', 'employee', 'customer'), getBooking);
router.patch('/:id/status', authenticate, requireRole('admin', 'employee'), changeBookingStatus);

export default router;

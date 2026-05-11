import { Router } from 'express';
import { sendBookingConfirmation } from '../controllers/notification.controller';

const router = Router();

router.post('/booking-confirmation', sendBookingConfirmation);

export default router;

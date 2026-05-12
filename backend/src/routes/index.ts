import { Router } from 'express';
import authRoutes from './auth.routes';
import restaurantRoutes from './restaurant.routes';
import menuRoutes from './menu.routes';
import bookingRoutes from './booking.routes';
import orderRoutes from './order.routes';
import uploadRoutes from './upload.routes';
import notificationRoutes from './notification.routes';
import categoryRoutes from './category.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/menu', menuRoutes);
router.use('/bookings', bookingRoutes);
router.use('/orders', orderRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);
router.use('/categories', categoryRoutes);

export default router;

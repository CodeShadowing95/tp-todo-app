import express from 'express';
import itemRoutes from './item.routes';
import checkHealthRoutes from './health.routes';
import authRoutes from './auth.routes';
import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/items', authMiddleware, itemRoutes);
router.use('/check-health', checkHealthRoutes);

export default router;

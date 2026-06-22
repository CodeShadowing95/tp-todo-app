import express from 'express';
import itemRoutes from './item.routes';
import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

router.use('/items', authMiddleware, itemRoutes);

export default router;

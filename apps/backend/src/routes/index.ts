import express from 'express';
import itemRoutes from './item.routes';
import checkHealthRoutes from './health.routes';

const router = express.Router();

router.use('/items', itemRoutes);
router.use('/check-health', checkHealthRoutes);

export default router;

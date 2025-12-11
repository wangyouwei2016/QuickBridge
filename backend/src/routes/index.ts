import { Router } from 'express';
import addressRoutes from './address.routes';
import dataRoutes from './data.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/address', addressRoutes);
router.use('/data', dataRoutes);
router.use('/', healthRoutes);

export default router;

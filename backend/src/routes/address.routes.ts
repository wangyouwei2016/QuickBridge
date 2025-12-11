import { Router } from 'express';
import { addressController } from '../controllers/address.controller';
import { addressCreationLimiter } from '../middleware/rate-limiter';

const router = Router();

router.post('/random', addressCreationLimiter, addressController.generateRandom);
router.post('/custom', addressCreationLimiter, addressController.createCustom);
router.get('/:address/status', addressController.checkStatus);

export default router;

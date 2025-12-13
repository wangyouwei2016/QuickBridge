import { addressController } from '../controllers/address.controller';
import { Router } from 'express';

const router = Router();

router.post('/random', addressController.generateRandom);
router.post('/custom', addressController.createCustom);
router.get('/:address/status', addressController.checkStatus);

export default router;

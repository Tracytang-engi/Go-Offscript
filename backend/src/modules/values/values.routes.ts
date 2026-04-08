import { Router } from 'express';
import * as valuesController from './values.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/all', valuesController.getAllValues);

router.use(authenticate);
router.post('/', valuesController.saveUserValues);
router.get('/', valuesController.getUserValues);

export default router;

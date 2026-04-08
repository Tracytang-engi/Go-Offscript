import { Router } from 'express';
import * as pathController from './path.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/generate', pathController.generatePath);
router.get('/latest', pathController.getLatestPath);

export default router;

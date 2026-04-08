import { Router } from 'express';
import * as novaController from './nova.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/analyze', novaController.analyze);
router.post('/chat', novaController.chat);

export default router;

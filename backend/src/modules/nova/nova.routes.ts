import { Router } from 'express';
import * as novaController from './nova.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/profile', novaController.generateProfile);
router.post('/analyze', novaController.analyze);
router.post('/chat', novaController.chat);
router.post('/linkedin-outreach', novaController.linkedinOutreach);

export default router;

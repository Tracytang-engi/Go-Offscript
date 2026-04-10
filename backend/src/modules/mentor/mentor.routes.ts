import { Router } from 'express';
import { searchMentors } from './mentor.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/search', searchMentors);

export default router;

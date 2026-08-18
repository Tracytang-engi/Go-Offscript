import { Router } from 'express';
import * as waitlistController from './waitlist.controller';

const router = Router();

// Public routes — no authentication
router.post('/', waitlistController.joinWaitlist);
router.get('/count', waitlistController.getCount);
router.get('/', waitlistController.exportEmails); // admin CSV export (requires x-admin-key header)

export default router;

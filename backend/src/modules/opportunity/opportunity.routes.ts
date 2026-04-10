import { Router } from 'express';
import * as opportunityController from './opportunity.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', opportunityController.getOpportunities);
router.post('/search', opportunityController.searchOpportunities);   // AI-powered real search
router.get('/:id', opportunityController.getOpportunityById);

export default router;

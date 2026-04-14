import { Request, Response, NextFunction } from 'express';
import * as opportunityService from './opportunity.service';
import { sendSuccess } from '../../utils/response';

export const getOpportunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await opportunityService.seedOpportunities();
    const rawType = req.query['type'];
    const filter = (typeof rawType === 'string' ? rawType : 'all');
    const page = parseInt(typeof req.query['page'] === 'string' ? req.query['page'] : '1', 10);
    const result = await opportunityService.getOpportunities(filter, page);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const getOpportunityById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const opp = await opportunityService.getOpportunityById(req.params['id'] as string);
    sendSuccess(res, opp);
  } catch (err) {
    next(err);
  }
};

// POST /api/opportunities/search
// Calls Perplexity to find real current opportunities based on the user's career path
export const searchOpportunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const targetCareer = typeof req.body?.targetCareer === 'string' ? req.body.targetCareer : undefined;
    const result = await opportunityService.searchAndStoreOpportunities(userId, targetCareer);
    sendSuccess(res, result, result.isReal
      ? 'Found real opportunities for your path'
      : 'Showing curated opportunities'
    );
  } catch (err) {
    next(err);
  }
};

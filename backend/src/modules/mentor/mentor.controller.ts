import { Request, Response, NextFunction } from 'express';
import { searchAndStoreMentors } from './mentor.service';
import { sendSuccess } from '../../utils/response';

export const searchMentors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const targetCareer = typeof req.body?.targetCareer === 'string' ? req.body.targetCareer : undefined;
    const result = await searchAndStoreMentors(userId, targetCareer);
    sendSuccess(res, result, result.isReal
      ? 'Found mentors for your path'
      : 'Showing available mentors'
    );
  } catch (err) {
    next(err);
  }
};

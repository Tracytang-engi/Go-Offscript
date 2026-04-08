import { Request, Response, NextFunction } from 'express';
import * as cvService from './cv.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/errorHandler';

export const uploadCv = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError('No file provided', 400);
    const result = await cvService.uploadCv(req.user!.userId, req.file);
    sendSuccess(res, result, 'CV uploaded and processed', 201);
  } catch (err) {
    next(err);
  }
};

export const getLatestCv = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cv = await cvService.getLatestCv(req.user!.userId);
    sendSuccess(res, cv);
  } catch (err) {
    next(err);
  }
};

export const getCvSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skills = await cvService.getCvSkills(req.user!.userId, req.params['id'] as string);
    sendSuccess(res, skills);
  } catch (err) {
    next(err);
  }
};

import { Request, Response, NextFunction } from 'express';
import * as pathService from './path.service';
import { sendSuccess } from '../../utils/response';

export const generatePath = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const path = await pathService.generatePath(req.user!.userId);
    sendSuccess(res, path, 'Career path generated', 201);
  } catch (err) {
    next(err);
  }
};

export const getLatestPath = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const path = await pathService.getLatestPath(req.user!.userId);
    sendSuccess(res, path);
  } catch (err) {
    next(err);
  }
};

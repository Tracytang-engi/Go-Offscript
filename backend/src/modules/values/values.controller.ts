import { Request, Response, NextFunction } from 'express';
import * as valuesService from './values.service';
import { sendSuccess } from '../../utils/response';

export const getAllValues = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const values = await valuesService.getAllValues();
    sendSuccess(res, values);
  } catch (err) {
    next(err);
  }
};

export const saveUserValues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { values } = req.body as { values: string[] };
    const result = await valuesService.saveUserValues(req.user!.userId, values);
    sendSuccess(res, result, 'Values saved');
  } catch (err) {
    next(err);
  }
};

export const getUserValues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await valuesService.getUserValues(req.user!.userId);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

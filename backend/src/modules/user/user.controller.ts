import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';
import { sendSuccess } from '../../utils/response';

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getMe(req.user!.userId);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.updateMe(req.user!.userId, req.body);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await userService.getProfile(req.user!.userId);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await userService.updateProfile(req.user!.userId, req.body);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
};

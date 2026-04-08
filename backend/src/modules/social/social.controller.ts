import { Request, Response, NextFunction } from 'express';
import * as socialService from './social.service';
import { sendSuccess } from '../../utils/response';
import { SocialPlatform } from '@prisma/client';

export const uploadScreenshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { platform, description } = req.body as {
      platform: SocialPlatform;
      description?: string;
    };

    const result = await socialService.saveScreenshotSignal(
      req.user!.userId,
      platform,
      req.file,            // optional image from multer
      description          // optional manual text
    );

    sendSuccess(res, result, 'Social signal saved and analysed');
  } catch (err) {
    next(err);
  }
};

export const getSignals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signals = await socialService.getSocialSignals(req.user!.userId);
    sendSuccess(res, signals);
  } catch (err) {
    next(err);
  }
};

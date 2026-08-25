import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';
import * as persistence from './user.persistence';
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
    const profile = await persistence.updateExtendedProfile(req.user!.userId, req.body);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
};

export const bootstrap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await persistence.getBootstrap(req.user!.userId);
    sendSuccess(res, data, 'Bootstrap loaded');
  } catch (err) {
    next(err);
  }
};

export const syncSavedOpportunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await persistence.upsertSavedOpportunity(req.user!.userId, req.body);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const syncSavedMentor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await persistence.upsertSavedMentor(req.user!.userId, req.body);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const appendChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await persistence.appendChatMessage(req.user!.userId, req.body);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionKey = typeof req.query.sessionKey === 'string' ? req.query.sessionKey : undefined;
    const messages = await persistence.listChatMessages(req.user!.userId, sessionKey);
    sendSuccess(res, messages);
  } catch (err) {
    next(err);
  }
};

import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/response';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 'Account created — check your email for a verification code', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Logged in');
  } catch (err) {
    next(err);
  }
};

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) {
      res.status(400).json({ success: false, message: 'email is required' });
      return;
    }
    const result = await authService.sendOtp(email);
    sendSuccess(res, result, 'OTP sent');
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body as { email: string; otp: string };
    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'email and otp are required' });
      return;
    }
    const result = await authService.verifyOtp(email, otp);
    sendSuccess(res, result, 'Email verified');
  } catch (err) {
    next(err);
  }
};

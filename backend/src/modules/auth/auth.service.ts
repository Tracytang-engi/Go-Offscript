import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import type { RegisterDto, LoginDto } from './auth.schema';
import { sendOtpEmail } from './mailer';

const signToken = (userId: string, email: string) =>
  jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

// ── Helpers ───────────────────────────────────────────────────────────────────

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const dispatchOtp = async (email: string, otp: string) => {
  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    console.error('[Auth] Failed to send OTP email:', err);
    throw new AppError('We could not send the verification email. Please try again.', 503);
  }
};

// ── Auth functions ────────────────────────────────────────────────────────────

export const register = async (dto: RegisterDto) => {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new AppError('Email already in use', 409);

  const hashedPassword = await bcrypt.hash(dto.password, 12);
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExp = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const user = await prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      emailVerified: false,
      emailOtp: hashedOtp,
      emailOtpExp: otpExp,
      profile: { create: {} },
    },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  try {
    await dispatchOtp(dto.email, otp);
  } catch (err) {
    // The app only moves to verification after a successful response. Remove the
    // just-created, unverified account so the same address can retry registration.
    try {
      await prisma.user.delete({ where: { id: user.id } });
    } catch (cleanupErr) {
      console.error('[Auth] Failed to clean up account after OTP delivery failure:', cleanupErr);
    }
    throw err;
  }

  return { user };
};

export const login = async (dto: LoginDto) => {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const token = signToken(user.id, user.email);
  const { password: _, emailOtp: __, emailOtpExp: ___, ...safeUser } = user;
  return { user: safeUser, token };
};

export const sendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('User not found', 404);

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExp = new Date(Date.now() + 15 * 60 * 1000);

  const previousOtp = user.emailOtp;
  const previousOtpExp = user.emailOtpExp;

  await prisma.user.update({
    where: { email },
    data: { emailOtp: hashedOtp, emailOtpExp: otpExp },
  });

  try {
    await dispatchOtp(email, otp);
  } catch (err) {
    // A failed resend must not invalidate a code that may already be in flight.
    try {
      await prisma.user.update({
        where: { email },
        data: { emailOtp: previousOtp, emailOtpExp: previousOtpExp },
      });
    } catch (rollbackErr) {
      console.error('[Auth] Failed to restore OTP after delivery failure:', rollbackErr);
    }
    throw err;
  }
  return { sent: true };
};

export const verifyOtp = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('User not found', 404);
  if (!user.emailOtp || !user.emailOtpExp) throw new AppError('No OTP requested', 400);
  if (new Date() > user.emailOtpExp) throw new AppError('OTP expired', 400);

  const valid = await bcrypt.compare(otp, user.emailOtp);
  if (!valid) throw new AppError('Invalid OTP', 400);

  await prisma.user.update({
    where: { email },
    data: { emailVerified: true, emailOtp: null, emailOtpExp: null },
  });

  const token = signToken(user.id, user.email);
  const { password: _, emailOtp: __, emailOtpExp: ___, ...safeUser } = user;
  return { user: { ...safeUser, emailVerified: true }, token };
};

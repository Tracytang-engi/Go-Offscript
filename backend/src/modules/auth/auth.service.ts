import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import type { RegisterDto, LoginDto } from './auth.schema';

const signToken = (userId: string, email: string) =>
  jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

export const register = async (dto: RegisterDto) => {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new AppError('Email already in use', 409);

  const hashedPassword = await bcrypt.hash(dto.password, 12);

  const user = await prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      profile: { create: {} },
    },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const token = signToken(user.id, user.email);
  return { user, token };
};

export const login = async (dto: LoginDto) => {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const token = signToken(user.id, user.email);
  const { password: _, ...safeUser } = user;
  return { user: safeUser, token };
};

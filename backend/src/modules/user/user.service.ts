import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      profile: true,
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateMe = async (userId: string, data: { name?: string }) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, updatedAt: true },
  });
  return user;
};

export const getProfile = async (userId: string) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError('Profile not found', 404);
  return profile;
};

export const updateProfile = async (
  userId: string,
  data: { bio?: string; location?: string; avatarUrl?: string }
) => {
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
  return profile;
};

import { prisma } from '../../config/prisma';

export type BootstrapPayload = {
  user: { id: string; name: string; email: string };
  profile: {
    age: string | null;
    school: string | null;
    region: string | null;
    location: string | null;
    portraitBullets: string[];
    chatSummary: string | null;
    saveChatHistory: boolean;
    likedPathTitles: string[];
    skippedPathTitles: string[];
    pathSnapshot: unknown | null;
    connectedPlatforms: string[];
    onboardingDone: boolean;
  };
  cv: { id: string; fileName: string; skills: string[] } | null;
  values: string[];
  socialSignals: Array<{ platform: string; summary: string | null; connected: boolean }>;
  savedOpportunities: Array<{ clientKey: string; snapshot: unknown; status: string }>;
  savedMentors: Array<{
    clientKey: string;
    snapshot: unknown;
    contacted: boolean;
    savedMessage: string | null;
  }>;
  chatMessages: Array<{ sessionKey: string; role: string; content: string; createdAt: string }>;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
};

export const ensureProfile = async (userId: string) => {
  return prisma.userProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
};

export const getBootstrap = async (userId: string): Promise<BootstrapPayload> => {
  const [user, profile, cvUpload, userValues, socialSignals, savedOpps, savedMentors, chatMessages] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      }),
      ensureProfile(userId),
      prisma.cvUpload.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { extractedSkills: true },
      }),
      prisma.userValue.findMany({ where: { userId }, include: { value: true } }),
      prisma.socialSignal.findMany({ where: { userId } }),
      prisma.userSavedOpportunity.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } }),
      prisma.userSavedMentor.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } }),
      prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 500,
      }),
    ]);

  return {
    user,
    profile: {
      age: profile.age,
      school: profile.school,
      region: profile.region,
      location: profile.location,
      portraitBullets: asStringArray(profile.portraitBullets),
      chatSummary: profile.chatSummary,
      saveChatHistory: profile.saveChatHistory,
      likedPathTitles: profile.likedPathTitles ?? [],
      skippedPathTitles: profile.skippedPathTitles ?? [],
      pathSnapshot: profile.pathSnapshot,
      connectedPlatforms: profile.connectedPlatforms ?? [],
      onboardingDone: profile.onboardingDone,
    },
    cv: cvUpload
      ? {
          id: cvUpload.id,
          fileName: cvUpload.fileName,
          skills: cvUpload.extractedSkills.map((s) => s.skill),
        }
      : null,
    values: userValues.map((uv) => uv.value.key),
    socialSignals: socialSignals.map((s) => ({
      platform: s.platform,
      summary: s.summary,
      connected: s.connected,
    })),
    savedOpportunities: savedOpps.map((o) => ({
      clientKey: o.clientKey,
      snapshot: o.snapshot,
      status: o.status,
    })),
    savedMentors: savedMentors.map((m) => ({
      clientKey: m.clientKey,
      snapshot: m.snapshot,
      contacted: m.contacted,
      savedMessage: m.savedMessage,
    })),
    chatMessages: chatMessages.map((m) => ({
      sessionKey: m.sessionKey,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  };
};

export const updateExtendedProfile = async (
  userId: string,
  data: {
    name?: string;
    age?: string;
    school?: string;
    region?: string;
    location?: string;
    portraitBullets?: string[];
    chatSummary?: string;
    saveChatHistory?: boolean;
    likedPathTitles?: string[];
    skippedPathTitles?: string[];
    pathSnapshot?: unknown;
    connectedPlatforms?: string[];
    onboardingDone?: boolean;
  }
) => {
  if (data.name !== undefined) {
    await prisma.user.update({ where: { id: userId }, data: { name: data.name } });
  }

  const profileData: Record<string, unknown> = {};
  if (data.age !== undefined) profileData.age = data.age;
  if (data.school !== undefined) profileData.school = data.school;
  if (data.region !== undefined) profileData.region = data.region;
  if (data.location !== undefined) profileData.location = data.location;
  if (data.portraitBullets !== undefined) profileData.portraitBullets = data.portraitBullets;
  if (data.chatSummary !== undefined) profileData.chatSummary = data.chatSummary;
  if (data.saveChatHistory !== undefined) profileData.saveChatHistory = data.saveChatHistory;
  if (data.likedPathTitles !== undefined) profileData.likedPathTitles = data.likedPathTitles;
  if (data.skippedPathTitles !== undefined) profileData.skippedPathTitles = data.skippedPathTitles;
  if (data.pathSnapshot !== undefined) profileData.pathSnapshot = data.pathSnapshot as object;
  if (data.connectedPlatforms !== undefined) profileData.connectedPlatforms = data.connectedPlatforms;
  if (data.onboardingDone !== undefined) profileData.onboardingDone = data.onboardingDone;

  const profile = await prisma.userProfile.upsert({
    where: { userId },
    create: { userId, ...profileData },
    update: profileData,
  });

  // Privacy: turning off chat history clears stored transcripts
  if (data.saveChatHistory === false) {
    await prisma.chatMessage.deleteMany({ where: { userId } });
  }

  return profile;
};

export const upsertSavedOpportunity = async (
  userId: string,
  body: { clientKey: string; snapshot: unknown; status?: string; remove?: boolean }
) => {
  if (body.remove) {
    await prisma.userSavedOpportunity.deleteMany({
      where: { userId, clientKey: body.clientKey },
    });
    return { removed: true };
  }

  const row = await prisma.userSavedOpportunity.upsert({
    where: { userId_clientKey: { userId, clientKey: body.clientKey } },
    create: {
      userId,
      clientKey: body.clientKey,
      snapshot: body.snapshot as object,
      status: body.status ?? 'PENDING',
    },
    update: {
      snapshot: body.snapshot as object,
      ...(body.status !== undefined ? { status: body.status } : {}),
    },
  });
  return row;
};

export const upsertSavedMentor = async (
  userId: string,
  body: {
    clientKey: string;
    snapshot: unknown;
    contacted?: boolean;
    savedMessage?: string;
    remove?: boolean;
  }
) => {
  if (body.remove) {
    await prisma.userSavedMentor.deleteMany({
      where: { userId, clientKey: body.clientKey },
    });
    return { removed: true };
  }

  const row = await prisma.userSavedMentor.upsert({
    where: { userId_clientKey: { userId, clientKey: body.clientKey } },
    create: {
      userId,
      clientKey: body.clientKey,
      snapshot: body.snapshot as object,
      contacted: body.contacted ?? false,
      savedMessage: body.savedMessage,
    },
    update: {
      snapshot: body.snapshot as object,
      ...(body.contacted !== undefined ? { contacted: body.contacted } : {}),
      ...(body.savedMessage !== undefined ? { savedMessage: body.savedMessage } : {}),
    },
  });
  return row;
};

export const appendChatMessage = async (
  userId: string,
  body: { sessionKey: string; role: string; content: string }
) => {
  const profile = await ensureProfile(userId);
  if (!profile.saveChatHistory) {
    return { saved: false as const };
  }

  const msg = await prisma.chatMessage.create({
    data: {
      userId,
      sessionKey: body.sessionKey,
      role: body.role,
      content: body.content,
    },
  });
  return { saved: true as const, message: msg };
};

export const listChatMessages = async (userId: string, sessionKey?: string) => {
  return prisma.chatMessage.findMany({
    where: {
      userId,
      ...(sessionKey ? { sessionKey } : {}),
    },
    orderBy: { createdAt: 'asc' },
    take: 500,
  });
};

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { callNovaAgent } from './nova.agent';
import { sendSuccess } from '../../utils/response';

export const analyze = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    // Load stored data from DB
    const [cvUpload, userValues, socialSignals] = await Promise.all([
      prisma.cvUpload.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { extractedSkills: true },
      }),
      prisma.userValue.findMany({ where: { userId }, include: { value: true } }),
      prisma.socialSignal.findMany({ where: { userId } }),
    ]);

    // Accept client-side data as supplementary input (e.g. if onboarding happened
    // faster than DB writes, or if values were only saved in Zustand store)
    const clientSkills: string[] = req.body?.skills ?? [];
    const clientValues: string[] = req.body?.values ?? [];
    const clientSocials: Array<{ platform: string; summary?: string }> = req.body?.socialSignals ?? [];

    const dbSkills = cvUpload?.extractedSkills.map((s) => s.skill) ?? [];
    const dbValues = userValues.map((uv) => uv.value.key);
    const dbSocials = socialSignals.map((s) => ({ platform: s.platform, summary: s.summary ?? undefined }));

    // Merge DB + client data, deduplicate
    const mergedSkills = [...new Set([...dbSkills, ...clientSkills])];
    const mergedValues = [...new Set([...dbValues, ...clientValues])];
    const mergedSocials = dbSocials.length > 0 ? dbSocials : clientSocials;

    const result = await callNovaAgent({
      userId,
      skills: mergedSkills,
      values: mergedValues,
      socialSignals: mergedSocials,
      cvSummary: cvUpload?.parsedText ?? undefined,
    });

    sendSuccess(res, result, 'Nova analysis complete');
  } catch (err) {
    next(err);
  }
};

// TODO: Implement streaming chat for conversational Nova (Phase 2+)
export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    sendSuccess(res, { message: 'Nova chat coming soon' });
  } catch (err) {
    next(err);
  }
};

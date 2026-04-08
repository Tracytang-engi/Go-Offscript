import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { callNovaAgent } from '../nova/nova.agent';

export const generatePath = async (userId: string) => {
  // Gather user profile data
  const [cvUpload, userValues, socialSignals] = await Promise.all([
    prisma.cvUpload.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { extractedSkills: true },
    }),
    prisma.userValue.findMany({ where: { userId }, include: { value: true } }),
    prisma.socialSignal.findMany({ where: { userId, connected: true } }),
  ]);

  const skills = cvUpload?.extractedSkills.map((s) => s.skill) ?? [];
  const values = userValues.map((uv) => uv.value.key);
  const signals = socialSignals.map((s) => ({ platform: s.platform, summary: s.summary }));

  const novaOutput = await callNovaAgent({
    userId,
    skills,
    values,
    socialSignals: signals,
    cvSummary: cvUpload?.parsedText ?? undefined,
  });

  // Persist the career path
  const careerPath = await prisma.careerPath.create({
    data: {
      userId,
      primaryPath: novaOutput.primaryPath.title,
      secondaryPath: novaOutput.secondaryPath?.title,
      explanation: novaOutput.explanation,
      tensionNote: novaOutput.tensionNote,
      nextActions: novaOutput.nextActions,
      rawNovaOutput: JSON.parse(JSON.stringify(novaOutput)),
      pathScores: {
        create: [
          {
            pathTitle: novaOutput.primaryPath.title,
            matchScore: novaOutput.primaryPath.matchScore,
            label: 'your sweet spot',
            rank: 1,
          },
          ...(novaOutput.secondaryPath
            ? [{
                pathTitle: novaOutput.secondaryPath.title,
                matchScore: novaOutput.secondaryPath.matchScore,
                label: 'strong match',
                rank: 2,
              }]
            : []),
          ...(novaOutput.tertiaryPath
            ? [{
                pathTitle: novaOutput.tertiaryPath.title,
                matchScore: novaOutput.tertiaryPath.matchScore,
                label: 'passion signal 🔥',
                rank: 3,
              }]
            : []),
        ],
      },
    },
    include: { pathScores: true },
  });

  await prisma.userEvent.create({
    data: { userId, eventType: 'path_generated', payload: { careerPathId: careerPath.id } },
  });

  return careerPath;
};

export const getLatestPath = async (userId: string) => {
  const path = await prisma.careerPath.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { pathScores: { orderBy: { rank: 'asc' } } },
  });
  if (!path) throw new AppError('No career path found. Generate one first.', 404);
  return path;
};

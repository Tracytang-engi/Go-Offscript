import { prisma } from '../../config/prisma';
import { searchMentorsWithAI, buildLinkedInSearchUrl } from './mentor.search';

export const searchAndStoreMentors = async (userId: string, targetCareer?: string) => {
  const [latestPath, cvUpload, userValues] = await Promise.all([
    prisma.careerPath.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { pathScores: { orderBy: { rank: 'asc' } } },
    }),
    prisma.cvUpload.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { extractedSkills: true },
    }),
    prisma.userValue.findMany({ where: { userId }, include: { value: true } }),
  ]);

  const pathTitles = latestPath?.pathScores.map((s) => s.pathTitle) ?? [];
  const primaryPath = latestPath?.primaryPath ?? pathTitles[0] ?? 'general career exploration';
  const skills = cvUpload?.extractedSkills.map((s) => s.skill) ?? [];
  const values = userValues.map((uv) => uv.value.key);

  const found = await searchMentorsWithAI({ primaryPath, pathTitles, targetCareer, skills, values });

  if (found.length === 0) {
    const existing = await prisma.mentor.findMany({ where: { isActive: true }, take: 5 });
    return { mentors: existing, isReal: false };
  }

  // Store mentors — LinkedIn search URL = name + company only (never hallucinated profile URLs)
  const stored = await Promise.all(
    found.map((m) => {
      const linkedinUrl = buildLinkedInSearchUrl(m.name, m.company);
      const mentorId = `search-${m.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

      return prisma.mentor.upsert({
        where: { id: mentorId },
        create: {
          id: mentorId,
          name: m.name,
          title: `${m.title} @ ${m.company}`,
          bio: m.bio,
          expertise: m.expertise,
          linkedinUrl,
          isActive: true,
        },
        update: {
          title: `${m.title} @ ${m.company}`,
          bio: m.bio,
          expertise: m.expertise,
          linkedinUrl,
        },
      });
    })
  );

  return { mentors: stored, isReal: true };
};

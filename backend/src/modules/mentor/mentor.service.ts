import { prisma } from '../../config/prisma';
import { searchMentorsWithAI } from './mentor.search';

export const searchAndStoreMentors = async (userId: string) => {
  const [latestPath, cvUpload, userValues] = await Promise.all([
    prisma.careerPath.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.cvUpload.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { extractedSkills: true },
    }),
    prisma.userValue.findMany({ where: { userId }, include: { value: true } }),
  ]);

  const primaryPath = latestPath?.primaryPath ?? 'general career exploration';
  const skills = cvUpload?.extractedSkills.map((s) => s.skill) ?? [];
  const values = userValues.map((uv) => uv.value.key);

  const found = await searchMentorsWithAI({ primaryPath, skills, values });

  if (found.length === 0) {
    // Return any existing mentors in DB
    const existing = await prisma.mentor.findMany({ where: { isActive: true }, take: 5 });
    return { mentors: existing, isReal: false };
  }

  // Store mentors (upsert by name to avoid duplicates across searches)
  const stored = await Promise.all(
    found.map((m) =>
      prisma.mentor.upsert({
        where: { id: `search-${m.name.toLowerCase().replace(/\s+/g, '-')}` },
        create: {
          id: `search-${m.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: m.name,
          title: `${m.title} @ ${m.company}`,
          bio: m.bio,
          expertise: m.expertise,
          linkedinUrl: m.linkedinUrl ?? undefined,
          isActive: true,
        },
        update: {
          title: `${m.title} @ ${m.company}`,
          bio: m.bio,
          expertise: m.expertise,
          linkedinUrl: m.linkedinUrl ?? undefined,
        },
      })
    )
  );

  return { mentors: stored, isReal: true };
};

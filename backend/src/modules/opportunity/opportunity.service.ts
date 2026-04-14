import { prisma } from '../../config/prisma';
import { OpportunityType } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { searchOpportunitiesWithAI } from './opportunity.search';

const TYPE_FILTER_MAP: Record<string, OpportunityType[]> = {
  all: Object.values(OpportunityType),
  opps: [OpportunityType.INTERNSHIP, OpportunityType.FELLOWSHIP, OpportunityType.SHORT_PROJECT],
  coaching: [OpportunityType.COACHING],
  meet: [OpportunityType.MEETUP],
};

export const getOpportunities = async (filter: string = 'all', page = 1, limit = 10) => {
  const types = TYPE_FILTER_MAP[filter] ?? TYPE_FILTER_MAP.all;
  const skip = (page - 1) * limit;

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where: { type: { in: types }, isOpen: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.opportunity.count({ where: { type: { in: types }, isOpen: true } }),
  ]);

  return { opportunities, total, page, limit, hasMore: skip + limit < total };
};

export const getOpportunityById = async (id: string) => {
  const opp = await prisma.opportunity.findUnique({ where: { id } });
  if (!opp) throw new AppError('Opportunity not found', 404);
  return opp;
};

// ─── AI-powered real opportunity search ──────────────────────────────────────

export const searchAndStoreOpportunities = async (userId: string, targetCareer?: string): Promise<{
  opportunities: Awaited<ReturnType<typeof prisma.opportunity.findMany>>;
  isReal: boolean;
}> => {
  // Get user's career path (with all path scores), skills, and values
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

  // Build a list of all path titles Nova generated (e.g. "UX Designer @ fintech startups")
  const pathTitles = latestPath?.pathScores.map((s) => s.pathTitle) ?? [];
  const primaryPath = latestPath?.primaryPath ?? pathTitles[0] ?? 'general career exploration';
  const skills = cvUpload?.extractedSkills.map((s) => s.skill) ?? [];
  const values = userValues.map((uv) => uv.value.key);

  // Call Perplexity to find real opportunities anchored on exact path titles
  const searched = await searchOpportunitiesWithAI({ primaryPath, pathTitles, targetCareer, skills, values });

  if (searched.length === 0) {
    // Fallback to seeded opportunities
    await seedOpportunities();
    const opps = await prisma.opportunity.findMany({
      where: { isOpen: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    return { opportunities: opps, isReal: false };
  }

  // Store new opportunities and link to career path
  const stored = await Promise.all(
    searched.map((opp) =>
      prisma.opportunity.create({
        data: {
          title: opp.title,
          organization: opp.organization,
          description: opp.description,
          type: opp.type,
          deadline: opp.deadline ?? undefined,
          url: opp.url ?? undefined,
          isOpen: true,
          tags: opp.tags,
          peerCount: Math.floor(Math.random() * 15) + 1,
          ...(latestPath ? {
            careerPaths: {
              create: { careerPathId: latestPath.id },
            },
          } : {}),
        },
      })
    )
  );

  return { opportunities: stored, isReal: true };
};

// Seed some example opportunities for development
export const seedOpportunities = async () => {
  const count = await prisma.opportunity.count();
  if (count > 0) return;

  await prisma.opportunity.createMany({
    data: [
      {
        title: 'Goldman Sachs Summer Analyst',
        organization: 'Goldman Sachs',
        description: 'Client-facing finance from day one.',
        type: OpportunityType.INTERNSHIP,
        deadline: 'closes May',
        isOpen: true,
        tags: ['finance', 'investment banking', 'client management'],
        peerCount: 4,
      },
      {
        title: 'Wellcome Trust Fellowship',
        organization: 'Wellcome Trust',
        description: 'Funded research. No experience needed. Stipend + costs.',
        type: OpportunityType.FELLOWSHIP,
        deadline: 'open now',
        isOpen: true,
        tags: ['research', 'science', 'fellowship'],
        peerCount: 3,
      },
      {
        title: 'Freelance Creative Project',
        organization: 'Self-directed',
        description: 'Build your creative portfolio with short freelance work.',
        type: OpportunityType.SHORT_PROJECT,
        deadline: 'anytime',
        isOpen: true,
        tags: ['creative', 'freelance', 'portfolio'],
        peerCount: 7,
      },
      {
        title: '1:1 Career Coaching Session',
        organization: 'Go Off Script Coaches',
        description: 'A focused session with a career coach in your target industry.',
        type: OpportunityType.COACHING,
        deadline: 'open now',
        isOpen: true,
        tags: ['coaching', 'career advice'],
        peerCount: 12,
      },
      {
        title: 'Creative Careers Meetup London',
        organization: 'Creative Mornings',
        description: 'Monthly community meetup for people building creative careers.',
        type: OpportunityType.MEETUP,
        deadline: 'monthly',
        isOpen: true,
        tags: ['meetup', 'community', 'networking'],
        peerCount: 20,
      },
    ],
  });
};

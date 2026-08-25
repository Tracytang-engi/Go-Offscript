import { OpportunityType } from '@prisma/client';
import { callAgentJson } from '../../lib/perplexity/agent';
import { opportunitiesSchema } from '../../lib/perplexity/schemas';

export interface SearchedOpportunity {
  title: string;
  organization: string;
  description: string;
  type: OpportunityType;
  deadline: string | null;
  url: string | null;
  tags: string[];
}

const SYSTEM_PROMPT = `You are an opportunity researcher. Find REAL, CURRENTLY OPEN opportunities that are a precise match for a specific target role.

Rules:
- Every result must directly relate to the target roles listed — no generic opportunities
- Only return real organizations and real programs that exist
- Include real application or information URLs where possible
- Descriptions must say WHY this fits the specific role (not just what the org does)
- Use web search to find current openings
- Keep descriptions concise (one sentence)`;

export const searchOpportunitiesWithAI = async (input: {
  primaryPath: string;
  pathTitles?: string[];
  targetCareer?: string;
  skills: string[];
  values: string[];
  location?: string;
}): Promise<SearchedOpportunity[]> => {
  const targetTitles = input.targetCareer
    ? [input.targetCareer]
    : (input.pathTitles ?? [input.primaryPath]);

  const roleLines = targetTitles
    .filter(Boolean)
    .map((t) => `  - ${t}`)
    .join('\n');

  const userPrompt = `Find 9 real, currently available opportunities for someone pursuing these SPECIFIC career paths:

Target Roles (use these exactly to anchor every result):
${roleLines}

Supporting Context:
- Skills: ${input.skills.slice(0, 10).join(', ') || 'not specified'}
- Values: ${input.values.join(', ') || 'growth, impact'}
- Location: ${input.location ?? 'UK / remote-friendly'}

Every opportunity must be directly relevant to at least one of the target roles above. Include:
- 3 internships or entry programs in these exact fields (paid preferred)
- 2 fellowships or funded programs directly in these fields
- 1 short project, competition, or portfolio challenge
- 2 coaching or mentorship programs specific to these roles
- 1 community, meetup, or network for people in these fields

No generic results. Each result must name the specific role or industry it serves.`;

  const { data } = await callAgentJson<{ opportunities: SearchedOpportunity[] }>(
    {
      preset: 'low',
      instructions: SYSTEM_PROMPT,
      input: userPrompt,
      tools: [{ type: 'web_search' }],
      responseFormat: opportunitiesSchema,
      maxOutputTokens: 3000,
      temperature: 0.2,
    },
    { opportunities: [] }
  );

  const parsed = data.opportunities ?? [];
  const validTypes = Object.values(OpportunityType);

  return parsed
    .filter((o) => o.title && o.organization)
    .map((o) => ({
      ...o,
      type: validTypes.includes(o.type) ? o.type : OpportunityType.INTERNSHIP,
      tags: Array.isArray(o.tags) ? o.tags : [],
      deadline: o.deadline ?? null,
      url: o.url && typeof o.url === 'string' && o.url.startsWith('http') ? o.url : null,
    }));
};

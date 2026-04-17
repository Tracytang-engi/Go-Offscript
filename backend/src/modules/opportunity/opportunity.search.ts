import { env } from '../../config/env';
import { OpportunityType } from '@prisma/client';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

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
- Return ONLY valid JSON, no markdown, no preamble.

Output format (strict JSON array):
[
  {
    "title": "exact program / role / event name",
    "organization": "real organization name",
    "description": "1 concise sentence: what it is and why it fits the target role",
    "type": "INTERNSHIP | FELLOWSHIP | SHORT_PROJECT | COACHING | MEETUP",
    "deadline": "e.g. 'rolling', 'closes June 2025', 'annual — opens September', or null",
    "url": "real application or info URL, or null if uncertain",
    "tags": ["tag1", "tag2", "tag3"]
  }
]`;

export const searchOpportunitiesWithAI = async (input: {
  primaryPath: string;
  pathTitles?: string[];
  targetCareer?: string;
  skills: string[];
  values: string[];
  location?: string;
}): Promise<SearchedOpportunity[]> => {
  if (!env.PERPLEXITY_API_KEY) {
    console.warn('[OpportunitySearch] No API key — returning empty');
    return [];
  }

  // If user selected a specific career from swipe, use it exclusively
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

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
        ...(env.PERPLEXITY_GROUP_ID ? { 'X-Group-Id': env.PERPLEXITY_GROUP_ID } : {}),
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      console.error('[OpportunitySearch] Perplexity error:', await response.text());
      return [];
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    const content = data.choices?.[0]?.message?.content ?? '';
    const cleaned = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

    const parsed = JSON.parse(cleaned) as SearchedOpportunity[];

    const validTypes = Object.values(OpportunityType);
    return parsed
      .filter((o) => o.title && o.organization)
      .map((o) => ({
        ...o,
        type: validTypes.includes(o.type) ? o.type : OpportunityType.INTERNSHIP,
        tags: Array.isArray(o.tags) ? o.tags : [],
        url: o.url && o.url.startsWith('http') ? o.url : null,
      }));
  } catch (err) {
    console.error('[OpportunitySearch] Failed to parse response:', err);
    return [];
  }
};

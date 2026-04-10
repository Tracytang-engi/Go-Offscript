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

const SYSTEM_PROMPT = `You are an opportunity researcher. Your job is to find REAL, CURRENTLY OPEN opportunities that match a career profile.

Rules:
- Only return real organizations that actually exist
- Only return opportunities that are real and currently open or regularly available
- Include real application URLs where possible
- Be specific — use real program names, not generic descriptions
- Return ONLY valid JSON, no markdown, no preamble

Output format (strict JSON array):
[
  {
    "title": "specific program/role name",
    "organization": "real organization name",
    "description": "1-2 sentences — what it is and why it fits this profile",
    "type": "INTERNSHIP | FELLOWSHIP | SHORT_PROJECT | COACHING | MEETUP",
    "deadline": "e.g. 'rolling', 'closes June 2025', 'annual — opens September', or null",
    "url": "real application or info URL, or null if unknown",
    "tags": ["tag1", "tag2", "tag3"]
  }
]`;

export const searchOpportunitiesWithAI = async (input: {
  primaryPath: string;
  skills: string[];
  values: string[];
  location?: string;
}): Promise<SearchedOpportunity[]> => {
  if (!env.PERPLEXITY_API_KEY) {
    console.warn('[OpportunitySearch] No API key — returning empty');
    return [];
  }

  const userPrompt = `Find 8 real, currently available opportunities for someone with this profile:

Career Path: ${input.primaryPath}
Skills: ${input.skills.slice(0, 10).join(', ') || 'general'}
Values: ${input.values.join(', ') || 'growth, impact'}
Location: ${input.location ?? 'UK / remote-friendly'}

Include a mix of:
- 3 internships or entry-level programs (paid preferred)
- 2 fellowships or funded programs
- 1 short project or competition
- 1 coaching or mentorship program
- 1 community meetup or network

Focus on real programs at real organizations that genuinely match this career path. Include real application URLs.`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
        ...(env.PERPLEXITY_GROUP_ID ? { 'X-Group-Id': env.PERPLEXITY_GROUP_ID } : {}),
      },
      body: JSON.stringify({
        model: 'sonar-pro',   // has real-time web search
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,    // lower = more factual
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

    // Validate and normalize types
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

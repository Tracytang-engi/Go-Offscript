import { callAgentJson } from '../../lib/perplexity/agent';
import { mentorsSchema } from '../../lib/perplexity/schemas';

export interface FoundMentor {
  name: string;
  title: string;
  company: string;
  bio: string;
  expertise: string[];
  yearsExperience: number;
}

const stripAcademicTitle = (name: string): string =>
  name.replace(/^(Dr\.?\s+|Prof\.?\s+|Professor\s+|Mr\.?\s+|Ms\.?\s+|Mrs\.?\s+)/i, '').trim();

/** LinkedIn people search: name only (stripped of academic titles) */
export const buildLinkedInSearchUrl = (name: string, _company: string): string => {
  const cleanName = stripAcademicTitle(name);
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(cleanName)}`;
};

const SYSTEM_PROMPT = `You are a professional mentor researcher. Find REAL, specific professionals who work in a given field and would make great mentors for early-career people.

Key requirements:
- Use the people_search tool to find real professionals. Prefer people_search over guessing.
- "name" MUST be a real person's full name in "First Last" format (e.g. "Sarah Chen", "James Okafor"). NEVER put a job title or role description in the name field.
- Identify professionals by NAME, JOB TITLE, and COMPANY — real people
- 3-8 years of experience (not entry level, not C-suite / famous — we want people who reply to messages)
- Must be genuinely active in the field
- Write their bio based on public professional background from search results
- DO NOT include any LinkedIn URLs`;

export const searchMentorsWithAI = async (input: {
  primaryPath: string;
  pathTitles?: string[];
  targetCareer?: string;
  skills: string[];
  values: string[];
}): Promise<FoundMentor[]> => {
  const targetTitles = input.targetCareer
    ? [input.targetCareer]
    : (input.pathTitles ?? [input.primaryPath]);

  const roleLines = targetTitles
    .filter(Boolean)
    .map((t) => `  - ${t}`)
    .join('\n');

  const userPrompt = `Find 5 real professionals who are excellent mentors for someone targeting these career paths:

Target Roles:
${roleLines}

Mentee context:
- Skills: ${input.skills.slice(0, 8).join(', ') || 'not specified'}
- Values: ${input.values.join(', ') || 'growth, impact'}

For each mentor:
- They must work in one of the target roles above — highly specific match
- 3-8 years experience (approachable, not yet at the top of their field)
- Mix: some at large companies, some at startups, some independent/freelance
- Prefer UK-based or open to global connections
- Write a bio that highlights specifically why they're relevant to this mentee's path
- Prefer Name + Company style identification`;

  const { data } = await callAgentJson<{ mentors: FoundMentor[] }>(
    {
      preset: 'low',
      instructions: SYSTEM_PROMPT,
      input: userPrompt,
      tools: [{ type: 'people_search' }, { type: 'web_search' }],
      responseFormat: mentorsSchema,
      maxOutputTokens: 2500,
      temperature: 0.3,
    },
    { mentors: [] }
  );

  const parsed = data.mentors ?? [];

  const looksLikePersonName = (name: string) => {
    const lower = name.toLowerCase();
    const roleKeywords = [
      ' at ',
      ' in ',
      ' for ',
      'engineer',
      'manager',
      'director',
      'analyst',
      'designer',
      'developer',
      'lead',
      'head of',
      'senior',
      'junior',
    ];
    if (roleKeywords.some((kw) => lower.includes(kw))) return false;
    if (name.trim().split(/\s+/).length < 2) return false;
    return true;
  };

  return parsed
    .filter((m) => m.name && looksLikePersonName(m.name))
    .map((m) => ({
      ...m,
      name: stripAcademicTitle(m.name),
      expertise: Array.isArray(m.expertise) ? m.expertise : [],
      yearsExperience: typeof m.yearsExperience === 'number' ? m.yearsExperience : 5,
    }))
    .slice(0, 5);
};

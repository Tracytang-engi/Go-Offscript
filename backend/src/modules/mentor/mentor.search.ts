import { env } from '../../config/env';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export interface FoundMentor {
  name: string;
  title: string;
  company: string;
  bio: string;
  expertise: string[];
  linkedinUrl: string | null;
  yearsExperience: number;
}

const SYSTEM_PROMPT = `You are a mentor researcher. Find REAL professionals on LinkedIn who are good mentors for early-career people.

Criteria:
- At least 3 years of relevant experience
- Mid-to-senior level (not entry level, not C-suite / celebrity — we want people who actually reply to messages)
- Real people with real LinkedIn profiles
- Based in UK or open to remote mentoring

Return ONLY valid JSON array, no markdown, no preamble.

Output format:
[
  {
    "name": "Full Name",
    "title": "Job Title",
    "company": "Company Name",
    "bio": "2-3 sentence bio drawn from their public LinkedIn — what they do, their background, what makes them a good mentor",
    "expertise": ["skill1", "skill2", "skill3"],
    "linkedinUrl": "https://linkedin.com/in/their-profile or null if unsure",
    "yearsExperience": 5
  }
]`;

export const searchMentorsWithAI = async (input: {
  primaryPath: string;
  skills: string[];
  values: string[];
}): Promise<FoundMentor[]> => {
  if (!env.PERPLEXITY_API_KEY) return [];

  const userPrompt = `Find 5 real LinkedIn professionals who would make great mentors for someone pursuing:

Career Path: ${input.primaryPath}
Their Skills: ${input.skills.slice(0, 8).join(', ') || 'general'}
Their Values: ${input.values.join(', ') || 'growth, impact'}

Requirements:
- Real people you can actually find on LinkedIn
- 3-8 years of experience in this field (not too junior, not too senior/famous)
- The kind of person who would actually reply to a thoughtful LinkedIn message
- Mix of backgrounds — some from big companies, some from startups, some independent
- Prefer UK-based or internationally accessible

For each person, write a genuine 2-3 sentence bio based on their public LinkedIn profile that explains why they're a good fit for this mentee's path.`;

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
        temperature: 0.4,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      console.error('[MentorSearch] Perplexity error:', await response.text());
      return [];
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    const content = data.choices?.[0]?.message?.content ?? '';
    const cleaned = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

    const parsed = JSON.parse(cleaned) as FoundMentor[];

    return parsed
      .filter((m) => m.name && m.title)
      .map((m) => ({
        ...m,
        linkedinUrl: m.linkedinUrl?.startsWith('http') ? m.linkedinUrl : null,
        expertise: Array.isArray(m.expertise) ? m.expertise.slice(0, 5) : [],
        yearsExperience: m.yearsExperience ?? 3,
      }));
  } catch (err) {
    console.error('[MentorSearch] Failed to parse response:', err);
    return [];
  }
};

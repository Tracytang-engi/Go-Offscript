import { env } from '../../config/env';
import type { NovaInput, NovaOutput } from './nova.types';
import { NOVA_SYSTEM_PROMPT, buildNovaUserPrompt } from './nova.prompt';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Mock output for when Cloudinary/Perplexity isn't configured yet (dev fallback)
const MOCK_OUTPUT: NovaOutput = {
  primaryPath: {
    title: 'Finance + Creative Direction',
    description: 'Your financial skills + creative instincts are rare — this is your sweet spot.',
    matchScore: 91,
  },
  secondaryPath: {
    title: 'Creative Industries — Commercial',
    description: 'Strong match with your visual storytelling and client comms skills.',
    matchScore: 76,
  },
  tertiaryPath: {
    title: 'Architecture & Built Environment',
    description: 'Passion signal from your interests — worth exploring even as a side path.',
    matchScore: 62,
  },
  tensionNote: 'creativity vs financial security creates a fork — creative roles pay less early on, but your finance background can bridge that gap faster than most',
  nextActions: [
    'Look into creative strategy roles at financial services firms',
    'Build a side portfolio of any visual/creative work you have',
    'Connect with people doing finance + brand work at companies like Goldman or BlackRock',
  ],
  explanation: "okay i see you — creativity AND financial security, plus your TikTok says architecture is lowkey your thing. here's your path — no filter 🎯",
  opportunities: [
    {
      title: 'Goldman Sachs Summer Analyst',
      organization: 'Goldman Sachs',
      type: 'INTERNSHIP',
      description: 'Client-facing finance from day one.',
      deadline: 'closes May',
    },
    {
      title: 'Wellcome Trust Fellowship',
      organization: 'Wellcome Trust',
      type: 'FELLOWSHIP',
      description: 'Funded research. No experience needed. Stipend + costs.',
      deadline: 'open now',
    },
    {
      title: 'Freelance Creative Project',
      organization: 'Self-directed',
      type: 'SHORT_PROJECT',
      description: 'Build your creative portfolio with a short freelance project.',
      deadline: 'anytime',
    },
  ],
};

export const callNovaAgent = async (input: NovaInput): Promise<NovaOutput> => {
  // Fall back to mock if API key not configured
  if (!env.PERPLEXITY_API_KEY) {
    console.warn('[Nova] No API key — returning mock output');
    return MOCK_OUTPUT;
  }

  const userPrompt = buildNovaUserPrompt({
    skills: input.skills,
    values: input.values,
    socialSignals: input.socialSignals ?? [],
    cvSummary: input.cvSummary,
    chatSummary: input.chatSummary,
  });

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
        { role: 'system', content: NOVA_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Nova] Perplexity API error:', error);
    console.warn('[Nova] Falling back to mock output');
    return MOCK_OUTPUT;
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices?.[0]?.message?.content ?? '';

  try {
    // Strip any accidental markdown code fences
    const cleaned = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleaned) as NovaOutput;
    return parsed;
  } catch (err) {
    console.error('[Nova] Failed to parse Perplexity response:', content, err);
    return MOCK_OUTPUT;
  }
};

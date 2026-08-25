import type { NovaInput, NovaOutput } from './nova.types';
import { NOVA_SYSTEM_PROMPT, buildNovaUserPrompt } from './nova.prompt';
import { callAgentJson } from '../../lib/perplexity/agent';
import { novaPathSchema } from '../../lib/perplexity/schemas';

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
  explanation: "okay i see you — creativity AND financial security, plus your TikTok says architecture is lowkey your thing. here's your path — no filter",
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

/** Path generation via Agent API with web_search to ground role realism */
export const callNovaAgent = async (input: NovaInput): Promise<NovaOutput> => {
  const userPrompt = buildNovaUserPrompt({
    skills: input.skills,
    values: input.values,
    socialSignals: input.socialSignals ?? [],
    cvSummary: input.cvSummary,
    chatSummary: input.chatSummary,
  });

  const { data } = await callAgentJson<NovaOutput>(
    {
      preset: 'low',
      instructions: `${NOVA_SYSTEM_PROMPT}\n\nUse web search to verify that recommended path titles are real, currently relevant career directions. Keep the JSON schema exactly.`,
      input: userPrompt,
      tools: [{ type: 'web_search' }],
      responseFormat: novaPathSchema,
      maxOutputTokens: 2500,
      temperature: 0.7,
    },
    MOCK_OUTPUT
  );

  if (!data.primaryPath?.title) {
    console.warn('[Nova] Invalid path payload — using mock');
    return MOCK_OUTPUT;
  }

  return data;
};

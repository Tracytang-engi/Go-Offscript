import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { callNovaAgent } from './nova.agent';
import {
  NOVA_PROFILE_SYSTEM_PROMPT,
  NOVA_CHAT_SYSTEM_PROMPT,
  buildNovaProfilePrompt,
  buildNovaUserPrompt,
} from './nova.prompt';
import { sendSuccess } from '../../utils/response';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// ??? Helper: call Perplexity and parse JSON ???????????????????????????????????

async function callPerplexityJson<T>(
  systemPrompt: string,
  userPrompt: string,
  fallback: T
): Promise<T> {
  if (!env.PERPLEXITY_API_KEY) return fallback;

  try {
    const res = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
        ...(env.PERPLEXITY_GROUP_ID ? { 'X-Group-Id': env.PERPLEXITY_GROUP_ID } : {}),
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      console.error('[Nova] Perplexity error:', await res.text());
      return fallback;
    }

    const data = await res.json() as { choices: Array<{ message: { content: string } }> };
    const content = data.choices?.[0]?.message?.content ?? '';
    const cleaned = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('[Nova] Failed to parse response:', err);
    return fallback;
  }
}

// ??? POST /nova/profile ???????????????????????????????????????????????????????
// Generates initial user profile summary + opening question

export const generateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const [cvUpload, userValues, socialSignals] = await Promise.all([
      prisma.cvUpload.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { extractedSkills: true },
      }),
      prisma.userValue.findMany({ where: { userId }, include: { value: true } }),
      prisma.socialSignal.findMany({ where: { userId } }),
    ]);

    // Merge with any client-side data passed in body
    const clientSkills: string[] = req.body?.skills ?? [];
    const clientValues: string[] = req.body?.values ?? [];

    const dbSkills = cvUpload?.extractedSkills.map((s) => s.skill) ?? [];
    const dbValues = userValues.map((uv) => uv.value.key);
    const dbSocials = socialSignals.map((s) => ({ platform: s.platform, summary: s.summary ?? undefined }));

    const skills = [...new Set([...dbSkills, ...clientSkills])];
    const values = [...new Set([...dbValues, ...clientValues])];

    const userPrompt = buildNovaProfilePrompt({
      skills,
      values,
      socialSignals: dbSocials,
      cvSummary: cvUpload?.parsedText ?? undefined,
    });

    const result = await callPerplexityJson<{ profileSummary: string; openingQuestion: string }>(
      NOVA_PROFILE_SYSTEM_PROMPT,
      userPrompt,
      {
        profileSummary: `you're someone with a solid mix of skills ? ${skills.slice(0, 3).join(', ')} ? and values like ${values.slice(0, 2).join(' and ')}. you're clearly thinking carefully about your next move.`,
        openingQuestion: "Is there anything you've always wanted to try that doesn't show up on your CV?",
      }
    );

    sendSuccess(res, result, 'Profile generated');
  } catch (err) {
    next(err);
  }
};

// ??? POST /nova/chat ??????????????????????????????????????????????????????????
// Responds to a single user message in the profile chat

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userMessage, history = [], profileContext = '' } = req.body as {
      userMessage: string;
      history: Array<{ role: 'user' | 'nova'; content: string }>;
      profileContext?: string;
    };

    const conversationText = history
      .map((m) => `${m.role === 'user' ? 'User' : 'Nova'}: ${m.content}`)
      .join('\n');

    const userPrompt = [
      profileContext ? `Profile context: ${profileContext}` : '',
      conversationText ? `Conversation so far:\n${conversationText}` : '',
      `User just said: "${userMessage}"`,
      '\nRespond to what the user just shared.',
    ].filter(Boolean).join('\n\n');

    const result = await callPerplexityJson<{ response: string }>(
      NOVA_CHAT_SYSTEM_PROMPT,
      userPrompt,
      { response: "that's really interesting ? thanks for sharing that. it'll help me find the right paths for you." }
    );

    sendSuccess(res, result, 'Chat response generated');
  } catch (err) {
    next(err);
  }
};

// ??? POST /nova/analyze ???????????????????????????????????????????????????????
// Full career path analysis (called from PathScreen)

export const analyze = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const [cvUpload, userValues, socialSignals] = await Promise.all([
      prisma.cvUpload.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { extractedSkills: true },
      }),
      prisma.userValue.findMany({ where: { userId }, include: { value: true } }),
      prisma.socialSignal.findMany({ where: { userId } }),
    ]);

    const clientSkills: string[] = req.body?.skills ?? [];
    const clientValues: string[] = req.body?.values ?? [];
    const clientSocials: Array<{ platform: string; summary?: string }> = req.body?.socialSignals ?? [];
    const chatSummary: string = req.body?.chatSummary ?? '';

    const dbSkills = cvUpload?.extractedSkills.map((s) => s.skill) ?? [];
    const dbValues = userValues.map((uv) => uv.value.key);
    const dbSocials = socialSignals.map((s) => ({ platform: s.platform, summary: s.summary ?? undefined }));

    const mergedSkills = [...new Set([...dbSkills, ...clientSkills])];
    const mergedValues = [...new Set([...dbValues, ...clientValues])];
    const mergedSocials = dbSocials.length > 0 ? dbSocials : clientSocials;

    const result = await callNovaAgent({
      userId,
      skills: mergedSkills,
      values: mergedValues,
      socialSignals: mergedSocials,
      cvSummary: cvUpload?.parsedText ?? undefined,
      chatSummary: chatSummary || undefined,
    });

    sendSuccess(res, result, 'Nova analysis complete');
  } catch (err) {
    next(err);
  }
};

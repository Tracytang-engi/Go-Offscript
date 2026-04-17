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
import { sendError, sendSuccess } from '../../utils/response';

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

// POST /nova/linkedin-outreach — one follow-up question, then cold message draft
const LINKEDIN_FOLLOWUP_SYSTEM = `You are Nova. Be extremely brief — no greetings, no filler.
Output ONLY valid JSON: {"question":"..."}
The question must be ONE short sentence (max 22 words) asking what you still need to know to write a strong LinkedIn cold message for this situation.`;

const LINKEDIN_MESSAGE_SYSTEM = `You write LinkedIn cold messages for early-career users.
Output ONLY valid JSON: {"message":"..."}
Rules for "message":
- English, 40-80 words (strict)
- Warm, professional, specific to the mentor's background; no false claims or fake connections
- Appropriate sign-off; use the mentor's first name if natural`;

export const linkedinOutreach = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as {
      phase: 'followup' | 'generate';
      mentorName: string;
      mentorTitle: string;
      mentorBio: string;
      userProfileSummary: string;
      purpose: 'job' | 'chat' | 'other';
      purposeDetail?: string;
      followUpAnswer?: string;
    };

    const purposeLabel =
      body.purpose === 'job'
        ? 'inquire about a job or role'
        : body.purpose === 'chat'
          ? 'arrange a short chat / coffee chat'
          : `other: ${(body.purposeDetail ?? '').trim() || 'user-specified goal'}`;

    if (body.phase === 'followup') {
      const userPrompt = [
        `Mentor: ${body.mentorName} — ${body.mentorTitle}`,
        `Public-style bio: ${body.mentorBio}`,
        `User profile (summary): ${body.userProfileSummary || 'not provided'}`,
        `Message goal: ${purposeLabel}`,
        'Ask ONE follow-up question so you can write the message next.',
      ].join('\n');

      const result = await callPerplexityJson<{ question: string }>(
        LINKEDIN_FOLLOWUP_SYSTEM,
        userPrompt,
        { question: 'What role or team at their company are you most interested in, and what do you want them to do next (reply, intro, or advice)?' }
      );
      sendSuccess(res, result, 'Follow-up ready');
      return;
    }

    if (body.phase === 'generate') {
      const answer = (body.followUpAnswer ?? '').trim() || 'no extra detail';
      const userPrompt = [
        `Mentor: ${body.mentorName} — ${body.mentorTitle}`,
        `Bio: ${body.mentorBio}`,
        `User profile: ${body.userProfileSummary || 'not provided'}`,
        `Goal: ${purposeLabel}`,
        `User answered your clarifying question with: "${answer}"`,
        'Write the LinkedIn message the user can send.',
      ].join('\n\n');

      const result = await callPerplexityJson<{ message: string }>(
        LINKEDIN_MESSAGE_SYSTEM,
        userPrompt,
        {
          message:
            `Hi ${body.mentorName.split(' ')[0]}, I came across your work at the intersection of our shared interests and I'm exploring paths in this space. I'd really value a brief perspective from someone with your experience. Would you be open to a short note or a 15-minute chat when you have a moment? Thank you for considering.`,
        }
      );
      sendSuccess(res, result, 'Message drafted');
      return;
    }

    return sendError(res, 'phase must be "followup" or "generate"', 400);
  } catch (err) {
    next(err);
  }
};

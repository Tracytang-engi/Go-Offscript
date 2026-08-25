import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { callNovaAgent } from './nova.agent';
import {
  NOVA_PROFILE_SYSTEM_PROMPT,
  NOVA_CHAT_SYSTEM_PROMPT,
  NOVA_NOVACHAT_SYSTEM_PROMPT,
  NOVA_REPATH_CHAT_SYSTEM_PROMPT,
  NOVA_REFINE_MESSAGE_SYSTEM,
  buildNovaProfilePrompt,
} from './nova.prompt';
import { sendError, sendSuccess } from '../../utils/response';
import { callAgentJson, MODEL_FAST, shouldSearchForChat } from '../../lib/perplexity/agent';
import {
  profileSchema,
  chatReplySchema,
  outreachFollowupSchema,
  outreachMessageSchema,
} from '../../lib/perplexity/schemas';

// ─── POST /nova/profile ───────────────────────────────────────────────────────

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

    const fallback = {
      profileSummary: `you're someone with a solid mix of skills — ${skills.slice(0, 3).join(', ')} — and values like ${values.slice(0, 2).join(' and ')}. you're clearly thinking carefully about your next move.`,
      openingQuestion: "Is there anything you've always wanted to try that doesn't show up on your CV?",
      portraitBullets: skills.slice(0, 3),
    };

    const { data: result } = await callAgentJson(
      {
        model: MODEL_FAST,
        instructions: NOVA_PROFILE_SYSTEM_PROMPT,
        input: userPrompt,
        responseFormat: profileSchema,
        maxOutputTokens: 800,
        temperature: 0.7,
        maxToolCalls: 0,
      },
      fallback
    );

    sendSuccess(res, result, 'Profile generated');
  } catch (err) {
    next(err);
  }
};

// ─── POST /nova/chat ──────────────────────────────────────────────────────────

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      userMessage,
      history = [],
      profileContext = '',
      mode,
      previousResponseId,
    } = req.body as {
      userMessage: string;
      history: Array<{ role: 'user' | 'nova'; content: string }>;
      profileContext?: string;
      mode?: 'repath' | 'novachat';
      previousResponseId?: string;
    };

    const isRepath = mode === 'repath';
    const isNovachat = mode === 'novachat';
    const systemPrompt = isRepath
      ? NOVA_REPATH_CHAT_SYSTEM_PROMPT
      : isNovachat
        ? NOVA_NOVACHAT_SYSTEM_PROMPT
        : NOVA_CHAT_SYSTEM_PROMPT;

    const defaultRepath = {
      response: 'sounds interesting — are you drawn more towards creative work or something more analytical?',
      type: 'question' as const,
      options: ['A: creative / people-facing', 'B: analytical / technical'],
    };
    const defaultNovachat = {
      response: "that's good to know — do you prefer working more independently or collaboratively with a team?",
      type: 'question' as const,
      options: ['A: independently / deep focus', 'B: collaboratively / team energy'],
    };
    const defaultChat = {
      response: "that's really interesting — thanks for sharing that. it'll help me find the right paths for you.",
      type: 'statement' as const,
    };

    const fallback = isRepath ? defaultRepath : isNovachat ? defaultNovachat : defaultChat;

    const needSearch = shouldSearchForChat(userMessage);
    const turnNumber = Math.ceil(history.length / 2) + 1;

    // Prefer previous_response_id when the client has one (S1 memory).
    // On first turn / missing id, send compact context + current message.
    const useResume = Boolean(previousResponseId);

    const input = useResume
      ? userMessage
      : [
          profileContext ? `Profile context: ${profileContext}` : '',
          history.length
            ? `Conversation so far:\n${history
                .map((m) => `${m.role === 'user' ? 'User' : 'Nova'}: ${m.content}`)
                .join('\n')}`
            : '',
          `User just said: "${userMessage}"`,
          isRepath || isNovachat
            ? `This is turn ${turnNumber} of the conversation.`
            : 'Respond to what the user just shared.',
          needSearch
            ? 'The user asked something that may need current real-world facts — use web search if helpful.'
            : 'Do not invent external facts; focus on reflecting what the user shared.',
        ]
          .filter(Boolean)
          .join('\n\n');

    const { data: result, responseId } = await callAgentJson(
      {
        ...(needSearch
          ? {
              preset: 'low' as const,
              tools: [{ type: 'web_search' as const }],
            }
          : {
              model: MODEL_FAST,
              maxToolCalls: 0,
            }),
        instructions: systemPrompt,
        input,
        previousResponseId: useResume ? previousResponseId : undefined,
        responseFormat: chatReplySchema,
        maxOutputTokens: 800,
        temperature: 0.7,
      },
      fallback
    );

    sendSuccess(
      res,
      {
        ...result,
        type: result.type === 'statement' ? 'statement' : 'question',
        responseId: responseId || undefined,
        usedWebSearch: needSearch,
      },
      'Chat response generated'
    );
  } catch (err) {
    next(err);
  }
};

// ─── POST /nova/analyze ───────────────────────────────────────────────────────

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

// ─── LinkedIn outreach ────────────────────────────────────────────────────────

const LINKEDIN_FOLLOWUP_SYSTEM = `You are Nova. Be extremely brief — no greetings, no filler.
Output a JSON object with one short follow-up question (max 22 words) asking what you still need to know to write a strong LinkedIn cold message.`;

const LINKEDIN_MESSAGE_SYSTEM = `You write LinkedIn cold messages for early-career users.
Rules for "message":
- English, 40-80 words (strict)
- Warm, professional, specific to the mentor's background; no false claims or fake connections
- Ground the note in the user's portrait and the mentor fields provided
- Appropriate sign-off; use the mentor's first name if natural
- Do not invent employers, projects, or mutual contacts not present in the inputs`;

export const linkedinOutreach = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as {
      phase: 'followup' | 'generate';
      mentorName: string;
      mentorTitle: string;
      mentorBio: string;
      userProfileSummary: string;
      portraitBullets?: string[];
      purpose: 'job' | 'chat' | 'other';
      purposeDetail?: string;
      followUpAnswer?: string;
      /** O3: only when user taps "Research this mentor" */
      researchMentor?: boolean;
    };

    const purposeLabel =
      body.purpose === 'job'
        ? 'inquire about a job or role'
        : body.purpose === 'chat'
          ? 'arrange a short chat / coffee chat'
          : `other: ${(body.purposeDetail ?? '').trim() || 'user-specified goal'}`;

    const userPortrait =
      body.portraitBullets && body.portraitBullets.length > 0
        ? `User portrait:\n${body.portraitBullets.map((b) => `- ${b}`).join('\n')}`
        : body.userProfileSummary
          ? `User profile: ${body.userProfileSummary}`
          : 'User profile: not provided';

    if (body.phase === 'followup') {
      const userPrompt = [
        `Mentor: ${body.mentorName} — ${body.mentorTitle}`,
        `Public-style bio: ${body.mentorBio}`,
        userPortrait,
        `Message goal: ${purposeLabel}`,
        'Ask ONE follow-up question so you can write the message next.',
      ].join('\n');

      const { data: result } = await callAgentJson(
        {
          model: MODEL_FAST,
          instructions: LINKEDIN_FOLLOWUP_SYSTEM,
          input: userPrompt,
          responseFormat: outreachFollowupSchema,
          maxOutputTokens: 200,
          maxToolCalls: 0,
        },
        {
          question:
            'What role or team at their company are you most interested in, and what do you want them to do next (reply, intro, or advice)?',
        }
      );
      sendSuccess(res, result, 'Follow-up ready');
      return;
    }

    if (body.phase === 'generate') {
      const answer = (body.followUpAnswer ?? '').trim() || 'no extra detail';
      const research = Boolean(body.researchMentor);

      const userPrompt = [
        `Mentor: ${body.mentorName} — ${body.mentorTitle}`,
        `Bio: ${body.mentorBio}`,
        userPortrait,
        `Goal: ${purposeLabel}`,
        `User answered your clarifying question with: "${answer}"`,
        research
          ? 'Optional research was requested: you may use tools to verify public professional context for this named person + company, but do not invent details you cannot support. Prefer the bio/portrait when unsure.'
          : 'Do not search the web. Use only the mentor fields and user portrait provided.',
        'Write the LinkedIn message the user can send.',
      ].join('\n\n');

      const { data: result } = await callAgentJson(
        {
          ...(research
            ? {
                preset: 'low' as const,
                tools: [{ type: 'people_search' as const }, { type: 'web_search' as const }],
              }
            : {
                model: MODEL_FAST,
                maxToolCalls: 0,
              }),
          instructions: LINKEDIN_MESSAGE_SYSTEM,
          input: userPrompt,
          responseFormat: outreachMessageSchema,
          maxOutputTokens: 500,
          temperature: 0.6,
        },
        {
          message: `Hi ${body.mentorName.split(' ')[0]}, I came across your work at the intersection of our shared interests and I'm exploring paths in this space. I'd really value a brief perspective from someone with your experience. Would you be open to a short note or a 15-minute chat when you have a moment? Thank you for considering.`,
        }
      );
      sendSuccess(res, { ...result, researched: research }, 'Message drafted');
      return;
    }

    return sendError(res, 'phase must be "followup" or "generate"', 400);
  } catch (err) {
    next(err);
  }
};

// ─── POST /nova/refine-message ────────────────────────────────────────────────

export const refineMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentMessage, userRequest, mentorName, mentorTitle, mentorBio, portraitBullets } =
      req.body as {
        currentMessage: string;
        userRequest: string;
        mentorName: string;
        mentorTitle: string;
        mentorBio: string;
        portraitBullets?: string[];
      };

    const portrait =
      portraitBullets && portraitBullets.length > 0
        ? `User portrait:\n${portraitBullets.map((b) => `- ${b}`).join('\n')}`
        : '';

    const userPrompt = [
      `Mentor: ${mentorName} — ${mentorTitle}`,
      mentorBio ? `Bio: ${mentorBio}` : '',
      portrait,
      `Current draft:\n"${currentMessage}"`,
      `User's edit request: "${userRequest}"`,
      'Produce a refined version that applies the request. Keep what works. Do not search the web.',
    ]
      .filter(Boolean)
      .join('\n\n');

    const { data: result } = await callAgentJson(
      {
        model: MODEL_FAST,
        instructions: NOVA_REFINE_MESSAGE_SYSTEM,
        input: userPrompt,
        responseFormat: outreachMessageSchema,
        maxOutputTokens: 500,
        maxToolCalls: 0,
      },
      { message: currentMessage }
    );

    sendSuccess(res, result, 'Message refined');
  } catch (err) {
    next(err);
  }
};

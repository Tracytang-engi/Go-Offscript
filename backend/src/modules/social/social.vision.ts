import { env } from '../../config/env';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

const VISION_SYSTEM_PROMPT = `You are Nova, a career intelligence assistant. Analyze this social media screenshot and extract what topics, industries, and interests the user is consuming.

Return ONLY valid JSON — no markdown, no explanation:
{
  "topics": ["string", ...],       // main content topics visible (e.g. "architecture", "finance", "streetwear")
  "industries": ["string", ...],   // potential career industries inferred
  "vibes": ["string", ...],        // aesthetic/lifestyle signals (e.g. "entrepreneurship", "creative work", "luxury")
  "summary": "string"              // 1-2 sentence plain-English summary Nova can use, casual tone
}`;

export const analyzeScreenshotWithVision = async (
  imageUrl: string,
  platform: string,
  manualDescription?: string
): Promise<{
  topics: string[];
  industries: string[];
  vibes: string[];
  summary: string;
}> => {
  const fallback = {
    topics: [],
    industries: [],
    vibes: [],
    summary: manualDescription ?? `user shared a ${platform} screenshot`,
  };

  if (!env.PERPLEXITY_API_KEY) return fallback;

  const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
    {
      type: 'image_url',
      image_url: { url: imageUrl },
    },
    {
      type: 'text',
      text: `This is a screenshot from ${platform}.${manualDescription ? ` User also says: "${manualDescription}"` : ''} What topics and career interests does this reveal?`,
    },
  ];

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-instruct',
        messages: [
          { role: 'system', content: VISION_SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn('[Vision] Perplexity vision error:', err);
      return fallback;
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content ?? '';
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      topics: parsed.topics ?? [],
      industries: parsed.industries ?? [],
      vibes: parsed.vibes ?? [],
      summary: parsed.summary ?? fallback.summary,
    };
  } catch (err) {
    console.warn('[Vision] Failed to parse vision response:', err);
    // If vision model fails, fall back to text-only analysis of the description
    if (manualDescription) {
      return await analyzeDescriptionOnly(platform, manualDescription);
    }
    return fallback;
  }
};

// Text-only fallback: analyze just the manual description using sonar-pro
const analyzeDescriptionOnly = async (
  platform: string,
  description: string
): Promise<{ topics: string[]; industries: string[]; vibes: string[]; summary: string }> => {
  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: VISION_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Platform: ${platform}. User description: "${description}". Extract topics and career interests.`,
          },
        ],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });
    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content ?? '';
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { topics: [], industries: [], vibes: [], summary: description };
  }
};

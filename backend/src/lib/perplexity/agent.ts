import { env } from '../../config/env';

const AGENT_API_URL = 'https://api.perplexity.ai/v1/agent';

/** Cheap reasoning model for no-search JSON tasks */
export const MODEL_FAST = 'openai/gpt-5.6-luna';

export type AgentPreset = 'fast' | 'low' | 'medium' | 'high' | 'xhigh';

export type AgentTool =
  | { type: 'web_search'; filters?: Record<string, unknown> }
  | { type: 'people_search' }
  | { type: 'fetch_url' };

export interface JsonSchemaFormat {
  name: string;
  schema: Record<string, unknown>;
}

export interface AgentCallOptions {
  /** Standing system rules */
  instructions?: string;
  /** User prompt — string or Open Responses input items */
  input: string | Array<Record<string, unknown>>;
  /** Prefer presets for search-heavy work; use `model` alone when tools must stay off */
  preset?: AgentPreset;
  model?: string;
  tools?: AgentTool[];
  /** Resume a prior Agent turn (NovaChat multi-turn) */
  previousResponseId?: string;
  responseFormat?: JsonSchemaFormat;
  maxOutputTokens?: number;
  temperature?: number;
  /** Blunt kill-switch if a preset still tries to call tools */
  maxToolCalls?: number;
}

export interface AgentResult {
  id: string;
  outputText: string;
  raw: unknown;
}

type AgentApiResponse = {
  id?: string;
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
    role?: string;
  }>;
};

const extractOutputText = (data: AgentApiResponse): string => {
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text;
  }
  const message = (data.output ?? []).find((item) => item.type === 'message');
  const parts = message?.content ?? [];
  const text = parts
    .filter((p) => p.type === 'output_text' || typeof p.text === 'string')
    .map((p) => p.text ?? '')
    .join('');
  return text.trim();
};

const stripJsonFences = (content: string): string =>
  content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

/**
 * Low-level Agent API call.
 * - No-search tasks: pass `model` and omit `tools` (do not use a search-heavy preset).
 * - Search tasks: pass `preset: 'low'` (or similar) and explicit `tools`.
 */
export const callAgent = async (opts: AgentCallOptions): Promise<AgentResult> => {
  if (!env.PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  const body: Record<string, unknown> = {
    input: opts.input,
  };

  if (opts.preset) body.preset = opts.preset;
  if (opts.model) body.model = opts.model;
  // If neither preset nor model, default to fast reasoning model without tools
  if (!opts.preset && !opts.model) body.model = MODEL_FAST;

  if (opts.instructions) body.instructions = opts.instructions;
  if (opts.tools && opts.tools.length > 0) body.tools = opts.tools;
  if (opts.previousResponseId) body.previous_response_id = opts.previousResponseId;
  if (opts.maxOutputTokens != null) body.max_output_tokens = opts.maxOutputTokens;
  if (opts.temperature != null) body.temperature = opts.temperature;
  if (opts.maxToolCalls != null) body.max_tool_calls = opts.maxToolCalls;

  if (opts.responseFormat) {
    body.response_format = {
      type: 'json_schema',
      json_schema: {
        name: opts.responseFormat.name,
        schema: {
          ...opts.responseFormat.schema,
          additionalProperties: opts.responseFormat.schema.additionalProperties ?? false,
        },
      },
    };
  }

  const response = await fetch(AGENT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
      ...(env.PERPLEXITY_GROUP_ID ? { 'X-Group-Id': env.PERPLEXITY_GROUP_ID } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Agent API ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as AgentApiResponse;
  const outputText = extractOutputText(data);
  return {
    id: data.id ?? '',
    outputText,
    raw: data,
  };
};

/**
 * Call Agent API and parse JSON (optionally enforced via response_format schema).
 * Returns fallback on any failure so product flows stay resilient.
 */
export const callAgentJson = async <T>(
  opts: AgentCallOptions,
  fallback: T
): Promise<{ data: T; responseId: string }> => {
  if (!env.PERPLEXITY_API_KEY) {
    return { data: fallback, responseId: '' };
  }

  try {
    const result = await callAgent(opts);
    const cleaned = stripJsonFences(result.outputText);
    if (!cleaned) {
      console.warn('[Agent] Empty output_text — using fallback');
      return { data: fallback, responseId: result.id };
    }
    const parsed = JSON.parse(cleaned) as T;
    return { data: parsed, responseId: result.id };
  } catch (err) {
    console.error('[Agent] callAgentJson failed:', err);
    return { data: fallback, responseId: '' };
  }
};

/** B1: open web search only when the user message looks fact-seeking */
export const shouldSearchForChat = (userMessage: string): boolean => {
  const text = userMessage.trim();
  if (text.length < 8) return false;
  return /\b(salary|salaries|pay|compensation|market|hiring|hire|company|companies|employer|industry trends?|job market|demand for|glassdoor|indeed|openings?|roles? at|internship at|working at|what(?:'s| is) out there|how much do|typical salary|linkedin|graduate scheme|vacancy|vacancies)\b/i.test(
    text
  );
};

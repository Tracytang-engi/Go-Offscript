/** Shared JSON schemas for Agent API response_format */

export const skillsSchema = {
  name: 'cv_skills',
  schema: {
    type: 'object',
    properties: {
      skills: {
        type: 'array',
        items: { type: 'string' },
        minItems: 4,
        maxItems: 8,
      },
    },
    required: ['skills'],
  },
};

export const profileSchema = {
  name: 'nova_profile',
  schema: {
    type: 'object',
    properties: {
      profileSummary: { type: 'string' },
      openingQuestion: { type: 'string' },
      portraitBullets: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['profileSummary', 'openingQuestion', 'portraitBullets'],
  },
};

export const chatReplySchema = {
  name: 'nova_chat_reply',
  schema: {
    type: 'object',
    properties: {
      response: { type: 'string' },
      type: { type: 'string', enum: ['question', 'statement'] },
      options: {
        type: 'array',
        items: { type: 'string' },
      },
      portraitBullets: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['response', 'type'],
  },
};

export const pathItemSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    matchScore: { type: 'number' },
    skillsAlreadyHave: { type: 'array', items: { type: 'string' } },
    skillsGap: { type: 'array', items: { type: 'string' } },
  },
  required: ['title', 'description', 'matchScore'],
};

export const novaPathSchema = {
  name: 'nova_paths',
  schema: {
    type: 'object',
    properties: {
      primaryPath: pathItemSchema,
      secondaryPath: pathItemSchema,
      tertiaryPath: pathItemSchema,
      tensionNote: { type: 'string' },
      nextActions: { type: 'array', items: { type: 'string' } },
      explanation: { type: 'string' },
      opportunities: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            organization: { type: 'string' },
            type: { type: 'string' },
            description: { type: 'string' },
            deadline: { type: 'string' },
          },
          required: ['title', 'organization', 'type', 'description'],
        },
      },
    },
    required: ['primaryPath', 'tensionNote', 'nextActions', 'explanation', 'opportunities'],
  },
};

export const opportunitiesSchema = {
  name: 'opportunity_list',
  schema: {
    type: 'object',
    properties: {
      opportunities: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            organization: { type: 'string' },
            description: { type: 'string' },
            type: {
              type: 'string',
              enum: ['INTERNSHIP', 'FELLOWSHIP', 'SHORT_PROJECT', 'COACHING', 'MEETUP'],
            },
            deadline: { type: ['string', 'null'] },
            url: { type: ['string', 'null'] },
            tags: { type: 'array', items: { type: 'string' } },
          },
          required: ['title', 'organization', 'description', 'type'],
        },
      },
    },
    required: ['opportunities'],
  },
};

export const mentorsSchema = {
  name: 'mentor_list',
  schema: {
    type: 'object',
    properties: {
      mentors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            title: { type: 'string' },
            company: { type: 'string' },
            bio: { type: 'string' },
            expertise: { type: 'array', items: { type: 'string' } },
            yearsExperience: { type: 'number' },
          },
          required: ['name', 'title', 'company', 'bio', 'expertise', 'yearsExperience'],
        },
      },
    },
    required: ['mentors'],
  },
};

export const outreachFollowupSchema = {
  name: 'outreach_followup',
  schema: {
    type: 'object',
    properties: {
      question: { type: 'string' },
    },
    required: ['question'],
  },
};

export const outreachMessageSchema = {
  name: 'outreach_message',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string' },
    },
    required: ['message'],
  },
};

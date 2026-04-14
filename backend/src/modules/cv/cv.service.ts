import { prisma } from '../../config/prisma';
import { cloudinary } from '../../config/cloudinary';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { Readable } from 'stream';
import type { UploadedFile } from '../../types/multer';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

// ─── AI-powered skill extraction ─────────────────────────────────────────────

const extractSkillsWithAI = async (cvText: string): Promise<string[]> => {
  if (!env.PERPLEXITY_API_KEY || !cvText.trim()) return fallbackExtract(cvText);

  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
        ...(env.PERPLEXITY_GROUP_ID ? { 'X-Group-Id': env.PERPLEXITY_GROUP_ID } : {}),
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `Extract 5-8 key professional skills from this CV. Return ONLY a JSON array of skill name strings. Be specific — use the actual terminology from the CV, not generic labels. No markdown, no explanation.
Example output: ["Financial Modelling", "Python", "Client Management", "Figma", "Data Analysis"]`,
          },
          {
            role: 'user',
            content: `CV text (first 3000 chars):\n\n${cvText.slice(0, 3000)}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 200,
      }),
    });

    if (!res.ok) throw new Error(`Perplexity error ${res.status}`);

    const data = await res.json() as { choices: Array<{ message: { content: string } }> };
    const content = data.choices?.[0]?.message?.content ?? '';
    const cleaned = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleaned) as string[];

    if (!Array.isArray(parsed) || parsed.length === 0) return fallbackExtract(cvText);
    return parsed.filter((s): s is string => typeof s === 'string').slice(0, 8);
  } catch (err) {
    console.warn('[CV] AI skill extraction failed, using fallback:', err);
    return fallbackExtract(cvText);
  }
};

// ─── Fallback: keyword matching for when AI is unavailable ───────────────────

const SKILL_PATTERNS = [
  'python', 'javascript', 'typescript', 'react', 'node.js', 'sql', 'postgresql',
  'excel', 'powerpoint', 'google sheets', 'power bi', 'tableau',
  'financial modelling', 'financial modeling', 'dcf', 'valuation', 'private equity',
  'investment banking', 'portfolio management', 'risk management',
  'accounting', 'budgeting', 'forecasting', 'financial analysis',
  'figma', 'sketch', 'photoshop', 'illustrator', 'canva', 'after effects',
  'brand strategy', 'content creation', 'copywriting', 'graphic design', 'ui/ux', 'user research',
  'data analysis', 'data visualisation', 'data visualization', 'machine learning',
  'project management', 'agile', 'scrum', 'stakeholder management',
  'client management', 'leadership', 'communication', 'research', 'writing',
  'marketing', 'social media', 'seo', 'product management',
  'business development', 'sales', 'consulting', 'strategy', 'operations',
  'prototyping', 'wireframing', 'public speaking', 'presentations',
];

const fallbackExtract = (text: string): string[] => {
  const lower = text.toLowerCase();
  return [...new Set(SKILL_PATTERNS.filter((skill) => lower.includes(skill)))].slice(0, 8);
};

// ─── Upload to Cloudinary ─────────────────────────────────────────────────────

const uploadToCloudinary = (
  buffer: Buffer,
  filename: string
): Promise<{ secure_url: string; public_id: string }> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'go-off-script/cvs',
        public_id: `cv_${Date.now()}_${filename.replace(/\s/g, '_')}`,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    Readable.from(buffer).pipe(stream);
  });

// ─── Main upload handler ──────────────────────────────────────────────────────

export const uploadCv = async (
  userId: string,
  file: UploadedFile
): Promise<{ cvId: string; skills: string[]; fileUrl: string; parsedText: string }> => {
  // 1. Extract text from PDF
  let parsedText = '';
  try {
    if (file.mimetype === 'application/pdf') {
      const result = await pdfParse(file.buffer);
      parsedText = result.text ?? '';
    } else {
      // For DOC/DOCX — basic text extraction (good enough for skill detection)
      parsedText = file.buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ');
    }
  } catch (err) {
    console.warn('[CV] Text extraction failed, continuing with empty text:', err);
  }

  // 2. Extract skills using AI (falls back to keyword matching if unavailable)
  const skills = await extractSkillsWithAI(parsedText);

  // 3. Upload to Cloudinary (skip gracefully if not configured)
  let fileUrl = '';
  let cloudinaryId: string | undefined;

  if (env.CLOUDINARY_API_KEY && env.CLOUDINARY_CLOUD_NAME) {
    try {
      const uploaded = await uploadToCloudinary(file.buffer, file.originalname);
      fileUrl = uploaded.secure_url;
      cloudinaryId = uploaded.public_id;
    } catch (err) {
      console.warn('[CV] Cloudinary upload failed, saving without cloud URL:', err);
      fileUrl = `local://${file.originalname}`;
    }
  } else {
    // Cloudinary not configured — store filename reference only
    fileUrl = `pending://${file.originalname}`;
    console.warn('[CV] Cloudinary not configured — file not stored in cloud');
  }

  // 4. Save to database
  const cv = await prisma.cvUpload.create({
    data: {
      userId,
      fileName: file.originalname,
      fileUrl,
      cloudinaryId,
      parsedText,
      status: 'DONE',
      extractedSkills: {
        create: skills.map((skill) => ({ skill, category: 'extracted' })),
      },
    },
    include: { extractedSkills: true },
  });

  await prisma.userEvent.create({
    data: { userId, eventType: 'cv_uploaded', payload: { cvId: cv.id, skillCount: skills.length } },
  });

  return {
    cvId: cv.id,
    skills: cv.extractedSkills.map((s) => s.skill),
    fileUrl: cv.fileUrl,
    parsedText: parsedText.slice(0, 500), // send preview to frontend
  };
};

export const getLatestCv = async (userId: string) => {
  const cv = await prisma.cvUpload.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { extractedSkills: true },
  });
  if (!cv) throw new AppError('No CV found', 404);
  return cv;
};

export const getCvSkills = async (userId: string, cvId: string) => {
  const cv = await prisma.cvUpload.findFirst({
    where: { id: cvId, userId },
    include: { extractedSkills: true },
  });
  if (!cv) throw new AppError('CV not found', 404);
  return cv.extractedSkills;
};

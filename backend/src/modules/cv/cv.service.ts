import { prisma } from '../../config/prisma';
import { cloudinary } from '../../config/cloudinary';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { Readable } from 'stream';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

// ─── Skill extraction from CV text ────────────────────────────────────────────

const SKILL_PATTERNS = [
  // Technical
  'python', 'javascript', 'typescript', 'react', 'node.js', 'nodejs', 'sql', 'postgresql',
  'mysql', 'mongodb', 'excel', 'powerpoint', 'word', 'google sheets',
  // Finance
  'financial modelling', 'financial modeling', 'dcf', 'valuation', 'private equity',
  'investment banking', 'hedge fund', 'portfolio management', 'risk management',
  'accounting', 'budgeting', 'forecasting',
  // Creative
  'figma', 'sketch', 'photoshop', 'illustrator', 'indesign', 'canva', 'after effects',
  'visual storytelling', 'brand strategy', 'content creation', 'copywriting',
  'graphic design', 'ui/ux', 'user research',
  // Soft / Business
  'data analysis', 'project management', 'agile', 'scrum', 'client management',
  'client comms', 'stakeholder management', 'presentation', 'public speaking',
  'leadership', 'team management', 'communication', 'research', 'writing',
  'marketing', 'social media', 'seo', 'growth hacking', 'product management',
  'business development', 'sales', 'consulting', 'strategy',
  // Design tools
  'design tools', 'adobe suite', 'prototyping', 'wireframing',
];

const extractSkillsFromText = (text: string): string[] => {
  const lower = text.toLowerCase();
  return [...new Set(SKILL_PATTERNS.filter((skill) => lower.includes(skill)))];
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
  file: Express.Multer.File
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

  // 2. Extract skills from parsed text
  const skills = extractSkillsFromText(parsedText);

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

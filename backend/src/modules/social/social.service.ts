import { prisma } from '../../config/prisma';
import { cloudinary } from '../../config/cloudinary';
import { env } from '../../config/env';
import { SocialPlatform } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { analyzeScreenshotWithVision } from './social.vision';
import { Readable } from 'stream';

// Upload screenshot image to Cloudinary
const uploadScreenshot = (
  buffer: Buffer,
  platform: string
): Promise<{ secure_url: string; public_id: string }> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'go-off-script/social-signals',
        public_id: `${platform.toLowerCase()}_${Date.now()}`,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    Readable.from(buffer).pipe(stream);
  });

export const saveScreenshotSignal = async (
  userId: string,
  platform: SocialPlatform,
  imageFile?: Express.Multer.File,
  manualDescription?: string
) => {
  if (!Object.values(SocialPlatform).includes(platform)) {
    throw new AppError(`Unknown platform: ${platform}`, 400);
  }

  let imageUrl: string | undefined;
  let analysisResult: Awaited<ReturnType<typeof analyzeScreenshotWithVision>> | undefined;

  // 1. Upload screenshot to Cloudinary (if image provided)
  if (imageFile) {
    if (env.CLOUDINARY_API_KEY && env.CLOUDINARY_CLOUD_NAME) {
      try {
        const uploaded = await uploadScreenshot(imageFile.buffer, platform);
        imageUrl = uploaded.secure_url;
      } catch (err) {
        console.warn('[Social] Cloudinary upload failed:', err);
        // Continue — we can still analyze with text description
      }
    } else {
      console.warn('[Social] Cloudinary not configured — screenshot not stored');
    }
  }

  // 2. Run vision/text analysis
  const hasInput = imageUrl || manualDescription;
  if (hasInput) {
    analysisResult = await analyzeScreenshotWithVision(
      imageUrl ?? '',
      platform,
      manualDescription
    );
  }

  const summary = analysisResult?.summary ?? manualDescription ?? null;
  const rawData = analysisResult
    ? {
        topics: analysisResult.topics,
        industries: analysisResult.industries,
        vibes: analysisResult.vibes,
        imageUrl,
        manualDescription,
      }
    : undefined;

  // 3. Save / update signal in database
  const signal = await prisma.socialSignal.upsert({
    where: { userId_platform: { userId, platform } },
    create: {
      userId,
      platform,
      connected: true,
      summary,
      rawData: rawData ? JSON.parse(JSON.stringify(rawData)) : undefined,
    },
    update: {
      connected: true,
      summary,
      rawData: rawData ? JSON.parse(JSON.stringify(rawData)) : undefined,
      updatedAt: new Date(),
    },
  });

  await prisma.userEvent.create({
    data: {
      userId,
      eventType: 'social_screenshot_uploaded',
      payload: {
        platform,
        hasImage: !!imageUrl,
        hasDescription: !!manualDescription,
        topicsFound: analysisResult?.topics?.length ?? 0,
      },
    },
  });

  return {
    signal,
    analysis: analysisResult,
  };
};

export const getSocialSignals = async (userId: string) => {
  return prisma.socialSignal.findMany({ where: { userId } });
};

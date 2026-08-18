import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, sendError } from '../../utils/response';
import { env } from '../../config/env';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/waitlist — public, no auth required
export const joinWaitlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email || !EMAIL_RE.test(email.trim())) {
      return sendError(res, 'Please provide a valid email address.', 400);
    }
    const normalised = email.trim().toLowerCase();

    const existing = await prisma.waitlistEntry.findUnique({ where: { email: normalised } });
    if (existing) {
      return sendError(res, "You're already on the list — we'll be in touch!", 409);
    }

    await prisma.waitlistEntry.create({ data: { email: normalised } });
    return sendSuccess(res, { success: true }, "You're on the waitlist!");
  } catch (err) {
    next(err);
  }
};

// GET /api/waitlist/count — public, returns total count
export const getCount = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await prisma.waitlistEntry.count();
    return sendSuccess(res, { count }, 'Count fetched');
  } catch (err) {
    next(err);
  }
};

// GET /api/waitlist — admin only, requires ADMIN_KEY header, returns CSV
export const exportEmails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (!adminKey || adminKey !== env.ADMIN_KEY) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const entries = await prisma.waitlistEntry.findMany({
      orderBy: { createdAt: 'asc' },
      select: { email: true, createdAt: true },
    });

    const csv = ['email,joined_at', ...entries.map((e) => `${e.email},${e.createdAt.toISOString()}`)].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="waitlist.csv"');
    return res.send(csv);
  } catch (err) {
    next(err);
  }
};

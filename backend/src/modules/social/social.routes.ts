import { Router } from 'express';
import multer from 'multer';
import * as socialController from './social.controller';
import { authenticate } from '../../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fileFilter: (_req: any, file: any, cb: any) => {
    cb(null, file.mimetype.startsWith('image/'));
  },
});

const router = Router();
router.use(authenticate);

// POST /api/social/signals — accepts optional image + text description
router.post('/signals', upload.single('screenshot'), socialController.uploadScreenshot);
router.get('/signals', socialController.getSignals);

export default router;

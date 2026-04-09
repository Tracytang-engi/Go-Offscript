import { Router } from 'express';
import multer from 'multer';
import * as cvController from './cv.controller';
import { authenticate } from '../../middleware/auth';

const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fileFilter: (_req: any, file: any, cb: any) => {
    cb(null, ALLOWED_MIME.includes(file.mimetype));
  },
});

const router = Router();
router.use(authenticate);

router.post('/upload', upload.single('cv'), cvController.uploadCv);
router.get('/latest', cvController.getLatestCv);
router.get('/:id/skills', cvController.getCvSkills);

export default router;

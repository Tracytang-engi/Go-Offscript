import { Router } from 'express';
import multer from 'multer';
import * as cvController from './cv.controller';
import { authenticate } from '../../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();
router.use(authenticate);

router.post('/upload', upload.single('cv'), cvController.uploadCv);
router.get('/latest', cvController.getLatestCv);
router.get('/:id/skills', cvController.getCvSkills);

export default router;

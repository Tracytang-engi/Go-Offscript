import { Router } from 'express';
import * as userController from './user.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.get('/me/profile', userController.getProfile);
router.patch('/me/profile', userController.updateProfile);

export default router;

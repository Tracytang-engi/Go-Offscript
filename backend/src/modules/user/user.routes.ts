import { Router } from 'express';
import * as userController from './user.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.get('/me/bootstrap', userController.bootstrap);
router.get('/me/profile', userController.getProfile);
router.patch('/me/profile', userController.updateProfile);
router.post('/me/saved-opportunities', userController.syncSavedOpportunity);
router.post('/me/saved-mentors', userController.syncSavedMentor);
router.post('/me/chat-messages', userController.appendChat);
router.get('/me/chat-messages', userController.getChatHistory);

export default router;

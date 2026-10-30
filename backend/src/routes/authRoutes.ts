import { Router } from 'express';
import {
  loginController,
  registerController,
  syncUserProfileController,
  getMeController,
} from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', loginController);
router.post('/register', registerController);
router.post('/profile', requireAuth, syncUserProfileController);
router.get('/me', requireAuth, getMeController);

export default router;

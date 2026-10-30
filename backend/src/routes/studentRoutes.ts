import { Router } from 'express';
import {
  getStudentPerformanceController,
  getStudentRecommendationsController,
  getStudentHistoryController,
} from '../controllers/studentController';
import { requireAuth, requireStudent } from '../middleware/authMiddleware';

const router = Router();

router.get('/performance', requireAuth, requireStudent, getStudentPerformanceController);
router.get('/recommendations', requireAuth, requireStudent, getStudentRecommendationsController);
router.get('/history', requireAuth, requireStudent, getStudentHistoryController);

export default router;

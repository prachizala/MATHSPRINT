import { Router } from 'express';
import {
  getTeacherSprintsController,
  getTeacherAnalyticsController,
} from '../controllers/teacherController';
import { requireAuth, requireTeacher } from '../middleware/authMiddleware';

const router = Router();

router.get('/sprints', requireAuth, requireTeacher, getTeacherSprintsController);
router.get('/analytics', requireAuth, requireTeacher, getTeacherAnalyticsController);

export default router;

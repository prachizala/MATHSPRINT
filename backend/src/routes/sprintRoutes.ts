import { Router } from 'express';
import {
  createSprintController,
  createLobbyForSprintController,
  getSprintController,
  startSprintController,
  endSprintController,
  cancelSprintController,
  pauseSprintController,
  resumeSprintController,
  broadcastAnnouncementController,
  getAnnouncementController,
  submitAnswerController,
  getSprintLeaderboardController,
  getSprintResultController,
} from '../controllers/sprintController';
import { requireAuth, requireTeacher, requireStudent } from '../middleware/authMiddleware';

const router = Router();

// Teacher sprint management
router.post('/', requireAuth, requireTeacher, createSprintController);
router.post('/:sprintId/lobby', requireAuth, requireTeacher, createLobbyForSprintController);
router.post('/:sprintId/start', requireAuth, requireTeacher, startSprintController);
router.post('/:sprintId/pause', requireAuth, requireTeacher, pauseSprintController);
router.post('/:sprintId/resume', requireAuth, requireTeacher, resumeSprintController);
router.post('/:sprintId/announcement', requireAuth, requireTeacher, broadcastAnnouncementController);
router.post('/:sprintId/end', requireAuth, requireTeacher, endSprintController);
router.post('/:sprintId/cancel', requireAuth, requireTeacher, cancelSprintController);

// Shared / Sprint details
router.get('/:sprintId', requireAuth, getSprintController);
router.get('/:sprintId/announcement', requireAuth, getAnnouncementController);
router.get('/:sprintId/leaderboard', requireAuth, getSprintLeaderboardController);
router.get('/:sprintId/result', requireAuth, getSprintResultController);

// Student secure answer submission
router.post('/:sprintId/answers', requireAuth, requireStudent, submitAnswerController);

export default router;

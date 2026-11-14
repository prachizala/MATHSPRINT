"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sprintController_1 = require("../controllers/sprintController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Teacher sprint management
router.post('/', authMiddleware_1.requireAuth, authMiddleware_1.requireTeacher, sprintController_1.createSprintController);
router.post('/:sprintId/lobby', authMiddleware_1.requireAuth, authMiddleware_1.requireTeacher, sprintController_1.createLobbyForSprintController);
router.post('/:sprintId/start', authMiddleware_1.requireAuth, authMiddleware_1.requireTeacher, sprintController_1.startSprintController);
router.post('/:sprintId/pause', authMiddleware_1.requireAuth, authMiddleware_1.requireTeacher, sprintController_1.pauseSprintController);
router.post('/:sprintId/resume', authMiddleware_1.requireAuth, authMiddleware_1.requireTeacher, sprintController_1.resumeSprintController);
router.post('/:sprintId/announcement', authMiddleware_1.requireAuth, authMiddleware_1.requireTeacher, sprintController_1.broadcastAnnouncementController);
router.post('/:sprintId/end', authMiddleware_1.requireAuth, authMiddleware_1.requireTeacher, sprintController_1.endSprintController);
router.post('/:sprintId/cancel', authMiddleware_1.requireAuth, authMiddleware_1.requireTeacher, sprintController_1.cancelSprintController);
// Shared / Sprint details
router.get('/:sprintId', authMiddleware_1.requireAuth, sprintController_1.getSprintController);
router.get('/:sprintId/announcement', authMiddleware_1.requireAuth, sprintController_1.getAnnouncementController);
router.get('/:sprintId/leaderboard', authMiddleware_1.requireAuth, sprintController_1.getSprintLeaderboardController);
router.get('/:sprintId/result', authMiddleware_1.requireAuth, sprintController_1.getSprintResultController);
// Student secure answer submission
router.post('/:sprintId/answers', authMiddleware_1.requireAuth, authMiddleware_1.requireStudent, sprintController_1.submitAnswerController);
exports.default = router;

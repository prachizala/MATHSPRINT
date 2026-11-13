"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacherController_1 = require("../controllers/teacherController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/sprints', authMiddleware_1.requireAuth, authMiddleware_1.requireTeacher, teacherController_1.getTeacherSprintsController);
router.get('/analytics', authMiddleware_1.requireAuth, authMiddleware_1.requireTeacher, teacherController_1.getTeacherAnalyticsController);
exports.default = router;

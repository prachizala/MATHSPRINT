"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const questionController_1 = require("../controllers/questionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.requireAuth, questionController_1.getQuestionsController);
router.post('/generate', authMiddleware_1.requireAuth, questionController_1.generateQuestionsController);
exports.default = router;

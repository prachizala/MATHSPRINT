"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const sprintRoutes_1 = __importDefault(require("./sprintRoutes"));
const lobbyRoutes_1 = __importDefault(require("./lobbyRoutes"));
const teacherRoutes_1 = __importDefault(require("./teacherRoutes"));
const studentRoutes_1 = __importDefault(require("./studentRoutes"));
const questionRoutes_1 = __importDefault(require("./questionRoutes"));
const router = (0, express_1.Router)();
// Exact required health check specification
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'MathSprint API is running',
    });
});
router.use('/auth', authRoutes_1.default);
router.use('/sprints', sprintRoutes_1.default);
router.use('/lobbies', lobbyRoutes_1.default);
router.use('/teacher', teacherRoutes_1.default);
router.use('/students', studentRoutes_1.default);
router.use('/questions', questionRoutes_1.default);
exports.default = router;

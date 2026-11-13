"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lobbyController_1 = require("../controllers/lobbyController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/join', authMiddleware_1.requireAuth, authMiddleware_1.requireStudent, lobbyController_1.joinLobbyController);
router.get('/:code', lobbyController_1.getLobbyByCodeController);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLobbyByCodeController = exports.joinLobbyController = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const firestoreDataService_1 = require("../services/firestoreDataService");
const realtimeSprintService_1 = require("../services/realtimeSprintService");
const sprintService_1 = require("../services/sprintService");
const joinLobbyController = async (req, res) => {
    try {
        const { code } = req.body;
        const studentId = req.user?.uid;
        const studentName = req.user?.name || 'Student';
        if (!code) {
            return (0, responseHelper_1.sendError)(res, 'PIN code is required to join a sprint', 400);
        }
        if (!studentId) {
            return (0, responseHelper_1.sendError)(res, 'Authentication required', 401);
        }
        const cleanCode = code.toString().replace(/\s/g, '').trim();
        const lobby = await firestoreDataService_1.FirestoreDataService.getLobbyByCode(cleanCode);
        if (!lobby) {
            return (0, responseHelper_1.sendError)(res, 'Lobby not found. Please check your 6-digit PIN code.', 404);
        }
        if (lobby.status === 'ENDED' || lobby.status === 'CANCELLED') {
            return (0, responseHelper_1.sendError)(res, `Cannot join lobby. Sprint has already ${lobby.status.toLowerCase()}.`, 400);
        }
        const sprintId = lobby.sprintId || lobby.lobbyId;
        const sprint = await firestoreDataService_1.FirestoreDataService.getSprint(sprintId);
        // Add student to Realtime Database live participants
        await realtimeSprintService_1.RealtimeSprintService.addParticipant(sprintId, {
            studentId,
            name: studentName,
        });
        // Get sanitized questions for the sprint (never include answers during waiting/live)
        let questions = [];
        if (sprint) {
            const allQ = await firestoreDataService_1.FirestoreDataService.getQuestionsByIds(sprint.questionIds || []);
            questions = sprintService_1.SprintService.sanitizeQuestions(allQ);
        }
        return (0, responseHelper_1.sendSuccess)(res, {
            lobbyId: lobby.lobbyId,
            sprintId,
            code: lobby.code,
            sprintName: lobby.sprintName,
            topic: lobby.topic,
            difficulty: lobby.difficulty,
            timeLimit: lobby.timeLimit,
            status: lobby.status,
            questions,
        }, 'Successfully joined sprint lobby');
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.joinLobbyController = joinLobbyController;
const getLobbyByCodeController = async (req, res) => {
    try {
        const { code } = req.params;
        if (!code) {
            return (0, responseHelper_1.sendError)(res, 'Lobby PIN code is required', 400);
        }
        const cleanCode = code.toString().replace(/\s/g, '').trim();
        const lobby = await firestoreDataService_1.FirestoreDataService.getLobbyByCode(cleanCode);
        if (!lobby) {
            return (0, responseHelper_1.sendError)(res, 'Lobby not found. Please verify the code.', 404);
        }
        const sprintId = lobby.sprintId || lobby.lobbyId;
        const sprint = await firestoreDataService_1.FirestoreDataService.getSprint(sprintId);
        return (0, responseHelper_1.sendSuccess)(res, {
            lobbyId: lobby.lobbyId,
            sprintId,
            code: lobby.code,
            sprintName: lobby.sprintName,
            topic: lobby.topic,
            difficulty: lobby.difficulty,
            timeLimit: lobby.timeLimit,
            status: lobby.status,
            questionCount: lobby.questionCount,
            startedAt: sprint?.startedAt || null,
        });
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.getLobbyByCodeController = getLobbyByCodeController;

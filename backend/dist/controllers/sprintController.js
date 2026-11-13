"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSprintResultController = exports.getSprintLeaderboardController = exports.submitAnswerController = exports.getAnnouncementController = exports.broadcastAnnouncementController = exports.resumeSprintController = exports.pauseSprintController = exports.cancelSprintController = exports.endSprintController = exports.startSprintController = exports.getSprintController = exports.createLobbyForSprintController = exports.createSprintController = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const firestoreDataService_1 = require("../services/firestoreDataService");
const realtimeSprintService_1 = require("../services/realtimeSprintService");
const sprintService_1 = require("../services/sprintService");
const scoringService_1 = require("../services/scoringService");
// ==================== 1. CREATE SPRINT (Teacher) ====================
const createSprintController = async (req, res) => {
    try {
        const { name, topic, difficulty, questionCount, timeLimit, questions } = req.body;
        const teacherId = req.user?.uid || 'teacher-default';
        const sprintId = `sprint-${Date.now()}`;
        const count = questionCount || 10;
        const limit = timeLimit || 120; // 2 minutes
        // Prepare questions with fair-play shuffling
        let questionIds = [];
        if (Array.isArray(questions) && questions.length > 0) {
            for (const q of questions) {
                const qId = q.questionId || `q-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
                const fq = {
                    questionId: qId,
                    question: q.question,
                    options: q.options,
                    answer: q.answer,
                    explanation: q.explanation || '',
                    topic: q.topic || topic || 'General Math',
                    difficulty: q.difficulty || difficulty || 'medium',
                    createdAt: Date.now(),
                };
                await firestoreDataService_1.FirestoreDataService.saveQuestion(fq);
                questionIds.push(qId);
            }
        }
        else {
            // Use existing question bank with fair-play shuffling
            const available = await firestoreDataService_1.FirestoreDataService.getAllQuestions(topic);
            const shuffled = sprintService_1.SprintService.shuffleQuestions(available);
            if (shuffled.length >= count) {
                questionIds = shuffled.slice(0, count).map((q) => q.questionId);
            }
            else {
                const allQuestions = await firestoreDataService_1.FirestoreDataService.getAllQuestions();
                const pool = Array.from(new Set([...shuffled, ...sprintService_1.SprintService.shuffleQuestions(allQuestions)]));
                questionIds = pool.slice(0, count).map((q) => q.questionId);
            }
        }
        const newSprint = {
            sprintId,
            lobbyId: '',
            teacherId,
            name: name || '2-Minute Math Sprint Battle',
            topic: topic || 'Arithmetic & Logic',
            difficulty: difficulty || 'medium',
            questionCount: questionIds.length,
            timeLimit: limit,
            status: 'DRAFT',
            createdAt: Date.now(),
            startedAt: null,
            endedAt: null,
            questionIds,
        };
        await firestoreDataService_1.FirestoreDataService.saveSprint(newSprint);
        return (0, responseHelper_1.sendSuccess)(res, newSprint, 'Sprint created in DRAFT state', 201);
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.createSprintController = createSprintController;
// ==================== 2. CREATE/OPEN LOBBY FOR SPRINT (Teacher) ====================
const createLobbyForSprintController = async (req, res) => {
    try {
        const sprintId = String(req.params.sprintId);
        const sprint = await firestoreDataService_1.FirestoreDataService.getSprint(sprintId);
        if (!sprint) {
            return (0, responseHelper_1.sendError)(res, 'Sprint not found', 404);
        }
        // Generate unique 6-digit lobby pin
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const lobbyId = `lobby-${Date.now()}`;
        const newLobby = {
            lobbyId,
            code,
            teacherId: sprint.teacherId,
            sprintName: sprint.name,
            topic: sprint.topic,
            difficulty: sprint.difficulty,
            questionCount: sprint.questionCount,
            timeLimit: sprint.timeLimit,
            status: 'WAITING',
            startTime: null,
            createdAt: Date.now(),
            sprintId,
        };
        // Update sprint with lobbyId and status WAITING
        await firestoreDataService_1.FirestoreDataService.saveLobby(newLobby);
        await firestoreDataService_1.FirestoreDataService.updateSprintStatus(sprintId, 'WAITING', { lobbyId });
        // Initialize Realtime Database room for live telemetry
        await realtimeSprintService_1.RealtimeSprintService.initLiveSprint(sprintId);
        return (0, responseHelper_1.sendSuccess)(res, {
            lobby: newLobby,
            sprint: { ...sprint, lobbyId, status: 'WAITING' },
        }, 'Lobby opened in WAITING state', 201);
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.createLobbyForSprintController = createLobbyForSprintController;
// ==================== 3. GET SPRINT DETAILS ====================
const getSprintController = async (req, res) => {
    try {
        const sprintParam = String(req.params.sprintId);
        let sprint = await firestoreDataService_1.FirestoreDataService.getSprint(sprintParam);
        let lobby = null;
        if (!sprint) {
            lobby = await firestoreDataService_1.FirestoreDataService.getLobby(sprintParam);
            if (lobby && lobby.sprintId) {
                sprint = await firestoreDataService_1.FirestoreDataService.getSprint(lobby.sprintId);
            }
        }
        else if (sprint.lobbyId) {
            lobby = await firestoreDataService_1.FirestoreDataService.getLobby(sprint.lobbyId);
        }
        // Auto-provision practice drill if requested by topic recommendation
        if (!sprint && sprintParam.startsWith('drill-')) {
            const topicRaw = sprintParam.replace('drill-', '');
            const topicName = topicRaw.charAt(0).toUpperCase() + topicRaw.slice(1);
            const available = await firestoreDataService_1.FirestoreDataService.getAllQuestions(topicName);
            const drillSprint = {
                sprintId: sprintParam,
                lobbyId: `lobby-${sprintParam}`,
                teacherId: 'system-practice',
                name: `${topicName} Practice Drill`,
                topic: topicName,
                difficulty: 'medium',
                questionCount: Math.min(available.length, 10),
                timeLimit: 120,
                status: 'LIVE',
                createdAt: Date.now(),
                startedAt: Date.now(),
                endedAt: Date.now() + 120000,
                questionIds: available.slice(0, 10).map((q) => q.questionId),
            };
            await firestoreDataService_1.FirestoreDataService.saveSprint(drillSprint);
            await realtimeSprintService_1.RealtimeSprintService.updateSprintState(sprintParam, 'LIVE', drillSprint.startedAt, drillSprint.endedAt);
            sprint = drillSprint;
        }
        if (!sprint) {
            return (0, responseHelper_1.sendError)(res, 'Sprint not found', 404);
        }
        // Check timer expiry
        await sprintService_1.SprintService.checkAndEnforceTimer(sprint);
        const questions = await firestoreDataService_1.FirestoreDataService.getQuestionsByIds(sprint.questionIds || []);
        const isTeacher = req.user?.role === 'teacher';
        const isEnded = sprint.status === 'ENDED';
        // Do NOT expose answers to students while sprint is active
        const clientQuestions = (isTeacher || isEnded)
            ? questions
            : sprintService_1.SprintService.sanitizeQuestions(questions);
        return (0, responseHelper_1.sendSuccess)(res, {
            ...sprint,
            code: lobby?.code,
            questions: clientQuestions,
        });
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.getSprintController = getSprintController;
// ==================== 4. START SPRINT (Teacher) ====================
const startSprintController = async (req, res) => {
    try {
        const sprintId = String(req.params.sprintId);
        const started = await sprintService_1.SprintService.startSprint(sprintId);
        return (0, responseHelper_1.sendSuccess)(res, started, 'Sprint started! Status is now LIVE');
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 400);
    }
};
exports.startSprintController = startSprintController;
// ==================== 5. END SPRINT (Teacher) ====================
const endSprintController = async (req, res) => {
    try {
        const sprintId = String(req.params.sprintId);
        const ended = await sprintService_1.SprintService.endSprint(sprintId);
        return (0, responseHelper_1.sendSuccess)(res, ended, 'Sprint ended');
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 400);
    }
};
exports.endSprintController = endSprintController;
// ==================== 5B. CANCEL SPRINT (Teacher) ====================
const cancelSprintController = async (req, res) => {
    try {
        const sprintId = String(req.params.sprintId);
        let resolvedSprintId = sprintId;
        let sprint = await firestoreDataService_1.FirestoreDataService.getSprint(sprintId);
        if (!sprint) {
            const lobby = await firestoreDataService_1.FirestoreDataService.getLobby(sprintId);
            if (lobby && lobby.sprintId) {
                resolvedSprintId = lobby.sprintId;
            }
        }
        const cancelled = await sprintService_1.SprintService.cancelSprint(resolvedSprintId);
        return (0, responseHelper_1.sendSuccess)(res, cancelled, 'Sprint cancelled');
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 400);
    }
};
exports.cancelSprintController = cancelSprintController;
// ==================== 5C. PAUSE SPRINT (Teacher) ====================
const pauseSprintController = async (req, res) => {
    try {
        const sprintId = String(req.params.sprintId);
        let resolvedSprintId = sprintId;
        let sprint = await firestoreDataService_1.FirestoreDataService.getSprint(sprintId);
        if (!sprint) {
            const lobby = await firestoreDataService_1.FirestoreDataService.getLobby(sprintId);
            if (lobby && lobby.sprintId) {
                resolvedSprintId = lobby.sprintId;
            }
        }
        const paused = await sprintService_1.SprintService.pauseSprint(resolvedSprintId);
        return (0, responseHelper_1.sendSuccess)(res, paused, 'Sprint paused');
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 400);
    }
};
exports.pauseSprintController = pauseSprintController;
// ==================== 5D. RESUME SPRINT (Teacher) ====================
const resumeSprintController = async (req, res) => {
    try {
        const sprintId = String(req.params.sprintId);
        let resolvedSprintId = sprintId;
        let sprint = await firestoreDataService_1.FirestoreDataService.getSprint(sprintId);
        if (!sprint) {
            const lobby = await firestoreDataService_1.FirestoreDataService.getLobby(sprintId);
            if (lobby && lobby.sprintId) {
                resolvedSprintId = lobby.sprintId;
            }
        }
        const resumed = await sprintService_1.SprintService.resumeSprint(resolvedSprintId);
        return (0, responseHelper_1.sendSuccess)(res, resumed, 'Sprint resumed');
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 400);
    }
};
exports.resumeSprintController = resumeSprintController;
// ==================== 5E. BROADCAST ANNOUNCEMENT (Teacher) ====================
const broadcastAnnouncementController = async (req, res) => {
    try {
        const sprintId = String(req.params.sprintId);
        const { message } = req.body;
        if (!message) {
            return (0, responseHelper_1.sendError)(res, 'message is required', 400);
        }
        let resolvedSprintId = sprintId;
        const lobby = await firestoreDataService_1.FirestoreDataService.getLobby(sprintId);
        if (lobby && lobby.sprintId) {
            resolvedSprintId = lobby.sprintId;
        }
        const announcement = await realtimeSprintService_1.RealtimeSprintService.setAnnouncement(resolvedSprintId, message);
        return (0, responseHelper_1.sendSuccess)(res, announcement, 'Announcement broadcasted successfully');
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.broadcastAnnouncementController = broadcastAnnouncementController;
// ==================== 5F. GET ACTIVE ANNOUNCEMENT ====================
const getAnnouncementController = async (req, res) => {
    try {
        const sprintId = String(req.params.sprintId);
        let resolvedSprintId = sprintId;
        const lobby = await firestoreDataService_1.FirestoreDataService.getLobby(sprintId);
        if (lobby && lobby.sprintId) {
            resolvedSprintId = lobby.sprintId;
        }
        const announcement = await realtimeSprintService_1.RealtimeSprintService.getAnnouncement(resolvedSprintId);
        return (0, responseHelper_1.sendSuccess)(res, announcement);
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.getAnnouncementController = getAnnouncementController;
// ==================== 6. SECURE ANSWER SUBMISSION (Student) ====================
const submitAnswerController = async (req, res) => {
    try {
        const sprintId = String(req.params.sprintId);
        const { questionId, selectedAnswer, responseTimeMs } = req.body;
        const studentId = req.user?.uid;
        const studentName = req.user?.name || 'Student';
        if (!studentId) {
            return (0, responseHelper_1.sendError)(res, 'Authenticated student required', 401);
        }
        if (!questionId || selectedAnswer === undefined) {
            return (0, responseHelper_1.sendError)(res, 'questionId and selectedAnswer are required', 400);
        }
        // 1. Verify sprint exists (resolves sprintId or lobbyId)
        let resolvedSprintId = sprintId;
        let sprint = await firestoreDataService_1.FirestoreDataService.getSprint(sprintId);
        if (!sprint) {
            const lobby = await firestoreDataService_1.FirestoreDataService.getLobby(sprintId);
            if (lobby && lobby.sprintId) {
                resolvedSprintId = lobby.sprintId;
                sprint = await firestoreDataService_1.FirestoreDataService.getSprint(resolvedSprintId);
            }
        }
        if (!sprint) {
            return (0, responseHelper_1.sendError)(res, 'Sprint not found', 404);
        }
        // 2. Verify sprint is LIVE & check server timer (source of truth)
        const isExpired = await sprintService_1.SprintService.checkAndEnforceTimer(sprint);
        if (isExpired || sprint.status !== 'LIVE') {
            return (0, responseHelper_1.sendError)(res, 'Sprint is not currently LIVE. Submissions closed.', 400);
        }
        // 3. Verify server time is before sprint end
        const now = Date.now();
        if (sprint.endedAt && now >= sprint.endedAt) {
            await sprintService_1.SprintService.endSprint(resolvedSprintId);
            return (0, responseHelper_1.sendError)(res, 'Sprint time limit of 120 seconds has elapsed.', 400);
        }
        // 4. Verify question belongs to sprint
        if (!sprint.questionIds || !sprint.questionIds.includes(questionId)) {
            return (0, responseHelper_1.sendError)(res, 'Question does not belong to this sprint', 400);
        }
        // 5. Prevent duplicate submission for this question
        const existingAnswer = await firestoreDataService_1.FirestoreDataService.getStudentAnswerForQuestion(studentId, resolvedSprintId, questionId);
        if (existingAnswer) {
            return (0, responseHelper_1.sendError)(res, 'Duplicate submission: You have already answered this question', 409);
        }
        // 6. Record server timestamp & validate response time
        const serverTimestamp = now;
        const cleanResponseTime = Math.min(Math.max(Number(responseTimeMs) || 2000, 200), 30000);
        // 7. Validate answer on the server
        const question = await firestoreDataService_1.FirestoreDataService.getQuestion(questionId);
        if (!question) {
            return (0, responseHelper_1.sendError)(res, 'Question data not found', 404);
        }
        const isCorrect = selectedAnswer.toString().trim().toLowerCase() === question.answer.toString().trim().toLowerCase();
        // 8. Fetch current student score & streak to calculate new points
        let currentScoreRecord = await firestoreDataService_1.FirestoreDataService.getStudentScore(studentId, resolvedSprintId);
        const currentStreak = currentScoreRecord ? currentScoreRecord.streak : 0;
        // 9. Calculate score with ScoringService
        const scoreOutput = scoringService_1.ScoringService.calculateScore({
            isCorrect,
            responseTimeMs: cleanResponseTime,
            currentStreak,
        });
        const newStreak = isCorrect ? currentStreak + 1 : 0;
        const totalScore = (currentScoreRecord?.score || 0) + scoreOutput.totalPoints;
        const correctAnswers = (currentScoreRecord?.correctAnswers || 0) + (isCorrect ? 1 : 0);
        const totalQuestions = (currentScoreRecord?.totalQuestions || 0) + 1;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        // 10. Save answer record in Firestore
        const answerId = `ans-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const answerDoc = {
            answerId,
            studentId,
            sprintId: resolvedSprintId,
            questionId,
            selectedAnswer: selectedAnswer.toString(),
            correct: isCorrect,
            timestamp: serverTimestamp,
            responseTime: cleanResponseTime,
        };
        await firestoreDataService_1.FirestoreDataService.saveAnswer(answerDoc);
        // 11. Save updated score in Firestore
        const scoreDoc = {
            scoreId: `${studentId}_${resolvedSprintId}`,
            studentId,
            sprintId: resolvedSprintId,
            score: totalScore,
            accuracy,
            streak: newStreak,
            correctAnswers,
            totalQuestions,
            updatedAt: serverTimestamp,
        };
        await firestoreDataService_1.FirestoreDataService.saveScore(scoreDoc);
        // 12. Update Realtime Database live participants & live leaderboard
        await realtimeSprintService_1.RealtimeSprintService.updateParticipantProgress(resolvedSprintId, studentId, scoreOutput.totalPoints, newStreak);
        // 13. Return updated score to student (DO NOT return correct answers of upcoming questions)
        return (0, responseHelper_1.sendSuccess)(res, {
            correct: isCorrect,
            pointsAwarded: scoreOutput.totalPoints,
            basePoints: scoreOutput.basePoints,
            speedBonus: scoreOutput.speedBonus,
            streakBonus: scoreOutput.streakBonus,
            totalScore,
            streak: newStreak,
            totalQuestionsAnswered: totalQuestions,
        }, 'Answer processed securely');
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.submitAnswerController = submitAnswerController;
// ==================== 7. GET LIVE LEADERBOARD ====================
const getSprintLeaderboardController = async (req, res) => {
    try {
        const sprintId = String(req.params.sprintId);
        let resolvedSprintId = sprintId;
        const lobby = await firestoreDataService_1.FirestoreDataService.getLobby(sprintId);
        if (lobby && lobby.sprintId) {
            resolvedSprintId = lobby.sprintId;
        }
        const leaderboard = await realtimeSprintService_1.RealtimeSprintService.getLeaderboard(resolvedSprintId);
        return (0, responseHelper_1.sendSuccess)(res, leaderboard);
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.getSprintLeaderboardController = getSprintLeaderboardController;
// ==================== 8. GET FINAL SPRINT RESULT & SOLUTIONS ====================
const getSprintResultController = async (req, res) => {
    try {
        const sprintParam = String(req.params.sprintId);
        const studentId = req.user?.uid;
        if (!studentId) {
            return (0, responseHelper_1.sendError)(res, 'Authentication required', 401);
        }
        let sprint = await firestoreDataService_1.FirestoreDataService.getSprint(sprintParam);
        let resolvedSprintId = sprintParam;
        if (!sprint) {
            const lobby = await firestoreDataService_1.FirestoreDataService.getLobby(sprintParam);
            if (lobby && lobby.sprintId) {
                resolvedSprintId = lobby.sprintId;
                sprint = await firestoreDataService_1.FirestoreDataService.getSprint(resolvedSprintId);
            }
        }
        if (!sprint) {
            return (0, responseHelper_1.sendError)(res, 'Sprint not found', 404);
        }
        await sprintService_1.SprintService.checkAndEnforceTimer(sprint);
        const scoreRecord = await firestoreDataService_1.FirestoreDataService.getStudentScore(studentId, resolvedSprintId);
        const answers = await firestoreDataService_1.FirestoreDataService.getStudentAnswersForSprint(studentId, resolvedSprintId);
        const questions = await firestoreDataService_1.FirestoreDataService.getQuestionsByIds(sprint.questionIds || []);
        // Unlock solutions only if sprint has ENDED
        const solutionsUnlocked = sprint.status === 'ENDED';
        const liveState = await realtimeSprintService_1.RealtimeSprintService.getLiveSprint(resolvedSprintId);
        const studentRank = liveState?.leaderboard?.[studentId]?.rank || 1;
        const responseTimes = answers.map((a) => a.responseTime).filter((t) => t > 0);
        const fastestResponseMs = responseTimes.length > 0 ? Math.min(...responseTimes) : 1800;
        const questionSolutions = solutionsUnlocked
            ? questions.map((q) => {
                const studentAns = answers.find((a) => a.questionId === q.questionId);
                return {
                    questionId: q.questionId,
                    question: q.question,
                    options: q.options,
                    answer: q.answer,
                    explanation: q.explanation,
                    selectedAnswer: studentAns?.selectedAnswer || null,
                    isCorrect: studentAns?.correct || false,
                    responseTime: studentAns?.responseTime || 0,
                };
            })
            : [];
        return (0, responseHelper_1.sendSuccess)(res, {
            sprintId: resolvedSprintId,
            sprintName: sprint.name,
            status: sprint.status,
            score: scoreRecord?.score || 0,
            accuracy: scoreRecord?.accuracy || 0,
            streak: scoreRecord?.streak || 0,
            rank: studentRank,
            fastestResponseMs,
            correctAnswers: scoreRecord?.correctAnswers || 0,
            totalQuestions: sprint.questionCount || questions.length,
            solutionsUnlocked,
            solutions: questionSolutions,
        });
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.getSprintResultController = getSprintResultController;

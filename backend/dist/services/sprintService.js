"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SprintService = void 0;
const firestoreDataService_1 = require("./firestoreDataService");
const realtimeSprintService_1 = require("./realtimeSprintService");
class SprintService {
    /**
     * Validate state transition
     */
    static isValidTransition(current, target) {
        const validTransitions = {
            DRAFT: ['WAITING', 'CANCELLED'],
            WAITING: ['LIVE', 'CANCELLED'],
            LIVE: ['PAUSED', 'ENDED', 'CANCELLED'],
            PAUSED: ['LIVE', 'ENDED', 'CANCELLED'],
            ENDED: [], // Cannot transition out of ENDED
            CANCELLED: [], // Cannot transition out of CANCELLED
        };
        return validTransitions[current]?.includes(target) || false;
    }
    /**
     * Start a sprint (Teacher only, WAITING -> LIVE)
     */
    static async startSprint(sprintId) {
        const sprint = await firestoreDataService_1.FirestoreDataService.getSprint(sprintId);
        if (!sprint) {
            throw new Error(`Sprint not found: ${sprintId}`);
        }
        if (sprint.status !== 'WAITING') {
            throw new Error(`Cannot start sprint in status '${sprint.status}'. Must be 'WAITING'.`);
        }
        const now = Date.now();
        const durationSeconds = sprint.timeLimit || 120;
        const endedAt = now + durationSeconds * 1000;
        await firestoreDataService_1.FirestoreDataService.updateSprintStatus(sprintId, 'LIVE', {
            startedAt: now,
            endedAt,
        });
        if (sprint.lobbyId) {
            await firestoreDataService_1.FirestoreDataService.updateLobbyStatus(sprint.lobbyId, 'LIVE', now);
        }
        // Sync RTDB
        await realtimeSprintService_1.RealtimeSprintService.updateSprintState(sprintId, 'LIVE', now, endedAt);
        return {
            ...sprint,
            status: 'LIVE',
            startedAt: now,
            endedAt,
        };
    }
    /**
     * End a sprint (LIVE -> ENDED)
     */
    static async endSprint(sprintId) {
        const sprint = await firestoreDataService_1.FirestoreDataService.getSprint(sprintId);
        if (!sprint) {
            throw new Error(`Sprint not found: ${sprintId}`);
        }
        if (sprint.status === 'ENDED') {
            return sprint;
        }
        if (sprint.status !== 'LIVE' && sprint.status !== 'WAITING') {
            throw new Error(`Cannot end sprint in status '${sprint.status}'.`);
        }
        const now = Date.now();
        await firestoreDataService_1.FirestoreDataService.updateSprintStatus(sprintId, 'ENDED', {
            endedAt: now,
        });
        if (sprint.lobbyId) {
            await firestoreDataService_1.FirestoreDataService.updateLobbyStatus(sprint.lobbyId, 'ENDED');
        }
        // Sync RTDB
        await realtimeSprintService_1.RealtimeSprintService.updateSprintState(sprintId, 'ENDED', sprint.startedAt, now);
        return {
            ...sprint,
            status: 'ENDED',
            endedAt: now,
        };
    }
    /**
     * Cancel a sprint (DRAFT / WAITING / LIVE -> CANCELLED)
     */
    static async cancelSprint(sprintId) {
        const sprint = await firestoreDataService_1.FirestoreDataService.getSprint(sprintId);
        if (!sprint) {
            throw new Error(`Sprint not found: ${sprintId}`);
        }
        if (sprint.status === 'ENDED' || sprint.status === 'CANCELLED') {
            return sprint;
        }
        const now = Date.now();
        await firestoreDataService_1.FirestoreDataService.updateSprintStatus(sprintId, 'CANCELLED', {
            endedAt: now,
        });
        if (sprint.lobbyId) {
            await firestoreDataService_1.FirestoreDataService.updateLobbyStatus(sprint.lobbyId, 'CANCELLED');
        }
        // Sync RTDB
        await realtimeSprintService_1.RealtimeSprintService.updateSprintState(sprintId, 'CANCELLED', sprint.startedAt, now);
        return {
            ...sprint,
            status: 'CANCELLED',
            endedAt: now,
        };
    }
    /**
     * Pause a live sprint (LIVE -> PAUSED)
     */
    static async pauseSprint(sprintId) {
        const sprint = await firestoreDataService_1.FirestoreDataService.getSprint(sprintId);
        if (!sprint) {
            throw new Error(`Sprint not found: ${sprintId}`);
        }
        if (sprint.status === 'PAUSED') {
            return sprint;
        }
        if (sprint.status !== 'LIVE') {
            throw new Error(`Cannot pause sprint in status '${sprint.status}'. Must be LIVE.`);
        }
        const now = Date.now();
        const remainingMs = Math.max(0, (sprint.endedAt || (now + 120000)) - now);
        await firestoreDataService_1.FirestoreDataService.updateSprintStatus(sprintId, 'PAUSED', {
            pausedAt: now,
            remainingMs,
        });
        if (sprint.lobbyId) {
            await firestoreDataService_1.FirestoreDataService.updateLobbyStatus(sprint.lobbyId, 'PAUSED');
        }
        // Sync RTDB
        await realtimeSprintService_1.RealtimeSprintService.updateSprintState(sprintId, 'PAUSED', sprint.startedAt, sprint.endedAt);
        return {
            ...sprint,
            status: 'PAUSED',
            pausedAt: now,
            remainingMs,
        };
    }
    /**
     * Resume a paused sprint (PAUSED -> LIVE)
     */
    static async resumeSprint(sprintId) {
        const sprint = await firestoreDataService_1.FirestoreDataService.getSprint(sprintId);
        if (!sprint) {
            throw new Error(`Sprint not found: ${sprintId}`);
        }
        if (sprint.status === 'LIVE') {
            return sprint;
        }
        if (sprint.status !== 'PAUSED') {
            throw new Error(`Cannot resume sprint in status '${sprint.status}'. Must be PAUSED.`);
        }
        const now = Date.now();
        const remainingMs = sprint.remainingMs || 60000;
        const newEndedAt = now + remainingMs;
        await firestoreDataService_1.FirestoreDataService.updateSprintStatus(sprintId, 'LIVE', {
            pausedAt: null,
            remainingMs: null,
            endedAt: newEndedAt,
        });
        if (sprint.lobbyId) {
            await firestoreDataService_1.FirestoreDataService.updateLobbyStatus(sprint.lobbyId, 'LIVE');
        }
        // Sync RTDB with updated endTime
        await realtimeSprintService_1.RealtimeSprintService.updateSprintState(sprintId, 'LIVE', sprint.startedAt, newEndedAt);
        return {
            ...sprint,
            status: 'LIVE',
            pausedAt: null,
            remainingMs: null,
            endedAt: newEndedAt,
        };
    }
    /**
     * Check if sprint has reached its server end time and auto-end if expired
     */
    static async checkAndEnforceTimer(sprint) {
        if (sprint.status !== 'LIVE') {
            return sprint.status === 'ENDED';
        }
        const now = Date.now();
        if (sprint.endedAt && now >= sprint.endedAt) {
            // Auto-end expired sprint on the server
            await this.endSprint(sprint.sprintId);
            return true; // Is expired
        }
        return false; // Still active
    }
    /**
     * Fisher-Yates array shuffling utility for fair-play randomization
     */
    static shuffleArray(array) {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }
    /**
     * Randomize question order for participants
     */
    static shuffleQuestions(questions) {
        return this.shuffleArray(questions);
    }
    /**
     * Filter questions for clients:
     * 1. Strips answer and explanation (no answer leaks during active sprint!)
     * 2. Permutes option positions (A/B/C/D) randomly so adjacent students cannot copy option letters
     */
    static sanitizeQuestions(questions) {
        return questions.map((q) => ({
            questionId: q.questionId,
            question: q.question,
            options: this.shuffleArray(q.options),
            topic: q.topic,
            difficulty: q.difficulty,
            createdAt: q.createdAt,
        }));
    }
}
exports.SprintService = SprintService;

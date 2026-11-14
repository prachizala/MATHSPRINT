"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeSprintService = void 0;
const firebaseAdmin_1 = require("../config/firebaseAdmin");
// In-memory fallback cache for RTDB state
const liveSprintsMemory = new Map();
// Seed default demo sprint in liveSprints
liveSprintsMemory.set('sprint-demo-1', {
    status: 'WAITING',
    startTime: null,
    endTime: null,
    participants: {
        'demo-student-1': {
            studentId: 'demo-student-1',
            name: 'Alex Rivera',
            joined: Date.now() - 20000,
            answered: 0,
            score: 0,
            streak: 0,
            lastUpdate: Date.now(),
        },
        'demo-student-2': {
            studentId: 'demo-student-2',
            name: 'Maya Chen',
            joined: Date.now() - 15000,
            answered: 0,
            score: 0,
            streak: 0,
            lastUpdate: Date.now(),
        },
    },
    leaderboard: {},
    progress: {
        totalParticipants: 2,
        totalAnswered: 0,
        averageScore: 0,
    },
});
class RealtimeSprintService {
    /**
     * Initializes a live sprint room in Realtime Database.
     * NEVER stores question answer keys here!
     */
    static async initLiveSprint(sprintId) {
        const initialState = {
            status: 'WAITING',
            startTime: null,
            endTime: null,
            participants: {},
            leaderboard: {},
            progress: {
                totalParticipants: 0,
                totalAnswered: 0,
                averageScore: 0,
            },
        };
        liveSprintsMemory.set(sprintId, initialState);
        if (firebaseAdmin_1.isFirebaseAdminInitialized && firebaseAdmin_1.adminRtdb) {
            try {
                await firebaseAdmin_1.adminRtdb.ref(`liveSprints/${sprintId}`).set(initialState);
            }
            catch (err) {
                console.warn('[RealtimeSprintService] RTDB set error:', err);
            }
        }
    }
    /**
     * Transition sprint status (e.g. WAITING -> LIVE, LIVE -> ENDED)
     */
    static async updateSprintState(sprintId, status, startTime = null, endTime = null) {
        const patch = { status };
        if (startTime !== null)
            patch.startTime = startTime;
        if (endTime !== null)
            patch.endTime = endTime;
        const current = liveSprintsMemory.get(sprintId) || {
            status,
            startTime,
            endTime,
            participants: {},
            leaderboard: {},
            progress: { totalParticipants: 0, totalAnswered: 0, averageScore: 0 },
        };
        liveSprintsMemory.set(sprintId, { ...current, ...patch });
        if (firebaseAdmin_1.isFirebaseAdminInitialized && firebaseAdmin_1.adminRtdb) {
            try {
                await firebaseAdmin_1.adminRtdb.ref(`liveSprints/${sprintId}`).update(patch);
            }
            catch (err) {
                console.warn('[RealtimeSprintService] RTDB update state error:', err);
            }
        }
    }
    /**
     * Add student to live sprint participants when they join
     */
    static async addParticipant(sprintId, participant) {
        const liveParticipant = {
            studentId: participant.studentId,
            name: participant.name,
            joined: Date.now(),
            answered: 0,
            score: 0,
            streak: 0,
            lastUpdate: Date.now(),
            status: 'Thinking',
        };
        const state = liveSprintsMemory.get(sprintId) || {
            status: 'WAITING',
            startTime: null,
            endTime: null,
            participants: {},
            leaderboard: {},
            progress: { totalParticipants: 0, totalAnswered: 0, averageScore: 0 },
        };
        state.participants[participant.studentId] = liveParticipant;
        state.progress.totalParticipants = Object.keys(state.participants).length;
        liveSprintsMemory.set(sprintId, state);
        if (firebaseAdmin_1.isFirebaseAdminInitialized && firebaseAdmin_1.adminRtdb) {
            try {
                await firebaseAdmin_1.adminRtdb
                    .ref(`liveSprints/${sprintId}/participants/${participant.studentId}`)
                    .set(liveParticipant);
                await firebaseAdmin_1.adminRtdb
                    .ref(`liveSprints/${sprintId}/progress/totalParticipants`)
                    .set(state.progress.totalParticipants);
            }
            catch (err) {
                console.warn('[RealtimeSprintService] RTDB addParticipant error:', err);
            }
        }
    }
    /**
     * Update student score, streak, answers count, and recalculate leaderboard rankings
     */
    static async updateParticipantProgress(sprintId, studentId, scoreAwarded, streak) {
        const state = liveSprintsMemory.get(sprintId) || {
            status: 'LIVE',
            startTime: null,
            endTime: null,
            participants: {},
            leaderboard: {},
            progress: { totalParticipants: 0, totalAnswered: 0, averageScore: 0 },
        };
        const participant = state.participants[studentId] || {
            studentId,
            name: 'Student',
            joined: Date.now(),
            answered: 0,
            score: 0,
            streak: 0,
            lastUpdate: Date.now(),
            status: 'Thinking',
        };
        participant.score += scoreAwarded;
        participant.streak = streak;
        participant.answered += 1;
        participant.status = 'Answered';
        participant.lastUpdate = Date.now();
        state.participants[studentId] = participant;
        // Recalculate ranks across participants
        const sorted = Object.values(state.participants).sort((a, b) => b.score - a.score);
        const newLeaderboard = {};
        sorted.forEach((p, index) => {
            newLeaderboard[p.studentId] = {
                studentId: p.studentId,
                name: p.name,
                score: p.score,
                rank: index + 1,
                streak: p.streak,
                status: p.status || 'Thinking',
            };
        });
        state.leaderboard = newLeaderboard;
        // Recalculate aggregate progress
        const totalAns = Object.values(state.participants).reduce((acc, p) => acc + p.answered, 0);
        const totalScore = Object.values(state.participants).reduce((acc, p) => acc + p.score, 0);
        const count = Object.keys(state.participants).length;
        state.progress.totalAnswered = totalAns;
        state.progress.averageScore = count > 0 ? Math.round(totalScore / count) : 0;
        liveSprintsMemory.set(sprintId, state);
        if (firebaseAdmin_1.isFirebaseAdminInitialized && firebaseAdmin_1.adminRtdb) {
            try {
                await firebaseAdmin_1.adminRtdb
                    .ref(`liveSprints/${sprintId}/participants/${studentId}`)
                    .update(participant);
                await firebaseAdmin_1.adminRtdb.ref(`liveSprints/${sprintId}/leaderboard`).set(newLeaderboard);
                await firebaseAdmin_1.adminRtdb.ref(`liveSprints/${sprintId}/progress`).set(state.progress);
            }
            catch (err) {
                console.warn('[RealtimeSprintService] RTDB update error:', err);
            }
        }
        return {
            newTotalScore: participant.score,
            answeredCount: participant.answered,
        };
    }
    /**
     * Broadcast teacher announcement in live sprint
     */
    static async setAnnouncement(sprintId, message) {
        const announcement = { message, timestamp: Date.now() };
        const memory = liveSprintsMemory.get(sprintId);
        if (memory) {
            memory.announcement = announcement;
        }
        if (firebaseAdmin_1.isFirebaseAdminInitialized && firebaseAdmin_1.adminRtdb) {
            try {
                await firebaseAdmin_1.adminRtdb.ref(`liveSprints/${sprintId}/announcement`).set(announcement);
            }
            catch (err) {
                console.warn('[RealtimeSprintService] RTDB setAnnouncement error:', err);
            }
        }
        return announcement;
    }
    /**
     * Get current teacher announcement
     */
    static async getAnnouncement(sprintId) {
        const state = await this.getLiveSprint(sprintId);
        return state?.announcement || null;
    }
    /**
     * Get current state of live sprint
     */
    static async getLiveSprint(sprintId) {
        if (firebaseAdmin_1.isFirebaseAdminInitialized && firebaseAdmin_1.adminRtdb) {
            try {
                const snap = await firebaseAdmin_1.adminRtdb.ref(`liveSprints/${sprintId}`).once('value');
                if (snap.exists()) {
                    return snap.val();
                }
            }
            catch (err) {
                console.warn('[RealtimeSprintService] RTDB getLiveSprint error:', err);
            }
        }
        return liveSprintsMemory.get(sprintId) || null;
    }
    /**
     * Get sorted leaderboard
     */
    static async getLeaderboard(sprintId) {
        const state = await this.getLiveSprint(sprintId);
        if (!state || !state.leaderboard)
            return [];
        return Object.values(state.leaderboard).sort((a, b) => a.rank - b.rank);
    }
}
exports.RealtimeSprintService = RealtimeSprintService;

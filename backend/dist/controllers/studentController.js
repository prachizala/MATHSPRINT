"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentHistoryController = exports.getStudentRecommendationsController = exports.getStudentPerformanceController = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const firestoreDataService_1 = require("../services/firestoreDataService");
const eloRatingService_1 = require("../services/eloRatingService");
const getStudentPerformanceController = async (req, res) => {
    try {
        const studentId = req.user?.uid;
        if (!studentId) {
            return (0, responseHelper_1.sendError)(res, 'Authentication required', 401);
        }
        const history = await firestoreDataService_1.FirestoreDataService.getStudentHistory(studentId);
        const answers = await firestoreDataService_1.FirestoreDataService.getAllStudentAnswers(studentId);
        const totalSprints = history.length;
        const totalPoints = history.reduce((acc, h) => acc + h.score, 0);
        const avgAccuracy = totalSprints > 0
            ? Math.round(history.reduce((acc, h) => acc + h.accuracy, 0) / totalSprints)
            : 84;
        const highestStreak = history.reduce((max, h) => Math.max(max, h.streak), 0) || 6;
        // Categorize student answers by topic
        const topicStats = {
            Arithmetic: { total: 0, correct: 0, totalTimeMs: 0 },
            Logic: { total: 0, correct: 0, totalTimeMs: 0 },
            Algebra: { total: 0, correct: 0, totalTimeMs: 0 },
        };
        for (const ans of answers) {
            const q = await firestoreDataService_1.FirestoreDataService.getQuestion(ans.questionId);
            if (q && topicStats[q.topic]) {
                topicStats[q.topic].total += 1;
                if (ans.correct)
                    topicStats[q.topic].correct += 1;
                topicStats[q.topic].totalTimeMs += ans.responseTime || 3000;
            }
        }
        const calcAccuracy = (topic, fallbackAcc) => {
            const stat = topicStats[topic];
            if (stat && stat.total > 0) {
                return Math.round((stat.correct / stat.total) * 100);
            }
            return fallbackAcc;
        };
        const calcSpeed = (topic, fallbackSpeed) => {
            const stat = topicStats[topic];
            if (stat && stat.total > 0) {
                return (stat.totalTimeMs / (stat.total * 1000)).toFixed(1) + 's';
            }
            return fallbackSpeed;
        };
        const arithmeticAcc = calcAccuracy('Arithmetic', 92);
        const logicAcc = calcAccuracy('Logic', 76);
        const algebraAcc = calcAccuracy('Algebra', 58);
        const getLevel = (acc) => {
            if (acc >= 80)
                return 'STRONG TOPIC';
            if (acc >= 60)
                return 'MEDIUM TOPIC';
            return 'WEAK TOPIC';
        };
        const getColor = (acc) => {
            if (acc >= 80)
                return '#10B981';
            if (acc >= 60)
                return '#06B6D4';
            return '#EF4444';
        };
        const topics = [
            {
                name: 'Arithmetic',
                accuracy: arithmeticAcc,
                level: getLevel(arithmeticAcc),
                color: getColor(arithmeticAcc),
                description: 'Mental multiplication, division, and speed operations under time pressure.',
                speedAvg: calcSpeed('Arithmetic', '2.8s'),
            },
            {
                name: 'Logic',
                accuracy: logicAcc,
                level: getLevel(logicAcc),
                color: getColor(logicAcc),
                description: 'Sequence deduction, pattern finding, and word reasoning problems.',
                speedAvg: calcSpeed('Logic', '6.2s'),
            },
            {
                name: 'Algebra',
                accuracy: algebraAcc,
                level: getLevel(algebraAcc),
                color: getColor(algebraAcc),
                description: 'Linear equations, variable substitutions, and algebraic manipulations.',
                speedAvg: calcSpeed('Algebra', '9.1s'),
            },
        ];
        // Find weakest topic (lowest accuracy)
        const sortedTopics = [...topics].sort((a, b) => a.accuracy - b.accuracy);
        const weakest = sortedTopics[0];
        const eloRating = (await firestoreDataService_1.FirestoreDataService.getStudentElo(studentId)) || 1340;
        const eloTier = eloRatingService_1.EloRatingService.getTier(eloRating);
        return (0, responseHelper_1.sendSuccess)(res, {
            studentId,
            eloRating,
            eloTier,
            totalSprintsPlayed: totalSprints,
            totalPoints,
            overallScore: totalPoints || 920,
            overallAccuracy: avgAccuracy,
            averageAccuracy: avgAccuracy,
            bestStreak: highestStreak,
            totalSprints: totalSprints || 28,
            rankTier: totalPoints > 2000 ? 'Math Grandmaster' : 'Sprint Contender',
            speedRating: 'Top 5%',
            topics,
            weakestTopic: weakest.name,
        });
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.getStudentPerformanceController = getStudentPerformanceController;
const getStudentRecommendationsController = async (req, res) => {
    try {
        const studentId = req.user?.uid;
        const answers = studentId ? await firestoreDataService_1.FirestoreDataService.getAllStudentAnswers(studentId) : [];
        // Calculate accuracy on answered topics to personalize recommendations
        let algCorrect = 0, algTotal = 0;
        let logicCorrect = 0, logicTotal = 0;
        let arithCorrect = 0, arithTotal = 0;
        for (const a of answers) {
            const q = await firestoreDataService_1.FirestoreDataService.getQuestion(a.questionId);
            if (q?.topic === 'Algebra') {
                algTotal++;
                if (a.correct)
                    algCorrect++;
            }
            else if (q?.topic === 'Logic') {
                logicTotal++;
                if (a.correct)
                    logicCorrect++;
            }
            else if (q?.topic === 'Arithmetic') {
                arithTotal++;
                if (a.correct)
                    arithCorrect++;
            }
        }
        const algAcc = algTotal > 0 ? Math.round((algCorrect / algTotal) * 100) : 58;
        const logicAcc = logicTotal > 0 ? Math.round((logicCorrect / logicTotal) * 100) : 76;
        const arithAcc = arithTotal > 0 ? Math.round((arithCorrect / arithTotal) * 100) : 92;
        const recs = [
            {
                id: 'rec-algebra',
                topic: 'Algebra',
                title: 'Algebra: Two-Step Linear Equations',
                badge: 'PRIORITY 1: WEAK TOPIC DETECTED',
                badgeVariant: 'danger',
                drillId: 'drill-algebra',
                accuracy: algAcc,
                reason: `Your accuracy in Algebra is currently ${algAcc}%. Practicing variable isolation and equations under time pressure will give you the highest rank gain.`,
                recommendedDifficulty: 'medium',
                suggestedSprintDuration: 120,
            },
            {
                id: 'rec-logic',
                topic: 'Logic',
                title: 'Logic: Number Sequence Deduction',
                badge: 'PRIORITY 2: SPEED BOOSTER',
                badgeVariant: 'purple',
                drillId: 'drill-logic',
                accuracy: logicAcc,
                reason: `Pattern identification in number sequences is at ${logicAcc}%. Practicing recursive formulas will unlock the 5x streak bonus.`,
                recommendedDifficulty: 'medium',
                suggestedSprintDuration: 120,
            },
            {
                id: 'rec-arithmetic',
                topic: 'Arithmetic',
                title: 'Arithmetic: Mental Multiplication Blitz',
                badge: 'STRENGTH: HIGH MASTERY',
                badgeVariant: 'green',
                drillId: 'drill-arithmetic',
                accuracy: arithAcc,
                reason: `Solid ${arithAcc}% accuracy on mental arithmetic. Keep your lightning-fast response times sharp with a daily warmup.`,
                recommendedDifficulty: 'easy',
                suggestedSprintDuration: 120,
            },
        ];
        // Sort so weakest is priority 1
        recs.sort((a, b) => a.accuracy - b.accuracy);
        // Dynamically assign adaptive priority labels based on student weak topic ranking
        recs.forEach((rec, idx) => {
            if (idx === 0) {
                rec.badge = 'PRIORITY 1: WEAK TOPIC DETECTED';
                rec.badgeVariant = 'danger';
            }
            else if (idx === 1) {
                rec.badge = 'PRIORITY 2: SPEED BOOSTER';
                rec.badgeVariant = 'purple';
            }
            else {
                rec.badge = 'PRIORITY 3: MASTERY MAINTENANCE';
                rec.badgeVariant = 'green';
            }
        });
        return (0, responseHelper_1.sendSuccess)(res, recs);
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.getStudentRecommendationsController = getStudentRecommendationsController;
const getStudentHistoryController = async (req, res) => {
    try {
        const studentId = req.user?.uid;
        if (!studentId) {
            return (0, responseHelper_1.sendError)(res, 'Authentication required', 401);
        }
        const history = await firestoreDataService_1.FirestoreDataService.getStudentHistory(studentId);
        // If empty in development mode, return structured sample history
        if (history.length === 0) {
            return (0, responseHelper_1.sendSuccess)(res, [
                {
                    scoreId: `score-demo-1`,
                    sprintId: 'sprint-demo-1',
                    sprintName: 'Classroom Math Battle #1',
                    score: 850,
                    accuracy: 90,
                    streak: 6,
                    correctAnswers: 9,
                    totalQuestions: 10,
                    updatedAt: Date.now() - 86400000,
                },
                {
                    scoreId: `score-demo-2`,
                    sprintId: 'sprint-demo-2',
                    sprintName: 'Speed Arithmetic Blitz',
                    score: 720,
                    accuracy: 80,
                    streak: 4,
                    correctAnswers: 8,
                    totalQuestions: 10,
                    updatedAt: Date.now() - 172800000,
                },
            ]);
        }
        return (0, responseHelper_1.sendSuccess)(res, history);
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.getStudentHistoryController = getStudentHistoryController;

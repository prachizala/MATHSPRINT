import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { FirestoreDataService } from '../services/firestoreDataService';
import { RealtimeSprintService } from '../services/realtimeSprintService';
import { SprintService } from '../services/sprintService';
import { ScoringService } from '../services/scoringService';
import {
  FirestoreSprint,
  FirestoreLobby,
  FirestoreQuestion,
  FirestoreScore,
  FirestoreAnswer,
} from '../types';

// ==================== 1. CREATE SPRINT (Teacher) ====================
export const createSprintController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, topic, difficulty, questionCount, timeLimit, questions } = req.body;
    const teacherId = req.user?.uid || 'teacher-default';

    const sprintId = `sprint-${Date.now()}`;
    const count = questionCount || 10;
    const limit = timeLimit || 120; // 2 minutes

    // Prepare questions with fair-play shuffling
    let questionIds: string[] = [];
    if (Array.isArray(questions) && questions.length > 0) {
      for (const q of questions) {
        const qId = q.questionId || `q-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const fq: FirestoreQuestion = {
          questionId: qId,
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation || '',
          topic: q.topic || topic || 'General Math',
          difficulty: q.difficulty || difficulty || 'medium',
          createdAt: Date.now(),
        };
        await FirestoreDataService.saveQuestion(fq);
        questionIds.push(qId);
      }
    } else {
      // Use existing question bank with fair-play shuffling
      const available = await FirestoreDataService.getAllQuestions(topic);
      const shuffled = SprintService.shuffleQuestions(available);
      if (shuffled.length >= count) {
        questionIds = shuffled.slice(0, count).map((q) => q.questionId);
      } else {
        const allQuestions = await FirestoreDataService.getAllQuestions();
        const pool = Array.from(new Set([...shuffled, ...SprintService.shuffleQuestions(allQuestions)]));
        questionIds = pool.slice(0, count).map((q) => q.questionId);
      }
    }

    const newSprint: FirestoreSprint = {
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

    await FirestoreDataService.saveSprint(newSprint);

    return sendSuccess(res, newSprint, 'Sprint created in DRAFT state', 201);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

// ==================== 2. CREATE/OPEN LOBBY FOR SPRINT (Teacher) ====================
export const createLobbyForSprintController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sprintId = String(req.params.sprintId);
    const sprint = await FirestoreDataService.getSprint(sprintId);

    if (!sprint) {
      return sendError(res, 'Sprint not found', 404);
    }

    // Generate unique 6-digit lobby pin
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const lobbyId = `lobby-${Date.now()}`;

    const newLobby: FirestoreLobby = {
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
    await FirestoreDataService.saveLobby(newLobby);
    await FirestoreDataService.updateSprintStatus(sprintId, 'WAITING', { lobbyId });

    // Initialize Realtime Database room for live telemetry
    await RealtimeSprintService.initLiveSprint(sprintId);

    return sendSuccess(res, {
      lobby: newLobby,
      sprint: { ...sprint, lobbyId, status: 'WAITING' },
    }, 'Lobby opened in WAITING state', 201);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

// ==================== 3. GET SPRINT DETAILS ====================
export const getSprintController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sprintParam = String(req.params.sprintId);
    let sprint = await FirestoreDataService.getSprint(sprintParam);

    let lobby: FirestoreLobby | null = null;
    if (!sprint) {
      lobby = await FirestoreDataService.getLobby(sprintParam);
      if (lobby && lobby.sprintId) {
        sprint = await FirestoreDataService.getSprint(lobby.sprintId);
      }
    } else if (sprint.lobbyId) {
      lobby = await FirestoreDataService.getLobby(sprint.lobbyId);
    }

    // Auto-provision practice drill if requested by topic recommendation
    if (!sprint && sprintParam.startsWith('drill-')) {
      const topicRaw = sprintParam.replace('drill-', '');
      const topicName = topicRaw.charAt(0).toUpperCase() + topicRaw.slice(1);
      const available = await FirestoreDataService.getAllQuestions(topicName);
      const drillSprint: FirestoreSprint = {
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
      await FirestoreDataService.saveSprint(drillSprint);
      await RealtimeSprintService.updateSprintState(
        sprintParam,
        'LIVE',
        drillSprint.startedAt,
        drillSprint.endedAt
      );
      sprint = drillSprint;
    }

    if (!sprint) {
      return sendError(res, 'Sprint not found', 404);
    }

    // Check timer expiry
    await SprintService.checkAndEnforceTimer(sprint);

    const questions = await FirestoreDataService.getQuestionsByIds(sprint.questionIds || []);

    const isTeacher = req.user?.role === 'teacher';
    const isEnded = sprint.status === 'ENDED';

    // Do NOT expose answers to students while sprint is active
    const clientQuestions = (isTeacher || isEnded)
      ? questions
      : SprintService.sanitizeQuestions(questions);

    return sendSuccess(res, {
      ...sprint,
      code: lobby?.code,
      questions: clientQuestions,
    });
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

// ==================== 4. START SPRINT (Teacher) ====================
export const startSprintController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sprintId = String(req.params.sprintId);
    const started = await SprintService.startSprint(sprintId);
    return sendSuccess(res, started, 'Sprint started! Status is now LIVE');
  } catch (err: any) {
    return sendError(res, err.message, 400);
  }
};

// ==================== 5. END SPRINT (Teacher) ====================
export const endSprintController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sprintId = String(req.params.sprintId);
    const ended = await SprintService.endSprint(sprintId);
    return sendSuccess(res, ended, 'Sprint ended');
  } catch (err: any) {
    return sendError(res, err.message, 400);
  }
};

// ==================== 5B. CANCEL SPRINT (Teacher) ====================
export const cancelSprintController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sprintId = String(req.params.sprintId);
    let resolvedSprintId = sprintId;
    let sprint = await FirestoreDataService.getSprint(sprintId);
    if (!sprint) {
      const lobby = await FirestoreDataService.getLobby(sprintId);
      if (lobby && lobby.sprintId) {
        resolvedSprintId = lobby.sprintId;
      }
    }
    const cancelled = await SprintService.cancelSprint(resolvedSprintId);
    return sendSuccess(res, cancelled, 'Sprint cancelled');
  } catch (err: any) {
    return sendError(res, err.message, 400);
  }
};

// ==================== 5C. PAUSE SPRINT (Teacher) ====================
export const pauseSprintController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sprintId = String(req.params.sprintId);
    let resolvedSprintId = sprintId;
    let sprint = await FirestoreDataService.getSprint(sprintId);
    if (!sprint) {
      const lobby = await FirestoreDataService.getLobby(sprintId);
      if (lobby && lobby.sprintId) {
        resolvedSprintId = lobby.sprintId;
      }
    }
    const paused = await SprintService.pauseSprint(resolvedSprintId);
    return sendSuccess(res, paused, 'Sprint paused');
  } catch (err: any) {
    return sendError(res, err.message, 400);
  }
};

// ==================== 5D. RESUME SPRINT (Teacher) ====================
export const resumeSprintController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sprintId = String(req.params.sprintId);
    let resolvedSprintId = sprintId;
    let sprint = await FirestoreDataService.getSprint(sprintId);
    if (!sprint) {
      const lobby = await FirestoreDataService.getLobby(sprintId);
      if (lobby && lobby.sprintId) {
        resolvedSprintId = lobby.sprintId;
      }
    }
    const resumed = await SprintService.resumeSprint(resolvedSprintId);
    return sendSuccess(res, resumed, 'Sprint resumed');
  } catch (err: any) {
    return sendError(res, err.message, 400);
  }
};

// ==================== 6. SECURE ANSWER SUBMISSION (Student) ====================
export const submitAnswerController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sprintId = String(req.params.sprintId);
    const { questionId, selectedAnswer, responseTimeMs } = req.body;
    const studentId = req.user?.uid;
    const studentName = req.user?.name || 'Student';

    if (!studentId) {
      return sendError(res, 'Authenticated student required', 401);
    }

    if (!questionId || selectedAnswer === undefined) {
      return sendError(res, 'questionId and selectedAnswer are required', 400);
    }

    // 1. Verify sprint exists (resolves sprintId or lobbyId)
    let resolvedSprintId = sprintId;
    let sprint = await FirestoreDataService.getSprint(sprintId);
    if (!sprint) {
      const lobby = await FirestoreDataService.getLobby(sprintId);
      if (lobby && lobby.sprintId) {
        resolvedSprintId = lobby.sprintId;
        sprint = await FirestoreDataService.getSprint(resolvedSprintId);
      }
    }
    if (!sprint) {
      return sendError(res, 'Sprint not found', 404);
    }

    // 2. Verify sprint is LIVE & check server timer (source of truth)
    const isExpired = await SprintService.checkAndEnforceTimer(sprint);
    if (isExpired || sprint.status !== 'LIVE') {
      return sendError(res, 'Sprint is not currently LIVE. Submissions closed.', 400);
    }

    // 3. Verify server time is before sprint end
    const now = Date.now();
    if (sprint.endedAt && now >= sprint.endedAt) {
      await SprintService.endSprint(resolvedSprintId);
      return sendError(res, 'Sprint time limit of 120 seconds has elapsed.', 400);
    }

    // 4. Verify question belongs to sprint
    if (!sprint.questionIds || !sprint.questionIds.includes(questionId)) {
      return sendError(res, 'Question does not belong to this sprint', 400);
    }

    // 5. Prevent duplicate submission for this question
    const existingAnswer = await FirestoreDataService.getStudentAnswerForQuestion(
      studentId,
      resolvedSprintId,
      questionId
    );
    if (existingAnswer) {
      return sendError(res, 'Duplicate submission: You have already answered this question', 409);
    }

    // 6. Record server timestamp & validate response time
    const serverTimestamp = now;
    const cleanResponseTime = Math.min(Math.max(Number(responseTimeMs) || 2000, 200), 30000);

    // 7. Validate answer on the server
    const question = await FirestoreDataService.getQuestion(questionId);
    if (!question) {
      return sendError(res, 'Question data not found', 404);
    }

    const isCorrect = selectedAnswer.toString().trim().toLowerCase() === question.answer.toString().trim().toLowerCase();

    // 8. Fetch current student score & streak to calculate new points
    let currentScoreRecord = await FirestoreDataService.getStudentScore(studentId, resolvedSprintId);
    const currentStreak = currentScoreRecord ? currentScoreRecord.streak : 0;

    // 9. Calculate score with ScoringService
    const scoreOutput = ScoringService.calculateScore({
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
    const answerDoc: FirestoreAnswer = {
      answerId,
      studentId,
      sprintId: resolvedSprintId,
      questionId,
      selectedAnswer: selectedAnswer.toString(),
      correct: isCorrect,
      timestamp: serverTimestamp,
      responseTime: cleanResponseTime,
    };
    await FirestoreDataService.saveAnswer(answerDoc);

    // 11. Save updated score in Firestore
    const scoreDoc: FirestoreScore = {
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
    await FirestoreDataService.saveScore(scoreDoc);

    // 12. Update Realtime Database live participants & live leaderboard
    await RealtimeSprintService.updateParticipantProgress(
      resolvedSprintId,
      studentId,
      scoreOutput.totalPoints,
      newStreak
    );

    // 13. Return updated score to student (DO NOT return correct answers of upcoming questions)
    return sendSuccess(res, {
      correct: isCorrect,
      pointsAwarded: scoreOutput.totalPoints,
      basePoints: scoreOutput.basePoints,
      speedBonus: scoreOutput.speedBonus,
      streakBonus: scoreOutput.streakBonus,
      totalScore,
      streak: newStreak,
      totalQuestionsAnswered: totalQuestions,
    }, 'Answer processed securely');
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

// ==================== 7. GET LIVE LEADERBOARD ====================
export const getSprintLeaderboardController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sprintId = String(req.params.sprintId);
    let resolvedSprintId = sprintId;
    const lobby = await FirestoreDataService.getLobby(sprintId);
    if (lobby && lobby.sprintId) {
      resolvedSprintId = lobby.sprintId;
    }
    const leaderboard = await RealtimeSprintService.getLeaderboard(resolvedSprintId);
    return sendSuccess(res, leaderboard);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

// ==================== 8. GET FINAL SPRINT RESULT & SOLUTIONS ====================
export const getSprintResultController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sprintParam = String(req.params.sprintId);
    const studentId = req.user?.uid;

    if (!studentId) {
      return sendError(res, 'Authentication required', 401);
    }

    let sprint = await FirestoreDataService.getSprint(sprintParam);
    let resolvedSprintId = sprintParam;
    if (!sprint) {
      const lobby = await FirestoreDataService.getLobby(sprintParam);
      if (lobby && lobby.sprintId) {
        resolvedSprintId = lobby.sprintId;
        sprint = await FirestoreDataService.getSprint(resolvedSprintId);
      }
    }

    if (!sprint) {
      return sendError(res, 'Sprint not found', 404);
    }

    await SprintService.checkAndEnforceTimer(sprint);

    const scoreRecord = await FirestoreDataService.getStudentScore(studentId, resolvedSprintId);
    const answers = await FirestoreDataService.getStudentAnswersForSprint(studentId, resolvedSprintId);
    const questions = await FirestoreDataService.getQuestionsByIds(sprint.questionIds || []);

    // Unlock solutions only if sprint has ENDED
    const solutionsUnlocked = sprint.status === 'ENDED';

    const liveState = await RealtimeSprintService.getLiveSprint(resolvedSprintId);
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

    return sendSuccess(res, {
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
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

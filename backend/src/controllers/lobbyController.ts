import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { FirestoreDataService } from '../services/firestoreDataService';
import { RealtimeSprintService } from '../services/realtimeSprintService';
import { SprintService } from '../services/sprintService';

export const joinLobbyController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code } = req.body;
    const studentId = req.user?.uid;
    const studentName = req.user?.name || 'Student';

    if (!code) {
      return sendError(res, 'PIN code is required to join a sprint', 400);
    }

    if (!studentId) {
      return sendError(res, 'Authentication required', 401);
    }

    const cleanCode = code.toString().replace(/\s/g, '').trim();
    const lobby = await FirestoreDataService.getLobbyByCode(cleanCode);

    if (!lobby) {
      return sendError(res, 'Lobby not found. Please check your 6-digit PIN code.', 404);
    }

    if (lobby.status === 'ENDED' || lobby.status === 'CANCELLED') {
      return sendError(res, `Cannot join lobby. Sprint has already ${lobby.status.toLowerCase()}.`, 400);
    }

    const sprintId = lobby.sprintId || lobby.lobbyId;
    const sprint = await FirestoreDataService.getSprint(sprintId);

    // Add student to Realtime Database live participants
    await RealtimeSprintService.addParticipant(sprintId, {
      studentId,
      name: studentName,
    });

    // Get sanitized questions for the sprint (never include answers during waiting/live)
    let questions: any[] = [];
    if (sprint) {
      const allQ = await FirestoreDataService.getQuestionsByIds(sprint.questionIds || []);
      questions = SprintService.sanitizeQuestions(allQ);
    }

    return sendSuccess(res, {
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
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

export const getLobbyByCodeController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code } = req.params;
    if (!code) {
      return sendError(res, 'Lobby PIN code is required', 400);
    }

    const cleanCode = code.toString().replace(/\s/g, '').trim();
    const lobby = await FirestoreDataService.getLobbyByCode(cleanCode);

    if (!lobby) {
      return sendError(res, 'Lobby not found. Please verify the code.', 404);
    }

    const sprintId = lobby.sprintId || lobby.lobbyId;
    const sprint = await FirestoreDataService.getSprint(sprintId);

    return sendSuccess(res, {
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
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

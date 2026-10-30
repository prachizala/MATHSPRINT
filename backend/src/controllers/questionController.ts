import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { GeminiService } from '../services/geminiService';

export const generateQuestionsController = async (req: Request, res: Response) => {
  const { topic, difficulty, count } = req.body;

  if (!topic) {
    return sendError(res, 'Topic is required', 400);
  }

  const questions = await GeminiService.generateQuestions({
    topic,
    difficulty: difficulty || 'medium',
    count: count ? parseInt(count, 10) : 5,
  });

  return sendSuccess(res, questions, 'Questions generated successfully');
};

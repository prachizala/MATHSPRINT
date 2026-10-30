import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { GeminiService } from '../services/geminiService';
import { FirestoreDataService } from '../services/firestoreDataService';

export const getQuestionsController = async (req: Request, res: Response) => {
  try {
    const { topic, difficulty, search } = req.query;
    let questions = await FirestoreDataService.getAllQuestions();

    if (topic && topic !== 'All') {
      const topLower = String(topic).toLowerCase();
      questions = questions.filter((q) => q.topic.toLowerCase().includes(topLower));
    }
    if (difficulty && difficulty !== 'All') {
      const diffLower = String(difficulty).toLowerCase();
      questions = questions.filter((q) => q.difficulty.toLowerCase() === diffLower);
    }
    if (search) {
      const s = String(search).toLowerCase();
      questions = questions.filter(
        (q) =>
          q.question.toLowerCase().includes(s) ||
          q.topic.toLowerCase().includes(s) ||
          q.explanation.toLowerCase().includes(s)
      );
    }

    return sendSuccess(res, questions);
  } catch (err: any) {
    return sendError(res, err.message, 500);
  }
};

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

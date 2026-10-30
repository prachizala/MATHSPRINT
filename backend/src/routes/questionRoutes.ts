import { Router } from 'express';
import { generateQuestionsController } from '../controllers/questionController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/generate', requireAuth, generateQuestionsController);

export default router;

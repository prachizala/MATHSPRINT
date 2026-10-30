import { Router } from 'express';
import { generateQuestionsController, getQuestionsController } from '../controllers/questionController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, getQuestionsController);
router.post('/generate', requireAuth, generateQuestionsController);

export default router;

import { Router } from 'express';
import { joinLobbyController, getLobbyByCodeController } from '../controllers/lobbyController';
import { requireAuth, requireStudent } from '../middleware/authMiddleware';

const router = Router();

router.post('/join', requireAuth, requireStudent, joinLobbyController);
router.get('/:code', getLobbyByCodeController);

export default router;

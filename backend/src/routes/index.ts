import { Router } from 'express';
import authRoutes from './authRoutes';
import sprintRoutes from './sprintRoutes';
import lobbyRoutes from './lobbyRoutes';
import teacherRoutes from './teacherRoutes';
import studentRoutes from './studentRoutes';
import questionRoutes from './questionRoutes';

const router = Router();

// Exact required health check specification
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MathSprint API is running',
  });
});

router.use('/auth', authRoutes);
router.use('/sprints', sprintRoutes);
router.use('/lobbies', lobbyRoutes);
router.use('/teacher', teacherRoutes);
router.use('/students', studentRoutes);
router.use('/questions', questionRoutes);

export default router;

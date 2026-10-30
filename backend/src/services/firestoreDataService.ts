import { adminFirestore, isFirebaseAdminInitialized } from '../config/firebaseAdmin';
import {
  FirestoreUser,
  FirestoreLobby,
  FirestoreQuestion,
  FirestoreSprint,
  FirestoreAnswer,
  FirestoreScore,
  SprintStatus,
} from '../types';

// In-memory collections for development fallback
const memoryUsers = new Map<string, FirestoreUser>();
const memoryLobbies = new Map<string, FirestoreLobby>();
const memoryQuestions = new Map<string, FirestoreQuestion>();
const memorySprints = new Map<string, FirestoreSprint>();
const memoryAnswers = new Map<string, FirestoreAnswer>();
const memoryScores = new Map<string, FirestoreScore>();

// Seed comprehensive question bank: 24 questions across Arithmetic, Logic, Algebra
const seedQuestions: FirestoreQuestion[] = [
  // ==================== ARITHMETIC ====================
  {
    questionId: 'q-arith-1',
    question: 'Calculate: 14 × 6',
    options: ['84', '74', '94', '64'],
    answer: '84',
    explanation: '14 × 6 = (10 × 6) + (4 × 6) = 60 + 24 = 84',
    topic: 'Arithmetic',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-arith-2',
    question: 'Calculate: 125 × 8',
    options: ['1000', '950', '1050', '1100'],
    answer: '1000',
    explanation: '125 × 8 = 1000',
    topic: 'Arithmetic',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-arith-3',
    question: 'Calculate: 25 × 36',
    options: ['900', '850', '950', '800'],
    answer: '900',
    explanation: '25 × 36 = (100 / 4) × 36 = 100 × 9 = 900',
    topic: 'Arithmetic',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-arith-4',
    question: 'What is 15% of 360?',
    options: ['54', '48', '52', '60'],
    answer: '54',
    explanation: '10% of 360 = 36; 5% = 18; 36 + 18 = 54',
    topic: 'Arithmetic',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-arith-5',
    question: 'What is 25% of 280?',
    options: ['70', '65', '75', '80'],
    answer: '70',
    explanation: '25% of 280 = 280 / 4 = 70',
    topic: 'Arithmetic',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-arith-6',
    question: 'Calculate: 48 ÷ 1.5',
    options: ['32', '30', '34', '36'],
    answer: '32',
    explanation: '48 ÷ 1.5 = 48 × (2/3) = 16 × 2 = 32',
    topic: 'Arithmetic',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-arith-7',
    question: 'Calculate: 99 × 47',
    options: ['4653', '4663', '4643', '4753'],
    answer: '4653',
    explanation: '99 × 47 = (100 - 1) × 47 = 4700 - 47 = 4653',
    topic: 'Arithmetic',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-arith-8',
    question: 'Calculate: 19² - 18²',
    options: ['37', '35', '39', '41'],
    answer: '37',
    explanation: 'a² - b² = (a - b)(a + b) = (19 - 18)(19 + 18) = 1 × 37 = 37',
    topic: 'Arithmetic',
    difficulty: 'hard',
    createdAt: Date.now(),
  },

  // ==================== LOGIC ====================
  {
    questionId: 'q-logic-1',
    question: 'Find the next number: 2, 6, 12, 20, 30, ?',
    options: ['42', '40', '44', '38'],
    answer: '42',
    explanation: 'Differences: +4, +6, +8, +10, +12. 30 + 12 = 42 (n × (n + 1))',
    topic: 'Logic',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-logic-2',
    question: 'If yesterday was 2 days before Friday, what day is tomorrow?',
    options: ['Friday', 'Saturday', 'Thursday', 'Sunday'],
    answer: 'Friday',
    explanation: '2 days before Friday is Wednesday. Yesterday was Wednesday, so today is Thursday, tomorrow is Friday.',
    topic: 'Logic',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-logic-3',
    question: 'If A is taller than B, and C is shorter than A but taller than B, who is shortest?',
    options: ['B', 'C', 'A', 'Cannot determine'],
    answer: 'B',
    explanation: 'Order: A > C > B. Therefore, B is the shortest.',
    topic: 'Logic',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-logic-4',
    question: 'Find the odd one out: 27, 64, 125, 216, 342',
    options: ['342', '216', '125', '64'],
    answer: '342',
    explanation: 'All others are cubes: 3³=27, 4³=64, 5³=125, 6³=216, but 7³=343, not 342.',
    topic: 'Logic',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-logic-5',
    question: 'Find the next number: 3, 7, 15, 31, ?',
    options: ['63', '59', '61', '65'],
    answer: '63',
    explanation: 'Pattern: (previous × 2) + 1. 31 × 2 + 1 = 63.',
    topic: 'Logic',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-logic-6',
    question: 'If 5 workers build 5 tables in 5 days, how many days for 10 workers to build 10 tables?',
    options: ['5 days', '10 days', '2.5 days', '1 day'],
    answer: '5 days',
    explanation: '1 worker takes 5 days to build 1 table. 10 workers take 5 days to build 10 tables.',
    topic: 'Logic',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-logic-7',
    question: 'Find the next letter in the series: B, D, G, K, ?',
    options: ['P', 'O', 'Q', 'R'],
    answer: 'P',
    explanation: 'Alphabet steps: B(+2)=D(+3)=G(+4)=K(+5)=P (16th letter).',
    topic: 'Logic',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-logic-8',
    question: 'A clock shows 3:15. What is the angle between the hour and minute hands?',
    options: ['7.5°', '0°', '15°', '5°'],
    answer: '7.5°',
    explanation: 'Minute hand is at 90°. Hour hand is at 90° + (15/60) × 30° = 97.5°. Difference is 7.5°.',
    topic: 'Logic',
    difficulty: 'hard',
    createdAt: Date.now(),
  },

  // ==================== ALGEBRA ====================
  {
    questionId: 'q-alg-1',
    question: 'Solve for x: 3x + 15 = 45',
    options: ['10', '15', '12', '8'],
    answer: '10',
    explanation: '3x = 45 - 15 = 30 => x = 10',
    topic: 'Algebra',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-alg-2',
    question: 'Simplify: (x³ × x⁴) / x²',
    options: ['x⁵', 'x⁶', 'x⁷', 'x⁴'],
    answer: 'x⁵',
    explanation: 'x^(3 + 4 - 2) = x^5',
    topic: 'Algebra',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-alg-3',
    question: 'Solve for y: 2(y - 3) + 4 = 18',
    options: ['10', '8', '9', '11'],
    answer: '10',
    explanation: '2y - 6 + 4 = 18 => 2y - 2 = 18 => 2y = 20 => y = 10',
    topic: 'Algebra',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-alg-4',
    question: 'Solve for x: 4x - 9 = 2x + 11',
    options: ['10', '8', '12', '7'],
    answer: '10',
    explanation: '4x - 2x = 11 + 9 => 2x = 20 => x = 10',
    topic: 'Algebra',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-alg-5',
    question: 'If x + y = 12 and xy = 35, find x² + y²',
    options: ['74', '64', '84', '70'],
    answer: '74',
    explanation: '(x + y)² = x² + 2xy + y² => 144 = x² + y² + 70 => x² + y² = 74',
    topic: 'Algebra',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-alg-6',
    question: 'What are the roots of x² - 7x + 12 = 0?',
    options: ['3 and 4', '2 and 6', '-3 and -4', '1 and 12'],
    answer: '3 and 4',
    explanation: '(x - 3)(x - 4) = 0 => x = 3 or x = 4',
    topic: 'Algebra',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-alg-7',
    question: 'If 2^(x+1) = 64, find x',
    options: ['5', '6', '4', '7'],
    answer: '5',
    explanation: '64 = 2^6, so x + 1 = 6 => x = 5',
    topic: 'Algebra',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-alg-8',
    question: 'Expand: (2x + 3)(x - 4)',
    options: ['2x² - 5x - 12', '2x² + 5x - 12', '2x² - 11x - 12', '2x² - 5x + 12'],
    answer: '2x² - 5x - 12',
    explanation: '2x² - 8x + 3x - 12 = 2x² - 5x - 12',
    topic: 'Algebra',
    difficulty: 'hard',
    createdAt: Date.now(),
  },
];

seedQuestions.forEach((q) => memoryQuestions.set(q.questionId, q));

// Default mock sprint and lobby
const defaultSprintId = 'sprint-demo-1';
const defaultLobbyId = 'lobby-demo-1';
const defaultCode = '482910';

const seedSprint: FirestoreSprint = {
  sprintId: defaultSprintId,
  lobbyId: defaultLobbyId,
  teacherId: 'teacher-default',
  name: 'Classroom Math Battle #1',
  topic: 'Arithmetic & Speed Math',
  difficulty: 'medium',
  questionCount: 10,
  timeLimit: 120,
  status: 'WAITING',
  createdAt: Date.now() - 30000,
  startedAt: null,
  endedAt: null,
  questionIds: seedQuestions.map((q) => q.questionId),
};

const seedLobby: FirestoreLobby = {
  lobbyId: defaultLobbyId,
  code: defaultCode,
  teacherId: 'teacher-default',
  sprintName: 'Classroom Math Battle #1',
  topic: 'Arithmetic & Speed Math',
  difficulty: 'medium',
  questionCount: 10,
  timeLimit: 120,
  status: 'WAITING',
  startTime: null,
  createdAt: Date.now() - 30000,
  sprintId: defaultSprintId,
};

memorySprints.set(defaultSprintId, seedSprint);
memoryLobbies.set(defaultLobbyId, seedLobby);

export class FirestoreDataService {
  // ==================== USERS ====================
  static async getUser(userId: string): Promise<FirestoreUser | null> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      const snap = await adminFirestore.collection('users').doc(userId).get();
      return snap.exists ? (snap.data() as FirestoreUser) : null;
    }
    return memoryUsers.get(userId) || null;
  }

  static async setUser(user: FirestoreUser): Promise<void> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      await adminFirestore.collection('users').doc(user.userId).set(user, { merge: true });
    }
    memoryUsers.set(user.userId, user);
  }

  // ==================== QUESTIONS ====================
  static async getQuestion(questionId: string): Promise<FirestoreQuestion | null> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      const snap = await adminFirestore.collection('questions').doc(questionId).get();
      return snap.exists ? (snap.data() as FirestoreQuestion) : null;
    }
    return memoryQuestions.get(questionId) || null;
  }

  static async getQuestionsByIds(questionIds: string[]): Promise<FirestoreQuestion[]> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      const questions: FirestoreQuestion[] = [];
      for (const id of questionIds) {
        const q = await this.getQuestion(id);
        if (q) questions.push(q);
      }
      return questions;
    }
    return questionIds.map((id) => memoryQuestions.get(id)).filter(Boolean) as FirestoreQuestion[];
  }

  static async saveQuestion(question: FirestoreQuestion): Promise<void> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      await adminFirestore.collection('questions').doc(question.questionId).set(question);
    }
    memoryQuestions.set(question.questionId, question);
  }

  static async getAllQuestions(topic?: string): Promise<FirestoreQuestion[]> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      let ref: any = adminFirestore.collection('questions');
      const snap = await ref.get();
      const allDocs = snap.docs.map((d: any) => d.data() as FirestoreQuestion);
      if (!topic) return allDocs;
      const lowerTopic = topic.toLowerCase();
      const filtered = allDocs.filter((q: FirestoreQuestion) => lowerTopic.includes(q.topic.toLowerCase()));
      return filtered.length > 0 ? filtered : allDocs;
    }
    const all = Array.from(memoryQuestions.values());
    if (!topic) return all;
    const lowerTopic = topic.toLowerCase();
    const filtered = all.filter((q) => lowerTopic.includes(q.topic.toLowerCase()));
    return filtered.length > 0 ? filtered : all;
  }

  // ==================== SPRINTS ====================
  static async getSprint(sprintId: string): Promise<FirestoreSprint | null> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      const snap = await adminFirestore.collection('sprints').doc(sprintId).get();
      return snap.exists ? (snap.data() as FirestoreSprint) : null;
    }
    return memorySprints.get(sprintId) || null;
  }

  static async saveSprint(sprint: FirestoreSprint): Promise<void> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      await adminFirestore.collection('sprints').doc(sprint.sprintId).set(sprint, { merge: true });
    }
    memorySprints.set(sprint.sprintId, sprint);
  }

  static async updateSprintStatus(
    sprintId: string,
    status: SprintStatus,
    extraFields?: Partial<FirestoreSprint>
  ): Promise<void> {
    const patch = { status, ...extraFields };
    if (isFirebaseAdminInitialized && adminFirestore) {
      await adminFirestore.collection('sprints').doc(sprintId).update(patch);
    }
    const current = memorySprints.get(sprintId);
    if (current) {
      memorySprints.set(sprintId, { ...current, ...patch });
    }
  }

  static async getTeacherSprints(teacherId: string): Promise<FirestoreSprint[]> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      const snap = await adminFirestore
        .collection('sprints')
        .where('teacherId', '==', teacherId)
        .orderBy('createdAt', 'desc')
        .get();
      return snap.docs.map((d: any) => d.data() as FirestoreSprint);
    }
    return Array.from(memorySprints.values())
      .filter((s) => s.teacherId === teacherId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // ==================== LOBBIES ====================
  static async getLobby(lobbyId: string): Promise<FirestoreLobby | null> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      const snap = await adminFirestore.collection('lobbies').doc(lobbyId).get();
      return snap.exists ? (snap.data() as FirestoreLobby) : null;
    }
    return memoryLobbies.get(lobbyId) || null;
  }

  static async getLobbyByCode(code: string): Promise<FirestoreLobby | null> {
    const cleanCode = code.trim();
    if (isFirebaseAdminInitialized && adminFirestore) {
      const snap = await adminFirestore
        .collection('lobbies')
        .where('code', '==', cleanCode)
        .limit(1)
        .get();
      return snap.empty ? null : (snap.docs[0].data() as FirestoreLobby);
    }
    for (const lobby of memoryLobbies.values()) {
      if (lobby.code === cleanCode) return lobby;
    }
    return null;
  }

  static async saveLobby(lobby: FirestoreLobby): Promise<void> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      await adminFirestore.collection('lobbies').doc(lobby.lobbyId).set(lobby, { merge: true });
    }
    memoryLobbies.set(lobby.lobbyId, lobby);
  }

  static async updateLobbyStatus(
    lobbyId: string,
    status: SprintStatus,
    startTime?: number | null
  ): Promise<void> {
    const patch: any = { status };
    if (startTime !== undefined) patch.startTime = startTime;

    if (isFirebaseAdminInitialized && adminFirestore) {
      await adminFirestore.collection('lobbies').doc(lobbyId).update(patch);
    }
    const current = memoryLobbies.get(lobbyId);
    if (current) {
      memoryLobbies.set(lobbyId, { ...current, ...patch });
    }
  }

  // ==================== ANSWERS ====================
  static async getStudentAnswerForQuestion(
    studentId: string,
    sprintId: string,
    questionId: string
  ): Promise<FirestoreAnswer | null> {
    const key = `${studentId}_${sprintId}_${questionId}`;
    if (isFirebaseAdminInitialized && adminFirestore) {
      const snap = await adminFirestore
        .collection('answers')
        .where('studentId', '==', studentId)
        .where('sprintId', '==', sprintId)
        .where('questionId', '==', questionId)
        .limit(1)
        .get();
      return snap.empty ? null : (snap.docs[0].data() as FirestoreAnswer);
    }
    return memoryAnswers.get(key) || null;
  }

  static async saveAnswer(answer: FirestoreAnswer): Promise<void> {
    const key = `${answer.studentId}_${answer.sprintId}_${answer.questionId}`;
    if (isFirebaseAdminInitialized && adminFirestore) {
      await adminFirestore.collection('answers').doc(answer.answerId).set(answer);
    }
    memoryAnswers.set(key, answer);
  }

  static async getStudentAnswersForSprint(
    studentId: string,
    sprintId: string
  ): Promise<FirestoreAnswer[]> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      const snap = await adminFirestore
        .collection('answers')
        .where('studentId', '==', studentId)
        .where('sprintId', '==', sprintId)
        .get();
      return snap.docs.map((d: any) => d.data() as FirestoreAnswer);
    }
    return Array.from(memoryAnswers.values()).filter(
      (a) => a.studentId === studentId && a.sprintId === sprintId
    );
  }

  static async getAllStudentAnswers(studentId: string): Promise<FirestoreAnswer[]> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      const snap = await adminFirestore
        .collection('answers')
        .where('studentId', '==', studentId)
        .get();
      return snap.docs.map((d: any) => d.data() as FirestoreAnswer);
    }
    return Array.from(memoryAnswers.values()).filter((a) => a.studentId === studentId);
  }

  // ==================== SCORES ====================
  static async getStudentScore(studentId: string, sprintId: string): Promise<FirestoreScore | null> {
    const scoreId = `${studentId}_${sprintId}`;
    if (isFirebaseAdminInitialized && adminFirestore) {
      const snap = await adminFirestore.collection('scores').doc(scoreId).get();
      return snap.exists ? (snap.data() as FirestoreScore) : null;
    }
    return memoryScores.get(scoreId) || null;
  }

  static async saveScore(score: FirestoreScore): Promise<void> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      await adminFirestore.collection('scores').doc(score.scoreId).set(score, { merge: true });
    }
    memoryScores.set(score.scoreId, score);
  }

  static async getSprintScores(sprintId: string): Promise<FirestoreScore[]> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      const snap = await adminFirestore
        .collection('scores')
        .where('sprintId', '==', sprintId)
        .orderBy('score', 'desc')
        .get();
      return snap.docs.map((d: any) => d.data() as FirestoreScore);
    }
    return Array.from(memoryScores.values())
      .filter((s) => s.sprintId === sprintId)
      .sort((a, b) => b.score - a.score);
  }

  static async getStudentHistory(studentId: string): Promise<FirestoreScore[]> {
    if (isFirebaseAdminInitialized && adminFirestore) {
      const snap = await adminFirestore
        .collection('scores')
        .where('studentId', '==', studentId)
        .orderBy('updatedAt', 'desc')
        .get();
      return snap.docs.map((d: any) => d.data() as FirestoreScore);
    }
    return Array.from(memoryScores.values())
      .filter((s) => s.studentId === studentId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

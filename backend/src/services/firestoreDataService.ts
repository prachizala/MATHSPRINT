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

  // ==================== FRACTIONS & DECIMALS ====================
  {
    questionId: 'q-frac-1',
    question: 'Calculate: 3/4 + 2/5',
    options: ['23/20', '5/9', '1', '7/20'],
    answer: '23/20',
    explanation: 'Common denominator 20: 15/20 + 8/20 = 23/20',
    topic: 'Fractions',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-frac-2',
    question: 'Calculate: 5/6 - 1/3',
    options: ['1/2', '4/3', '2/3', '3/6'],
    answer: '1/2',
    explanation: '5/6 - 2/6 = 3/6 = 1/2',
    topic: 'Fractions',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-frac-3',
    question: 'What is 3/8 as a decimal?',
    options: ['0.375', '0.35', '0.38', '0.425'],
    answer: '0.375',
    explanation: '3 ÷ 8 = 0.375',
    topic: 'Fractions',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-frac-4',
    question: 'Calculate: (2/3) × (9/10)',
    options: ['3/5', '18/30', '4/5', '2/5'],
    answer: '3/5',
    explanation: '(2 × 9) / (3 × 10) = 18/30 = 3/5',
    topic: 'Fractions',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-frac-5',
    question: 'Calculate: (7/12) ÷ (14/15)',
    options: ['5/8', '3/4', '7/10', '1/2'],
    answer: '5/8',
    explanation: '(7/12) × (15/14) = (1/4) × (5/2) = 5/8',
    topic: 'Fractions',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-frac-6',
    question: 'Convert 2 3/4 to an improper fraction',
    options: ['11/4', '9/4', '10/4', '14/4'],
    answer: '11/4',
    explanation: '(2 × 4 + 3) / 4 = 11/4',
    topic: 'Fractions',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-frac-7',
    question: 'Which fraction is the largest: 5/8, 7/12, 3/4, 9/16?',
    options: ['3/4', '5/8', '7/12', '9/16'],
    answer: '3/4',
    explanation: '3/4 = 0.75, 5/8 = 0.625, 9/16 = 0.5625, 7/12 ≈ 0.583. 3/4 is largest.',
    topic: 'Fractions',
    difficulty: 'hard',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-frac-8',
    question: 'Simplify: (1/2 + 1/3) ÷ (1/4 + 1/6)',
    options: ['2', '5/6', '12/5', '1'],
    answer: '2',
    explanation: '(5/6) ÷ (5/12) = (5/6) × (12/5) = 2',
    topic: 'Fractions',
    difficulty: 'hard',
    createdAt: Date.now(),
  },

  // ==================== GEOMETRY ====================
  {
    questionId: 'q-geom-1',
    question: 'What is the perimeter of a rectangle with length 14 cm and width 6 cm?',
    options: ['40 cm', '20 cm', '84 cm', '48 cm'],
    answer: '40 cm',
    explanation: '2 × (14 + 6) = 2 × 20 = 40 cm',
    topic: 'Geometry',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-geom-2',
    question: 'What is the sum of interior angles in a triangle?',
    options: ['180°', '360°', '90°', '270°'],
    answer: '180°',
    explanation: 'The interior angles of any planar triangle always sum to 180°.',
    topic: 'Geometry',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-geom-3',
    question: 'What is the area of a right-angled triangle with base 8 cm and height 12 cm?',
    options: ['48 cm²', '96 cm²', '40 cm²', '24 cm²'],
    answer: '48 cm²',
    explanation: 'Area = (1/2) × base × height = (1/2) × 8 × 12 = 48 cm²',
    topic: 'Geometry',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-geom-4',
    question: 'What is the hypotenuse of a right triangle with legs of length 6 and 8?',
    options: ['10', '12', '14', '9'],
    answer: '10',
    explanation: '√(6² + 8²) = √(36 + 64) = √100 = 10',
    topic: 'Geometry',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-geom-5',
    question: 'Find the area of a circle with radius 7 cm (use π ≈ 22/7)',
    options: ['154 cm²', '44 cm²', '88 cm²', '196 cm²'],
    answer: '154 cm²',
    explanation: 'Area = πr² = (22/7) × 7 × 7 = 154 cm²',
    topic: 'Geometry',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-geom-6',
    question: 'How many degrees are in the sum of angles of a regular hexagon?',
    options: ['720°', '540°', '360°', '1080°'],
    answer: '720°',
    explanation: '(n - 2) × 180° = (6 - 2) × 180° = 4 × 180° = 720°',
    topic: 'Geometry',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-geom-7',
    question: 'What is the volume of a cylinder with radius 3 cm and height 7 cm? (π ≈ 22/7)',
    options: ['198 cm³', '132 cm³', '66 cm³', '264 cm³'],
    answer: '198 cm³',
    explanation: 'V = πr²h = (22/7) × 9 × 7 = 198 cm³',
    topic: 'Geometry',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-geom-8',
    question: 'The diagonals of a rhombus are 12 cm and 16 cm. What is its side length?',
    options: ['10 cm', '14 cm', '8 cm', '12 cm'],
    answer: '10 cm',
    explanation: 'Half diagonals: 6 and 8. Side = √(6² + 8²) = 10 cm.',
    topic: 'Geometry',
    difficulty: 'hard',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-geom-9',
    question: 'What is the total surface area of a cube with edge length 5 cm?',
    options: ['150 cm²', '125 cm²', '100 cm²', '75 cm²'],
    answer: '150 cm²',
    explanation: 'Surface Area = 6 × a² = 6 × 25 = 150 cm²',
    topic: 'Geometry',
    difficulty: 'hard',
    createdAt: Date.now(),
  },

  // ==================== PERCENTAGES & RATIOS ====================
  {
    questionId: 'q-pct-1',
    question: 'If the ratio of boys to girls is 3:5 and there are 15 boys, how many girls are there?',
    options: ['25', '20', '30', '18'],
    answer: '25',
    explanation: 'Multiplier = 15 ÷ 3 = 5. Girls = 5 × 5 = 25.',
    topic: 'Percentages',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-pct-2',
    question: 'A shirt originally priced at $80 is on 20% discount. What is the sale price?',
    options: ['$64', '$60', '$70', '$68'],
    answer: '$64',
    explanation: 'Discount = $80 × 0.20 = $16; Sale price = $80 - $16 = $64',
    topic: 'Percentages',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-pct-3',
    question: 'What percentage of 250 is 75?',
    options: ['30%', '25%', '35%', '40%'],
    answer: '30%',
    explanation: '(75 / 250) × 100% = 3/10 × 100% = 30%',
    topic: 'Percentages',
    difficulty: 'easy',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-pct-4',
    question: 'A price increases from $50 to $65. What is the percentage increase?',
    options: ['30%', '25%', '35%', '15%'],
    answer: '30%',
    explanation: 'Increase = $15. (15 / 50) × 100% = 30%',
    topic: 'Percentages',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-pct-5',
    question: 'Divide $360 in the ratio 2:3:4. What is the middle share?',
    options: ['$120', '$80', '$160', '$100'],
    answer: '$120',
    explanation: 'Total parts = 9. 1 part = $40. Middle share = 3 × $40 = $120.',
    topic: 'Percentages',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-pct-6',
    question: 'If a car travels 240 km on 20 liters of petrol, how far can it travel on 35 liters?',
    options: ['420 km', '400 km', '380 km', '440 km'],
    answer: '420 km',
    explanation: 'Efficiency = 240 / 20 = 12 km/L. Distance = 35 × 12 = 420 km.',
    topic: 'Percentages',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-pct-7',
    question: 'If 40% of a number is equal to 2/3 of another number, find the ratio of the first to the second.',
    options: ['5:3', '3:5', '4:3', '2:5'],
    answer: '5:3',
    explanation: '0.4A = (2/3)B => (2/5)A = (2/3)B => A/B = 5/3 = 5:3',
    topic: 'Percentages',
    difficulty: 'medium',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-pct-8',
    question: 'An investment grows by 10% in Year 1 and 20% in Year 2. What is the total compound percentage growth?',
    options: ['32%', '30%', '28%', '35%'],
    answer: '32%',
    explanation: '1.10 × 1.20 = 1.32 => 32% overall growth.',
    topic: 'Percentages',
    difficulty: 'hard',
    createdAt: Date.now(),
  },
  {
    questionId: 'q-pct-9',
    question: 'A mixture contains alcohol and water in the ratio 4:1. If 5 liters of water are added, the ratio becomes 4:3. How many liters of alcohol are in the mixture?',
    options: ['10 liters', '12 liters', '8 liters', '16 liters'],
    answer: '10 liters',
    explanation: 'Alcohol = 4x, Water = x. 4x / (x + 5) = 4/3 => 3(4x) = 4(x + 5) => 12x = 4x + 20 => 8x = 20 => x = 2.5. Alcohol = 4(2.5) = 10 liters.',
    topic: 'Percentages',
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

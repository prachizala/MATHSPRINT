/**
 * MATHSPRINT Phase 4: Full End-to-End Live Battle Simulation
 */

const { createApp } = require('./dist/server');
const http = require('http');

const app = createApp();
const server = http.createServer(app);

function makeRequest(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: address.port,
        path: `/api${path}`,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          ...headers,
        },
      },
      (res) => {
        let resBody = '';
        res.on('data', (chunk) => {
          resBody += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = resBody ? JSON.parse(resBody) : null;
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: resBody });
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function runE2ETests() {
  console.log('🚀 Starting MATHSPRINT Phase 4 End-to-End Battle Simulation...\n');

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  try {
    // 1. TEACHER: CREATE SPRINT
    console.log('--- Step 1: Teacher Creates Sprint ---');
    const createRes = await makeRequest('POST', '/sprints', {
      name: 'Classroom Battle 10-A',
      topic: 'Arithmetic • Logic • Algebra',
      difficulty: 'medium',
      questionCount: 10,
      timeLimit: 120,
    }, {
      'x-user-role': 'teacher',
      'x-user-id': 'teacher-sarah',
      'x-user-name': 'Prof. Sarah Miller',
    });

    assert(createRes.status === 201, 'POST /sprints returns 201 Created');
    assert(createRes.data?.data?.status === 'DRAFT', 'Sprint begins in DRAFT state');
    assert(createRes.data?.data?.questionCount === 10, '10 questions generated/assigned to sprint');
    assert(createRes.data?.data?.timeLimit === 120, 'Sprint timeLimit is locked to 120 seconds');
    const sprintId = createRes.data?.data?.sprintId;

    // 2. TEACHER: GENERATE LOBBY (6-DIGIT PIN)
    console.log('\n--- Step 2: Teacher Generates Lobby ---');
    const lobbyRes = await makeRequest('POST', `/sprints/${sprintId}/lobby`, {}, {
      'x-user-role': 'teacher',
      'x-user-id': 'teacher-sarah',
    });

    assert(lobbyRes.status === 201, 'POST /sprints/:id/lobby returns 201 Created');
    assert(lobbyRes.data?.data?.lobby?.status === 'WAITING', 'Lobby is in WAITING state');
    const pin = lobbyRes.data?.data?.lobby?.code;
    assert(/^\d{6}$/.test(pin), `Lobby generated authoritative 6-digit PIN: ${pin}`);

    // 3. STUDENTS JOIN LOBBY BY PIN
    console.log('\n--- Step 3: Students Join Lobby ---');
    const student1Join = await makeRequest('POST', '/lobbies/join', { code: pin }, {
      'x-user-role': 'student',
      'x-user-id': 'student-aarav',
      'x-user-name': 'Aarav',
    });

    assert(student1Join.status === 200, 'Student 1 joins lobby via PIN');
    assert(student1Join.data?.data?.status === 'WAITING', 'Sprint is still in WAITING state');
    const questions = student1Join.data?.data?.questions;
    assert(Array.isArray(questions) && questions.length === 10, 'Student receives 10 questions');

    // Anti-Cheat Check: No answer keys exposed
    const leakedAnswers = questions.filter((q) => q.answer !== undefined || q.explanation !== undefined);
    assert(leakedAnswers.length === 0, 'SECURITY: Zero answers or explanations exposed to student during active lobby');

    // Student 2 joins
    const student2Join = await makeRequest('POST', '/lobbies/join', { code: pin }, {
      'x-user-role': 'student',
      'x-user-id': 'student-diya',
      'x-user-name': 'Diya',
    });
    assert(student2Join.status === 200, 'Student 2 joins lobby via PIN');

    // 4. TEACHER STARTS SPRINT (120s AUTHORITATIVE CLOCK)
    console.log('\n--- Step 4: Teacher Starts Sprint ---');
    const startRes = await makeRequest('POST', `/sprints/${sprintId}/start`, {}, {
      'x-user-role': 'teacher',
      'x-user-id': 'teacher-sarah',
    });

    assert(startRes.status === 200, 'POST /sprints/:id/start returns 200');
    assert(startRes.data?.data?.status === 'LIVE', 'Sprint status transitions to LIVE');
    assert(typeof startRes.data?.data?.startedAt === 'number', 'Server startedAt recorded');
    assert(typeof startRes.data?.data?.endedAt === 'number', 'Server endedAt recorded (120s limit)');
    const expectedDuration = Math.round((startRes.data?.data?.endedAt - startRes.data?.data?.startedAt) / 1000);
    assert(expectedDuration === 120, 'Server timer set to exactly 120 seconds');

    // 5. RAPID ANSWER SUBMISSIONS & SCORING
    console.log('\n--- Step 5: Live Submissions & Server Scoring ---');
    const q1 = questions[0];
    const q2 = questions[1];
    const q3 = questions[2];

    // Submit Answer Q1 by Student 1
    const ans1 = await makeRequest('POST', `/sprints/${sprintId}/answers`, {
      questionId: q1.questionId,
      selectedAnswer: q1.options[0],
      responseTimeMs: 2200,
    }, {
      'x-user-role': 'student',
      'x-user-id': 'student-aarav',
      'x-user-name': 'Aarav',
    });

    assert(ans1.status === 200, 'Student 1 submits answer to server');
    assert(ans1.data?.data?.pointsAwarded !== undefined, 'Server calculated points');
    assert(typeof ans1.data?.data?.totalScore === 'number', 'Server updated total score');

    // Anti-Cheat: Duplicate Answer Prevention
    const dupAns = await makeRequest('POST', `/sprints/${sprintId}/answers`, {
      questionId: q1.questionId,
      selectedAnswer: q1.options[1],
      responseTimeMs: 3000,
    }, {
      'x-user-role': 'student',
      'x-user-id': 'student-aarav',
    });
    assert(dupAns.status === 409, 'ANTI-CHEAT: Duplicate submission on same question strictly rejected (409 Conflict)');

    // Student 2 answers Q1
    const s2Ans1 = await makeRequest('POST', `/sprints/${sprintId}/answers`, {
      questionId: q1.questionId,
      selectedAnswer: q1.options[0],
      responseTimeMs: 1500,
    }, {
      'x-user-role': 'student',
      'x-user-id': 'student-diya',
      'x-user-name': 'Diya',
    });
    assert(s2Ans1.status === 200, 'Student 2 submits answer');

    // Student 1 answers Q2
    const ans2 = await makeRequest('POST', `/sprints/${sprintId}/answers`, {
      questionId: q2.questionId,
      selectedAnswer: q2.options[0],
      responseTimeMs: 3500,
    }, {
      'x-user-role': 'student',
      'x-user-id': 'student-aarav',
      'x-user-name': 'Aarav',
    });
    assert(ans2.status === 200, 'Student 1 submits Question 2 answer');

    // 6. LIVE LEADERBOARD & TEACHER MONITORING
    console.log('\n--- Step 6: Live Leaderboard Telemetry ---');
    const lbRes = await makeRequest('GET', `/sprints/${sprintId}/leaderboard`);
    assert(lbRes.status === 200, 'GET /sprints/:id/leaderboard returns 200');
    assert(Array.isArray(lbRes.data?.data) && lbRes.data?.data.length >= 2, 'Leaderboard contains both active contestants');
    assert(lbRes.data?.data[0]?.rank === 1, 'Top contestant is ranked #1');

    // 7. TEACHER ENDS SPRINT
    console.log('\n--- Step 7: Sprint Ends ---');
    const endRes = await makeRequest('POST', `/sprints/${sprintId}/end`, {}, {
      'x-user-role': 'teacher',
      'x-user-id': 'teacher-sarah',
    });
    assert(endRes.status === 200, 'Teacher ends sprint');
    assert(endRes.data?.data?.status === 'ENDED', 'Sprint status transitions to ENDED');

    // Anti-Cheat: Submissions closed after ENDED
    const lateAns = await makeRequest('POST', `/sprints/${sprintId}/answers`, {
      questionId: q3.questionId,
      selectedAnswer: q3.options[0],
      responseTimeMs: 2000,
    }, {
      'x-user-role': 'student',
      'x-user-id': 'student-aarav',
    });
    assert(lateAns.status === 400, 'ANTI-CHEAT: Submissions after sprint ENDED strictly rejected (400)');

    // 8. FINAL RESULT & UNLOCKED SOLUTIONS
    console.log('\n--- Step 8: Final Results & Solutions Unlocking ---');
    const resultRes = await makeRequest('GET', `/sprints/${sprintId}/result`, undefined, {
      'x-user-role': 'student',
      'x-user-id': 'student-aarav',
    });

    assert(resultRes.status === 200, 'GET /sprints/:id/result returns 200');
    assert(resultRes.data?.data?.solutionsUnlocked === true, 'Official solutions unlocked after sprint ENDED');
    assert(Array.isArray(resultRes.data?.data?.solutions) && resultRes.data?.data?.solutions.length > 0, 'Solutions array populated');
    const sol1 = resultRes.data?.data?.solutions[0];
    assert(sol1.answer !== undefined && sol1.explanation !== undefined, 'Each solution contains correct answer and step-by-step explanation');
    assert(typeof resultRes.data?.data?.rank === 'number', 'Student rank provided in final results');
    assert(typeof resultRes.data?.data?.fastestResponseMs === 'number', 'Fastest response time provided');

    // 9. STUDENT TOPIC MASTERY & WEAK TOPIC DETECTION
    console.log('\n--- Step 9: Topic Mastery & Weak Topic Detection ---');
    const perfRes = await makeRequest('GET', '/students/performance', undefined, {
      'x-user-role': 'student',
      'x-user-id': 'student-aarav',
    });

    assert(perfRes.status === 200, 'GET /students/performance returns 200');
    const perfData = perfRes.data?.data;
    assert(Array.isArray(perfData?.topics) && perfData?.topics.length === 3, 'Returns 3 core topics: Arithmetic, Logic, Algebra');
    const arith = perfData?.topics?.find((t) => t.name === 'Arithmetic');
    const logic = perfData?.topics?.find((t) => t.name === 'Logic');
    const alg = perfData?.topics?.find((t) => t.name === 'Algebra');
    assert(arith && logic && alg, 'Arithmetic, Logic, and Algebra all evaluated');
    assert(
      arith && ['STRONG TOPIC', 'MEDIUM TOPIC', 'WEAK TOPIC'].includes(arith.level),
      `Arithmetic classified as: ${arith?.level} (${arith?.accuracy}%)`
    );
    assert(
      alg && ['STRONG TOPIC', 'MEDIUM TOPIC', 'WEAK TOPIC'].includes(alg.level),
      `Algebra classified as: ${alg?.level} (${alg?.accuracy}%)`
    );
    assert(typeof perfData?.weakestTopic === 'string', `Weakest topic identified: ${perfData?.weakestTopic}`);

    // 10. ADAPTIVE RECOMMENDATIONS & PRACTICE DRILL
    console.log('\n--- Step 10: Adaptive Recommendations & Practice Drill ---');
    const recsRes = await makeRequest('GET', '/students/recommendations', undefined, {
      'x-user-role': 'student',
      'x-user-id': 'student-aarav',
    });

    assert(recsRes.status === 200, 'GET /students/recommendations returns 200');
    assert(Array.isArray(recsRes.data?.data) && recsRes.data?.data.length > 0, 'Adaptive recommendations returned');
    const topRec = recsRes.data?.data[0];
    assert(topRec.badge.includes('PRIORITY 1'), `Top recommendation prioritized for weak area: ${topRec.title}`);
    assert(topRec.drillId !== undefined, `Practice drill ID provided: ${topRec.drillId}`);

    // Student launches practice drill directly
    const drillRes = await makeRequest('GET', `/sprints/${topRec.drillId}`);
    assert(drillRes.status === 200, `Student launches targeted drill (${topRec.drillId})`);
    assert(drillRes.data?.data?.status === 'LIVE', 'Practice drill sprint is immediately LIVE');
    assert(drillRes.data?.data?.questions?.length > 0, 'Practice drill loaded with topic-specific questions');

  } finally {
    server.close();
  }

  console.log(`\n==============================================`);
  console.log(`E2E Results: ${passedTests} / ${totalTests} Passed`);
  console.log(`==============================================`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL PHASE 4 END-TO-END BATTLE FLOW TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error('\n❌ SOME E2E TESTS FAILED!\n');
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error('Fatal E2E error:', err);
  process.exit(1);
});

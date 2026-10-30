const { createApp } = require('./dist/server');
const http = require('http');

const app = createApp();
const server = http.createServer(app);

const makeRequest = (method, path, body, headers = {}) => {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const req = http.request(
      {
        host: '127.0.0.1',
        port: address.port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            resolve({ status: res.statusCode || 200, data });
          } catch {
            resolve({ status: res.statusCode || 200, data: raw });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function runTests() {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`\n🧪 Testing MATHSPRINT Backend API on port ${port}...\n`);

  let allPassed = true;
  const assert = (condition, msg) => {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      allPassed = false;
    }
  };

  try {
    // 1. GET /api/health
    const health = await makeRequest('GET', '/api/health');
    assert(health.status === 200, 'GET /api/health returns 200');
    assert(health.data.success === true && health.data.message === 'MathSprint API is running', 'Health check matches required schema: { success: true, message: "MathSprint API is running" }');

    // 2. Teacher: Create Sprint
    const createSprint = await makeRequest('POST', '/api/sprints', {
      name: 'Algebra Speed Championship',
      topic: 'Algebra',
      difficulty: 'medium',
      questionCount: 5,
      timeLimit: 120,
    }, {
      'x-user-role': 'teacher',
      'x-user-id': 'teacher-unit-test',
    });
    assert(createSprint.status === 201, 'POST /api/sprints returns 201');
    assert(createSprint.data.data?.status === 'DRAFT', 'Sprint created in DRAFT state');
    const sprintId = createSprint.data.data?.sprintId;

    // 3. Teacher: Open Lobby
    const openLobby = await makeRequest('POST', `/api/sprints/${sprintId}/lobby`, {}, {
      'x-user-role': 'teacher',
      'x-user-id': 'teacher-unit-test',
    });
    assert(openLobby.status === 201, 'POST /api/sprints/:sprintId/lobby returns 201');
    assert(openLobby.data.data?.lobby?.status === 'WAITING', 'Lobby created in WAITING state');
    const lobbyCode = openLobby.data.data?.lobby?.code;
    assert(typeof lobbyCode === 'string' && lobbyCode.length === 6, `Lobby generated valid 6-digit PIN code: ${lobbyCode}`);

    // 4. Student: Join Lobby
    const studentJoin = await makeRequest('POST', '/api/lobbies/join', {
      code: lobbyCode,
    }, {
      'x-user-role': 'student',
      'x-user-id': 'student-unit-test',
    });
    assert(studentJoin.status === 200, 'POST /api/lobbies/join returns 200');
    assert(studentJoin.data.data?.questions?.length > 0, 'Student receives questions for sprint');
    assert(studentJoin.data.data?.questions[0].answer === undefined, 'CRITICAL: Answer keys are NOT exposed to student during active sprint');
    const firstQ = studentJoin.data.data?.questions[0];

    // 5. Teacher: Start Sprint
    const startSprint = await makeRequest('POST', `/api/sprints/${sprintId}/start`, {}, {
      'x-user-role': 'teacher',
      'x-user-id': 'teacher-unit-test',
    });
    assert(startSprint.status === 200, 'POST /api/sprints/:sprintId/start transitions to LIVE');
    assert(startSprint.data.data?.status === 'LIVE', 'Sprint status is LIVE');
    assert(typeof startSprint.data.data?.startedAt === 'number', 'Sprint startedAt recorded');
    assert(typeof startSprint.data.data?.endedAt === 'number', 'Sprint endedAt recorded for 120s timer');

    // 6. Student: Submit Answer
    const submitAns = await makeRequest('POST', `/api/sprints/${sprintId}/answers`, {
      questionId: firstQ.questionId,
      selectedAnswer: firstQ.options[0],
      responseTimeMs: 2500, // < 5s speed bonus
    }, {
      'x-user-role': 'student',
      'x-user-id': 'student-unit-test',
    });
    assert(submitAns.status === 200, 'POST /api/sprints/:sprintId/answers returns 200');
    assert(submitAns.data.data?.pointsAwarded !== undefined, `Points calculated on server: ${submitAns.data.data?.pointsAwarded} PTS`);
    assert(submitAns.data.data?.totalScore !== undefined, `Updated total score returned: ${submitAns.data.data?.totalScore}`);

    // 7. Duplicate Submission Prevention
    const duplicateAns = await makeRequest('POST', `/api/sprints/${sprintId}/answers`, {
      questionId: firstQ.questionId,
      selectedAnswer: firstQ.options[0],
      responseTimeMs: 2000,
    }, {
      'x-user-role': 'student',
      'x-user-id': 'student-unit-test',
    });
    assert(duplicateAns.status === 409, 'Duplicate answer submission strictly rejected with 409 Conflict');

    // 8. GET /api/sprints/:sprintId/leaderboard
    const leaderboard = await makeRequest('GET', `/api/sprints/${sprintId}/leaderboard`);
    assert(leaderboard.status === 200, 'GET /api/sprints/:sprintId/leaderboard returns 200');
    assert(Array.isArray(leaderboard.data.data), 'Leaderboard returns array of participants');

    // 9. Teacher: End Sprint
    const endSprint = await makeRequest('POST', `/api/sprints/${sprintId}/end`, {}, {
      'x-user-role': 'teacher',
      'x-user-id': 'teacher-unit-test',
    });
    assert(endSprint.status === 200, 'POST /api/sprints/:sprintId/end returns 200');
    assert(endSprint.data.data?.status === 'ENDED', 'Sprint status is ENDED');

    // 10. Student: Results & Unlocked Solutions
    const results = await makeRequest('GET', `/api/sprints/${sprintId}/result`, undefined, {
      'x-user-role': 'student',
      'x-user-id': 'student-unit-test',
    });
    assert(results.status === 200, 'GET /api/sprints/:sprintId/result returns 200');
    assert(results.data.data?.solutionsUnlocked === true, 'Solutions unlocked after sprint has ENDED');
    assert(results.data.data?.solutions?.length > 0, 'Full question solutions with explanations provided');

    // 11. Teacher Analytics & Sprints
    const teacherSprints = await makeRequest('GET', '/api/teacher/sprints', undefined, {
      'x-user-role': 'teacher',
      'x-user-id': 'teacher-unit-test',
    });
    assert(teacherSprints.status === 200 && Array.isArray(teacherSprints.data.data), 'GET /api/teacher/sprints returns teacher sprints');

    const teacherAnalytics = await makeRequest('GET', '/api/teacher/analytics', undefined, {
      'x-user-role': 'teacher',
      'x-user-id': 'teacher-unit-test',
    });
    assert(teacherAnalytics.status === 200 && teacherAnalytics.data.data?.totalSprints >= 1, 'GET /api/teacher/analytics returns class telemetry');

    // 12. Student Performance & History
    const perf = await makeRequest('GET', '/api/students/performance', undefined, {
      'x-user-role': 'student',
      'x-user-id': 'student-unit-test',
    });
    assert(perf.status === 200 && typeof perf.data.data?.averageAccuracy === 'number', 'GET /api/students/performance returns student performance');

    const recs = await makeRequest('GET', '/api/students/recommendations', undefined, {
      'x-user-role': 'student',
      'x-user-id': 'student-unit-test',
    });
    assert(recs.status === 200 && Array.isArray(recs.data.data), 'GET /api/students/recommendations returns recommendations');

    const history = await makeRequest('GET', '/api/students/history', undefined, {
      'x-user-role': 'student',
      'x-user-id': 'student-unit-test',
    });
    assert(history.status === 200 && Array.isArray(history.data.data), 'GET /api/students/history returns sprint history');

    // 13. Teacher: Cancel a Sprint
    const cancelSprint = await makeRequest('POST', `/api/sprints/${sprintId}/cancel`, {}, {
      'x-user-role': 'teacher',
      'x-user-id': 'teacher-unit-test',
    });
    assert(cancelSprint.status === 200, 'POST /api/sprints/:sprintId/cancel returns 200');

  } finally {
    server.close();
  }

  if (allPassed) {
    console.log('\n🎉 ALL 13 BACKEND MODULE TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error('\n❌ SOME TESTS FAILED!\n');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});

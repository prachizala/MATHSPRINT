# MATHSPRINT — Real-Time Competitive Math Battle Arena ⚡📐

[![React Native](https://img.shields.io/badge/Frontend-React_Native_Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js / Express](https://img.shields.io/badge/Backend-Node.js_Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Realtime-Firebase_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-Passing-10B981?style=for-the-badge&logo=jest&logoColor=white)](backend/test-backend.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

> **High-intensity 2-minute competitive classroom math battle platform engineered with real-time telemetry, server-authoritative anti-cheat clocks, and adaptive diagnostic analytics.**

---

## 🎯 The Problem It Solves

Traditional classroom math drills and homework assignments often suffer from low student engagement, delayed grading feedback, and rampant answer copying. Existing gamified quiz tools (like Kahoot or Quizizz) rely on broad multiple-choice trivia and do not offer granular mathematical diagnostics, speed telemetry, or adaptive difficulty tiers.

**MATHSPRINT** transforms math practice into an adrenaline-filled, multiplayer live sprint:
1. **Real-Time Synchronous Battles:** Students duel simultaneously across a room or campus in timed 120-second rounds.
2. **Server-Authoritative Anti-Cheat:** Question payloads sent to clients contain *zero* answer keys or explanations. Answers are verified exclusively server-side.
3. **Data-Driven Diagnostics:** Teachers receive immediate question-by-question misconception reports, identifying exact areas where students stumble (e.g., negative integers, fraction division, or algebraic expansion).

---

## 📸 System Architecture & Game Experience

```
+-----------------------------------------------------------------------------------------+
|                                  MATHSPRINT ARCHITECTURE                                |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   +-----------------------+              +-----------------------+                      |
|   |   Student Mobile App  |              |   Teacher Dashboard   |                      |
|   |  (React Native Expo)  |              |    (Live Analytics)   |                      |
|   +-----------+-----------+              +-----------+-----------+                      |
|               |                                      |                                  |
|               | Real-Time Event Sync                 | Admin Commands (Pause/Resume/End)|
|               v                                      v                                  |
|   +------------------------------------------------------+                              |
|   |         Express & TypeScript Game Server Engine      |                              |
|   |   - Server-Authoritative 120s Countdown Timer        |                              |
|   |   - Dynamic Algorithmic Math Problem Generator       |                              |
|   |   - Anti-Duplicate & Anti-Tamper Payload Validator   |                              |
|   +---------------------------+--------------------------+                              |
|                               |                                                         |
|                               v                                                         |
|   +------------------------------------------------------+                              |
|   |          Firebase Firestore & Realtime DB            |                              |
|   |   - Live Leaderboard Broadcast                       |                              |
|   |   - Granular Telemetry Logs & Misconception Matrix   |                              |
|   +------------------------------------------------------+                              |
+-----------------------------------------------------------------------------------------+
```

```
+---------------------------+   +---------------------------+   +---------------------------+
|      STUDENT SPRINT       |   |     LIVE LEADERBOARD      |   |    TEACHER DIAGNOSTICS    |
+---------------------------+   +---------------------------+   +---------------------------+
| ⏱️ 01:42 | Streak: x4 🔥  |   | 🏆 1st: Aarav S. (4,250)  |   | Class Accuracy: 84%       |
|                           |   | 🥈 2nd: Prachi Z. (3,980) |   | Hardest: Q7 (Fractions)   |
| Solve for x:              |   | 🥉 3rd: Rohan M. (3,710)  |   | Easiest: Q2 (Addition)    |
|   3x - 7 = 14             |   |                           |   |                           |
|                           |   | Recent Submissions:       |   | Common Misconception:     |
| [ A: 5 ]     [ B: 7 ]     |   | * Prachi: Q8 +150pts (1.1s|   | Sign error when moving -7 |
| [ C: 9 ]     [ D: 6 ]     |   | * Aarav:  Q8 +150pts (0.9s|   |                           |
|                           |   |                           |   | [Pause Match] [Export CSV]|
+---------------------------+   +---------------------------+   +---------------------------+
```
*(Screenshot placeholders: `./docs/screenshots/gameplay.png`, `./docs/screenshots/leaderboard.png`)*

---

## ⚡ Core Features

* 🎮 **Multiplayer Live Duels:** Students join sprint rooms via 6-character room codes. Dynamic scoring awards points based on answer accuracy and reaction latency (< 1.5s triggers bonus multipliers).
* 🛡️ **Anti-Cheat & Fair-Play Protocols:**
  * **Zero Client Answer Exposure:** Client receives only `questionId`, `prompt`, and scrambled options. Correct answer keys are kept strictly on the Node.js server.
  * **Authoritative Clock:** The server rejects any submission timestamped after the official `endedAt` epoch, preventing network latency hacking.
  * **Idempotency Protection:** Rejects duplicate submissions on the same question with `409 Conflict`.
* 👨‍🏫 **Teacher Battle Command:** Real-time administrative controls: **Pause**, **Resume**, **Extend Time**, or **Terminate**. Pausing freezes all client timers and locks answer buttons instantly.
* 📈 **Adaptive Practice Drills:** Personalized solo training modes that dynamically adjust difficulty based on historic topic mastery:
  * **Tier 1 (<60% Accuracy):** 60% Foundational, 30% Intermediate, 10% Advanced.
  * **Tier 2 (60%–80% Accuracy):** 20% Foundational, 60% Intermediate, 20% Advanced.
  * **Tier 3 (>80% Accuracy):** 10% Foundational, 40% Intermediate, 50% Advanced.

---

## 🛠️ Tech Stack & Dependencies

- **Frontend Mobile App:** React Native 0.86, Expo 57, React 19, React Navigation 7, TypeScript 5.7
- **Backend Service:** Node.js 22+, Express 4.21, TypeScript, ts-node-dev
- **Cloud & Realtime Infrastructure:** Firebase Realtime Database, Cloud Firestore, Firebase Security Rules
- **Automated Testing:** Node.js native test harness & E2E sprint simulator (`backend/test-backend.js`, `backend/test-e2e-sprint.js`)

---

## 📂 Project Structure

```
MATHSPRINT/
│
├── App.tsx                     # Main React Native entrypoint
├── app.json                    # Expo configuration & app manifests
├── package.json                # Frontend dependencies and scripts
├── tsconfig.json               # TypeScript compiler configuration
├── firestore.rules             # Production security rules for Firestore
├── database.rules.json         # Realtime Database security rules
│
├── assets/                     # App icons, splash screens, and badges
├── docs/                       # Architecture documentation & presentations
│   └── presentations/          # CyberForge hackathon pitch deck & whitepapers
│
├── src/                        # React Native source code
│   ├── components/             # Reusable UI components (Timer, ScoreCard, QuestionCard)
│   ├── navigation/             # Navigation stacks & tab bars
│   ├── context/                # Global game state & authentication contexts
│   ├── hooks/                  # Custom hooks (useTimer, useSprintSocket)
│   └── types/                  # TypeScript interface definitions
│
└── backend/                    # Node.js + Express game server
    ├── package.json            # Backend dependencies & test scripts
    ├── tsconfig.json           # Backend TypeScript build config
    ├── test-backend.js         # Automated HTTP & API unit test suite
    ├── test-e2e-sprint.js      # Multi-client simulated sprint test
    └── src/
        ├── index.ts            # Server entrypoint & listener
        ├── server.ts           # Express application setup
        ├── routes/             # REST endpoints (sprint creation, join, submit)
        └── services/           # Question generation engine & scoring logic
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)

### 1. Clone the repository
```bash
git clone https://github.com/prachizala/MATHSPRINT.git
cd MATHSPRINT
```

### 2. Run the Backend Game Server
```bash
cd backend
npm install
npm run dev
```
The server will boot up at `http://localhost:5000` (or configured `PORT`).

### 3. Run Backend Test Suite
```bash
cd backend
npm test
```

### 4. Run the Mobile Application (Expo)
In the root `MATHSPRINT/` directory:
```bash
npm install
npm start
```
- Press **`a`** to launch on an Android emulator or device connected via ADB.
- Press **`w`** to launch in the web browser.
- Scan the QR code using the **Expo Go** app on your physical mobile phone.

---

## 🔮 Future Enhancements
- [ ] Add AI-generated custom story-based math word problems using LLM APIs.
- [ ] Implement team relay mode (3 vs 3 classroom teams passing the sprint baton).
- [ ] Add sound effects and haptic feedback on correct answer streaks.

---

## 👤 Author & Hackathon Team

**Prachi Zala**  
- **Role:** Full-Stack Lead & Realtime Systems Architect  
- **GitHub:** [@prachizala](https://github.com/prachizala)  
- **LinkedIn:** [Prachi Zala](https://www.linkedin.com/in/prachi-zala-74a08b334/)

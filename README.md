# ⚡ MATHSPRINT — Real-Time Competitive Classroom Math Battle Arena

> **Silver Oak University (SOU) Mini Hackathon Project • Team Leader: Prachi Zala**  
> High-intensity, 2-minute competitive mathematics battle platform with server-authoritative scoring, real-time live telemetry, data-driven learning analytics, and adaptive difficulty-based practice.

[![Silver Oak Mini Hackathon](https://img.shields.io/badge/Hackathon-Silver_Oak_University_Mini_Hackathon-orange?style=flat-square)](https://github.com/prachizala)
[![Role](https://img.shields.io/badge/Role-Team_Leader-brightgreen?style=flat-square)](https://github.com/prachizala)
[![React Native](https://img.shields.io/badge/React_Native-Expo-black.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-RTDB-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)

---

## 📖 Overview

**MathSprint** transforms traditional math practice into an electrifying, fair-play classroom battle. In each sprint, students compete live against their peers to solve rapid-fire arithmetic, logic, algebra, geometry, and percentage problems under a strict server-synced clock. 

Unlike conventional quiz apps, **MathSprint** is engineered from the ground up with a **zero-trust, server-authoritative architecture**: answers are verified exclusively on the backend, questions sent to clients never contain answer keys, and timers are governed strictly by server timestamps.

---

## 🌟 Key Features

### ⚡ 1. Live 2-Minute Classroom Sprint Battles
- **6-Digit Authoritative Lobby PIN**: Teachers create a sprint, configure custom duration (`60s`, `90s`, `120s`, `180s`) and question count (`5`, `10`, `15`, `20`), and generate a secure PIN.
- **Fair-Play Real-Time Leaderboard**: Live rankings update dynamically with dynamic scoring (+100 base pts, +20 lightning speed bonus for <3.5s answers, and escalating streak multipliers).
- **Teacher Battle Command**: Teachers have complete live control with **Pause**, **Resume**, **End**, and **Cancel** controls. Pausing freezes the clock across all connected devices and locks answer options.
- **Teacher Live Battle Alerts**: Real-time broadcast system for teachers to send motivational alerts and sprint updates directly to contestant screens mid-battle.

### 🏎️ 2. Ghost Racer / Shadow Runner Track
- **Mario Kart-Style Benchmark Track**: Visual real-time race track displayed directly atop the sprint arena.
- **Classroom Pace Telemetry**: Compares the student runner (`🏃`) against the classroom median pace ghost (`👻`) in real-time.
- **Dynamic Advantage Indicators**: Live advantage badge updates dynamically (`🏃 You lead Class Benchmark by +2 Qs!`, `⚡ Neck-and-neck!`, `👻 Ghost is ahead!`).

### 🛡️ 3. Tactical Battle Power-Ups Dock
- **Single-Use Strategic Cards**: Students are equipped with 3 tactical power-ups during live battles and solo speed practice:
  - 🛡️ **Streak Shield**: Protects streak multipliers and prevents reset upon an incorrect answer.
  - 🎯 **50:50 Eliminator**: Instantly eliminates two incorrect answer choices from the current question.
  - ⏱️ **Time Freeze (+5s)**: Grants 5 additional seconds to the countdown clock for complex questions.
- **Zero-Asset Procedural Sound Synthesizer**: Web Audio API sound engine that synthesizes real-time countdown pulses, correct/incorrect harmonics, streak fanfare, power-up activation, shield deflection, and freeze ticks.

### ♟️ 4. Adaptive AI Difficulty Engine (Chess-Style Math Elo)
- **Dynamic Elo Rating (1000–2400)**: Calculates student skill level dynamically using standard Elo probability formulas based on accuracy and solve speed.
- **Live Difficulty Promotion / Demotion**: Students maintaining a 3+ correct streak are automatically promoted to harder problem tiers (Algebra / Complex Multi-step Logic), while struggling students receive restorative fundamentals.
- **Elo Progression Tier Badges**: Bronze (1000–1200), Silver (1201–1400), Gold (1401–1600), Platinum (1601–1800), Diamond (1801–2000), and Grandmaster (2000+).

### ⚔️ 5. Head-to-Head Live Rivalry Widget
- **Rival Tracking Telemetry**: Pinpoints the competitor positioned directly one rank above the student on the leaderboard.
- **Gap & Pace Differential**: Real-time points gap (`Only 80 pts behind Rival!`) and response speed comparison to fuel healthy competitive drive.

### 🛡️ 6. Anti-Cheat & Fair Play Architecture
- **Zero Client Answer Exposure**: Question payloads sent to students during active sprints contain strictly `questionId`, `question`, and `options`. Answer keys and explanations are stored safely on the server and only unlocked *after* the sprint officially terminates.
- **Server-Authoritative Clock**: Client devices cannot manipulate remaining time. The backend rejects any submissions received after the official `endedAt` timestamp.
- **Duplicate Prevention**: Anti-cheat guards strictly reject duplicate submissions on the same question with `409 Conflict`.

### 📊 7. Real, Data-Driven Learning Analytics
- **Question-by-Question Diagnostics**: Class accuracy per problem, identification of the hardest and easiest questions, and class-wide common misconceptions.
- **Topic Mastery Breakdown**: Granular evaluation across Arithmetic, Logic, Algebra, Fractions, Geometry, and Percentages.
- **Intervention Detection**: Automated identification of students who may need targeted support based on accuracy thresholds and response times.

### 🎯 8. Adaptive Difficulty-Based Practice
- **Performance-Aware Drills**: When students launch practice drills (`drill-arithmetic`, `drill-algebra`, etc.), the system analyzes their historical topic accuracy:
  - **Tier 1 (<60% Accuracy)**: 60% Easy, 30% Medium, 10% Hard questions.
  - **Tier 2 (60%–80% Accuracy)**: 20% Easy, 60% Medium, 20% Hard questions.
  - **Tier 3 (>80% Accuracy)**: 10% Easy, 40% Medium, 50% Hard questions.
- **Isolated Practice Mode**: Practice drills run independently without impacting live classroom battles.

### 📶 9. Smart Polling & Offline Resilience
- **Dual-Layer Synchronization**: Combines Firebase Realtime Database for instant push updates with an automatic HTTP polling fallback (2–2.5s) if RTDB is offline, blocked, or experiencing network latency.
- **In-App Server Config Modal**: Seamlessly inspect current server IP, test ping latency, and switch target hosts on the fly (`Laptop LAN`, `Android Emulator 10.0.2.2`, `Localhost`).
- **One-Tap Report Sharing**: Teachers can instantly share formatted classroom battle reports and podium standings via native device sharing.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React Native / Expo Client            │
│  (Student Arena, Live Quiz, Monitoring, Analytics)     │
└───────────────▲────────────────────────▲───────────────┘
                │                        │
       REST API │ (HTTP / JSON)          │ RTDB Listeners /
       Auth / Scoring                    │ Smart Polling Fallback
                │                        │
┌───────────────▼───────────────┐ ┌──────▼───────────────┐
│     Node.js / Express API     │ │ Firebase Realtime DB │
│   - Server scoring & anti-cheat│ │ - Live sprint state  │
│   - Timer enforcement         │ │ - Live leaderboard   │
│   - Adaptive question engine  │ │ - Active contestants │
└───────────────┬───────────────┘ └──────────────────────┘
                │
┌───────────────▼───────────────┐
│     Firestore Data Store      │
│   - 50+ Verified Questions    │
│   - Sprints, Lobbies, Users   │
│   - Completed Answers & Scores│
└───────────────────────────────┘
```

---

## 🔌 API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System status & server health check |
| `POST` | `/api/sprints` | Teacher | Create a new sprint with custom timeLimit & questionCount |
| `POST` | `/api/sprints/:id/lobby` | Teacher | Open lobby and generate authoritative 6-digit PIN |
| `POST` | `/api/lobbies/join` | Student | Join sprint lobby via 6-digit PIN |
| `POST` | `/api/sprints/:id/start` | Teacher | Launch sprint battle (WAITING -> LIVE) |
| `POST` | `/api/sprints/:id/pause` | Teacher | Pause sprint clock and freeze student submission |
| `POST` | `/api/sprints/:id/resume` | Teacher | Resume paused sprint clock |
| `POST` | `/api/sprints/:id/end` | Teacher | Finalize sprint (LIVE -> ENDED) |
| `POST` | `/api/sprints/:id/cancel` | Teacher | Cancel active sprint battle |
| `POST` | `/api/sprints/:id/answers` | Student | Submit answer with responseTimeMs for server scoring |
| `GET` | `/api/sprints/:id/leaderboard` | Authenticated | Live leaderboard standings & points |
| `GET` | `/api/sprints/:id/result` | Authenticated | Unlocked answers & solutions after sprint ends |
| `GET` | `/api/teacher/sprints` | Teacher | Teacher sprint history |
| `GET` | `/api/teacher/analytics` | Teacher | Real-time classroom learning analytics |
| `GET` | `/api/students/performance` | Student | Student topic mastery & weak topic analysis |
| `GET` | `/api/students/recommendations` | Student | Adaptive drill recommendations |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or later
- **npm**: v9 or later
- **Expo Go** app installed on your physical mobile device (Android / iOS)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/prachizala/MATHSPRINT.git
cd MATHSPRINT

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure Environment Variables

**Frontend (`.env` in root):**
```env
EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:5000/api
```
*(Tip: Replace `<YOUR_LAN_IP>` with your machine's Wi-Fi IPv4 address, e.g., `192.168.1.100`)*

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
```

### 3. Start the Backend Server

```bash
cd backend
npm run dev
```
The server will boot and display your local network IP:
```text
🚀 MATHSPRINT Server active on http://0.0.0.0:5000
📡 Accessible on LAN at: http://192.168.x.x:5000/api
```

### 4. Start the Mobile Client

In a separate terminal:
```bash
npm start
```
Scan the displayed QR code using the **Expo Go** app on your phone.

---

## 🧪 Testing & Verification

The project includes automated regression and end-to-end battle test suites:

```bash
# Run TypeScript compilation check
npm run typecheck
npm --prefix backend run typecheck

# Run backend core API unit tests
node backend/test-backend.js

# Run full Phase 4 End-to-End Battle Simulation
node backend/test-e2e-sprint.js
```

---

## 📱 Tech Stack

- **Client**: React Native 0.86, Expo SDK 57, React Navigation v7, TypeScript 5.7
- **Backend**: Node.js, Express 4.21, TypeScript, ts-node-dev
- **Database & Sync**: Firebase Firestore, Firebase Realtime Database (with fallback in-memory store)
- **Icons & Styling**: `@expo/vector-icons`, custom dark/neon design token system

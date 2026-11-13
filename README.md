# MathSprint — Real-Time Competitive Classroom Math Battle Arena

[![Hackathon: Silver Oak Mini Hackathon](https://img.shields.io/badge/Hackathon-Silver_Oak_University_Mini_Hackathon-orange?style=flat-square)](https://github.com/prachizala)
[![Role: Team Leader](https://img.shields.io/badge/Role-Team_Leader-brightgreen?style=flat-square)](https://github.com/prachizala)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-Expo-000020.svg?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_4.21-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-RTDB-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **Real-time multiplayer classroom mathematics battle arena with server-authoritative anti-cheat scoring, live telemetry, and adaptive difficulty drills.**

Developed as a Team Leader project at the **Silver Oak University (SOU) Mini Hackathon**, MathSprint transforms routine math drill practice into an exciting, fair-play classroom battle where students race against a server-synchronized clock.

---

## 🎯 The Problem It Solves

* **Classroom Math Engagement:** Traditional textbook drills and passive worksheets fail to engage students or provide immediate, actionable feedback to teachers.
* **Cheating in Online Quizzes:** Most mobile quiz applications expose answer keys inside the client-side JSON bundle or allow client-side timer manipulation.
* **Our Solution:** A **zero-trust, server-authoritative architecture**:
  * Question payloads delivered to student devices never contain answer keys.
  * Timers are governed strictly by server timestamps; late submissions are automatically rejected.
  * Dual-layer real-time sync via Firebase Realtime Database with intelligent polling fallbacks.

---

## 🚀 Key Features

* ⚡ **Live 2-Minute Sprint Battles:** Teachers launch a sprint with custom durations (`60s`, `90s`, `120s`, `180s`) and a 6-digit lobby PIN.
* 🛡️ **Anti-Cheat Scoring Engine:** Dynamic point scoring (+100 base pts, +20 lightning speed bonus for <3.5s answers, and escalating streak multipliers) verified server-side.
* 📊 **Live Leaderboard & Telemetry:** Instant ranking shifts rendered with fluid animations as students submit solutions.
* 👩‍🏫 **Teacher Battle Command:** Real-time **Pause**, **Resume**, **End**, and **Cancel** controls. Pausing freezes the clock across all connected devices and locks answer options.
* 📈 **Diagnostic Learning Analytics:** Per-question accuracy, identification of common misconceptions, and topic mastery breakdown (Arithmetic, Logic, Algebra, Geometry, Percentages).
* 🎯 **Adaptive Practice Drills:** Performance-aware solo practice drills that adjust problem difficulty based on student historical accuracy.

---

## 🛠️ Tech Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Mobile Client** | React Native (Expo SDK 57), React Navigation v7, TypeScript 5.7 |
| **Backend API** | Node.js, Express 4.21, TypeScript, ts-node-dev |
| **Real-Time Data & Sync** | Firebase Realtime Database (RTDB), Firestore, In-Memory fallbacks |
| **UI & Styling** | Custom neon/dark token design system, `@expo/vector-icons` |
| **Testing & Quality** | TypeScript strict mode, Node.js E2E battle simulations |

---

## 📂 Project Structure

```
MATHSPRINT/
├── App.tsx                     # React Native application root entrypoint
├── app.json                    # Expo configuration and mobile metadata
├── package.json                # Mobile client dependencies and scripts
├── tsconfig.json               # TypeScript compiler options
├── src/                        # Mobile client source code
│   ├── components/             # Reusable UI widgets (cards, timers, buttons)
│   ├── screens/                # Mobile views (Lobby, Battle, Leaderboard, Drills)
│   ├── navigation/             # Stack and tab navigation controllers
│   └── services/               # API clients and Firebase listeners
├── backend/                    # Express + TypeScript authoritative server
│   ├── package.json            # Server dependencies
│   ├── tsconfig.json           # Server TypeScript config
│   ├── src/                    # Backend controllers, models, and scoring logic
│   ├── test-backend.js         # API unit and route tests
│   └── test-e2e-sprint.js      # Phase 4 end-to-end battle simulation
└── firebase/                   # Firebase security rules and configuration
```

---

## 💻 Installation & Run Guide (Tested)

### 1. Prerequisites
* **Node.js 18+** & npm installed
* **Expo Go** app installed on your physical mobile device (Android or iOS)

### 2. Backend Server Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```
* Server will boot on `http://localhost:5000` (and broadcast your LAN IP for physical device connection).

### 3. Run Backend Verification Tests
```bash
# Verify backend API endpoints and scoring logic
node test-backend.js

# Run full end-to-end multiplayer battle simulation
node test-e2e-sprint.js
```

### 4. Mobile Client Setup
```bash
# Return to root directory
cd ..

# Install client dependencies
npm install

# Start Expo development server
npm start
```
* Scan the displayed terminal QR code using **Expo Go** on your phone.

---

## 📸 Screenshots & Demo

| 📱 Student Battle Arena | 📊 Live Leaderboard | 👩‍🏫 Teacher Command Center |
| :---: | :---: | :---: |
| *(Placeholder: Battle Screen)* | *(Placeholder: Leaderboard)* | *(Placeholder: Teacher Dashboard)* |

---

## 🔮 Future Improvements

1. **WebSockets (Socket.io) Primary Channel:** Transition from Firebase RTDB polling to persistent bi-directional WebSockets for sub-50ms latency.
2. **AI Question Generator:** Integration with local LLMs to generate curriculum-aligned math problems automatically.
3. **Sound FX & Haptics:** Audio cues for combo streaks, countdown ticks, and victory fanfare.
4. **Offline Bluetooth Mesh Battles:** Allow peer-to-peer classroom battles without active internet connection.

---

## 👩‍💻 Author & Maintainer

**Prachi Zala**  
*Hackathon Team Leader | BCA Student @ Shanti Business School, Ahmedabad*  

* **LinkedIn:** [linkedin.com/in/prachi-zala-74a08b334](https://www.linkedin.com/in/prachi-zala-74a08b334)  
* **GitHub:** [github.com/prachizala](https://github.com/prachizala)  
* **Portfolio:** [prachizala.github.io/prachi-portfolio](https://prachizala.github.io/prachi-portfolio/)

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).

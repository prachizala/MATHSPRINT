# Changelog & Design Decisions Explained

This document provides a concise architectural guide and interview cheatsheet for **MathSprint**, explaining key technical choices in simple, direct language.

---

## 1. Project Overview

| Property | Details |
|---|---|
| **Core Concept** | Real-time classroom math battle game with live leaderboard and adaptive drills |
| **Client Stack** | React Native (Expo SDK 57), TypeScript, React Navigation v7 |
| **Backend Stack** | Node.js, Express 4.21, TypeScript, Firebase Admin SDK |
| **Realtime Strategy** | Firebase Realtime Database with an automatic HTTP polling fallback (2.0–2.5s) |
| **State Storage** | Firestore for persistent question bank and match history; in-memory fallback for local dev |

---

## 2. Key Architecture & Design Decisions

### 1. Server-Authoritative Anti-Cheat Model
- **The Problem:** In standard mobile quiz games, question payloads sent to the client often contain the correct answer ID or index, making it trivial for tech-savvy students to inspect network traffic and cheat.
- **Our Solution:** Questions sent to student clients strictly contain `questionId`, `question`, and `options`. The correct answer key remains securely stored on the backend.
- **Verification:** When a student taps an answer, their client submits `{ questionId, selectedIndex, responseTimeMs }`. The backend evaluates correctness, calculates speed bonuses (<3.5s = +20 pts), and updates rankings. Answer explanations are only returned *after* the sprint concludes.

### 2. Dual-Layer Synchronization (WebSockets/RTDB + Smart Polling)
- **The Problem:** School Wi-Fi networks often enforce strict firewall policies or packet inspection that blocks persistent WebSocket connections or causes high latency spikes.
- **Our Solution:** The app uses Firebase Realtime Database for instantaneous push synchronization, but automatically falls back to an HTTP polling loop (2.0–2.5 seconds) if RTDB listeners drop or encounter network timeout errors.

### 3. Server-Governed Clock
- **The Problem:** Clients could manipulate their local device clock to grant themselves extra answer time.
- **Our Solution:** All timer expiration checks are validated against `Date.now()` on the server. If an answer arrives after `sprint.endedAt`, it is strictly rejected with `400 Sprint Ended`.

---

## 3. Technical Interview Cheatsheet

### Q: Why did you choose React Native with Expo instead of standard web?
> **Answer:** "In a classroom setting, students primarily have mobile devices. React Native with Expo allowed us to deliver a smooth, high-frame-rate native mobile experience on both Android and iOS from a single TypeScript codebase, while utilizing native haptic feedback and device sharing for battle reports."

### Q: How do you handle high concurrency during simultaneous answer submissions?
> **Answer:** "Answer evaluation runs as lightweight stateless Express routes. Scores and streaks are updated atomically in the database to prevent race conditions, and duplicate submissions for the same question ID return an immediate `409 Conflict`."

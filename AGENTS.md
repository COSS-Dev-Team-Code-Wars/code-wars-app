# AGENTS.md — Code Wars App: Full Codebase Context

> **Purpose:** This file is the single source of truth for any AI agent working on this repository. Before implementing any feature, fixing any bug, or making any change, read this entire document. It covers the full architecture, directory structures, coding patterns, data models, socket events, and API contracts for both `backend/` and `client/`.

---

## Known Bugs and Fixes — READ FIRST

### If score does not reflect in real-time after judge evaluation

Root cause 1: `socketClient.off('evalupdate')` without a handler reference removes ALL listeners for that event globally, including those from other components. Always pass the handler reference: `socketClient.off('evalupdate', handleEvalUpdate)`.

Root cause 2: In `submissionController.ts`, `team.save()` and `submission.save()` must be `await`ed before emitting `evalUpdate()`. Otherwise the socket fires before the DB write completes.

Root cause 3: Socket listeners in `useEffect([socketClient])` capture `location` at mount time (stale closure). Use a `useRef` synced via `useEffect([location.pathname])` to read the current route inside socket closures.

### If closing a modal throws `TypeError: setOpen is not a function`

**Symptom:** Clicking the ✕ close button on certain modals crashes with `setOpen is not a function` at `handleClose`.

**Root cause:** `CustomModal` (and `LeaderboardModal`, `AnnouncementModal`) define `const handleClose = () => setOpen(false)` internally. If the `setOpen` prop is not passed when rendering the component, it is `undefined`, so calling it throws a TypeError.

**Fix:** Always pass `setOpen` when using `CustomModal`. The two offending instances were in `client/src/components/widgets/code-editor/CodeEditor.jsx`:
```jsx
// ❌ Before — setOpen omitted, close button crashes
<CustomModal isOpen={isSubmissionError} windowTitle="Submission Error">
<CustomModal isOpen={isSubmissionSuccess} windowTitle="Submission Success">

// ✅ After — setOpen provided
<CustomModal isOpen={isSubmissionError} setOpen={setIsSubmissionError} windowTitle="Submission Error">
<CustomModal isOpen={isSubmissionSuccess} setOpen={setIsSubmissionSuccess} windowTitle="Submission Success">
```

**Rule:** Every `<CustomModal>`, `<LeaderboardModal>`, and `<AnnouncementModal>` usage **must** include a `setOpen` prop pointing to the corresponding state setter.

---

### If problems do not appear for participants when a round starts or on page refresh

**Symptom:** The problems table stays empty after the admin starts a round, or after the participant refreshes the page. No network error is visible.

**Root cause:** React fires child component effects **before** parent component effects. The sequence when `currRound` changes is:

1. `ViewAllProblemsPage` `useEffect([currRound])` fires → calls `getRoundQuestions()` → reads `currRoundRef.current` which is still `'start'` (the parent's sync effect hasn't run yet) → early-return guard triggers, no fetch happens.
2. THEN `ParticipantLayout` `useEffect([currRound])` fires → updates `currRoundRef.current` to `'EASY'` — too late.

**Fix:** `getRoundQuestions` in `ParticipantLayout.jsx` accepts an optional `roundOverride` parameter. When a known round value is available at the call site, pass it directly instead of relying on the ref.

```javascript
// ParticipantLayout.jsx — getRoundQuestions signature
const getRoundQuestions = async (roundOverride) => {
  const roundToFetch = roundOverride !== undefined ? roundOverride : currRoundRef.current;
  // ...
};

// ViewAllProblemsPage.jsx — pass currRound explicitly
useEffect(() => {
  getRoundQuestions(currRound);  // ✅ bypasses stale ref
}, [currRound]);
```

Socket callbacks in `ParticipantLayout` that call `getRoundQuestions()` without an argument are still safe — they use `currRoundRef.current` which is always up to date by the time a socket event fires.

---

### If a team's score accumulates incorrectly when solving multiple problems in the same round

**Symptom (v1):** A team submits to Q1 (Set A, partial → 80 pts) then Q2 (Set A, correct → 200 pts). Their total score becomes 280 instead of 200.

**Symptom (v2):** A team scores 200 on Q1 A, retries Q2 A and gets 80 — their score stays 200 instead of dropping to 80. Or: a team scores 160, retries and gets a lower score — their score stays 160 instead of reflecting the lower result.

**Business rule:** Participants answer **one question only** per round (from their chosen set). Scoring is based on **last submission strictly** — the score of the most recently graded submission in the round determines the team's round credit. Retrying always replaces the prior score, even if the new score is lower.

**Expected behavior:**
| Event | Old credited | New score | New credited | Delta |
|---|---|---|---|---|
| Q1 graded 200 | 0 | 200 | 200 | **+200** |
| Q1 re-graded 80 | 200 | 80 | 80 | **−120** → total = 80 ✓ |
| Q1 re-graded 500 | 80 | 500 | 500 | **+420** → total = 500 ✓ |
| Q2 graded 80 (after Q1=200) | 200 | 80 | 80 | **−120** → total = 80 ✓ |

**Fix location:** `backend/controllers/submissionController.ts` — `checkSubmission` function.

```typescript
// 1. Get the difficulty (round) of the problem being graded.
const questionDoc = await Question.findById(submission.problem_id);
const problemDifficulty: string = questionDoc ? questionDoc.difficulty : "";

// 2. Get all problems in the same round.
const roundQuestions = await Question.find({ difficulty: problemDifficulty }).select("_id");
const roundQuestionIds: string[] = roundQuestions.map((q: any) => q._id.toString());

// 3. Old credited score: score of the most recently graded submission across
//    all round problems for this team. Current submission is still "Pending" → auto-excluded.
const prevGradedSubs = await Submission.find({
  team_id: submission.team_id,
  problem_id: { $in: roundQuestionIds },
  status: { $ne: "Pending" },
}).sort({ timestamp: -1 });

const oldCreditedScore: number = prevGradedSubs.length > 0 ? (prevGradedSubs[0].score || 0) : 0;

// 4. New credited score: strictly the score from this (now-last) submission.
const newCreditedScore: number = score;

const pointsToAdd = newCreditedScore - oldCreditedScore;  // can be negative
```

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Backend — Full Reference](#3-backend--full-reference)
   - [Tech Stack & Dependencies](#31-tech-stack--dependencies)
   - [Entry Point & Server Setup](#32-entry-point--server-setup)
   - [Database Connection](#33-database-connection)
   - [Data Models (Mongoose Schemas)](#34-data-models-mongoose-schemas)
   - [Controllers](#35-controllers)
   - [Routes & API Endpoints](#36-routes--api-endpoints)
   - [Sockets](#37-sockets)
   - [Coding Patterns — Backend](#38-coding-patterns--backend)
4. [Client — Full Reference](#4-client--full-reference)
   - [Tech Stack & Dependencies](#41-tech-stack--dependencies)
   - [Entry Point & Routing](#42-entry-point--routing)
   - [Pages & Layouts](#43-pages--layouts)
   - [Components](#44-components)
   - [Utilities](#45-utilities)
   - [Socket Client](#46-socket-client)
   - [Coding Patterns — Client](#47-coding-patterns--client)
5. [Feature Domain: Game Rounds](#5-feature-domain-game-rounds)
6. [Feature Domain: Powerups System](#6-feature-domain-powerups-system)
7. [Feature Domain: Submissions & Grading](#7-feature-domain-submissions--grading)
8. [Feature Domain: Authentication](#8-feature-domain-authentication)
9. [Environment Variables](#9-environment-variables)
10. [How to Add a New Feature (Checklist)](#10-how-to-add-a-new-feature-checklist)
11. [Common Gotchas & Notes](#11-common-gotchas--notes)

---

## 1. Project Overview

**Code Wars** is a real-time competitive programming contest platform. Teams submit code solutions to algorithmic problems, judges evaluate those submissions, and an admin controls the game flow (rounds, freeze, logout, announcements). Scores update in real time via WebSockets.

**User Types:**
| Role | Login Field | Capabilities |
|---|---|---|
| `team` | `team_name` | View problems, submit code, buy power-ups |
| `judge` | `judge_name` | View submissions, evaluate/grade submissions |
| `admin` | `admin_name` | Control rounds, freeze/unfreeze screens, create questions/teams, view leaderboard |

**Game Rounds (in order):** `start` → `EASY` (30 min) → `MEDIUM` (45 min) → `WAGER` (15 min) → `HARD` (30 min)

---

## 2. Repository Structure

```
code-wars-app/
├── backend/                  # Express + TypeScript API server
│   ├── config/
│   │   └── db.ts             # MongoDB connection via Mongoose
│   ├── constants.ts          # Shared constants
│   ├── controllers/          # Request handlers (business logic)
│   │   ├── adminController.ts
│   │   ├── authController.ts
│   │   ├── leaderboardController.ts
│   │   ├── powerupController.ts
│   │   ├── questionsController.ts
│   │   ├── submissionController.ts
│   │   ├── teamDetailsController.ts
│   │   ├── teamScoreController.ts
│   │   └── testCaseController.ts
│   ├── models/               # Mongoose schema definitions + TypeScript interfaces
│   │   ├── admin.ts
│   │   ├── judge.ts
│   │   ├── leaderboards.ts
│   │   ├── powerup.ts
│   │   ├── question.ts
│   │   ├── submission.ts
│   │   ├── team.ts
│   │   └── testcase.ts
│   ├── routes/               # Express Router definitions
│   │   ├── adminRoutes.ts
│   │   ├── checkIfLoggedInRoute.ts
│   │   ├── health-check.ts
│   │   ├── leaderboardRoutes.ts
│   │   ├── loginRoute.ts
│   │   ├── powerupRoute.ts
│   │   ├── questionRoutes.ts
│   │   ├── signupRoute.ts
│   │   ├── submissionRoutes.ts
│   │   ├── teamDetailsRoute.ts
│   │   ├── teamScoreRoutes.ts
│   │   └── testCaseRoutes.ts
│   ├── seeders/              # One-off seed scripts
│   │   ├── JudgeSeeder.ts
│   │   └── TeamSeeder.ts
│   ├── sockets/              # Socket.IO logic
│   │   ├── leaderboardsSocket.ts
│   │   ├── powerupSocket.ts
│   │   ├── socket.ts         # Main socket server (port 8000)
│   │   └── submissionSocket.ts
│   ├── server.ts             # Main Express app (port 5000)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json
│   └── Procfile
│
├── client/                   # React 18 SPA (Create React App)
│   ├── public/
│   └── src/
│       ├── App.jsx           # Root: routing + SSE listener + global state
│       ├── index.js          # ReactDOM.render entry
│       ├── theme.js          # MUI theme customization
│       ├── index.css         # Global styles
│       ├── components/
│       │   ├── index.js      # Re-exports all components
│       │   ├── ui/           # Generic UI primitives
│       │   │   ├── ConfirmWindow.jsx
│       │   │   ├── CustomModal.jsx
│       │   │   ├── DropdownSelect.jsx
│       │   │   ├── ErrorWindow.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   ├── SuccessWindow.jsx
│       │   │   ├── Table.jsx
│       │   │   └── Topbar.jsx
│       │   └── widgets/      # Domain-specific composite components
│       │       ├── carousel/
│       │       │   └── SponsorCarousel.jsx
│       │       ├── leaderboard/
│       │       │   └── ParticipantsLeaderboard.jsx
│       │       ├── power-ups/
│       │       │   ├── BuyPowerUpsPopover.jsx
│       │       │   ├── PowerUpList.jsx
│       │       │   └── PowerUpType.jsx
│       │       ├── screen-overlays/
│       │       │   ├── FreezeOverlay.jsx
│       │       │   └── LoadingOverlay.jsx
│       │       └── timer/
│       │           ├── RoundTimer.jsx
│       │           └── ToastContainerConfig.jsx
│       ├── pages/
│       │   ├── index.js      # Re-exports all pages
│       │   ├── layouts/      # Layout wrappers with auth checks
│       │   │   ├── AdminLayout.jsx
│       │   │   ├── JudgeLayout.jsx
│       │   │   └── ParticipantLayout.jsx
│       │   ├── admin/
│       │   │   ├── GeneralOptionsPage.jsx
│       │   │   ├── PowerUpLogs.jsx
│       │   │   ├── TopTeamsPage.jsx
│       │   │   ├── CreateTeamPage.jsx
│       │   │   ├── CreateQuestionPage.jsx
│       │   │   └── TimerPage.jsx
│       │   ├── general/
│       │   │   └── LoginPage.jsx
│       │   ├── judges/
│       │   │   └── ViewSubmissionsPage.jsx
│       │   └── participants/
│       │       ├── ViewAllProblemsPage.jsx
│       │       ├── ViewSpecificProblemPage.jsx
│       │       └── ViewSubmissionLogPage.jsx
│       ├── socket/
│       │   └── socket.js     # Singleton socket.io-client instance
│       └── utils/
│           ├── apiRequest.js       # Axios HTTP helpers: getFetch, postFetch, putFetch, deleteFetch
│           ├── commonFunctions.js  # Shared utility functions
│           ├── constants.js        # baseURL from env
│           ├── dummyData.js        # Static test/demo data
│           ├── enterAdminPassword.js
│           ├── errors.js           # Error constants
│           ├── judge0.js           # Judge0 API integration utility
│           └── OverlayProvider.js  # Context for overlays
│
├── README.md
└── AGENTS.md                 # ← You are here
```

---

## 3. Backend — Full Reference

### 3.1 Tech Stack & Dependencies

| Package | Role |
|---|---|
| `express ^4.18` | HTTP server & routing |
| `mongoose ^7.6` | MongoDB ODM |
| `socket.io ^4.7` | WebSocket server (separate port 8000) |
| `jsonwebtoken ^9.0` | JWT auth token generation & validation |
| `bcrypt ^5.1` | Password hashing |
| `axios ^1.8` | HTTP client (used for external calls) |
| `dotenv ^16` | Environment variable loading |
| `http-proxy-middleware ^3` | Proxies `/socket.io/*` from port 5000 → 8000 |
| `body-parser ^1.20` | JSON request body parsing |
| `cors ^2.8` | CORS middleware |
| `typescript ^5.3` | Type-safe JS compilation |
| `ts-node-dev ^2` | Dev hot-reload (`tsnd server.ts`) |

**Dev command:** `npm run dev:server` → runs `tsnd server.ts`
**Build:** `npm run build:server` → `tsc`
**Seed teams:** `npm run seed`
**Seed judges:** `npm run seed:judge`

### 3.2 Entry Point & Server Setup

**File:** `backend/server.ts`

**Critical pattern — model registration order:**
Models MUST be imported at the very top of `server.ts` before being used anywhere, otherwise Mongoose throws "model not registered" errors.

```typescript
// ALWAYS import models first in server.ts
import "./models/judge";
import "./models/admin";
import "./models/team";
import "./models/question";
import "./models/submission";
import "./models/testcase";
```

**Socket proxy:** The Express app (port `5000`) proxies all `/socket.io/*` requests to the Socket.IO server running on port `8000`:
```typescript
app.use("/socket.io/*", createProxyMiddleware({
  target: 'http://localhost:8000',
  ws: true,
  changeOrigin: true
}));
```

This means the client can connect to socket on the same base URL as the REST API, and the proxy handles forwarding.

**Port behavior:**
- `process.env.PORT || 5000` — REST API
- `8000` — Socket.IO server (hardcoded in `sockets/socket.ts`)

### 3.3 Database Connection

**File:** `backend/config/db.ts`

Uses `MONGO_URI` env variable:
```typescript
await mongoose.connect(process.env.MONGO_URI || "");
```

Fallback env vars for constructing URI manually:
- `DB_USERNAME`, `DB_PASSWORD`, `DB_CLUSTER`, `DB_NAME`

Always call `connectDB()` in `server.ts` before setting up routes. The socket server runs independently; it accesses Mongoose models that are already registered by the main server because both share the same process.

### 3.4 Data Models (Mongoose Schemas)

#### Team (`models/team.ts`)
The central model. All game activity revolves around this model.

```typescript
interface Team extends Document {
  team_name: string;       // Display name & login identifier
  password: string;        // bcrypt hashed
  members: string;         // Comma-separated member names (plain string)
  score: number;           // Current point balance
  total_points_used: number; // Cumulative points spent on power-ups

  // Power-up state (all stored as embedded PowerupInfo objects)
  active_buffs: PowerupInfo[];       // Currently active buffs
  activated_powerups: PowerupInfo[]; // History of all purchased powerups
  debuffs_received: PowerupInfo[];   // Active debuffs applied TO this team

  easy_set: string;    // Which set (e.g., "c") this team solved for easy round
  medium_set: string;  // Which set this team solved for medium round
}
```

**Password handling:**
- Pre-save hook: hashes password with `bcrypt` only when modified
- Instance method: `comparePassword(inputPassword, callback)` — uses `bcrypt.compare`
- Pattern used in `authController.ts`: `user.comparePassword(inputPassword, (err, isMatch) => {...})`

#### Judge (`models/judge.ts`)
```typescript
{
  judge_name: String,   // Login identifier
  password: String      // bcrypt hashed (same pattern as Team)
}
```

#### Admin (`models/admin.ts`)
```typescript
{
  admin_name: String,   // Login identifier
  password: String      // bcrypt hashed (same pattern as Team)
}
```

#### Question (`models/question.ts`)
```typescript
{
  title: String,           // Problem title
  body: String,            // Problem statement (Markdown or plain text)
  points: Number,          // Total possible points
  difficulty: String,      // "easy" | "medium" | "hard" | "wager" (stored lowercase)
  total_cases: Number,     // Number of test cases
  display_id: Number,      // Human-readable ID shown in UI
  samples: String,         // Sample input/output as string
  set: String              // Which set this question belongs to (e.g., "a", "b", "c")
}
```

**Important:** `difficulty` is stored in **lowercase** in the database but displayed in **UPPERCASE** in the UI. Always store lowercase, compare lowercase.

#### Submission (`models/submission.ts`)
```typescript
{
  team_id: String,          // MongoDB ObjectId of the team (stored as string)
  team_name: String,
  judge_id: String,         // "Unassigned" until graded
  judge_name: String,       // "Unassigned" until graded
  problem_id: String,       // MongoDB ObjectId of the question (stored as string)
  problem_title: String,
  possible_points: Number,
  status: String,           // "Pending" | "checked" | "error"
  score: Number,            // Score for THIS submission
  evaluation: String,       // "Pending" | "correct" | "partially correct" | "incorrect solution" | "error" | "No Submission"
  timestamp: Date,
  content: String,          // Full source code submitted
  prev_max_score: Number,   // Highest score of all previous submissions to same problem by same team
  total_test_cases: Number,
  curr_correct_cases: Number,
  filename: String,
  display_id: Number        // Auto-incremented global submission counter
}
```

**Scoring logic (critical):**
```
score = floor(possible_points * correct_cases / total_test_cases)
pointsToAdd = score - submission.score (old value before update)
team.score += pointsToAdd
```
- Only adds the **difference** between old and new score to team score
- `prev_max_score` is carried forward to prevent score exploitation on re-evaluation

#### Powerup (`models/powerup.ts`)
```typescript
interface Powerup extends Document {
  name: string;    // Display name (e.g., "Immunity", "Stun")
  type: number;    // 0 = debuff, 1 = buff
  code: string;    // Internal identifier: 'immune' | 'dispel' | 'unchain' | 'stun' | 'editor' | 'frosty'
  tier: {
    [tier_no: string]: {
      description: string;
      duration: number;   // milliseconds
      cost: number;       // points cost
    }
  }
}

interface PowerupInfo {
  _id: string;        // ID of the Powerup document
  name: string;
  code: string;
  type: number;
  tier: string;       // Which tier was purchased (e.g., "1", "2")
  duration: number;   // milliseconds
  cost: number;
  from?: string;      // Team ID that inflicted the debuff (for debuffs_received)
  target?: string;    // Team ID targeted (for activated_powerups of debuffs)
  startTime: Date;
  endTime?: Date;
}
```

**Powerup codes:**
- `immune` — Immunity (buff, tiers 1-4; tier 4 costs 10% of team score + base cost)
- `dispel` — Dispel a debuff (buff, costs 120% of the debuff's base cost)
- `unchain` — Unchain debuff (buff)
- `stun` — Stun (debuff)
- `editor` — Editor (debuff)
- `frosty` — Frosty Hands (debuff)

#### TestCase (`models/testcase.ts`)
```typescript
{
  problem_id: String,          // MongoDB ObjectId of the question (stored as string)
  display_id: Number,          // Sequential case number
  input: String,
  expected_output: String,
  output_type: String          // e.g., "exact", "float" — governs comparison logic
}
```

#### Leaderboard (`models/leaderboards.ts`)
```typescript
{
  rank: Number,
  teamName: String,
  score: Number,
  totalScore: Number
}
```

**Note:** The actual leaderboard is typically derived by querying `Team.find({}).select(...)` and sorting by score. The `Leaderboard` model appears to be used for snapshots.

### 3.5 Controllers

All controllers follow this standard pattern:

```typescript
import { Request, Response } from 'express';
import mongoose from 'mongoose';

const ModelName = mongoose.model("ModelName");

const handlerFunction = async (req: Request, res: Response) => {
  // Extract params from req.body or req.params or req.query
  // Do DB operations
  // Always return res.send({ ... })
  return res.send({ success: true, results: data });
  // OR on error:
  return res.send({ success: false, results: "error message" });
};

export { handlerFunction };
```

**Key convention:** Always use `return res.send({ success: boolean, ... })`. Never throw — always handle errors in try/catch and return `{ success: false }`.

#### `adminController.ts` — Key exports & global state

This controller holds **module-scoped global variables** that act as the game state:
```typescript
var command = "normal";    // "normal" | "freeze" | "logout"
var buyImmunity = "disabled"; // "enabled" | "disabled"
var round = "start";       // "start" | "EASY" | "MEDIUM" | "WAGER" | "HARD"
var counter = 0;
var endTimer = false;
type Message = { message: string; timestamp: string };
let messages: Message[] = [];
```

These are accessed cross-module:
- `round` — imported in `submissionController.ts` to filter submissions by current difficulty
- `endTimer`, `setEndTimer` — imported in `socket.ts` for timer control
- `messages`, `buyImmunity` — streamed to clients via SSE

**`commandChannel`** — SSE endpoint that streams game state every 1 second:
```typescript
// Streams JSON with: command, buyImmunity, messages, round
res.write(`data: ${JSON.stringify({ command, buyImmunity, messages, round })}\n\n`);
```

**`setAdminCommand`** — When admin changes round, it:
1. Calls `stopRoundTimer()`
2. Sets `duration` based on the new round
3. For `EASY`: calls `freePowerups()` (adds 100 points to all teams)
4. For `MEDIUM`: calls `removePowerups()` (subtracts 100 points from all teams)
5. Calls `startRoundTimer(duration)` after a 1-second delay
6. Handles `freeze` → `pauseRoundTimer()` and `normal` → `resumeRoundTimer()`

#### `authController.ts` — Key functions

- **`signup`**: Creates Team, Judge, or Admin based on `req.body.usertype`
- **`login`**: Checks all three user collections sequentially (Team → Judge → Admin), validates password via `comparePassword`, returns JWT token and user copy with password deleted
- **`checkIfLoggedIn`**: Validates `authToken` from `req.body`
- **`checkTokenMiddleware`**: Express middleware that validates `authToken` from cookies (via `req.headers.cookie`)

**JWT payload:** `{ _id: user._id }` — signed with `process.env.SECRET_KEY_1`

**Auth storage on client:** JWT stored in `localStorage` as `authToken`, and `user` object stored as JSON string in `localStorage`.

#### `submissionController.ts` — Key functions

- **`uploadSubmission`**: Creates submission; tracks `prev_max_score`; triggers `newUpload(results)` socket emit; automatically assigns the team's `easy_set`/`medium_set` on first submission
- **`checkSubmission`**: Grades submission; calculates score difference; updates team score; calls `evalUpdate(submission)` socket emit
- **`getAllSubmissions`**: Aggregates submissions joined with questions, filtered by the **current round** (imported from `adminController`)
- **`getTeamSubmissions`**: Returns recent submissions for a specific team (query param `teamId`)
- **`getLastSubmissionByTeamOfProblem`**: Returns best score metadata for a team-problem pair

#### `powerupController.ts` — Key functions

- **`get_all_powerups`**: Returns all powerup definitions
- **`get_available_powerups`**: Filters powerups by what the team can afford (handles Dispel and Immunity IV special cost logic)
- **`buy_powerup`**: Full purchase logic for buffs and debuffs via HTTP; handles immunity, dispel, and regular debuffs
- **`remove_active_powerup`** (internal): Called on a 1-second interval to clean up expired powerups from all teams

#### `testCaseController.ts` — Key functions

- **`runCode`**: Runs submitted code against test cases (likely via Judge0 integration)
- **`createTestCase`** / **`createMultipleTestCases`**: Admin functions to add test cases
- **`getTestCasesByProblem`**: Fetches test cases for a given problem ID

### 3.6 Routes & API Endpoints

All routes are registered in `server.ts` via `app.use(routeFile)`.

#### Auth Routes
| Method | Path | Controller Function | Description |
|---|---|---|---|
| POST | `/login` | `login` | Login (team/judge/admin) |
| POST | `/signup` | `signup` | Create account |
| POST | `/checkifloggedin` | `checkIfLoggedIn` | Validate token from body |

#### Admin Routes
| Method | Path | Controller Function | Description |
|---|---|---|---|
| GET | `/admincommand` | `commandChannel` | SSE stream of game state |
| POST | `/setcommand` | `setAdminCommand` | Set command + round |
| POST | `/set-buy-immunity` | `setBuyImmunity` | Toggle immunity purchase |
| POST | `/announce` | `setAnnouncement` | Set announcements |
| POST | `/questions` | `generateQuestion` | Create a question (admin) |

#### Question Routes
| Method | Path | Controller Function | Description |
|---|---|---|---|
| GET | `/viewquestions` | `viewQuestions` | Get all questions |
| POST | `/viewquestionsdiff` | `getQuestionsBasedOnDifficulty` | Filter by difficulty |
| POST | `/viewquestioncontent` | `getQuestionContent` | Get question body |
| POST | `/generatequestion` | `generateQuestion` | Create question |

#### Submission Routes
| Method | Path | Controller Function | Description |
|---|---|---|---|
| POST | `/uploadsubmission` | `uploadSubmission` | Submit code |
| POST | `/downloadsubmission` | `downloadSubmission` | Download submission code |
| POST | `/checksubmission` | `checkSubmission` | Judge grades a submission |
| POST | `/viewsubmissions` | `viewSubmissionsTP` | Get submissions by team+problem |
| GET | `/getallsubmissions` | `getAllSubmissions` | Get all submissions (filtered by round) |
| POST | `/getlastsubmissionbyteam` | `getLastSubmissionByTeamOfProblem` | Get best score metadata |
| GET | `/getteamsubmissions` | `getTeamSubmissions` | Team's submission history |

#### Powerup Routes
| Method | Path | Controller Function | Description |
|---|---|---|---|
| GET | `/powerups/` | `get_all_powerups` | All powerup definitions |
| POST | `/powerups/buy` | `buy_powerup` | Purchase a powerup |
| POST | `/powerups/available` | `get_available_powerups` | Affordable powerups for a team |
| GET | `/powerups/:id` | `get_powerup_by_id` | Single powerup by ID |

#### Test Case Routes
| Method | Path | Controller Function | Description |
|---|---|---|---|
| GET | `/testcases/:problemId` | `getTestCasesByProblem` | Get test cases for a problem |
| POST | `/testcases/runcode` | `runCode` | Run code against test cases |
| POST | `/testcases/create` | `createTestCase` | Create single test case |
| POST | `/testcases/create-multiple` | `createMultipleTestCases` | Bulk create test cases |

#### Team & Leaderboard Routes
| Method | Path | Description |
|---|---|---|
| GET | `/teamscore` | Get team score |
| GET | `/teamdetails` | Get team details |
| GET | `/leaderboard` | Get leaderboard |
| GET | `/health` (or similar) | Health check |

### 3.7 Sockets

The Socket.IO server is a **separate process** listening on **port 8000**, initialized in `sockets/socket.ts`. It uses the default namespace.

#### Connection & Room Management

```typescript
let users: { [userId: string]: string } = {};  // userId → socketId mapping

io.on("connection", (socket) => {
  socket.on("join", (user) => {
    socket.join("user:" + user._id);  // Private room per user
    users[user._id] = socket.id;      // Track user's socket
  });
});
```

**Pattern for emitting to a specific user:**
```typescript
// Emit to a user by their MongoDB _id
io.to(users[userId]).emit("eventName", data);
// Broadcast to everyone
io.emit("eventName", data);
```

#### Socket Events — Client Sends (`socket.on`)

| Event | Payload | Description |
|---|---|---|
| `join` | `{ _id: string }` | Client registers their user ID upon login |
| `logout` | — | Client triggers dismissal of toasts |
| `socket-health` | any | Health check ping |
| `getActivePowerups` | — | Request to refresh active powerups |
| `moveRound` | — | Broadcast `startRound` to all clients |
| `buyBuff` | `{ powerUp, userTeam, debuff_to_dispel }` | Purchase a buff via socket |
| `applyDebuff` | `{ powerUp, userTeam, recipientTeam }` | Purchase and apply a debuff via socket |

#### Socket Events — Server Emits (`socket.emit` / `io.emit`)

| Event | Direction | Description |
|---|---|---|
| `update` | Broadcast | Round timer update: `{ remainingTime: number }` — emitted every second |
| `newupload` | Broadcast | New submission uploaded (notifies judges) |
| `evalupdate` | Broadcast | Submission graded (notifies teams) |
| `startRound` | Broadcast | Round has started (triggered by `moveRound`) |
| `newBuff` | To buying user | Buff purchase confirmed |
| `newDebuff` | To recipient | Debuff applied to them |
| `buffEnded` | To affected user | Buff has expired |
| `debuffEnded` | To affected user | Debuff has expired |
| `debuffDispelled` | To buying user | Debuff was dispelled |
| `updateScoreOnBuyBuff` | To buying user | Score updated after buying buff |
| `updateScoreOnBuyDebuff` | To buying user | Score updated after buying debuff |
| `scenarioCheckerBuff` | To buyer | Result: `'success'` \| `'existing'` \| `'insufficient_funds'` |
| `scenarioCheckerDebuff` | To buyer | Result: `'success'` \| `'existing'` \| `'insufficient_funds'` |
| `fetchActivePowerups` | To requester | Trigger client to re-fetch active powerups |
| `dismissToasts` | To user | Dismiss all toast notifications |
| `socket-health-response` | To requester | Health check response |

#### Timer Control (exported from `socket.ts`)

```typescript
startRoundTimer(seconds: number)  // Start/restart timer
pauseRoundTimer()                 // Pause (stores remainingSeconds)
resumeRoundTimer()                // Resume from remaining time
stopRoundTimer()                  // Stop completely, emit 0
```

**Shared with `adminController.ts`:** These functions are imported there to control timer based on admin round changes.

**Important:** Always call `stopRoundTimer()` before `startRoundTimer()` when switching rounds. `setAdminCommand` does this with a 1-second `setTimeout` delay before starting the new timer.

### 3.8 Coding Patterns — Backend

#### Pattern: Controller File Structure
```typescript
// 1. Import types and mongoose
import { Request, Response } from 'express';
import mongoose from 'mongoose';

// 2. Get registered models (NOT from model files directly)
const Team = mongoose.model("Team");

// 3. Each function follows this signature
const myHandler = async (req: Request, res: Response) => {
  try {
    // ... logic
    return res.send({ success: true, results: data });
  } catch (error) {
    return res.send({ success: false, results: "error message" });
  }
};

// 4. Export at the bottom
export { myHandler };
```

#### Pattern: Adding a New Route
1. Create or add handler to appropriate controller in `controllers/`
2. Add the route in the corresponding file in `routes/`
3. If new route file: `import` it in `server.ts` and call `app.use(newRoute)`

#### Pattern: Adding a New Model
1. Define `interface` (TypeScript) and `Schema` in `models/mymodel.ts`
2. Call `mongoose.model("ModelName", schema)` at end of file
3. Import the model file at the **TOP** of `server.ts` (before any other imports that might use it)

#### Pattern: Using a Model in a Controller
```typescript
// Option A: mongoose.model() (most common pattern in this codebase)
const Team = mongoose.model("Team");

// Option B: Named import (used in newer files like powerupController.ts)
import TeamModel, { Team } from '../models/team';
```

Both patterns coexist — do not mix them in the same file.

---

## 4. Client — Full Reference

### 4.1 Tech Stack & Dependencies

| Package | Role |
|---|---|
| `react ^18.2` | UI library |
| `react-router-dom ^6.21` | Client-side routing |
| `@mui/material ^5.15` | Material UI component library |
| `@emotion/react` & `@emotion/styled` | Styling engine for MUI |
| `@mui/x-data-grid ^6.19` | Data grid for submission tables |
| `axios ^1.13` | HTTP client |
| `socket.io-client ^4.7` | WebSocket client |
| `universal-cookie ^7` | Cookie management |
| `react-toastify ^10` | Toast notifications |
| `sweetalert2 ^11` | Modal/alert dialogs |
| `react-simple-code-editor ^0.14` | Code editor widget |
| `prismjs ^1.29` | Syntax highlighting for code editor |
| `react-material-ui-carousel ^3.4` | Carousel widget |
| `lodash ^4.17` | Utility functions (used for `get()` in constants) |

**Dev command:** `npm start` → runs `react-scripts start` on port 3000

### 4.2 Entry Point & Routing

**File:** `client/src/App.jsx`

**Global state managed in App.jsx:**
```javascript
const [freezeOverlay, setFreezeOverlay] = useState(false);
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [currRound, setCurrRound] = useState('START');
const [freezeChecked, setFreezeChecked] = useState(false);
const [buyImmunityChecked, setBuyImmunityChecked] = useState(false);
const [announcementList, setAnnouncementList] = useState([]);

// Refs for use inside SSE closure (avoids stale closure issues)
const roundRef = useRef('START');
const freezeRef = useRef(false);
const immunityRef = useRef(false);
const overlayFreezeLoad = useRef(false);
const announcementRef = useRef([]);
```

**SSE listener (Server-Sent Events):**
```javascript
useEffect(() => {
  const eventSource = new EventSource(`${baseURL}/admincommand`);
  eventSource.onmessage = (e) => {
    const adminMessage = JSON.parse(e.data);
    // Handles: freeze, logout, normal commands
    // Updates: currRound, buyImmunityChecked, announcementList
  };
}, []);
```

**Auth check:** `localStorage.getItem('authToken')` posted to `/checkifloggedin`.

**Route structure:**
```
/                          → LoginPage
/participant/view-all-problems    → ViewAllProblemsPage (inside ParticipantLayout)
/participant/view-specific-problem → ViewSpecificProblemPage (inside ParticipantLayout)
/participant/view-submission-log   → ViewSubmissionLogPage (inside ParticipantLayout)
/judge/submissions                 → ViewSubmissionsPage (inside JudgeLayout)
/admin/general                     → GeneralOptionsPage (inside AdminLayout)
/admin/logs                        → PowerUpLogs (inside AdminLayout)
/admin/podium                      → TopTeamsPage (inside AdminLayout)
/admin/create-team                 → CreateTeamPage (inside AdminLayout)
/admin/create-question             → CreateQuestionPage (inside AdminLayout)
/admin/timer                       → TimerPage (inside AdminLayout)
```

### 4.3 Pages & Layouts

**Layout pattern:** Each layout (`AdminLayout`, `JudgeLayout`, `ParticipantLayout`) is an Outlet wrapper that:
1. Calls `checkIfLoggedIn()` on mount
2. Handles auth redirection
3. Renders `Sidebar`, `TopBar` and an `<Outlet />` for child pages

**Props passed down from App.jsx to layouts:**
```jsx
<ParticipantLayout
  freezeOverlay={freezeOverlay}
  isLoggedIn={isLoggedIn}
  setIsLoggedIn={setIsLoggedIn}
  checkIfLoggedIn={checkIfLoggedIn}
  currRound={currRound}
  isBuyImmunityChecked={buyImmunityChecked}
  currAnnouncements={announcementList}
/>
```

**Admin `GeneralOptionsPage` receives admin-specific refs directly:**
```jsx
<GeneralOptionsPage
  setCurrRound={setCurrRound}
  roundRef={roundRef}
  freezeRef={freezeRef}
  immunityRef={immunityRef}
  announcementRef={announcementRef}
  setFreezeChecked={setFreezeChecked}
  setBuyImmunityChecked={setBuyImmunityChecked}
  setAnnouncementList={setAnnouncementList}
/>
```

### 4.4 Components

**Import pattern:** All components are imported from the barrel `components/` index:
```javascript
import { Sidebar, RoundTimer, BuyPowerUpsPopover } from 'components';
// NOT: import Sidebar from 'components/ui/Sidebar'
```

**Key components:**

| Component | Location | Description |
|---|---|---|
| `RoundTimer` | `widgets/timer/` | Displays countdown timer, listens to `update` socket event |
| `ToastContainerConfig` | `widgets/timer/` | Global toast container with config |
| `BuyPowerUpsPopover` | `widgets/power-ups/` | Popover UI for purchasing powerups |
| `PowerUpList` | `widgets/power-ups/` | List of available powerups |
| `PowerUpType` | `widgets/power-ups/` | Single powerup card |
| `ParticipantsLeaderboard` | `widgets/leaderboard/` | Live leaderboard widget |
| `FreezeOverlay` | `widgets/screen-overlays/` | Full-screen freeze overlay |
| `LoadingOverlay` | `widgets/screen-overlays/` | Loading spinner overlay |
| `SponsorCarousel` | `widgets/carousel/` | Sponsor logo carousel |
| `Sidebar` | `ui/` | Navigation sidebar |
| `TopBar` | `ui/` | Top bar with user info |
| `Table` | `ui/` | Generic data table (wraps MUI DataGrid) |
| `CustomModal` | `ui/` | Reusable modal dialog |
| `DropdownSelect` | `ui/` | Styled dropdown |
| `ConfirmWindow` | `ui/` | Confirmation dialog |
| `ErrorWindow` | `ui/` | Error display |
| `SuccessWindow` | `ui/` | Success display |

### 4.5 Utilities

**File:** `client/src/utils/apiRequest.js`

**The four API helpers — use exclusively for all HTTP calls:**

```javascript
// GET request with optional query params
import { getFetch } from 'utils/apiRequest';
const data = await getFetch(`${baseURL}/viewquestions`);
const data = await getFetch(`${baseURL}/getteamsubmissions`, { teamId: "abc123" });

// POST request
import { postFetch } from 'utils/apiRequest';
const result = await postFetch(`${baseURL}/uploadsubmission`, {
  problemId, teamId, content, ...
});

// PUT request
import { putFetch } from 'utils/apiRequest';

// DELETE request with ID appended to URL
import { deleteFetch } from 'utils/apiRequest';
```

**File:** `client/src/utils/constants.js`
```javascript
const baseURL = process.env.REACT_APP_SERVER_URL;
export { baseURL };
```
Always use `baseURL` for all API calls. Never hardcode URLs.

**File:** `client/src/utils/judge0.js`
- Integration with Judge0 code execution service
- Used for running code directly from the frontend (for "run" feature before submitting)

### 4.6 Socket Client

**File:** `client/src/socket/socket.js`

```javascript
export const socketClient = io(
  get(process.env, "REACT_APP_SOCKET_URL", "http://localhost:8000"),
  { transports: ['websocket', 'polling'], forceNode: true, secure: true }
);
```

**This is a singleton.** Import `socketClient` in any component that needs socket communication:

```javascript
import { socketClient } from 'socket/socket';

// In useEffect (to avoid duplicate listeners):
useEffect(() => {
  socketClient.on('update', (data) => {
    setRemainingTime(data.remainingTime);
  });

  // CRITICAL: Always clean up listeners on unmount
  return () => {
    socketClient.off('update');
  };
}, []);
```

**Join room after login:**
```javascript
// Call immediately after login to enable directed socket messages
socketClient.emit('join', { _id: user._id });
```

### 4.7 Coding Patterns — Client

#### Pattern: Making API Calls in a Component
```jsx
import { postFetch, getFetch } from 'utils/apiRequest';
import { baseURL } from 'utils/constants';

const MyComponent = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getFetch(`${baseURL}/viewquestions`);
      if (response) setData(response.results);
    };
    fetchData();
  }, []);
};
```

#### Pattern: Reading User from localStorage
```javascript
// Get user object
const user = JSON.parse(localStorage.getItem('user'));
const userType = user?.usertype; // "team" | "judge" | "admin"
const userId = user?._id;

// Get auth token
const authToken = localStorage.getItem('authToken');
```

#### Pattern: Socket Listener in Component
```jsx
useEffect(() => {
  // Register listener
  socketClient.on('eventName', (data) => {
    // handle event
  });

  // ALWAYS clean up to prevent duplicate listeners (common bug source)
  return () => {
    socketClient.off('eventName');
  };
}, []);
```

#### Pattern: Toast Notifications
```javascript
import { toast } from 'react-toastify';

toast.success("Buff purchased successfully!");
toast.error("Insufficient points.");
toast.info("A debuff has been applied to your team.");
```

#### Pattern: SweetAlert2 Dialogs
```javascript
import Swal from 'sweetalert2';

const result = await Swal.fire({
  title: 'Confirm Purchase',
  text: 'Are you sure?',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Yes'
});

if (result.isConfirmed) {
  // proceed
}
```

#### Pattern: Adding a New Page
1. Create `PageName.jsx` in appropriate subdirectory under `pages/`
2. Import and export it in `pages/index.js`
3. Add a `<Route>` in `App.jsx` inside the appropriate layout

#### Pattern: Adding a New Component
1. Create `ComponentName.jsx` in `components/ui/` (generic) or `components/widgets/` (domain-specific)
2. Import and export it in `components/index.js`

#### Pattern: MUI Theme
```javascript
import { theme } from 'theme.js';
// Already applied at root via <ThemeProvider theme={theme}>
// Use `sx` prop or `styled()` from @mui/material for custom styles
```

#### Pattern: Environment-based Titles
```javascript
const currentEnv = process.env.REACT_APP_ENVIRONMENT;
if (currentEnv !== 'production') {
  document.title = `[${currentEnv}] - Code Wars`;
}
```

---

## 5. Feature Domain: Game Rounds

The **round system** is the backbone of game flow. It is managed server-side in `adminController.ts` via SSE, and consumed everywhere via the SSE event stream.

**Round lifecycle:**
1. Admin goes to `admin/general` → `GeneralOptionsPage`
2. Admin selects a round from a dropdown and posts to `/setcommand`
3. `setAdminCommand` in `adminController.ts`:
   - Detects round change
   - Stops current timer
   - Applies round-change side effects (free/remove powerup bonuses)
   - Starts new timer
4. SSE stream picks up `round` change and broadcasts to all clients
5. `App.jsx` receives SSE update → updates `currRound` state
6. Components that depend on the round subscribe via props or context

**Timer:**
- Runs in `socket.ts` on the **socket server** (port 8000)
- Emits `update` event every second with `{ remainingTime: number }` (seconds)
- Client `RoundTimer` component listens to this event
- Timer functions (`startRoundTimer`, `pauseRoundTimer`, etc.) are exported and called from `adminController.ts`

**Freeze command:**
- Admin posts `{ command: 'freeze' }` → `pauseRoundTimer()` is called
- SSE broadcasts `command: 'freeze'` → `App.jsx` sets `freezeOverlay = true`
- `FreezeOverlay` component renders for team users
- Admin posts `{ command: 'normal' }` → `resumeRoundTimer()` → `freezeOverlay = false`

---

## 6. Feature Domain: Powerups System

Powerups involve **both** HTTP endpoints and Socket.IO events. Some actions are done via HTTP (`powerupController.ts`), and some via socket events (`socket.ts` `buyBuff`/`applyDebuff`).

**Powerup types:**
- `type: 0` = **Debuff** — applied to an opposing team (`stun`, `editor`, `frosty`)
- `type: 1` = **Buff** — applied to own team (`immune`, `dispel`, `unchain`)

**Purchase flow (socket-based, primary flow):**
1. Client socket emits `buyBuff` or `applyDebuff`
2. `socket.ts` handler:
   - Validates team exists and has enough score
   - Updates MongoDB with `$inc` (score/total_points_used) and `$push` (activated_powerups)
   - Emits `scenarioCheckerBuff/Debuff` to buyer with result
   - Emits `updateScoreOnBuyBuff/Debuff` to trigger client score refresh
   - Emits `newBuff` or `newDebuff` for toast notifications
   - Sets `setTimeout` for expiry emission (`buffEnded`/`debuffEnded`)

**Immunity special rules:**
- Immunity tier 4 costs `powerup.tier["4"].cost + 0.1 * team.score`
- Immunity prevents debuffs from being applied: checked via `active_buffs.find(buff => buff.code === 'immune')`
- Immunity starts at `startTime` but actually activates at the beginning of the next round (medium/hard)

**Debuff expiry handling:**
- Managed in two places: `powerupController.ts` (polling interval), and `socket.ts` (setTimeout)
- `remove_active_powerup()` runs every 1 second to clean up expired powerups for ALL teams
- Cleanup filters by `endTime > currentTime`

---

## 7. Feature Domain: Submissions & Grading

**Submission lifecycle:**
1. Team opens `participant/view-specific-problem` → sees problem + code editor
2. Team writes solution and clicks submit → `postFetch('/uploadsubmission', {...})`
3. `uploadSubmission` controller:
   - Tracks `prev_max_score` from prior submissions
   - Creates `Submission` with status `"Pending"` and evaluation `"Pending"`
   - Emits `newupload` via socket → notifies judges in real time
4. Judge opens `judge/submissions` → sees all pending submissions (filtered by current round)
5. Judge evaluates → posts to `/checksubmission`
6. `checkSubmission` controller:
   - Calculates `score = floor(possible_points * correctCases / total_test_cases)`
   - Computes `pointsToAdd = newScore - oldScore`
   - Updates `team.score += pointsToAdd`
   - Emits `evalupdate` via socket → team's client receives update
7. Team's `ViewAllProblemsPage` or specific problem page updates to show scored status

**Score computation:**
```
score formula: floor( possiblePoints × correctCases / totalTestCases )
delta = newScore - submission.score  ← current score of THIS submission (before update)
team.score += delta
```

The team score is only updated by the delta, not the absolute value. This allows re-evaluation without inflation.

**Scoring for multiple submissions to same problem:**
- First submission: `prev_max_score = 0`
- Subsequent submissions: `prev_max_score = max(prev.prev_max_score, prev.score)`
- This is stored for display purposes but the actual team score update is always delta-based

---

## 8. Feature Domain: Authentication

**Login flow:**
1. Client POSTs `{ username, password }` to `/login`
2. Server searches Team → Judge → Admin collections sequentially
3. Validates password via `comparePassword` (bcrypt)
4. Returns JWT token + sanitized user object
5. Client stores:
   - `localStorage.setItem('authToken', token)`
   - `localStorage.setItem('user', JSON.stringify(userObject))`
6. Client emits `socket.emit('join', { _id: user._id })` to register socket room

**Session validation:**
- Client reads `localStorage.getItem('authToken')` and POSTs to `/checkifloggedin`
- Called on app mount in `App.jsx` and on layout render

**Logout:**
1. Admin posts `{ command: 'logout' }` → SSE broadcasts to all clients
2. Client sees `command === 'logout'` in SSE → clears localStorage, removes cookie, redirects to root
3. Cookie `authToken` is also removed via `universal-cookie`

**Middleware:** `checkTokenMiddleware` in `authController.ts` validates token from cookie headers. Can be added to any route as middleware: `router.get('/protected', checkTokenMiddleware, handler)`.

---

## 9. Environment Variables

### Backend (`backend/.env`)
```
PORT=5000                     # HTTP server port (default: 5000)
MONGO_URI=mongodb+srv://...   # Full MongoDB connection string (primary)
DB_USERNAME=...               # Fallback MongoDB username
DB_PASSWORD=...               # Fallback MongoDB password
DB_CLUSTER=...                # Fallback MongoDB cluster
DB_NAME=...                   # Database name
SECRET_KEY_1=...              # JWT signing secret
```

### Client (`client/.env`)
```
REACT_APP_SERVER_URL=http://localhost:5000   # Backend REST API URL
REACT_APP_SOCKET_URL=http://localhost:8000   # Socket.IO server URL
REACT_APP_ENVIRONMENT=development            # "development" | "production"
```

---

## 10. How to Add a New Feature (Checklist)

### Backend — New Endpoint

- [ ] Define/update Mongoose model in `models/` if new data needed
- [ ] If new model: add `import "./models/mymodel"` at top of `server.ts`
- [ ] Add handler function(s) to appropriate controller in `controllers/`
- [ ] Follow the `async (req: Request, res: Response) => { return res.send({ success, results }) }` pattern
- [ ] Add route in `routes/` file: `router.METHOD('/path', handlerFn)`
- [ ] If new route file: import it in `server.ts` and call `app.use(newRoute)`
- [ ] Export all new functions at the bottom of the controller file

### Backend — New Socket Event

- [ ] Add the event handler inside `io.on("connection", (socket) => { ... })` in `sockets/socket.ts`
- [ ] Emit user-specific events via `io.to(users[userId]).emit(...)`
- [ ] Emit broadcast events via `io.emit(...)`
- [ ] Export any new functions needed by other files at the bottom of `socket.ts`

### Client — New Page

- [ ] Create `PageName.jsx` in correct subdirectory under `pages/`
- [ ] Add import + export to `pages/index.js`
- [ ] Add `<Route path="role/path" element={<PageName />} />` inside the correct layout in `App.jsx`
- [ ] Use `getFetch`/`postFetch` from `utils/apiRequest.js` for all API calls
- [ ] Use `baseURL` from `utils/constants.js` for all API URLs

### Client — New Component

- [ ] Create `ComponentName.jsx` in `components/ui/` or `components/widgets/subdirectory/`
- [ ] Add import + export to `components/index.js`
- [ ] Import using the barrel: `import { ComponentName } from 'components'`

### Client — New Socket Listener

- [ ] Import `socketClient` from `socket/socket`
- [ ] Add `socketClient.on('eventName', handler)` inside a `useEffect`
- [ ] Return cleanup function: `return () => { socketClient.off('eventName') }`

---

## 11. Common Gotchas & Notes

### Backend

1. **Model registration order matters.** If you use `mongoose.model("Team")` before importing `./models/team`, Mongoose throws a "model not registered" error. Always import model files at the top of `server.ts`.

2. **Two powerup purchase paths exist.** The HTTP endpoint (`POST /powerups/buy` via `powerupController.ts`) and the socket event (`buyBuff` / `applyDebuff` in `socket.ts`) both handle purchases. The socket path is the **primary** used in production; the HTTP path exists as well. Do not duplicate logic — if changing purchase behavior, update both.

3. **Round variable is module-level global.** `round` in `adminController.ts` is a plain module-level `var`. It is imported by reference in `submissionController.ts` as `import { round as currentRound }`. If you need to check the current round from a new controller, import it the same way.

4. **Score is always updated via delta, never set directly.** When grading submissions, always compute `delta = newScore - oldSubmissionScore` and do `team.score += delta`. Never set `team.score = newScore` directly.

5. **Immunity tier 4 cost is 10% of team score + base cost.** This must be checked at purchase time AND display time. The client should reflect this dynamic cost.

6. **`problem_id` in Submission is stored as a string, but questions use ObjectIds.** To join submissions with questions in MongoDB aggregation, you must cast: `$addFields: { problem_obj_id: { $toObjectId: "$problem_id" } }`. See `getAllSubmissions` in `submissionController.ts`.

7. **The socket server and Express server are separate processes but share Mongoose models.** They run in the same Node.js process (both imported into the same execution context), so Mongoose model registration from `server.ts` is available in `sockets/socket.ts`.

8. **Powerup expiry has two mechanisms:** `setTimeout` in socket events (for individual powerup expiry after purchase) and the polling interval in `powerupController.ts` (runs every 1 second to clean up all teams). Both must be considered when changing expiry behavior.

9. **`tsnd` (ts-node-dev) is used for hot reload.** Do not change the dev script to `ts-node` or `node` — `tsnd` provides the fast TypeScript watch mode.

### Client

1. **Always clean up socket listeners.** Forgetting `socketClient.off('eventName')` in the `useEffect` cleanup causes duplicate listeners and duplicate state updates. This is a very common bug in this codebase.

2. **`useRef` is used alongside `useState` for SSE closure values.** In `App.jsx`, values like `roundRef` and `freezeRef` mirror their `useState` counterparts. The refs are used inside the SSE event handler (which captures stale closure) while the state updates to trigger re-renders. Always update both the state and the ref when changing these values.

3. **`baseURL` from `utils/constants.js` is read from `REACT_APP_SERVER_URL`.** If this env variable is not set, it will be `undefined`. Always ensure `.env` is configured.

4. **The socket singleton is initialized on module import.** `socketClient` connects immediately when `socket/socket.js` is first imported. Do not import it conditionally or in multiple places expecting separate connections.

5. **All pages are exported from `pages/index.js` and all components from `components/index.js`.** Always use these barrel imports — do not import directly from the file path.

6. **MUI v5 is used.** Use `sx` prop for inline styles, `styled()` from `@mui/material/styles` for styled components. Do not use `makeStyles` (MUI v4 pattern).

7. **Auth token is stored in localStorage, NOT cookies.** The cookie `authToken` exists for legacy reasons and is cleaned on logout, but the primary auth method used for API calls is `localStorage.getItem('authToken')`.

8. **`/* eslint-disable */` is at the top of many files.** This is a pattern in this codebase to suppress linting warnings. It is acceptable to add it to new files if needed, but prefer fixing the actual lint issue.

9. **The `round` value in the client (`currRound`) is always uppercase** (e.g., `'EASY'`, `'MEDIUM'`). On the backend, `round` may be lowercase or mixed. The SSE handler in `App.jsx` calls `.toUpperCase()` on the received value.

10. **Difficulty values in questions are lowercase in the DB** (`'easy'`, `'medium'`, `'hard'`, `'wager'`) but displayed uppercase in the UI. When filtering or comparing, always normalize case.

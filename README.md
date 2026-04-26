<div align="center">

<img src="https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge" alt="Version" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
<img src="https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
<img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
<img src="https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
<img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />

<br/><br/>

# 🧠 ASD Animated Tutor

### A PECS-Inspired Adaptive Learning Platform for Children with Autism Spectrum Disorder

*An evidence-based, full-stack web application that guides children through an 8-stage structured word-learning journey — with real-time adaptive difficulty, spelling validation, speech recognition, and role-based management for teachers and administrators.*

<br/>

[✨ Features](#-features) • [🏗️ Architecture](#️-architecture) • [🚀 Quick Start](#-quick-start) • [📖 Learning Stages](#-learning-stages) • [🤖 Adaptive ML Engine](#-adaptive-ml-engine) • [👥 Role System](#-role-system) • [🔌 API Reference](#-api-reference) • [📁 Project Structure](#-project-structure)

</div>

---

## ✨ Features

### 🎓 For Children (Autism Students)
- **8-Stage PECS-Inspired Learning Flow** — structured journey from pre-test through post-test
- **Live Spelling Feedback** — each typed letter turns green ✅ or red ❌ in real time
- **SpeechRecognition Imitation Stage** — student speaks the word aloud; browser validates it
- **Scrambled Letter Tiles** — tap letters in order to build words (Reading stage)
- **Adaptive Word Selection** — recommended words based on personal mastery history
- **Streak Counter 🔥** — motivational streak badge for consecutive correct answers
- **Celebration Screen ⭐** — animated star rating and score summary on session complete
- **Audio Cues** — Web Speech API reads words aloud with adjustable rate

### 👩‍🏫 For Teachers
- **My Students Dashboard** — view all assigned students in one place
- **Per-Student Progress** — mastery score, weak words, declining trends, session history
- **ML-Powered Recommendations** — adaptive model flags words needing urgent attention
- **Student Notes** — attach private observations and strategies per student
- **Account Approval Workflow** — teacher accounts start inactive; admin activates them

### ⚙️ For Administrators
- **User Management** — view all users, change roles, activate/deactivate accounts inline
- **Teacher Assignment** — assign specific teachers to specific students via modal UI
- **System Stats Dashboard** — total users, teachers, students, active assignments
- **Real-Time Deactivation** — middleware blocks deactivated accounts instantly (no JWT wait)

### 🤖 Adaptive ML Engine
- **Ebbinghaus Forgetting Curve** — mastery decays exponentially if a word isn't practiced
- **Stage-Weighted Scoring** — spelling (1.35×) contributes more than passive presentation (0.40×)
- **Confidence Anchoring** — avoids over-confidence from lucky early answers (anchored to 50% for <20 attempts)
- **Trend Detection** — flags each word as `improving`, `stable`, or `declining`
- **Dynamic Session Sizing** — recommends 3–6 words per session based on current performance

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ASD Animated Tutor                       │
├──────────────────────────┬──────────────────────────────────────┤
│     Frontend (React 18)  │        Backend (Express + MongoDB)   │
│                          │                                      │
│  ┌─────────────────────┐ │  ┌──────────────────────────────┐   │
│  │   Pages             │ │  │   Routes                      │   │
│  │  ├─ LoginPage       │ │  │  ├─ /api/auth (JWT)           │   │
│  │  ├─ RegisterPage    │ │  │  ├─ /api/words (CRUD)         │   │
│  │  ├─ DashboardPage   │ │  │  ├─ /api/sessions             │   │
│  │  ├─ LearningSession │ │  │  ├─ /api/analytics            │   │
│  │  ├─ AnalyticsPage   │ │  │  ├─ /api/admin                │   │
│  │  ├─ AdminPage       │ │  │  └─ /api/teacher              │   │
│  │  ├─ TeacherPage     │ │  └──────────────────────────────┘   │
│  │  ├─ WordsPage       │ │  ┌──────────────────────────────┐   │
│  │  └─ ProfilePage     │ │  │   Models                      │   │
│  └─────────────────────┘ │  │  ├─ User                      │   │
│  ┌─────────────────────┐ │  │  ├─ Word                      │   │
│  │   Auth Context      │ │  │  ├─ Session + StageResult      │   │
│  │   + API Service     │ │  │  ├─ Analytics                  │   │
│  │   + Role Gates      │ │  │  └─ Assignment                 │   │
│  └─────────────────────┘ │  └──────────────────────────────┘   │
│                          │  ┌──────────────────────────────┐   │
│  GSAP Animations         │  │   Utils                       │   │
│  Web Speech API          │  │  └─ adaptiveLearning.js (ML)  │   │
│  SpeechRecognition API   │  └──────────────────────────────┘   │
└──────────────────────────┴──────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.x |
| MongoDB | ≥ 6.x (local or Atlas) |
| npm | ≥ 9.x |

### 1. Clone the Repository

```bash
git clone https://github.com/Deepak27iiita/Autism_tutor.git
cd Autism_tutor
```

### 2. Install All Dependencies

```bash
npm run install-all
```

> This installs root dependencies (Express, Mongoose, etc.) and client dependencies (React, GSAP, Axios) in one command.

### 3. Configure Environment Variables

#### Server (`server/.env`)
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/asd_tutor
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
```

#### Client (`client/.env`)  *(optional — defaults to localhost:4000)*
```env
REACT_APP_API_URL=http://localhost:4000/api
```

### 4. Seed the Database

```bash
node server/seed.js
```

This inserts **15 sample words** across Animals, Food, and Objects categories.

### 5. Start the Application

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| 🖥️ Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:4000/api |
| 🔍 Health Check | http://localhost:4000/api/health |

---

## 📖 Learning Stages

The 8-stage session is inspired by the **Picture Exchange Communication System (PECS)** — a proven method for teaching functional communication to children with ASD.

```
Pre-Test ──► Presentation ──► Recognition ──► Reading
                                                  │
Post-Test ◄── Elicitation ◄── Imitation ◄── Spelling
```

| # | Stage | Interaction | Input Type | Purpose |
|---|-------|-------------|------------|---------|
| 1 | **Pre-Test** | See image → pick word (text MCQ) | Button click | Baseline measurement |
| 2 | **Presentation** | Word + image shown, auto-spoken | None (passive) | Initial encoding |
| 3 | **Recognition** | See word → pick matching image | Image click | Receptive identification |
| 4 | **Reading** | See image → tap scrambled letter tiles | Letter tiles | Decoding + sequencing |
| 5 | **Spelling** | See image → type word (live green/red feedback) | Keyboard | Expressive spelling |
| 6 | **Imitation** | Hear word → speak it aloud (mic records) | Speech/confirm | Verbal production |
| 7 | **Elicitation** | See image only → type word (no hints) | Keyboard | Independent recall |
| 8 | **Post-Test** | Same as Pre-Test | Button click | Retention measurement |

> 💡 **Improvement** = `(postTestScore - preTestScore) / preTestScore × 100%`

---

## 🤖 Adaptive ML Engine

The engine in `server/utils/adaptiveLearning.js` computes a **mastery score (0–100)** for each word a student has practiced.

### Mastery Formula

```
rawScore = weightedAccuracy × 0.50
         + accuracy         × 0.15
         + speedScore       × 0.15    ← faster responses score higher
         + attemptsScore    × 0.20    ← fewer retries score higher

[If spelling data exists]
rawScore = rawScore × 0.65 + spellingAccuracy × 0.35

[Forgetting Curve Decay]
decay = 0.5 ^ (daysSincePractice / 7)   ← halves every 7 days

[Confidence Anchoring]
mastery = decayedScore × confidence + 0.50 × (1 − confidence)
confidence = min(attempts / 20, 1.0)
```

### Stage Weights

| Stage | Weight | Rationale |
|-------|--------|-----------|
| `spelling` | **1.35** | Hardest expressive stage |
| `post-test` | **1.30** | Best retention proof |
| `elicitation` | **1.20** | No hints — pure recall |
| `reading` | **1.10** | Decoding + sequencing |
| `recognition` | **1.00** | Standard receptive skill |
| `imitation` | **1.00** | Verbal production |
| `pre-test` | **0.80** | Baseline only |
| `presentation` | **0.40** | Passive watching |

### What the Model Outputs

| Output | Used For |
|--------|---------|
| `predictedAccuracy` | Analytics page ML score |
| `recommendedAnimationIntensity` | Auto-adjusts GSAP animation speed |
| `recommendedSessionSize` | 3–6 words based on performance |
| `weakWords[]` | Teacher dashboard + word recommendations |
| `decliningWords[]` | Urgent teacher attention flags |
| `dueForReview[]` | Words not practiced in ≥7 days (mastery <80%) |
| `trend` per word | `improving` / `stable` / `declining` |

---

## 👥 Role System

```
┌──────────┐     assigns     ┌─────────┐     teaches     ┌───────────┐
│  Admin   │ ─────────────► │ Teacher │ ─────────────► │   Child   │
│          │                 │         │                 │ (Student) │
│ Full CRUD│                 │ View    │                 │ Learning  │
│ on users │                 │ students│                 │ sessions  │
│ & assign │                 │ Progress│                 │ only      │
└──────────┘                 └─────────┘                 └───────────┘
```

### Role Permissions

| Feature | Child | Teacher | Admin |
|---------|:-----:|:-------:|:-----:|
| Learning Sessions | ✅ | ❌ | ❌ |
| Analytics (own) | ✅ | ✅ | ✅ |
| Word Library (CRUD) | ❌ | ✅ | ✅ |
| My Students Dashboard | ❌ | ✅ | ✅ |
| Admin Panel | ❌ | ❌ | ✅ |
| Assign Teachers | ❌ | ❌ | ✅ |
| Change User Roles | ❌ | ❌ | ✅ |
| Activate/Deactivate | ❌ | ❌ | ✅ |

### Teacher Approval Workflow

```
Teacher Registers
       │
       ▼
isActive = false (pending)
       │
       ▼
Admin sees teacher in Admin Panel
       │
       ▼
Admin clicks "Activate"
       │
       ▼
Teacher can now log in ✅
```

> ⚡ **Real-time deactivation** — the auth middleware checks `isActive` from the DB on **every request**. A deactivated teacher is blocked immediately without waiting for JWT expiry.

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register (teachers start inactive) |
| POST | `/api/auth/login` | Public | Login + get JWT |
| GET | `/api/auth/me` | Private | Get current user |

### Words
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/words` | Private | List words (with filters) |
| GET | `/api/words/recommended` | Private | Adaptive recommended words |
| POST | `/api/words` | Teacher/Admin | Create word |
| PUT | `/api/words/:id` | Teacher/Admin | Update word |
| DELETE | `/api/words/:id` | Teacher/Admin | Delete word |

### Sessions
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/sessions` | Private | Start new session |
| GET | `/api/sessions` | Private | List user sessions |
| PUT | `/api/sessions/:id/results` | Private | Submit stage result (spelling validated server-side) |
| PUT | `/api/sessions/:id/complete` | Private | Complete session + auto-create analytics |

### Analytics
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/analytics/:userId` | Private | Get analytics + summary |
| GET | `/api/analytics/:userId/ml-insights` | Private | Adaptive model predictions |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/users` | Admin | List all users |
| PUT | `/api/admin/users/:id/role` | Admin | Change user role |
| PUT | `/api/admin/users/:id/active` | Admin | Toggle active status |
| GET | `/api/admin/assignments` | Admin | List all assignments |
| POST | `/api/admin/assign` | Admin | Assign teacher to student |
| DELETE | `/api/admin/assign/:id` | Admin | Remove assignment |
| GET | `/api/admin/stats` | Admin | System stats |

### Teacher
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/teacher/students` | Teacher/Admin | Get assigned students |
| GET | `/api/teacher/students/:id/progress` | Teacher/Admin | Full student progress + ML insights |
| PUT | `/api/teacher/students/:id/notes` | Teacher/Admin | Update student notes |

---

## 📁 Project Structure

```
Autism_tutor/
├── 📄 package.json               # Root scripts (dev, server, client)
│
├── server/
│   ├── 📄 index.js               # Express app entry point
│   ├── 📄 seed.js                # Database seeding script
│   ├── .env                      # Environment variables
│   │
│   ├── middleware/
│   │   └── 📄 auth.js            # JWT verify + isActive DB check
│   │
│   ├── models/
│   │   ├── 📄 User.js            # User schema (roles, preferences, stats)
│   │   ├── 📄 Word.js            # Word schema (PECS categories)
│   │   ├── 📄 Session.js         # Session + StageResult schemas
│   │   ├── 📄 Analytics.js       # Per-session analytics record
│   │   └── 📄 Assignment.js      # Teacher ↔ Student assignments
│   │
│   ├── routes/
│   │   ├── 📄 auth.js            # Register / Login / Me
│   │   ├── 📄 users.js           # User preferences
│   │   ├── 📄 words.js           # Word CRUD + recommended
│   │   ├── 📄 sessions.js        # Session lifecycle + spelling validation
│   │   ├── 📄 analytics.js       # Analytics + ML insights
│   │   ├── 📄 admin.js           # Admin: users, roles, assignments
│   │   └── 📄 teacher.js         # Teacher: students, progress, notes
│   │
│   └── utils/
│       └── 📄 adaptiveLearning.js # ML engine v2 (mastery, decay, trends)
│
└── client/
    └── src/
        ├── 📄 App.js             # Routes + RoleGates
        ├── 📄 index.css          # Design system + all component styles
        │
        ├── components/
        │   ├── 📄 Layout.js      # App shell, role-aware nav
        │   ├── 📄 ProtectedRoute.js
        │   └── 📄 RoleGate.js
        │
        ├── context/
        │   └── 📄 AuthContext.js # JWT hydration, login, register, logout
        │
        ├── services/
        │   └── 📄 api.js         # Axios + ACCOUNT_INACTIVE interceptor
        │
        └── pages/
            ├── 📄 LoginPage.js         # Login + inactive/deactivated banners
            ├── 📄 RegisterPage.js      # Register + teacher pending screen
            ├── 📄 DashboardPage.js     # Stats + recent sessions
            ├── 📄 LearningSessionPage.js # 8-stage adaptive session
            ├── 📄 AnalyticsPage.js     # Charts, ML insights, stage accuracy
            ├── 📄 WordsPage.js         # Word CRUD (teacher/admin)
            ├── 📄 ProfilePage.js       # Learning preferences
            ├── 📄 AdminPage.js         # User management + assignments
            └── 📄 TeacherPage.js       # Student progress dashboard
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router 6, GSAP 3, Web Speech API |
| **Styling** | Vanilla CSS (custom design system, no frameworks) |
| **Backend** | Node.js 22, Express 4 |
| **Database** | MongoDB 7, Mongoose 7 |
| **Auth** | JSON Web Tokens (jsonwebtoken), bcryptjs |
| **Validation** | express-validator |
| **Dev Tools** | nodemon, concurrently |

---

## 🔐 Security Notes

- Passwords are hashed with **bcrypt** (10 salt rounds)
- JWT tokens expire after **30 days**
- Auth middleware performs a **real-time DB `isActive` check** on every request — deactivation takes effect instantly
- Server-side **spelling validation** prevents clients from submitting false correct answers
- Role is always read from the **DB** (not the JWT) to prevent stale-role exploitation

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for children with Autism Spectrum Disorder**

*Making learning accessible, adaptive, and joyful — one word at a time.*

</div>

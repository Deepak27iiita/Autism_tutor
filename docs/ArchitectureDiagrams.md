# Architecture Diagrams
## Web-Based Animated Tutor System

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React.js Frontend                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │ Learning │  │ Analytics│  │   Word   │           │   │
│  │  │ Session  │  │ Dashboard│  │Management│           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  │                                                       │   │
│  │  ┌──────────┐  ┌──────────┐                          │   │
│  │  │   GSAP   │  │  Lottie  │                          │   │
│  │  │Animation │  │Character │                          │   │
│  │  └──────────┘  └──────────┘                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │ (JWT Authentication)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVER (Node.js/Express)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Express.js REST API                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │   Auth   │  │ Sessions │  │ Analytics│           │   │
│  │  │  Routes  │  │  Routes  │  │  Routes  │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  │                                                       │   │
│  │  ┌──────────┐  ┌──────────┐                          │   │
│  │  │  JWT     │  │  bcrypt  │                          │   │
│  │  │  Auth    │  │ Password │                          │   │
│  │  └──────────┘  └──────────┘                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   User   │  │   Word   │  │ Session  │  │Analytics │   │
│  │Collection│  │Collection│  │Collection│  │Collection│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Learning Flow State Machine

```
                    [START]
                      │
                      ▼
                 ┌─────────┐
                 │Pre-Test │ (Baseline, no feedback)
                 └────┬────┘
                      │
                      ▼
              ┌───────────────┐
              │ Presentation  │ (Animated highlight + narration)
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Recognition   │ (Visual selection)
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │   Reading     │ (Word-image association)
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │   Spelling    │ (Guided letter animation)
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │  Imitation    │ (Audio-visual cue)
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │  Elicitation  │ (Recall without cues)
              └───────┬───────┘
                      │
                      ▼
                 ┌─────────┐
                 │Post-Test│ (Performance measurement)
                 └────┬────┘
                      │
                      ▼
              [Next Word?] ──Yes──> [Pre-Test] (for next word)
                      │
                     No
                      │
                      ▼
                 [COMPLETE]
```

---

## 3. Animation Pipeline

```
User Interaction
      │
      ▼
┌─────────────────┐
│ Animation       │
│ Controller      │
│ (Intensity)     │
└────────┬────────┘
         │
         ├─── Low Intensity (accuracy < 50%)
         │    └──> Slow animations (1.5s)
         │         └──> More guidance
         │
         ├─── Medium Intensity (50-80%)
         │    └──> Normal speed (1.0s)
         │         └──> Balanced assistance
         │
         └─── High Intensity (≥80%)
              └──> Fast animations (0.6s)
                   └──> Reduced assistance
         │
         ▼
┌─────────────────┐
│  GSAP Timeline  │
│  - highlight     │
│  - morph        │
│  - celebrate    │
│  - focus        │
│  - spell        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DOM Update      │
│  (GPU-accelerated│
│   transform/     │
│   opacity)       │
└─────────────────┘
```

---

## 4. Database ER Diagram

```
┌─────────────┐
│    User     │
├─────────────┤
│ _id (PK)    │
│ username    │
│ email       │
│ password    │
│ role        │
│ preferences │
│ stats       │
└──────┬──────┘
       │
       │ 1:N
       │
       ▼
┌─────────────┐         ┌─────────────┐
│   Session   │    N:M   │    Word     │
├─────────────┤◄─────────┤─────────────┤
│ _id (PK)    │  (through│ _id (PK)    │
│ userId (FK) │  results)│ word        │
│ type        │          │ category    │
│ words[]     │          │ imageUrl    │
│ results[]   │          │ difficulty  │
│ preScore    │          │ pecsPhase   │
│ postScore   │          └─────────────┘
│ improvement │
└──────┬──────┘
       │
       │ 1:N
       │
       ▼
┌─────────────┐
│  Analytics  │
├─────────────┤
│ _id (PK)    │
│ userId (FK) │
│ date        │
│ metrics     │
│ animation   │
│ wordProgress│
└─────────────┘
```

---

## 5. Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ POST /api/auth/login
     │ { email, password }
     ▼
┌──────────┐
│  Server  │
└────┬─────┘
     │
     │ Validate credentials
     │ Hash comparison (bcrypt)
     │
     ├─── Invalid ───> [Error Response]
     │
     └─── Valid ───> Generate JWT
                      │
                      ▼
              ┌──────────────┐
              │  JWT Token   │
              │  (30 days)   │
              └───────┬───────┘
                      │
                      ▼
              ┌──────────────┐
              │  Response    │
              │  { token,    │
              │    user }    │
              └───────┬───────┘
                      │
                      ▼
┌──────────┐
│  Client  │
│  Stores  │
│  Token   │
└────┬─────┘
     │
     │ Subsequent requests
     │ Authorization: Bearer <token>
     ▼
┌──────────┐
│  Server  │
│  Validates│
│  JWT     │
└──────────┘
```

---

## 6. Component Hierarchy (React)

```
App
├── AuthProvider (Context)
│   └── Router
│       ├── Login
│       ├── Register
│       └── PrivateRoute
│           ├── Dashboard
│           │   └── Navbar
│           ├── LearningSession
│           │   ├── Navbar
│           │   ├── LearningStage
│           │   │   ├── CharacterTutor
│           │   │   └── AnimationController
│           │   └── ProgressBar
│           ├── Analytics
│           │   └── Navbar
│           └── WordManagement
│               └── Navbar
```

---

## 7. API Request Flow

```
Client Component
      │
      │ axios.get('/api/words')
      ▼
┌─────────────────┐
│  Axios Client    │
│  + JWT Header    │
└────────┬────────┘
         │
         │ HTTP Request
         ▼
┌─────────────────┐
│  Express Server │
│  /api/words     │
└────────┬────────┘
         │
         │ auth middleware
         ▼
┌─────────────────┐
│  Verify JWT     │
└────────┬────────┘
         │
         ├─── Invalid ───> 401 Unauthorized
         │
         └─── Valid ───> Route Handler
                          │
                          ▼
                  ┌───────────────┐
                  │  Word.find()  │
                  │  (Mongoose)    │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  MongoDB      │
                  │  Query        │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  JSON Response │
                  │  [words...]   │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  Client        │
                  │  Updates UI   │
                  └───────────────┘
```

---

## 8. Animation Intensity Calculation

```
Session Results
      │
      ▼
┌─────────────────┐
│ Calculate       │
│ Accuracy        │
│ correct/total   │
└────────┬────────┘
         │
         ├─── < 50% ───> Low Intensity
         │                 └──> Slow (1.5s)
         │                      More guidance
         │
         ├─── 50-80% ───> Medium Intensity
         │                 └──> Normal (1.0s)
         │                      Balanced
         │
         └─── ≥ 80% ───> High Intensity
                          └──> Fast (0.6s)
                               Reduced assistance
         │
         ▼
┌─────────────────┐
│ Update          │
│ Animation       │
│ Settings        │
└─────────────────┘
```

---

## 9. Deployment Architecture

```
                    [Internet]
                         │
                         ▼
              ┌──────────────────┐
              │   Load Balancer   │
              │   (HTTPS/SSL)     │
              └─────────┬─────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Server  │    │  Server  │    │  Server  │
│Instance 1│    │Instance 2│    │Instance 3│
│(Node.js) │    │(Node.js) │    │(Node.js) │
└────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │   MongoDB       │
            │   (Replica Set) │
            │   - Primary     │
            │   - Secondary   │
            │   - Secondary   │
            └─────────────────┘
```

---

## 10. Data Flow: Learning Session

```
User Starts Session
      │
      ▼
┌─────────────────┐
│ Create Session  │
│ (POST /sessions)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Load Words      │
│ (GET /words)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ For each word:  │
│  For each stage:│
│    - Render UI  │
│    - Animate    │
│    - Get answer │
│    - Save result│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Complete Session│
│ Calculate scores│
│ (PUT /sessions) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update Analytics│
│ (POST /analytics)│
└────────┬────────┘
         │
         ▼
    [Dashboard]
```

---

**Document Version**: 1.0  
**Last Updated**: 2024


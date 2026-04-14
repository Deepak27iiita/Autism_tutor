# System Design Document
## Web-Based Animated Tutor for Children with ASD

### 1. Architecture Overview

#### 1.1 System Architecture
The system follows a **3-tier architecture**:
- **Presentation Layer**: React.js frontend with GSAP/Lottie animations
- **Application Layer**: Node.js/Express.js REST API
- **Data Layer**: MongoDB database

#### 1.2 Technology Stack

**Frontend:**
- React.js 18.2.0
- React Router DOM 6.16.0
- GSAP 3.12.2 (animation timelines)
- Lottie React 2.4.0 (character animations)
- Web Speech API (TTS)
- Axios (HTTP client)

**Backend:**
- Node.js
- Express.js 4.18.2
- MongoDB with Mongoose 7.5.0
- JWT (jsonwebtoken 9.0.2)
- bcryptjs 2.4.3 (password hashing)

**Infrastructure:**
- MongoDB database
- RESTful API design
- JWT-based authentication

### 2. System Components

#### 2.1 Frontend Components

```
client/
├── src/
│   ├── components/
│   │   ├── CharacterTutor.js      # Animated character guide
│   │   ├── LearningStage.js        # Stage-specific UI
│   │   ├── Navbar.js               # Navigation
│   │   └── PrivateRoute.js         # Route protection
│   ├── pages/
│   │   ├── Login.js                # Authentication
│   │   ├── Register.js             # User registration
│   │   ├── Dashboard.js            # Main dashboard
│   │   ├── LearningSession.js      # Core learning flow
│   │   ├── Analytics.js            # Progress tracking
│   │   └── WordManagement.js       # Word CRUD
│   ├── contexts/
│   │   └── AuthContext.js          # Authentication state
│   ├── utils/
│   │   └── animationController.js  # Animation logic
│   └── App.js                      # Root component
```

#### 2.2 Backend Components

```
server/
├── models/
│   ├── User.js                     # User schema
│   ├── Word.js                     # Word vocabulary
│   ├── Session.js                  # Learning sessions
│   └── Analytics.js                # Analytics data
├── routes/
│   ├── auth.js                     # Authentication endpoints
│   ├── users.js                    # User management
│   ├── words.js                    # Word CRUD
│   ├── sessions.js                 # Session management
│   └── analytics.js                # Analytics endpoints
├── middleware/
│   └── auth.js                     # JWT verification
└── index.js                        # Server entry point
```

### 3. Database Design

#### 3.1 Entity Relationship Diagram

```
User (1) ────< (N) Session
User (1) ────< (N) Analytics
Session (N) ────< (N) Word (through results)
```

#### 3.2 Schema Details

**User Collection:**
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: Enum ['child', 'teacher', 'admin'],
  profile: {
    firstName, lastName, age, avatar
  },
  preferences: {
    animationIntensity: Enum ['low', 'medium', 'high'],
    soundEnabled: Boolean,
    autoAdvance: Boolean
  },
  learningStats: {
    totalSessions, totalWordsLearned,
    averageAccuracy, lastSessionDate
  }
}
```

**Word Collection:**
```javascript
{
  word: String,
  category: Enum ['animals', 'food', ...],
  imageUrl: String,
  audioUrl: String,
  difficulty: Enum ['easy', 'medium', 'hard'],
  pecsPhase: Number [1-4],
  metadata: { description, tags }
}
```

**Session Collection:**
```javascript
{
  userId: ObjectId (ref: User),
  sessionType: Enum ['training', 'pre-test', 'post-test'],
  words: [ObjectId] (ref: Word),
  results: [{
    stage: Enum [...],
    wordId: ObjectId,
    correct: Boolean,
    timeSpent: Number,
    attempts: Number,
    animationLevel: String
  }],
  preTestScore: Number,
  postTestScore: Number,
  improvement: Number,
  duration: Number,
  completed: Boolean
}
```

**Analytics Collection:**
```javascript
{
  userId: ObjectId (ref: User),
  date: Date,
  metrics: {
    wordsLearned, accuracyRate,
    averageTimePerWord, sessionsCompleted,
    retentionRate
  },
  animationMetrics: {
    averageIntensity,
    animationAssistedImprovement
  },
  wordProgress: [{
    wordId: ObjectId,
    masteryLevel: Number [0-100],
    lastPracticed: Date,
    timesPracticed: Number
  }]
}
```

### 4. API Design

#### 4.1 Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### 4.2 User Endpoints
- `GET /api/users` - List users (admin/teacher)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id/preferences` - Update preferences

#### 4.3 Word Endpoints
- `GET /api/words` - List words (with filters)
- `GET /api/words/:id` - Get word details
- `POST /api/words` - Create word (admin/teacher)
- `PUT /api/words/:id` - Update word (admin/teacher)
- `DELETE /api/words/:id` - Delete word (admin/teacher)

#### 4.4 Session Endpoints
- `POST /api/sessions` - Create session
- `GET /api/sessions` - List user sessions
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id/results` - Add result
- `PUT /api/sessions/:id/complete` - Complete session

#### 4.5 Analytics Endpoints
- `GET /api/analytics/:userId` - Get user analytics
- `POST /api/analytics` - Create analytics record

### 5. Animation System Architecture

#### 5.1 Animation Controller
The `AnimationController` class manages all animations:

```javascript
class AnimationController {
  - intensity: 'low' | 'medium' | 'high'
  - settings: { duration, ease, scale, opacity }
  
  + setIntensity(intensity)
  + highlightElement(element, callback)
  + morphImageToWord(image, word, callback)
  + celebrateSuccess(element, callback)
  + focusMode(active, background, callback)
  + spellWord(word, letters, callback)
  + calculateIntensity(accuracy)
}
```

#### 5.2 Adaptive Intensity Logic

```
Accuracy < 50%  → Low intensity (slow, guided)
50% ≤ Accuracy < 80% → Medium intensity (normal)
Accuracy ≥ 80% → High intensity (reduced assistance)
```

#### 5.3 Animation Types

1. **Character Animation**: CSS-based idle states (blink, breathe)
2. **Highlight Animation**: GSAP scale + glow effect
3. **Morph Animation**: Image fade-out → Word fade-in with scale
4. **Focus Mode**: Background dim + active element highlight
5. **Spelling Animation**: Letter-by-letter reveal with bounce
6. **Celebration**: Gentle scale + rotation (no flashing)

### 6. Learning Flow State Machine

```
[Start] → Pre-Test → Presentation → Recognition → Reading
   ↓                                                    ↓
Post-Test ← Elicitation ← Imitation ← Spelling ←───────┘
   ↓
[Complete]
```

**State Transitions:**
- Each stage completes → Next stage
- All stages complete for word → Next word
- All words complete → Session complete

### 7. Security Design

#### 7.1 Authentication Flow
1. User registers/logs in
2. Server validates credentials
3. Server generates JWT token
4. Client stores token in localStorage
5. Client sends token in Authorization header
6. Server validates token on protected routes

#### 7.2 Password Security
- Passwords hashed with bcrypt (10 rounds)
- Never stored in plain text
- Never sent in API responses

#### 7.3 Authorization
- Role-based access control (RBAC)
- Middleware checks user role
- Child users can only access own data
- Teachers can access student data
- Admins have full access

### 8. Performance Optimization

#### 8.1 Frontend
- Code splitting with React.lazy()
- Image lazy loading
- Animation GPU acceleration (transform, opacity)
- Debounced API calls

#### 8.2 Backend
- Database indexing on frequently queried fields
- Pagination for large datasets
- Response caching for static data
- Connection pooling

### 9. Deployment Architecture

```
[Client Browser] → [CDN/Static Host] → React App
                              ↓
                    [Load Balancer]
                              ↓
                    [Node.js Server] → [MongoDB]
```

**Recommended:**
- Frontend: Vercel, Netlify, or AWS S3 + CloudFront
- Backend: Heroku, AWS EC2, or DigitalOcean
- Database: MongoDB Atlas (cloud) or self-hosted

### 10. Error Handling

#### 10.1 Frontend
- Try-catch blocks for async operations
- User-friendly error messages
- Fallback UI for failed states
- Network error retry logic

#### 10.2 Backend
- Express error middleware
- Validation error responses
- Database error handling
- 500 error logging (no sensitive data exposed)

---

**Document Version**: 1.0  
**Last Updated**: 2024


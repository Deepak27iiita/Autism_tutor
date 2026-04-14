# Software Requirements Specification (SRS)
## Web-Based Animated Tutor for Children with ASD

### 1. Introduction

#### 1.1 Purpose
This document specifies the requirements for a web-based animated tutor system designed to improve word recognition for children with Autism Spectrum Disorders (ASD). The system implements PECS (Picture Exchange Communication System) methodology with advanced adaptive animations.

#### 1.2 Scope
The system provides:
- Interactive learning sessions with 8 distinct stages
- Adaptive animation system that adjusts based on learner performance
- Multi-role support (Child, Teacher, Admin)
- Comprehensive analytics and progress tracking
- Responsive design for tablet, mobile, and desktop

#### 1.3 Research Foundation
Based on: "Using Web-based Animated Tutors to Improve Word Recognition for Children with Autism Spectrum Disorders"

### 2. Functional Requirements

#### 2.1 User Authentication
- **FR-1.1**: System shall support user registration with role assignment (child, teacher, admin)
- **FR-1.2**: System shall authenticate users via JWT tokens
- **FR-1.3**: System shall maintain user sessions securely

#### 2.2 Learning Flow
- **FR-2.1**: System shall implement Pre-Test stage (baseline assessment, no feedback)
- **FR-2.2**: System shall implement Presentation stage (animated highlight + narration)
- **FR-2.3**: System shall implement Recognition stage (visual selection)
- **FR-2.4**: System shall implement Reading stage (word-image association)
- **FR-2.5**: System shall implement Spelling stage (guided letter animation)
- **FR-2.6**: System shall implement Imitation stage (audio-visual cue)
- **FR-2.7**: System shall implement Elicitation stage (recall without cues)
- **FR-2.8**: System shall implement Post-Test stage (performance measurement)

#### 2.3 Animation System
- **FR-3.1**: System shall provide character-based tutor animations
- **FR-3.2**: System shall adapt animation intensity based on accuracy (low/medium/high)
- **FR-3.3**: System shall implement image-to-word morphing animations
- **FR-3.4**: System shall provide guided focus animations (background dimming)
- **FR-3.5**: System shall display positive reinforcement animations (no flashing)
- **FR-3.6**: System shall synchronize animations with speech synthesis

#### 2.4 Word Management
- **FR-4.1**: Teachers/Admins shall be able to add, edit, and delete words
- **FR-4.2**: System shall support word categorization (animals, food, objects, etc.)
- **FR-4.3**: System shall support PECS phase assignment (1-4)
- **FR-4.4**: System shall support difficulty levels (easy, medium, hard)

#### 2.5 Analytics
- **FR-5.1**: System shall track pre-test and post-test scores
- **FR-5.2**: System shall calculate improvement percentages
- **FR-5.3**: System shall track session history
- **FR-5.4**: System shall provide retention metrics (30-day retention)
- **FR-5.5**: System shall track animation-assisted improvements

### 3. Non-Functional Requirements

#### 3.1 Performance
- **NFR-1.1**: System shall load learning stages within 2 seconds
- **NFR-1.2**: Animations shall run at 60 FPS
- **NFR-1.3**: API responses shall be under 500ms

#### 3.2 Usability
- **NFR-2.1**: Interface shall be intuitive for children with ASD
- **NFR-2.2**: Animations shall be predictable and non-distracting
- **NFR-2.3**: System shall support touch interactions (tablet-friendly)
- **NFR-2.4**: System shall provide clear visual feedback

#### 3.3 Accessibility
- **NFR-3.1**: System shall support keyboard navigation
- **NFR-3.2**: System shall provide focus indicators
- **NFR-3.3**: System shall respect reduced-motion preferences
- **NFR-3.4**: System shall use high-contrast colors

#### 3.4 Security
- **NFR-4.1**: Passwords shall be hashed using bcrypt
- **NFR-4.2**: JWT tokens shall expire after 30 days
- **NFR-4.3**: API endpoints shall be protected with authentication
- **NFR-4.4**: User data shall be encrypted in transit (HTTPS)

#### 3.5 Compatibility
- **NFR-5.1**: System shall work on modern browsers (Chrome, Firefox, Safari, Edge)
- **NFR-5.2**: System shall be responsive (mobile, tablet, desktop)
- **NFR-5.3**: System shall support PWA installation

### 4. ASD-Specific Requirements

#### 4.1 Animation Safety
- **ASD-1.1**: No flashing animations (flicker rate < 3 Hz)
- **ASD-1.2**: No sudden movements or unexpected transitions
- **ASD-1.3**: Animations shall be smooth and predictable
- **ASD-1.4**: Character animations shall be subtle (idle breathing, blinking)

#### 4.2 Cognitive Load
- **ASD-2.1**: One concept per screen
- **ASD-2.2**: Clear visual hierarchy
- **ASD-2.3**: Minimal distractions
- **ASD-2.4**: Consistent layout and navigation

#### 4.3 Reinforcement
- **ASD-3.1**: Positive feedback for correct answers (no negative emotions)
- **ASD-3.2**: Neutral reset for incorrect answers
- **ASD-3.3**: Visual and audio reinforcement
- **ASD-3.4**: Progress indicators (stars, stickers)

### 5. System Constraints

- Must align with research paper methodology
- Must be web-based (HTML5)
- Must support offline functionality (PWA)
- Must be scalable for multiple concurrent users
- Must comply with data privacy regulations (COPPA for children)

### 6. User Roles

#### 6.1 Child (Learner)
- Access learning sessions
- View personal analytics
- Adjust preferences (animation intensity, sound)

#### 6.2 Teacher / Therapist
- All child permissions
- Manage word vocabulary
- View student analytics
- Create learning sessions

#### 6.3 Admin
- All teacher permissions
- User management
- System configuration
- Full analytics access

### 7. Data Requirements

#### 7.1 User Data
- Username, email, password (hashed)
- Role, profile information
- Learning preferences
- Learning statistics

#### 7.2 Word Data
- Word text, category, difficulty
- Image URL, audio URL
- PECS phase
- Metadata (tags, description)

#### 7.3 Session Data
- User ID, session type
- Words used, results per stage
- Pre-test/post-test scores
- Duration, completion status

#### 7.4 Analytics Data
- Daily/weekly metrics
- Accuracy rates
- Retention rates
- Animation effectiveness metrics

### 8. External Interfaces

- Web Speech API (Text-to-Speech)
- MongoDB database
- RESTful API endpoints
- Lottie/Rive animation libraries
- GSAP animation library

### 9. Assumptions and Dependencies

- Users have modern web browsers
- Internet connection for initial load (PWA for offline)
- MongoDB database server available
- Image and audio assets hosted externally or locally
- Teachers/therapists are trained in PECS methodology

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Author**: Development Team


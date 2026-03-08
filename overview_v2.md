## SideKick — Implementation Overview (Current State)

### Core Idea
A women-only (self-declared), **university-email-verified** mobile app that accelerates student life via:
1) **Fast Q&A** (trusted answers for modules/admin/careers, categorized by course and level)
2) **Safe Walk (1:1)**: quickly match with another verified student to walk together, confirm identity using a per-session PIN, and coordinate via a live map
3) **Community Chat**: real-time messaging with fellow verified students

---

## Implemented Features
### ✅ Completed Core Features
- **Authentication**
  - Student email sign-in with domain allowlist (.edu, .ac.uk)
  - Firebase Authentication (Email/Password)
  - Auto-generated nickname (displayed everywhere instead of real name)
  - Nickname regeneration (up to 3 times)
  
- **Home Dashboard** *(Added beyond MVP)*
  - Personal stats display (Safe Walks completed, Questions answered, Total help count)
  - Real-time notifications feed
  - Recent activity overview
  
- **Q&A System**
  - Post questions with course and academic level categorization
  - Answer questions
  - Mark answers as helpful (with counter)
  - Delete own questions/answers
  - Real-time question feed with live updates
  - Author nicknames displayed for privacy
  
- **Safe Walk 1:1**
  - Create request (from/to labels, leaving in: 0/5/10/15 mins)
  - Browse nearby requests
  - Accept request (first-come-first-served matching)
  - Auto-create session with 2 unique PINs (4-6 digits)
  - PIN mutual confirmation
  - Live map with 2 markers (updated every ~10s)
  - Real-time location tracking using Expo Location
  - End session functionality
  - Stats tracking (safeWalkCount increments)
  - Nearby user notifications
  
- **Community Chat** *(Added beyond MVP)*
  - Global chat for all verified students
  - Real-time messaging
  - Anonymous nicknames
  - Scrollable message history
  
- **Profile Management**
  - View auto-generated nickname
  - Regenerate nickname (limited to 3 times)
  - View contribution stats
  - Sign out

### 🚫 Out of Scope (As Planned)
- Alumni access
- Government ID / AI selfie verification
- Group walks (only 1:1)
- Push notifications (in-app only)
- Full route navigation with turn-by-turn directions

---

## UX / Screen Flow (Implemented)

### Auth + Onboarding
1. **Welcome Screen**: App logo and tagline with navigation to "What is SideKick"
2. **What is SideKick**: Feature overview with icons (Q&A, Safe Walk, Community)
3. **Register Screen**: 
   - Enter university email (.edu or .ac.uk)
   - Enter password (min 6 characters)
   - Toggle between sign-in and sign-up modes
   - Auto-generated nickname created on signup

### Main Navigation (5 Tabs)
**Tab 1: Home** *(Added beyond MVP)*
- Dashboard with personal stats
- Safe Walks completed count
- Questions answered count
- Total help provided
- Notifications feed (recent 5)
- Notification types: new_answer, walk_matched, walk_verified, walk_request_nearby

**Tab 2: Q&A**
- Questions Feed (live-updating)
  - Displays: author nickname, course, level, title, answer count
  - Sorted by creation time (newest first)
- "Ask Question" button → modal form
  - Title input
  - Body textarea
  - Course input (manual entry)
  - Level selector (1-4)
- Question Detail view
  - Full question with author info
  - All answers with helpful counts
  - "Answer" button → answer input
  - Mark Helpful button on each answer
  - Delete options for authors

**Tab 3: Chat** *(Added beyond MVP)*
- Global chat room
- Real-time message feed
- Message bubbles styled by sender (own vs others)
- Text input at bottom
- Auto-scroll to latest message
- Shows nickname for each message
- Timestamp included

**Tab 4: Safe Walk**
- Main view with two primary actions:
  - "Create Request" button
  - "View Requests" button
- **Create Request Modal**:
  - "From" location input
  - "To" location input
  - "Leaving in" picker (Now / 5 min / 10 min / 15 min)
  - Submit creates request visible to nearby users
- **Request Board**:
  - List of open requests near user
  - Shows: author nickname, from → to, leaving time, created time
  - "Accept" button on each request
- **Session Screen** (after matching):
  - Status indicator (Matched / Verified / Ended)
  - Shows: partner nickname, your PIN (visible), partner PIN input
  - Verification button
  - Location permission request
  - Live Map view with two markers
  - Last updated timestamps for each marker
  - "End Walk" button
- **Map Screen**:
  - React Native Maps implementation
  - Two custom markers (You + Partner)
  - Auto-centered on user's location
  - Updates every 10 seconds via Firestore

**Tab 5: Profile**
- Display nickname
- "Regenerate Nickname" button (shows remaining count)
- Stats display (mirrors Home dashboard)
- "Sign Out" button

---

## Safety Design (Implemented & Enhanced)
- ✅ No real names displayed (nickname only)
- ✅ Campus-only access via verified email domain
- ✅ PIN handshake:
  - Each user sees only *their* PIN initially
  - Must enter partner's PIN to unlock "Verified" status
  - Prevents random location sharing
- ✅ Location sharing only during active verified sessions
- ✅ Session-based tracking (auto-expires on end)
- ⏰ Block/Report (deferred to future enhancement)

---

## Tech Stack (Implemented)
**Frontend & Mobile**
- React Native 0.81.5 with Expo SDK 54
- React Navigation v7 (Bottom Tabs + Native Stack)
- NativeWind 4.2 (Tailwind CSS for React Native)
- TypeScript 5.9

**Backend & Services**
- Firebase Authentication 12.10 (Email/Password)
- Cloud Firestore 12.10 (Real-time database)
- Firestore Security Rules

**Location & Maps**
- Expo Location 19.0.8
- React Native Maps 1.20.1
- Real-time location updates

**UI/UX**
- Lucide React Native 0.577 (Icons)
- Custom color palette (warm neutrals)
- Georgia font family (serif)
- React Native Safe Area Context

---

## Data Model (Implemented)

### users/{uid}
- nickname: string
- email: string
- nicknameRegenCount: number (max 3)
- safeWalkCount: number
- questionsAnswered: number
- location: { lat, lng, updatedAt } *(optional)*
- createdAt: timestamp

### questions/{qid}
- authorId: string
- authorNickname: string *(added for display)*
- title: string
- body: string
- course: string *(added: e.g., "Computer Science")*
- level: number *(added: 1-4 for year of study)*
- answerCount: number *(added for performance)*
- createdAt: timestamp

### questions/{qid}/answers/{aid}
- authorId: string
- body: string
- helpfulCount: number
- createdAt: timestamp

### walkRequests/{rid}
- requesterId: string
- authorNickname: string *(added)*
- fromLabel: string
- toLabel: string
- leavingInMins: number (0/5/10/15)
- status: "open" | "matched" | "expired"
- matchedSessionId: string | null
- notifiedUserIds: string[] *(added: prevents duplicate notifications)*
- createdAt: timestamp

### walkSessions/{sid}
- userAId: string (requester)
- userBId: string (acceptor)
- pinA: string (4-6 digits)
- pinB: string (4-6 digits)
- verifiedA: boolean
- verifiedB: boolean
- status: "matched" | "verified" | "ended"
- userALocation: { lat, lng, updatedAt } | null
- userBLocation: { lat, lng, updatedAt } | null
- createdAt: timestamp
- endedAt: timestamp | null

### chatMessages/{mid} *(Added)*
- authorId: string
- nickname: string
- text: string
- createdAt: timestamp

### notifications/{nid} *(Added)*
- userId: string
- type: "new_answer" | "walk_matched" | "walk_verified" | "walk_request_nearby"
- read: boolean
- text: string
- createdAt: timestamp

---

## Matching Logic (Implemented)
1. **User A creates a request** → appears in Request Board for nearby users
2. **User B taps Accept** → system creates session:
   - Generate random pinA + pinB (4-6 digits each)
   - Set request.status = "matched"
   - Link request to session via matchedSessionId
   - Navigate both users to Session screen
3. **Nearby notifications**: Users within 200m get notified of new requests
4. **Location-based filtering**: Uses user location data to show relevant requests

---

## Live Map (Implemented)
- Location permission requested when session starts
- App updates user's location in session document every ~10 seconds
- Both users subscribe to session document for real-time updates
- Map displays:
  - User's marker (current position)
  - Partner's marker (from Firestore)
  - "Last updated" timestamps for each
- Map auto-centers on user's location
- Uses Expo Location API + React Native Maps
- Location data stored in session document:
  ```javascript
  userALocation: { lat, lng, updatedAt }
  userBLocation: { lat, lng, updatedAt }
  ```

---

## Demo Script (Implemented Features)

### Two-Device Walkthrough (2-3 minutes)
1. **Sign Up/Sign In**
   - Device A: Sign up with university email (.edu) → auto-generated nickname (e.g., "CozyPanda42")
   - Device B: Sign up with different university email → different nickname

2. **Home Dashboard**
   - View stats: 0 safe walks, 0 questions answered
   - Empty notifications feed

3. **Q&A Feature**
   - Device A: Ask question ("Best resources for CS101?", Course: Computer Science, Level: 1)
   - Device B: View question in feed, post answer
   - Device A: Mark answer as helpful
   - Both: See stats update (Device B: questionsAnswered +1)

4. **Community Chat**
   - Device A: Send message "Hello from CozyPanda!"
   - Device B: Receive message in real-time, reply

5. **Safe Walk**
   - Device A: Create request (From: "Library", To: "Student Dorms", Leaving: "Now")
   - Device B: View request in Request Board, tap Accept
   - Both devices: Navigate to Session Screen

6. **PIN Verification**
   - Device A shows: "Your PIN: 3847" + input field
   - Device B shows: "Your PIN: 5692" + input field
   - Exchange PINs verbally, each enters partner's PIN
   - Both tap "Verify"
   - Session status → "Verified"

7. **Live Map Tracking**
   - Both devices: See two markers on map
   - Move devices → markers update every ~10 seconds
   - Timestamps show "Last updated X seconds ago"

8. **End Session**
   - Either device: Tap "End Walk"
   - Both: Session ends, safeWalkCount increments
   - Both: Return to Safe Walk screen, notification appears

9. **Profile**
   - View updated stats
   - Try regenerating nickname (up to 3 times)

---

## Key Achievements
- ✅ Full authentication flow with university email validation
- ✅ Real-time Q&A system with helpful markers
- ✅ Complete Safe Walk 1:1 matching with PIN verification
- ✅ Live location tracking and map visualization
- ✅ Community chat feature
- ✅ Dashboard with stats and notifications
- ✅ Privacy-first design with anonymous nicknames
- ✅ Professional UI with custom color palette and typography
- ✅ Type-safe implementation with TypeScript

## Future Enhancements
- [ ] Push notifications (currently in-app only)
- [ ] Group walks (3-4 people)
- [ ] Advanced reporting and blocking
- [ ] Turn-by-turn navigation
- [ ] Q&A search and filtering
- [ ] User reputation system
- [ ] Dark mode
- [ ] Multi-university support
- [ ] Emergency contact notifications

<div align="center">
  <h1>🌸 SideKick</h1>
  <p><strong>A women-only student safety & community platform</strong></p>
  <p><em>Built for Durham University students, by women for women</em></p>
</div>

![SideKick](https://github.com/user-attachments/assets/d75db554-f622-47e5-84fe-1a5dbbeb0a43)

---

## 🎯 Overview

**SideKick** is a privacy-first mobile application designed to create a safer, more connected campus experience for female students. With university email verification and anonymous nicknames, students can access trusted help and find safe walking companions—all within a verified community.

### 💡 The Problem

Female students face two key challenges on campus:
- **Scattered Information**: Academic and administrative help is fragmented across group chats, societies, and informal networks, making it difficult to find trusted advice quickly.
- **Safety Concerns**: Late-night campus routines can feel unsafe, and finding a trusted walking partner is difficult without exposing personal information to strangers.

### ✨ The Solution

SideKick provides a **verified, anonymous, and safe** platform with three core features:

1. **📚 Q&A Community**
   - Ask and answer questions by course and level
   - Get trusted advice on modules, admin, careers, and campus life
   - Mark helpful answers to build collective knowledge
   
2. **🚶‍♀️ Safe Walk (1:1 Matching)**
   - Request a walking partner for any campus route
   - Real-time location sharing with live map view
   - PIN verification system for safe meet-ups
   - First-come, first-served matching with verified students
   
3. **💬 Community Chat**
   - Connect with fellow students in a verified, women-only space
   - Share experiences, advice, and support
   - Real-time messaging with anonymous nicknames

---

## 🔐 Safety & Privacy Features

- **🎓 University Email Verification**: Only students with `.edu` or `.ac.uk` email addresses can sign up
- **🎭 Anonymous Nicknames**: Auto-generated nicknames (e.g., "CozyPanda42") replace real names throughout the app
- **📍 Session-Based PIN Verification**: Each Safe Walk generates unique PINs for both users to exchange before starting
- **🗺️ Live Location Tracking**: Real-time map updates every 10 seconds during active walks
- **👤 Nickname Regeneration**: Users can regenerate their nickname up to 3 times for added privacy
- **🔒 Women-Only Community**: Self-declared women-only platform for a safer space

---

## 📱 Features

### Home Dashboard
- Personal stats: Safe Walks completed, Questions answered, Total help provided
- Real-time notifications for new answers, walk matches, and verifications
- Quick access to recent activity

### Q&A System
- **Post Questions**: Categorize by course and academic level
- **Provide Answers**: Share knowledge with the community
- **Mark Helpful**: Highlight the most useful responses
- **Delete Management**: Authors can delete their own questions/answers
- **Real-time Updates**: Live feed of community questions

### Safe Walk
- **Create Requests**: Set pickup/destination points and departure time (now/5/10/15 min)
- **Browse Nearby Requests**: See available walking partners in your area
- **Accept & Match**: First-come, first-served matching system
- **PIN Verification**: Exchange 4-6 digit PINs when you meet in person
- **Live Map**: Track each other's location in real-time during the walk
- **End Session**: Complete walks and increment your safety stats

### Profile Management
- View your auto-generated nickname
- Regenerate nickname (up to 3 times)
- Track your contribution stats
- Sign out securely

---

## 🛠️ Tech Stack

**Frontend & Mobile**
- [React Native](https://docs.expo.dev/) 0.81.5 with Expo SDK 54
- [React Navigation](https://reactnavigation.org/) (Bottom Tabs + Native Stack)
- [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- [TypeScript](https://www.typescriptlang.org/) for type safety

**Backend & Services**
- [Firebase Authentication](https://firebase.google.com/docs/auth) (Email/Password)
- [Cloud Firestore](https://firebase.google.com/docs/firestore/) (Real-time database)
- Firestore Security Rules for data protection

**Location & Maps**
- [Expo Location API](https://docs.expo.dev/versions/latest/sdk/location/)
- [React Native Maps](https://docs.expo.dev/versions/latest/sdk/map-view/)
- Real-time location updates

**UI/UX**
- [Lucide](https://lucide.dev/) React Native (Icons)
- Custom color palette (warm neutrals)
- Georgia font family
- [Safe Area Context](https://docs.expo.dev/versions/latest/sdk/safe-area-context/) for device compatibility

---

## 📦 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/en) (v22 or higher)
- [npm](https://www.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/more/expo-cli/)
- [Expo Go](https://expo.dev/go) (or an iOS/Android simulator)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Bapp1212/sidekick.git
   cd sidekick/SideKick
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Email/Password authentication
   - Create a Firestore database
   - Copy your Firebase config to `src/firebase.ts`:
     ```typescript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```

4. **Set up Firestore Security Rules**
   - Deploy the rules from `firestore.rules` to your Firebase project

5. **Update allowed email domains** (optional)
   - Edit `src/authHelpers.ts` to add your university's email domain

6. **Start the development server**
   ```bash
   npm start
   ```

7. **Run on your device**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

---

## 📂 Project Structure

```
SideKick/
├── assets/
│   ├── font/                    # Georgia font family
│   └── wordmark.svg             # App logo
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── PrimaryButton.tsx
│   │   └── Screen.tsx
│   ├── navigation/              # Navigation configuration
│   │   ├── MainTabs.tsx         # Main app tabs
│   │   ├── OnboardingStack.tsx  # Onboarding flow
│   │   └── RootNavigator.tsx    # Root navigation logic
│   ├── screens/
│   │   ├── onboarding/          # Welcome & registration screens
│   │   └── tabs/                # Main app screens
│   │       ├── HomeScreen.tsx
│   │       ├── QAScreen.tsx
│   │       ├── ChatScreen.tsx
│   │       ├── SafeWalkScreen.tsx
│   │       └── ProfileScreen.tsx
│   ├── theme/
│   │   └── tokens.ts            # Design tokens (colors, spacing)
│   ├── authHelpers.ts           # Authentication utilities
│   ├── dbHelpers.ts             # Firestore database operations
│   └── firebase.ts              # Firebase configuration
├── App.tsx                      # App entry point
├── package.json                 # Dependencies
└── tsconfig.json                # TypeScript configuration
```

---

## 🗄️ Data Model

### Collections

**users/{uid}**
```typescript
{
  nickname: string,
  email: string,
  nicknameRegenCount: number,    // Max 3
  safeWalkCount: number,          // Increments per completed walk
  questionsAnswered: number,      // Increments per answer posted
  location: {                     // Current location (optional)
    lat: number,
    lng: number,
    updatedAt: timestamp
  },
  createdAt: timestamp
}
```

**questions/{qid}**
```typescript
{
  authorId: string,
  authorNickname: string,
  course: string,                 // e.g., "Computer Science"
  level: number,                  // 1-4 (year of study)
  title: string,
  body: string,
  answerCount: number,
  createdAt: timestamp
}
```

**questions/{qid}/answers/{aid}**
```typescript
{
  authorId: string,
  body: string,
  helpfulCount: number,
  createdAt: timestamp
}
```

**walkRequests/{rid}**
```typescript
{
  requesterId: string,
  authorNickname: string,
  fromLabel: string,              // "Library"
  toLabel: string,                // "College Dorms"
  leavingInMins: number,          // 0, 5, 10, or 15
  status: "open" | "matched" | "expired",
  matchedSessionId: string | null,
  notifiedUserIds: string[],      // Prevents duplicate notifications
  createdAt: timestamp
}
```

**walkSessions/{sid}**
```typescript
{
  userAId: string,                // Requester
  userBId: string,                // Acceptor
  pinA: string,                   // 4-6 digit PIN for user A
  pinB: string,                   // 4-6 digit PIN for user B
  verifiedA: boolean,             // Has A verified B's PIN?
  verifiedB: boolean,             // Has B verified A's PIN?
  status: "matched" | "verified" | "ended",
  userALocation: { lat, lng, updatedAt } | null,
  userBLocation: { lat, lng, updatedAt } | null,
  createdAt: timestamp,
  endedAt: timestamp | null
}
```

**chatMessages/{mid}**
```typescript
{
  authorId: string,
  nickname: string,
  text: string,
  createdAt: timestamp
}
```

**notifications/{nid}**
```typescript
{
  userId: string,
  type: "new_answer" | "walk_matched" | "walk_verified" | "walk_request_nearby",
  read: boolean,
  text: string,                   // Human-readable message
  createdAt: timestamp
}
```

---

## 🚀 Key Workflows

### Safe Walk Flow

1. **User A creates a walk request**
   - Specifies: from location, to location, departure time
   - Request appears in "Request Board" for all nearby users

2. **User B accepts the request**
   - System creates a `walkSession` with:
     - Random PIN for User A (e.g., `3847`)
     - Random PIN for User B (e.g., `5692`)
   - Both users navigate to "Session Screen"

3. **In-person meet-up**
   - User A sees: "Your PIN: **3847**" + input field "Enter partner's PIN"
   - User B sees: "Your PIN: **5692**" + input field "Enter partner's PIN"
   - Each user verbally shares their PIN and enters partner's PIN

4. **PIN verification**
   - When both PINs are correctly entered, session status → "verified"
   - Location sharing activates

5. **Live map tracking**
   - Both markers update every ~10 seconds
   - Users can see each other's real-time location

6. **End session**
   - Either user can end the session
   - Both users' `safeWalkCount` increments
   - Notification sent to both users

---

## 🎨 Design Philosophy

**Color Palette**
- **Background**: `#f4ece4` (Warm cream)
- **Card Background**: `#ddd9d4` (Light taupe)
- **Primary**: `#85817d` (Warm gray)
- **Secondary**: `#5b798a` (Muted teal)
- **Input Background**: `#f9f4ee` (Soft ivory)

**Typography**
- **Font Family**: Georgia (serif) for warmth and approachability
- **Weights**: Regular, Italic, Bold, Bold Italic

**Design Principles**
- Warm, neutral tones for a welcoming feel
- Minimal UI to reduce cognitive load
- Clear visual hierarchy
- Accessible contrast ratios
- Consistent iconography (Lucide icons)

---

## 🔒 Security Considerations

### Authentication
- Email/password authentication via Firebase
- University email domain validation (`.edu`, `.ac.uk`)
- No email verification required (simplified for demo)

### Data Protection
- Firestore security rules enforce user-specific data access
- Real names never stored or displayed
- Location data only shared during active Safe Walk sessions
- Session PINs are single-use and session-specific

### Privacy
- All interactions use auto-generated nicknames
- Users cannot see other users' email addresses
- Location tracking is opt-in and session-based only
- Users can regenerate nicknames up to 3 times

---

## 🎯 Future Enhancements

- [ ] Push notifications for walk matches and messages
- [ ] Group walks (3-4 people)
- [ ] Advanced reporting and blocking features
- [ ] In-app route navigation with turn-by-turn directions
- [ ] Profile tags for interests and societies
- [ ] Search and filter for Q&A
- [ ] Upvote/downvote system for answers
- [ ] Dark mode theme
- [ ] Multi-university support
- [ ] Emergency contact notification
- [ ] Integration with campus safety services

---
<!--
## 🤝 Contributing

We welcome contributions from the community! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request
---
-->

## 📄 License

This project is developed as part of a hackathon and is currently unlicensed. For commercial use or deployment, please contact the maintainers.

---

## 👥 Team

Built with ❤️ by women for women at Durham University.

---
<!--
## 📞 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Contact via Durham University email

---

--->

<div align="center">
  <p><strong>Stay safe. Stay connected. 🌸</strong></p>
</div>

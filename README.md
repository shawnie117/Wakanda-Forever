# VIBRANIUM - AI SaaS Dashboard with Authentication

A modern, enterprise-grade AI SaaS dashboard with complete authentication system, built with React, Vite, Tailwind CSS, Framer Motion, Recharts, and Firebase.

## Features

- **Authentication System**
  - Email/Password signup and login
  - Google OAuth integration
  - Secure session management with Firebase
  - No hardcoded users or credentials

- **Modern Dark AI Theme**
  - Futuristic gradient background (#05010a → #3b0764)
  - Glassmorphism UI components
  - Smooth animations with Framer Motion
  - Responsive design

- **Core Features**
  - Product analysis with sentiment scoring
  - Competitor comparison dashboard
  - AI-powered insights and recommendations
  - AI chat assistant for queries
  - Save and view analysis history
  - User-specific data isolation

## Pages

1. **Login/Signup** - Secure authentication with email & Google
2. **Dashboard** - Overview of analyses and quick access
3. **Product Analysis** - Search products, view sentiment charts
4. **Competitor Comparison** - Compare pricing, features, sentiment
5. **Insights Dashboard** - Sentiment breakdown and recommendations
6. **AI Assistant** - Chat interface for analysis questions
7. **My Analyses** - View saved product analyses

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - React charts library
- **React Router DOM** - Client-side routing
- **Lucide React** - Icon library
- **Firebase** - Authentication & Database (Firestore)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase project (free tier at https://firebase.google.com)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your Firebase credentials to .env.local

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create `.env.local`:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup

1. Create project at [https://firebase.google.com](https://firebase.google.com)
2. Go to Project Settings → General
3. Copy your Firebase config values to .env.local
4. Enable Authentication:
   - Authentication → Sign-in method
   - Enable: Email/Password, Google
5. Create Firestore Database:
   - Firestore Database → Create Database (Start in test mode)
   - Create collection named `analyses`

### Firestore Collection Structure

Collection: `analyses`

Document fields:
```json
{
  "userId": "firebase_uid",
  "productName": "Camlin Scissors",
  "sentimentScore": 78,
  "competitorScore": 65,
  "createdAt": "timestamp"
}
```

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── GlassCard.jsx
│   ├── AnalyticsCard.jsx
│   └── ChartCard.jsx
├── context/
│   └── AuthContext.jsx
├── firebase/
│   └── firebaseConfig.js
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   ├── Analysis.jsx
│   ├── Comparison.jsx
│   ├── Insights.jsx
│   ├── AIAssistant.jsx
│   └── MyAnalyses.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Authentication Flow

### Sign Up
```
User → Email/Password or Google OAuth → Firebase Auth → Dashboard
```

### Login
```
User → Email/Password or Google OAuth → Firebase Auth → Dashboard
```

### Protected Routes
```
All dashboard pages redirect to login if not authenticated
```

## User Data Management

- **User ID**: Each user has unique UID from Firebase
- **Analyses**: All analyses linked to userId field
- **Firestore Rules**: Configure rules to restrict access
- **Session**: Automatic token management by Firebase

### Firestore Security Rules (Optional)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /analyses/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Design System

### Colors
- **Primary**: Purple (#9333ea) and Pink (#ec4899)
- **Background**: #05010a → #0f0018 → #1a0033 → #2a0050 → #3b0764
- **Glass**: bg-white/5 with backdrop-blur-lg
- **Border**: border-white/10

### Components
- **GlassCard**: Glassmorphism with hover animations
- **AnalyticsCard**: Metric display with gradient text
- **ProtectedRoute**: Authentication wrapper

## Development

### Run Dev Server
```bash
npm run dev
```

### Build Production
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## Deployment

### Vercel (Recommended)
```bash
npm run build
# Push to GitHub and connect to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist folder to Netlify
```

## Troubleshooting

**Firebase connection errors**
- Check .env.local exists with all Firebase credentials
- Verify credentials match your Firebase project
- Ensure Firestore database is created

**Google OAuth not working**
- Enable Google provider in Firebase Authentication
- Add authorized redirect domains in Firebase Console
- Verify Google OAuth 2.0 credentials if using custom setup

**Analyses not saving**
- Verify user is logged in (check browser DevTools)
- Check Firestore database has `analyses` collection
- Review browser console for error messages
- Verify Firestore rules allow write access

## License

MIT

## Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Recharts](https://recharts.org)


wfwfsdsdf
# ChatGPT / IDE Context Prompt for VIBRANIUM Project

## Project Name
**VIBRANIUM**

**Team:** Wakanda Forever  
**Institution:** CHRIST University Lavasa

---

## Problem Statement
Modern companies receive large amounts of customer feedback across many platforms such as reviews, forums, and social media. Manually analyzing this information to understand product performance and competitor positioning is slow and inefficient.

Organizations struggle to:
- Understand customer sentiment at scale
- Compare their product against competitors
- Detect feature gaps in the market
- Convert raw feedback into actionable insights

There is a need for an intelligent platform that automates product analysis and strategic insight generation.

---

## Solution Overview
**VIBRANIUM** is an AI‑powered Product Intelligence Platform that helps companies analyze their products, compare competitors, and generate strategic recommendations.

The system aggregates product data, evaluates sentiment trends, compares competitor features and pricing, and visualizes insights through an interactive dashboard.

The platform helps product teams quickly understand:
- Customer satisfaction
- Market positioning
- Competitor advantages
- Improvement opportunities

---

## Core Capabilities
The platform provides several major capabilities:

### Product Analysis
Users can analyze a product to generate sentiment scores and performance indicators based on available review data or simulated datasets.

### Competitor Comparison
Users can compare their product against multiple competitors using metrics such as sentiment score, price comparison, and feature availability.

### AI Insights Dashboard
The system generates insights and recommendations that highlight strengths, weaknesses, and improvement opportunities.

### AI Assistant
An interactive assistant allows users to ask questions about their product analysis results and receive contextual responses.

### Personal Analysis History
Users can view and revisit previously analyzed products stored in the database.

---

## Tech Stack

**Frontend:**
- React 18
- Vite

**Styling:**
- Tailwind CSS

**UI / Design:**
- Glassmorphism design
- Dark futuristic theme
- Responsive layout
- Framer Motion animations

**Data Visualization:**
- Recharts

**Routing:**
- React Router DOM v6

**Icons:**
- Lucide React

**Authentication and Database:**
- Firebase Authentication
- Firebase Firestore

**Alternative Database Option:**
- Supabase (dependency included but not primary system)

---

## System Architecture (High Level)
The application follows a modular SaaS dashboard architecture.

### Core layers:

#### 1. Authentication Layer
Handles user login, signup, and session management using Firebase Authentication.

#### 2. Data Layer
Stores user-specific product analysis results in Firestore.  
Each analysis record is associated with a Firebase UID to ensure data isolation.

#### 3. Analytics Layer
Processes product data and generates sentiment metrics, competitor comparisons, and analytical insights.  
Currently these calculations are simulated or client-side.

#### 4. Visualization Layer
The React dashboard displays charts, metrics, comparisons, and AI insights using interactive UI components.

#### 5. Interaction Layer
The AI assistant allows users to interact with their data through natural language queries.

---

## Project Structure
```
wakanda-forever/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── GlassCard.jsx
│   │   ├── AnalyticsCard.jsx
│   │   └── ChartCard.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── firebase/
│   │   └── firebaseConfig.js
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Analysis.jsx
│   │   ├── Comparison.jsx
│   │   ├── Insights.jsx
│   │   ├── AIAssistant.jsx
│   │   └── MyAnalyses.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Key Features

### Authentication System
Supports:
- Email and password login
- Google OAuth login
- Protected routes
- Session management
- User specific data isolation

All dashboard pages require authentication.

### Product Analysis
Users can:
- Search for products
- Generate sentiment scores
- View analysis metrics
- Visualize results through charts
- Save analysis results to Firestore

### Competitor Comparison
Users can compare products by:
- Price comparison
- Sentiment comparison
- Feature availability

Results are displayed through charts and tables.

### AI Insights Dashboard
Displays insights including:
- Sentiment breakdown
- Competitor positioning
- Strategic recommendations

### AI Chat Assistant
Provides a conversational interface where users can ask questions about their analysis results.

Example queries:
- "Why is sentiment low?"
- "Which competitor is strongest?"
- "What features should be improved?"

### Personal History
Users can view previously saved analyses.  
Data is filtered by the user's Firebase UID.

---

## Design System

### Theme:
Dark futuristic AI interface.

### Background Gradient:
```
#05010a → #0f0018 → #1a0033 → #2a0050 → #3b0764
```

### Primary Colors:
- **Purple:** `#9333ea`
- **Pink:** `#ec4899`

### UI Style:
- Glassmorphism cards
- Blurred backgrounds
- Soft borders
- Animated transitions

Common Tailwind styles:
- `bg-white/5`
- `backdrop-blur-lg`
- `border border-white/10`
- `rounded-xl`

Animations are implemented using **Framer Motion**.

---

## Firestore Database Structure

**Collection:** `analyses`

Example document:
```json
{
  "userId": "firebase_uid",
  "productName": "Example Product",
  "sentimentScore": 78,
  "competitorScore": 65,
  "createdAt": "timestamp"
}
```

Each user only accesses their own documents.

---

## Authentication Flow

- **AuthContext** manages authentication state.
- `useAuth()` → `{ user, loading }`
- **ProtectedRoute** checks authentication status.

If not authenticated:
- Redirect → `/login`

Login methods:
- `signInWithEmailAndPassword`
- `createUserWithEmailAndPassword`
- `signInWithPopup` (Google)

---

## Development Commands
```bash
npm install              # Install dependencies
npm run dev              # Start dev server (Vite)
npm run build            # Production build
npm run preview          # Preview production build
```

---

## Current Implementation Status

The application currently includes:
- Fully working authentication
- Protected routing
- Firebase integration
- Dashboard pages
- Animated UI
- Firestore storage
- User data isolation

**Note:** Product analysis data is currently simulated or locally generated.

---

## Future Enhancements

Possible improvements include:
- Real product review data integration
- External API integrations
- Advanced sentiment analysis models
- Automated competitor discovery
- Report export functionality
- Multi-product comparisons
- Improved AI assistant capabilities

---

## Important Development Guidelines

When working on this project:
- Maintain the dark glassmorphism design system
- Follow the existing component structure
- Ensure all data remains user‑isolated
- Use Firebase best practices
- Keep components reusable and modular
- Prioritize frontend experience for demo quality

---

## Git Workflow (IMPORTANT)

⚠️ **DO NOT push directly to the `main` branch**

Follow this workflow:
1. Create a feature/work branch for your changes
2. Push changes to your branch
3. Raise a Pull Request to merge into `main`
4. Merge only after PR review

This ensures code quality and proper review before changes reach the main branch.

---

## Project Goal

This project is designed as a **hackathon demonstration** of an AI-powered product intelligence dashboard.

The goal is to showcase how companies can leverage automated analysis and visualization tools to improve product strategy and market competitiveness.

---

## GitHub Repository
**Repository:** https://github.com/NeoVerse26/wakanda-forever

---

## Final Instruction for AI Assistants

When helping with this project:
- Follow the established tech stack
- Maintain UI consistency
- Focus on SaaS dashboard patterns
- Avoid breaking authentication or routing
- Optimize components for reusability
- Suggest improvements aligned with modern analytics platforms
- **Remember:** Never push directly to main - use feature branches and PRs

---

✅ **This context is complete and ready for IDE assistants (Cursor, Copilot Chat, Claude Code, ChatGPT, etc.)**

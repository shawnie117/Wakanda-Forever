# Wakanda Forever - Vibranium AI

Wakanda Forever is an AI-powered SaaS product intelligence platform with a React frontend and a FastAPI backend. It helps teams analyze product sentiment, discover competitors, identify market gaps, and generate strategic recommendations.

## Features

- Authentication with Firebase (email/password and Google login)
- SaaS product setup wizard with market and positioning inputs
- Market intelligence dashboard with charts and AI-generated insights
- Competitor discovery and feature comparison views
- Product health analytics dashboard
- AI assistant for product strategy Q&A

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, Framer Motion, Recharts
- Backend: FastAPI, Python NLP pipeline (feature extraction, sentiment, insight generation)
- Data/Auth: Firebase Authentication and Firestore

## Project Structure

```text
.
|- src/                 # React app
|- ai/                  # FastAPI app and AI pipeline
|  |- api/              # API routes and schemas
|  |- models/           # NLP and analysis models
|  |- pipelines/        # Analysis pipelines
|  |- services/         # Data collection and integrations
|- scripts/             # Dev helpers
|- index.html
|- package.json
```

## Prerequisites

- Node.js 18+
- Python 3.10+

## Quick Start

1. Install frontend dependencies:

```bash
npm install
```

2. Install backend dependencies:

```bash
py -m pip install -r ai/requirements.txt
```

3. Start frontend and backend together:

```bash
npm run dev
```

Frontend runs on Vite default port, backend runs on `http://127.0.0.1:8000`.

## Available Scripts

- `npm run dev` - run full dev workflow
- `npm run dev:frontend` - run only frontend
- `npm run dev:backend` - run only backend
- `npm run setup:ai` - install AI/backend Python packages
- `npm run build` - production build
- `npm run preview` - preview production build

## Environment Setup

Set up local environment variables for:

- Firebase client config used by the frontend
- Optional AI provider tokens used by backend services
- Optional Google Sheets credentials for pipeline integrations

Do not commit real `.env` files.

## Main App Routes

- `/login`
- `/signup`
- `/dashboard`
- `/saas-product-setup`
- `/market-intelligence`
- `/market-intelligence/:productId`
- `/product-health`
- `/competitor-discovery`
- `/insights`
- `/assistant`
- `/my-analyses`

## Notes

- Some pages include mock/demo data for visualization while backend integration is in progress.
- Python cache files, markdown docs (except this README), and environment files are excluded from git tracking.

## License

This project is built for educational and hackathon purposes.
- Empty state CTA: `Add SaaS Product`

---

## 7) Data Layer (Firestore Collections)

Used by `src/firebase/firestoreService.js` and page code:

- `saas_products`
- `product_features`
- `product_distribution`
- `competitor_inputs`
- `analysis_preferences`
- `analysis_results`
- `analyses` (legacy/alternate analysis cards used by multiple pages)

---

## 8) Environment Variables

Use root `.env` (template in `.env.example`):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_AI_API_URL=http://127.0.0.1:8000/api/v1
```

Backend-specific env template exists in `ai/.env.example`.

---

## 9) Run the Full App from Root Folder (Easy Mode)

From `wakanda-forever` only:

```bash
npm install
npm run setup:ai
npm run dev
```

### Windows PowerShell note
If your PowerShell policy blocks `npm`, use:

```bash
npm.cmd run setup:ai
npm.cmd run dev
```

### What `npm run dev` does now
- Starts Vite frontend (typically `http://localhost:5173`)
- Starts FastAPI backend (`http://127.0.0.1:8000`)

---

## 10) Additional Scripts

```bash
npm run dev:frontend   # frontend only
npm run dev:backend    # backend only
npm run build
npm run preview
```

---

## 11) UI Design System Notes

Defined primarily in `src/index.css`:
- Dark gradient futuristic background
- Glassmorphism surfaces (`.glass`, `GlassCard`)
- Purple/pink glow theme
- Custom loading animations (`LoadingScreen`, `LoadingOverlay`)

Footer brand: `VIBRANIUM — AI SaaS Intelligence Platform`.

---

## 12) Current Code Reality Notes

1. **Dashboard feature cards still point to `/analyze` and `/compare`**
   - Those routes are not registered in current `App.jsx`.
   - `Analysis.jsx` and `Comparison.jsx` exist in code as legacy pages but are not active routes now.

2. **Market Intelligence analysis block currently uses mock analysis payload**
   - Saved to Firestore and rendered as real UI sections.

3. **Assistant depends on backend availability**
   - If backend is down/misconfigured, assistant shows fallback error message in chat.

---

## 13) Recommended Next Cleanup (Optional)

- Wire `/analyze` and `/compare` routes or remove those Dashboard cards.
- Replace Market Intelligence mock analysis with live backend pipeline call.
- Add Firestore security rules for strict per-user data isolation in production.

---

## 14) Quick URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://127.0.0.1:8000`
- API docs: `http://127.0.0.1:8000/docs`

---

If you want, next I can generate a second file `README_UI_SPEC.md` that includes a **screen-by-screen field matrix** (every input, button, chart key, and data origin) for handoff/demo documentation.

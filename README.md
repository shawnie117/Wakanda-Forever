# VIBRANIUM

AI-powered SaaS product intelligence workspace with a React frontend, Firebase auth/data layer, and a FastAPI backend.

---

## 1) Current App Overview (UI + Flow)

The app currently runs as a **multi-page authenticated SaaS intelligence dashboard**.

### Primary flow
1. User logs in/signs up with Firebase.
2. User creates a SaaS product profile in Setup Wizard.
3. User opens Market Intelligence and runs analysis.
4. User explores Product Health, Competitor Discovery, Insights, and AI Assistant.
5. Data is saved/retrieved from Firestore collections.

---

## 2) Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React icons

### Backend
- FastAPI (`ai/api/main.py`)
- Hosted Hugging Face inference support (optional token), with fallback generation
- Model-free lexical/rule sentiment + feature extraction in backend pipeline

### Data/Auth
- Firebase Authentication (Email/Password + Google)
- Firestore for product metadata, preferences, and analysis documents

---

## 3) Project Structure (Important UI Files)

```text
src/
  App.jsx
  main.jsx
  index.css
  components/
    Navbar.jsx
    ProtectedRoute.jsx
    GlassCard.jsx
    AnalyticsCard.jsx
    PrimaryButton.jsx
    LoadingScreen.jsx
    LoadingOverlay.jsx
    ErrorBoundary.jsx
    Footer.jsx
  context/
    AuthContext.jsx
  firebase/
    firebaseConfig.js
    firestoreService.js
  services/
    aiApi.js
  pages/
    Login.jsx
    Signup.jsx
    Dashboard.jsx
    SaaSProductSetup.jsx
    MarketIntelligence.jsx
    ProductHealth.jsx
    CompetitorDiscovery.jsx
    Insights.jsx
    AIAssistant.jsx
    MyAnalyses.jsx
    Analysis.jsx        (legacy page file, not currently routed)
    Comparison.jsx      (legacy page file, not currently routed)
```

---

## 4) Routes (Current)

Defined in `src/App.jsx`.

### Public routes
- `/login`
- `/signup`

### Protected routes
- `/dashboard`
- `/saas-product-setup`
- `/market-intelligence`
- `/market-intelligence/:productId`
- `/product-health`
- `/competitor-discovery`
- `/insights`
- `/assistant`
- `/my-analyses`

### Redirect
- `/` -> `/dashboard`

---

## 5) Navigation (Current Header)

Navbar links (when authenticated):
- Dashboard
- Market Intelligence
- Competitor Discovery
- Product Health
- Insights
- AI Assistant

Profile dropdown:
- My Analyses
- Logout

---

## 6) Page-by-Page UI + Data Coverage

## Login (`/login`)
- Email/password login form
- Google OAuth button
- Firebase config guard (shows error if env vars missing)
- Redirect to `/dashboard` on success

## Signup (`/signup`)
- Name + email + password + confirm password
- Password validation (match + min 6 chars)
- Google OAuth signup
- Success state then redirect to `/dashboard`

## Dashboard (`/dashboard`)
### Hero
- Welcome header using user email prefix

### Stats cards (from Firestore `analyses`)
- Total Analyses
- Avg Sentiment
- Avg Competitor

### Feature cards
- Product Analysis (`/analyze`) **legacy link target**
- Competitor Comparison (`/compare`) **legacy link target**
- Strategic Insights (`/insights`)
- AI Assistant (`/assistant`)

### Recent analyses list
- Product name
- Sentiment score
- Competitor score
- Date

## SaaS Product Setup (`/saas-product-setup`)
7-step wizard:

1. **Product Info**
   - Product name (required)
   - Website (required)
   - Category
   - Description
   - Target customer segment

2. **Positioning**
   - Core problem
   - Key feature tags
   - UVP
   - Business model
   - Pricing tier range

3. **Target Market**
   - Region
   - Industry tags
   - Company size
   - Primary user persona

4. **Competitors**
   - Known competitors
   - Search keywords
   - Alternative categories
   - Search platform tags

5. **Distribution**
   - Platform name + product URL pairs

6. **Analysis Preferences**
   - Compare features
   - Pricing benchmark
   - Sentiment analysis
   - Market gap detection
   - Feature opportunity insights
   - Positioning recommendations

7. **Output Preferences**
   - SWOT Analysis
   - Competitive Matrix
   - Feature Gap Report
   - Pricing Optimization Suggestions
   - Go-to-Market Strategy Feedback

On submit, creates and links product documents in Firestore via `firestoreService.js`.

## Market Intelligence (`/market-intelligence`)
### Product context block
- Category, business model, customer segment, pricing range
- Key features tags
- Known competitor tags

### Action
- `Run AI Analysis` button
- If no product exists, redirects user to create one

### Current analysis output sections
- Key metrics: sentiment, market position, competitive advantage
- Competitor Feature Comparison chart
- Pricing Strategy Analysis chart
- Market Gap Opportunities cards
- SWOT Analysis (S/W/O/T lists)
- AI Positioning Recommendations (title, description, action items)

### Data source note
Currently uses mock analysis payload in page logic, then saves to Firestore (`analysis_results`).

## Product Health (`/product-health`)
Static/mock KPI dashboard with:
- DAU/MAU area chart
- Revenue + ARPU line chart
- Feature usage bar chart
- KPI progress bars (retention, activation, CSAT, TTV, LTV)
- Market performance summary cards

## Competitor Discovery (`/competitor-discovery`)
Static/mock discovery workspace:
- Search box + selectable discovery platforms
- SaaS positioning scatter chart (price vs complexity with market share bubble)
- Discovered competitors list with pricing/users/rating/features
- Market gap insight cards

## Insights (`/insights`)
Reads latest user analyses from Firestore and renders:
- Sentiment Breakdown (pie)
- Sentiment Trend (line)
- Top Strengths
- Top Complaints
- AI Strategic Recommendations

With fallback defaults when analysis history is absent.

## AI Assistant (`/assistant`)
- Chat UI with suggested prompts
- Sends query to backend through `analyzeProduct()` using synthetic assistant context
- Displays `ai_insights.insights_text` from backend response
- Loading/typing animation + graceful failure message

## My Analyses (`/my-analyses`)
- Loads all analyses for logged-in user
- Card list with date, sentiment score, competitor score
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

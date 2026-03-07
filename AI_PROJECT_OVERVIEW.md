# VIBRANIUM AI - Complete Project Structure

## Directory Tree

```
wakanda-forever/
│
├── ai/                                      # AI Backend (NEW)
│   ├── datasets/
│   │   ├── sample_reviews.json             # Sample product reviews
│   │   └── competitors.json                # Sample competitor data
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── sentiment_analyzer.py          # DistilBERT sentiment analysis
│   │   ├── feature_extractor.py           # BERT NER feature extraction
│   │   └── insight_generator.py           # Gemini/Flan-T5 insights
│   │
│   ├── pipelines/
│   │   ├── __init__.py
│   │   ├── analysis_pipeline.py           # Product analysis orchestration
│   │   └── competitor_pipeline.py         # Competitor comparison logic
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py                        # FastAPI application
│   │   ├── routes.py                      # API endpoints
│   │   └── schemas.py                     # Pydantic models
│   │
│   ├── requirements.txt                    # Python dependencies
│   ├── .env.example                        # Environment variables template
│   ├── README.md                           # AI module documentation
│   ├── FRONTEND_INTEGRATION.md             # Frontend integration guide
│   ├── quick_start.py                      # Automated setup script
│   └── test_system.py                      # System testing script
│
├── src/                                     # React Frontend (EXISTING)
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── GlassCard.jsx
│   │   └── ...
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Analysis.jsx                    # 🔗 Connect to /analyze-product
│   │   ├── Comparison.jsx                  # 🔗 Connect to /compare-products
│   │   ├── Insights.jsx
│   │   ├── AIAssistant.jsx
│   │   └── MyAnalyses.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── firebase/
│   │   └── firebaseConfig.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md                                # Main project README
└── CHATGPT_CONTEXT_PROMPT.md               # AI assistant context

```

## Component Interactions

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │◄────────│   FastAPI        │◄────────│  AI Models      │
│  (Port 5173)    │  HTTP   │   Backend        │  Load   │  (HuggingFace)  │
│                 │  REST   │   (Port 8000)    │         │                 │
└────────┬────────┘         └────────┬─────────┘         └─────────────────┘
         │                           │
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌──────────────────┐
│                 │         │                  │
│  Firebase Auth  │         │  AI Pipelines    │
│  & Firestore    │         │  - Sentiment     │
│                 │         │  - Features      │
└─────────────────┘         │  - Insights      │
                            └──────────────────┘
```

## API Endpoints

### Product Analysis
```
POST /api/v1/analyze-product
→ Sentiment Analysis (DistilBERT)
→ Feature Extraction (BERT NER)
→ AI Insights (Gemini/Flan-T5)
→ Returns comprehensive analysis
```

### Competitor Comparison
```
POST /api/v1/compare-products
→ Feature Gap Analysis
→ Price Comparison
→ Sentiment Comparison
→ Competitive Insights
→ Returns market positioning
```

### Health & Status
```
GET /api/v1/health
GET /api/v1/models/status
```

## Data Flow

### Analysis Flow
```
User Input (Product + Reviews)
    ↓
React Frontend (Analysis.jsx)
    ↓
API Call → POST /analyze-product
    ↓
Analysis Pipeline
    ├─→ Sentiment Analyzer (DistilBERT)
    ├─→ Feature Extractor (BERT NER)
    └─→ Insight Generator (Gemini/Flan-T5)
    ↓
JSON Response
    ↓
React Frontend Display
    ↓
Save to Firestore (Optional)
```

### Comparison Flow
```
User Input (Target Product + Competitors)
    ↓
React Frontend (Comparison.jsx)
    ↓
API Call → POST /compare-products
    ↓
Competitor Pipeline
    ├─→ Feature Gap Detection
    ├─→ Price Analysis
    ├─→ Sentiment Comparison
    └─→ Competitive Insights (AI)
    ↓
JSON Response
    ↓
React Frontend Display
```

## Key Technologies

### Frontend
- **React 18**: UI library
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **Recharts**: Data visualization
- **Firebase**: Authentication & Database

### Backend
- **FastAPI**: Web framework
- **Transformers**: HuggingFace models
- **PyTorch**: Deep learning backend
- **Google Gemini**: LLM (optional)
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

### AI Models
- **distilbert-base-uncased-finetuned-sst-2-english**: Sentiment
- **dslim/bert-base-NER**: Named Entity Recognition
- **google/flan-t5-base**: Text generation fallback
- **Gemini Pro**: Primary LLM (optional)

## Environment Setup

### Frontend (.env.local)
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_AI_API_URL=http://localhost:8000/api/v1
```

### Backend (ai/.env)
```env
GEMINI_API_KEY=your_key_here
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
```

## Quick Start Commands

### Start Everything

**Terminal 1 - AI Backend:**
```bash
cd ai
python quick_start.py    # First time setup
cd api
python main.py           # Start API server
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

### Access Points
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs
- API Root: http://localhost:8000

## Integration Checklist

- [ ] AI backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Firebase configured
- [ ] Models loaded successfully
- [ ] Test API endpoints
- [ ] Connect Analysis page to API
- [ ] Connect Comparison page to API
- [ ] Test end-to-end flow
- [ ] Save results to Firestore

## Performance Notes

- **Model Loading**: 10-30 seconds on first request
- **Analysis Time**: 3-5 seconds per request
- **Comparison Time**: 2-4 seconds per request
- **Concurrent Requests**: Supported
- **Memory Usage**: ~2-3 GB (with models loaded)

## Troubleshooting

### Backend Won't Start
```bash
cd ai
pip install --no-cache-dir -r requirements.txt
python test_system.py
```

### Frontend Can't Connect
- Check CORS settings in api/main.py
- Verify backend is running: http://localhost:8000/api/v1/health
- Check VITE_AI_API_URL in frontend .env.local

### Models Not Loading
- Ensure internet connection for HuggingFace downloads
- Check available disk space (need ~2GB)
- Try CPU-only PyTorch: `pip install torch --index-url https://download.pytorch.org/whl/cpu`

## Next Steps

1. **Test the AI Backend**: Run `python quick_start.py` in ai/ directory
2. **Review API Docs**: Visit http://localhost:8000/docs
3. **Integrate Frontend**: Follow FRONTEND_INTEGRATION.md
4. **Test End-to-End**: Analyze a product from the React UI
5. **Deploy** (optional): Deploy backend to cloud service

## Team

**Wakanda Forever**  
CHRIST University Lavasa  
Hackathon Project: VIBRANIUM AI Product Intelligence

---

For detailed documentation, see:
- ai/README.md - AI backend documentation
- ai/FRONTEND_INTEGRATION.md - Integration guide
- README.md - Main project README

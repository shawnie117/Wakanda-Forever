# VIBRANIUM AI Backend

AI-powered product intelligence pipeline for sentiment analysis, feature extraction, and competitive insights.

## Overview

The VIBRANIUM AI module provides a complete backend service for analyzing product reviews, extracting features, comparing competitors, and generating strategic insights using state-of-the-art AI models.

## Architecture

```
ai/
├── datasets/              # Sample datasets
│   ├── sample_reviews.json
│   └── competitors.json
│
├── models/                # AI model implementations
│   ├── sentiment_analyzer.py      # DistilBERT sentiment analysis
│   ├── feature_extractor.py       # BERT NER feature extraction
│   └── insight_generator.py       # HF-only insight generation
│
├── pipelines/             # Analysis orchestration
│   ├── analysis_pipeline.py       # Product analysis pipeline
│   └── competitor_pipeline.py     # Competitor comparison pipeline
│
├── api/                   # FastAPI service
│   ├── main.py           # FastAPI application
│   ├── routes.py         # API endpoints
│   └── schemas.py        # Request/response schemas
│
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Features

### 1. Sentiment Analysis
- **Model**: `distilbert-base-uncased-finetuned-sst-2-english`
- **Capability**: Analyzes customer sentiment from reviews
- **Output**: Sentiment score (0-100), distribution, and sentiment summary

### 2. Feature Extraction
- **Model**: `dslim/bert-base-NER` (BERT NER)
- **Capability**: Extracts product features and attributes from text
- **Output**: Feature categories, mentions, and key phrases

### 3. AI Insight Generation
- **Primary**: `HuggingFaceTB/SmolLM2-360M-Instruct`
- **Backup**: `distilgpt2`
- **Capability**: Generates strategic recommendations and insights
- **Output**: Actionable insights, strengths, weaknesses, recommendations

### 4. Competitor Comparison
- **Capability**: Identifies feature gaps, compares pricing and sentiment
- **Output**: Competitive position, feature gaps, market analysis

## Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Setup

1. **Navigate to AI directory**:
```bash
cd ai
```

2. **Create virtual environment** (recommended):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment variables** (optional):
Create a `.env` file in the `ai` directory:
```env
HF_RESEARCH_MODEL=HuggingFaceTB/SmolLM2-360M-Instruct
HF_BACKUP_MODEL=distilgpt2
```

## Usage

### Running the API Server

Start the FastAPI server:

```bash
# From the ai directory
cd api
python main.py
```

Or with uvicorn directly:

```bash
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Endpoints

#### 1. Health Check
```http
GET /api/v1/health
```

**Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "models_loaded": {
    "analysis_pipeline": true,
    "competitor_pipeline": true
  }
}
```

#### 2. Analyze Product
```http
POST /api/v1/analyze-product
```

**Request Body**:
```json
{
  "product_name": "Samsung Galaxy M35",
  "reviews": [
    {
      "reviewId": "rev_001",
      "text": "Amazing phone with great camera!",
      "rating": 5,
      "verified": true
    }
  ],
  "metadata": {
    "price": 18999,
    "category": "Electronics"
  },
}
```

**Response**: Complete analysis with sentiment, features, and AI insights.

#### 3. Compare Products
```http
POST /api/v1/compare-products
```

**Request Body**:
```json
{
  "target_product": {
    "productName": "Samsung Galaxy M35",
    "price": 18999,
    "sentimentScore": 75,
    "avgRating": 3.9,
    "features": ["5G", "AMOLED", "50MP camera"]
  },
  "competitors": [
    {
      "productName": "Xiaomi Redmi Note 13 Pro",
      "price": 17999,
      "sentimentScore": 82,
      "avgRating": 4.3,
      "features": ["5G", "AMOLED", "200MP camera"]
    }
  ],
}
```

**Response**: Competitive analysis with gaps, positioning, and insights.

## Testing the Pipelines

### Test Sentiment Analyzer
```bash
cd models
python sentiment_analyzer.py
```

### Test Feature Extractor
```bash
cd models
python feature_extractor.py
```

### Test Analysis Pipeline
```bash
cd pipelines
python analysis_pipeline.py
```

### Test Competitor Pipeline
```bash
cd pipelines
python competitor_pipeline.py
```

## Models Used

| Component | Model | Purpose |
|-----------|-------|---------|
| Sentiment Analysis | `distilbert-base-uncased-finetuned-sst-2-english` | Customer sentiment detection |
| Feature Extraction | `dslim/bert-base-NER` | Named entity recognition |
| Insight Generation (Primary) | `HuggingFaceTB/SmolLM2-360M-Instruct` | Strategic insights (local, instruction-tuned) |
| Insight Generation (Backup) | `distilgpt2` | Backup generation path |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HF_RESEARCH_MODEL` | No | Primary local HF model (default `HuggingFaceTB/SmolLM2-360M-Instruct`) |
| `HF_BACKUP_MODEL` | No | Backup local HF model (default `distilgpt2`) |

## Sample Datasets

The `datasets/` folder contains sample data:

1. **sample_reviews.json**: Product reviews for testing
   - Camlin Scissors (10 reviews)
   - Samsung Galaxy M35 (8 reviews)

2. **competitors.json**: Competitor product data
   - Office Supplies category (4 products)
   - Electronics category (4 products)

## API Integration with Frontend

### CORS Configuration
The API is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative React port)

### Example Frontend Integration (React)

```javascript
// Analyze a product
const analyzeProduct = async (productName, reviews) => {
  const response = await fetch('http://localhost:8000/api/v1/analyze-product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_name: productName,
      reviews: reviews
    })
  });
  
  return await response.json();
};

// Compare products
const compareProducts = async (targetProduct, competitors) => {
  const response = await fetch('http://localhost:8000/api/v1/compare-products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target_product: targetProduct,
      competitors: competitors
    })
  });
  
  return await response.json();
};
```

## Performance Notes

- **First request**: May take 10-30 seconds due to model loading
- **Subsequent requests**: Typically 2-5 seconds
- **Model loading**: Models are loaded once at startup and kept in memory
- **GPU acceleration**: PyTorch will use GPU if available (CUDA)

## Troubleshooting

### Models not loading
```bash
# Clear pip cache and reinstall
pip cache purge
pip install --no-cache-dir -r requirements.txt
```

### CUDA/GPU issues
```bash
# Install CPU-only version of PyTorch
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

### Port already in use
```bash
# Change port in main.py or use:
uvicorn api.main:app --port 8001
```

## Development

### Code Style
```bash
# Format code
black .

# Lint code
flake8 .
```

### Testing
```bash
pytest
```

## Future Enhancements

- [ ] Real-time review scraping integration
- [ ] Advanced NER for specific product attributes
- [ ] Multi-language support
- [ ] Caching for improved performance
- [ ] Database integration for analysis storage
- [ ] Batch processing for large datasets
- [ ] Model fine-tuning on domain-specific data

## Contributors

**Team**: Wakanda Forever  
**Institution**: CHRIST University Lavasa  
**Hackathon Project**: VIBRANIUM AI Product Intelligence

## License

This project is built for educational and hackathon purposes.

---

For questions or issues, please refer to the main project README or contact the development team.

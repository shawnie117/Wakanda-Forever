# VIBRANIUM AI - Frontend Integration Guide

This guide explains how to integrate the AI backend with the existing React frontend.

## Overview

The AI backend provides REST API endpoints that the React frontend can consume to get real-time product analysis and competitor insights.

## API Base URL

**Local Development**: `http://localhost:8000/api/v1`

## Integration Points

### 1. Product Analysis Page (`src/pages/Analysis.jsx`)

Replace simulated analysis with real AI analysis:

```javascript
import { useState } from 'react';

const Analysis = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const analyzeProduct = async (productName, reviews) => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_name: productName,
          reviews: reviews,
        })
      });
      
      const data = await response.json();
      setResult(data);
      
      // Save to Firestore
      await saveAnalysisToFirestore(data);
      
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    // Your existing UI with loading and result display
  );
};
```

### 2. Competitor Comparison Page (`src/pages/Comparison.jsx`)

```javascript
const Comparison = () => {
  const [comparisonResult, setComparisonResult] = useState(null);
  
  const compareProducts = async (targetProduct, competitors) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/compare-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_product: targetProduct,
          competitors: competitors,
        })
      });
      
      const data = await response.json();
      setComparisonResult(data);
      
    } catch (error) {
      console.error('Comparison failed:', error);
    }
  };
  
  return (
    // Your comparison UI
  );
};
```

### 3. AI Assistant Page (`src/pages/AIAssistant.jsx`)

Enhance the chat assistant with real AI insights:

```javascript
const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  
  const askQuestion = async (question, context) => {
    // Use context from previous analyses
    const response = await fetch('http://localhost:8000/api/v1/analyze-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_name: context.productName,
        reviews: context.reviews,
      })
    });
    
    const data = await response.json();
    
    // Extract relevant insights based on question
    const answer = extractRelevantInsight(data.ai_insights, question);
    
    setMessages([...messages, { question, answer }]);
  };
  
  return (
    // Chat interface
  );
};
```

## API Service Layer

Create a dedicated API service file: `src/services/vibraniumAPI.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000/api/v1';

export class VibraniumAPI {
  
  static async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
  
  static async analyzeProduct(productName, reviews, metadata = {}) {
    const response = await fetch(`${API_BASE_URL}/analyze-product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_name: productName,
        reviews: reviews.map(r => ({
          reviewId: r.id || r.reviewId,
          text: r.text || r.review,
          rating: r.rating,
          date: r.date,
          verified: r.verified || false
        })),
        metadata: metadata,
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  static async compareProducts(targetProduct, competitors) {
    const response = await fetch(`${API_BASE_URL}/compare-products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_product: targetProduct,
        competitors: competitors,
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  static async getModelsStatus() {
    const response = await fetch(`${API_BASE_URL}/models/status`);
    return response.json();
  }
}
```

## Environment Variables

Add to your frontend `.env.local`:

```env
VITE_AI_API_URL=http://localhost:8000/api/v1
```

## Data Transformation

### Transform Analysis Result for Display

```javascript
function transformAnalysisForDisplay(apiResult) {
  return {
    productName: apiResult.product_name,
    sentimentScore: apiResult.sentiment_analysis.overall_score,
    sentimentSummary: apiResult.sentiment_analysis.sentiment_summary,
    features: apiResult.feature_analysis.extracted_features,
    insights: apiResult.ai_insights.insights_text,
    distribution: {
      positive: apiResult.sentiment_analysis.distribution.positive,
      negative: apiResult.sentiment_analysis.distribution.negative,
      neutral: apiResult.sentiment_analysis.distribution.neutral
    },
    totalReviews: apiResult.sentiment_analysis.total_reviews
  };
}
```

### Transform Comparison Result

```javascript
function transformComparisonForDisplay(apiResult) {
  return {
    targetProduct: apiResult.target_product.name,
    position: apiResult.overall_position.tier,
    rank: apiResult.overall_position.rank,
    featureGaps: apiResult.feature_gaps.gaps_identified,
    pricePosition: apiResult.price_comparison.position,
    sentimentRank: apiResult.sentiment_comparison.rank,
    insights: apiResult.competitive_insights.competitive_insights,
    strengths: apiResult.overall_position.strengths,
    weaknesses: apiResult.overall_position.weaknesses
  };
}
```

## React Hook for API Integration

Create `src/hooks/useVibraniumAPI.js`:

```javascript
import { useState } from 'react';
import { VibraniumAPI } from '../services/vibraniumAPI';

export function useVibraniumAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const analyzeProduct = async (productName, reviews, metadata) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await VibraniumAPI.analyzeProduct(productName, reviews, metadata);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const compareProducts = async (target, competitors) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await VibraniumAPI.compareProducts(target, competitors);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    error,
    analyzeProduct,
    compareProducts
  };
}
```

## Usage in Components

```javascript
import { useVibraniumAPI } from '../hooks/useVibraniumAPI';

function ProductAnalysisPage() {
  const { analyzeProduct, loading, error } = useVibraniumAPI();
  const [result, setResult] = useState(null);
  
  const handleAnalyze = async () => {
    const reviews = [
      { text: "Great product!", rating: 5 },
      { text: "Not bad", rating: 3 }
    ];
    
    try {
      const analysisResult = await analyzeProduct("Product Name", reviews);
      setResult(analysisResult);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };
  
  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Product'}
      </button>
      
      {error && <div>Error: {error}</div>}
      
      {result && (
        <div>
          <h2>Sentiment Score: {result.sentiment_analysis.overall_score}/100</h2>
          <p>{result.ai_insights.insights_text}</p>
        </div>
      )}
    </div>
  );
}
```

## Firestore Integration

Save AI results to Firestore:

```javascript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';

async function saveAnalysisToFirestore(analysisResult) {
  const { user } = useAuth();
  
  await addDoc(collection(db, 'analyses'), {
    userId: user.uid,
    productName: analysisResult.product_name,
    sentimentScore: analysisResult.sentiment_analysis.overall_score,
    features: analysisResult.feature_analysis.extracted_features,
    insights: analysisResult.ai_insights.insights_text,
    createdAt: serverTimestamp()
  });
}
```

## Error Handling

```javascript
async function callAPI() {
  try {
    const result = await VibraniumAPI.analyzeProduct(...);
    return result;
  } catch (error) {
    if (error.message.includes('503')) {
      // API server not running
      alert('AI service is not available. Please start the backend server.');
    } else if (error.message.includes('500')) {
      // Model loading failed
      alert('AI model failed to load. Check backend logs.');
    } else {
      // Other errors
      alert('Analysis failed. Please try again.');
    }
  }
}
```

## Loading States

```javascript
function AnalysisPage() {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  
  const analyze = async () => {
    setStatus('loading');
    
    try {
      const result = await VibraniumAPI.analyzeProduct(...);
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };
  
  return (
    <div>
      {status === 'loading' && (
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" />
          <span>AI is analyzing product...</span>
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-red-500">
          Analysis failed. Please try again.
        </div>
      )}
      
      {status === 'success' && (
        <AnalysisResults data={result} />
      )}
    </div>
  );
}
```

## Testing the Integration

1. **Start the AI backend**:
```bash
cd ai/api
python main.py
```

2. **Start the frontend**:
```bash
npm run dev
```

3. **Test the endpoints** using the interactive API docs at `http://localhost:8000/docs`

4. **Verify CORS** is working by checking browser console

## Next Steps

1. Replace mock data in Analysis.jsx with API calls
2. Connect Comparison.jsx to competitor endpoint
3. Enhance AIAssistant.jsx with real insights
4. Update Dashboard.jsx to show real statistics
5. Integrate with Firestore for persistence

---

**Note**: Make sure the AI backend is running before testing the frontend integration!

"""
Sentiment Analysis Module (model-free)
Uses lightweight lexical scoring to avoid local model loading.
"""

import logging
import re
from typing import List, Dict, Any
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SentimentAnalyzer:
    """
    Lightweight sentiment analyzer using lexical scoring.
    """
    
    def __init__(self, model_name: str = "lexical-v1"):
        """Initialize lexical sentiment resources."""
        self.model_name = model_name
        self.positive_words = {
            "great", "excellent", "amazing", "good", "best", "love", "smooth", "fast", "value",
            "durable", "reliable", "comfortable", "premium", "awesome", "fantastic", "impressive"
        }
        self.negative_words = {
            "bad", "poor", "worst", "terrible", "slow", "lag", "expensive", "waste", "disappointed",
            "bug", "bugs", "issue", "issues", "heating", "overheat", "cheap", "mediocre", "drain"
        }
        logger.info("Sentiment analyzer initialized (lexical mode)")

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r"\b[a-zA-Z']+\b", text.lower())
    
    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of a single text
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary with label, score, and normalized sentiment score (0-100)
        """
        try:
            tokens = self._tokenize(text[:1200])
            if not tokens:
                return {
                    "label": "NEUTRAL",
                    "confidence": 0.5,
                    "sentiment_score": 50.0
                }

            pos_hits = sum(1 for token in tokens if token in self.positive_words)
            neg_hits = sum(1 for token in tokens if token in self.negative_words)
            raw = pos_hits - neg_hits
            normalized = max(-1.0, min(1.0, raw / 6.0))
            sentiment_score = 50 + (normalized * 50)

            if sentiment_score >= 60:
                label = "POSITIVE"
            elif sentiment_score <= 40:
                label = "NEGATIVE"
            else:
                label = "NEUTRAL"

            confidence = min(1.0, (abs(raw) / 6.0) + 0.2)

            return {
                "label": label,
                "confidence": round(confidence, 4),
                "sentiment_score": round(sentiment_score, 2)
            }
        except Exception as e:
            logger.error(f"Failed to analyze sentiment: {str(e)}")
            return {
                "label": "NEUTRAL",
                "confidence": 0.5,
                "sentiment_score": 50.0
            }
    
    def analyze_reviews(self, reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze sentiment for multiple reviews
        
        Args:
            reviews: List of review dictionaries with 'text' field
            
        Returns:
            Aggregated sentiment analysis with overall score and distribution
        """
        if not reviews:
            return {
                "overall_sentiment_score": 50.0,
                "total_reviews": 0,
                "positive_count": 0,
                "negative_count": 0,
                "neutral_count": 0,
                "sentiment_distribution": {
                    "positive": 0.0,
                    "negative": 0.0,
                    "neutral": 0.0
                },
                "individual_results": []
            }
        
        results = []
        scores = []
        positive_count = 0
        negative_count = 0
        neutral_count = 0
        
        for review in reviews:
            text = review.get('text', '')
            if not text:
                continue
            
            sentiment = self.analyze_text(text)
            results.append({
                "review_id": review.get('reviewId', ''),
                "text": text[:100] + "..." if len(text) > 100 else text,
                "rating": review.get('rating', 0),
                "sentiment": sentiment
            })
            
            scores.append(sentiment['sentiment_score'])
            
            # Count sentiment categories
            if sentiment['sentiment_score'] >= 60:
                positive_count += 1
            elif sentiment['sentiment_score'] <= 40:
                negative_count += 1
            else:
                neutral_count += 1
        
        total_reviews = len(results)
        overall_score = np.mean(scores) if scores else 50.0
        
        return {
            "overall_sentiment_score": round(overall_score, 2),
            "total_reviews": total_reviews,
            "positive_count": positive_count,
            "negative_count": negative_count,
            "neutral_count": neutral_count,
            "sentiment_distribution": {
                "positive": round((positive_count / total_reviews) * 100, 2) if total_reviews > 0 else 0.0,
                "negative": round((negative_count / total_reviews) * 100, 2) if total_reviews > 0 else 0.0,
                "neutral": round((neutral_count / total_reviews) * 100, 2) if total_reviews > 0 else 0.0
            },
            "individual_results": results
        }
    
    def get_sentiment_summary(self, sentiment_score: float) -> str:
        """
        Get human-readable sentiment summary
        
        Args:
            sentiment_score: Score from 0-100
            
        Returns:
            Human-readable sentiment description
        """
        if sentiment_score >= 80:
            return "Highly Positive"
        elif sentiment_score >= 60:
            return "Positive"
        elif sentiment_score >= 40:
            return "Neutral"
        elif sentiment_score >= 20:
            return "Negative"
        else:
            return "Highly Negative"


# Example usage
if __name__ == "__main__":
    analyzer = SentimentAnalyzer()
    
    # Test single text
    test_text = "This product is amazing! I love it so much."
    result = analyzer.analyze_text(test_text)
    print(f"Single text analysis: {result}")
    
    # Test multiple reviews
    test_reviews = [
        {"reviewId": "1", "text": "Great product!", "rating": 5},
        {"reviewId": "2", "text": "Terrible quality, waste of money.", "rating": 1},
        {"reviewId": "3", "text": "It's okay, nothing special.", "rating": 3}
    ]
    
    multi_result = analyzer.analyze_reviews(test_reviews)
    print(f"\nMultiple reviews analysis:")
    print(f"Overall score: {multi_result['overall_sentiment_score']}")
    print(f"Distribution: {multi_result['sentiment_distribution']}")

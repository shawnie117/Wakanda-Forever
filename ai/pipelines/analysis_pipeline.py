"""
Product Analysis Pipeline
Orchestrates sentiment analysis, feature extraction, and insight generation
"""

import logging
import sys
import os
from typing import Dict, Any, List, Optional
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from models.sentiment_analyzer import SentimentAnalyzer
from models.feature_extractor import FeatureExtractor
from models.insight_generator import InsightGenerator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AnalysisPipeline:
    """
    Complete pipeline for product analysis
    """
    
    def __init__(self):
        """
        Initialize the analysis pipeline
        """
        logger.info("Initializing Analysis Pipeline...")
        
        try:
            self.sentiment_analyzer = SentimentAnalyzer()
            logger.info("✓ Sentiment analyzer loaded")
        except Exception as e:
            logger.error(f"Failed to load sentiment analyzer: {str(e)}")
            raise
        
        try:
            self.feature_extractor = FeatureExtractor()
            logger.info("✓ Feature extractor loaded")
        except Exception as e:
            logger.error(f"Failed to load feature extractor: {str(e)}")
            raise
        
        try:
            self.insight_generator = InsightGenerator()
            logger.info("✓ Insight generator loaded")
        except Exception as e:
            logger.error(f"Failed to load insight generator: {str(e)}")
            raise
        
        logger.info("Analysis Pipeline initialized successfully")
    
    def analyze_product(
        self,
        product_name: str,
        reviews: List[Dict[str, Any]],
        product_metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Complete product analysis pipeline
        
        Args:
            product_name: Name of the product
            reviews: List of review dictionaries with 'text' field
            product_metadata: Optional metadata (price, category, etc.)
            
        Returns:
            Complete analysis including sentiment, features, and insights
        """
        logger.info(f"Starting analysis for: {product_name}")
        
        if not reviews:
            return {
                "error": "No reviews provided",
                "product_name": product_name
            }
        
        try:
            # Step 1: Sentiment Analysis
            logger.info("Step 1/3: Analyzing sentiment...")
            sentiment_result = self.sentiment_analyzer.analyze_reviews(reviews)
            logger.info(f"✓ Sentiment analysis complete. Overall score: {sentiment_result['overall_sentiment_score']}")
            
            # Step 2: Feature Extraction
            logger.info("Step 2/3: Extracting features...")
            feature_result = self.feature_extractor.extract_features_from_reviews(reviews)
            extracted_features = self.feature_extractor.get_feature_list(reviews)
            logger.info(f"✓ Feature extraction complete. Found {len(extracted_features)} unique features")
            
            # Step 3: Generate Insights
            logger.info("Step 3/3: Generating AI insights...")
            insights = self.insight_generator.generate_product_insights(
                product_name=product_name,
                sentiment_score=sentiment_result['overall_sentiment_score'],
                features=extracted_features,
                review_summary=sentiment_result,
                context_text=" ".join([
                    review.get('text', '') for review in reviews[:3]
                ]).strip(),
            )
            logger.info("✓ Insights generated")
            
            # Compile complete analysis
            analysis = {
                "product_name": product_name,
                "metadata": product_metadata or {},
                "sentiment_analysis": {
                    "overall_score": sentiment_result['overall_sentiment_score'],
                    "sentiment_summary": self.sentiment_analyzer.get_sentiment_summary(
                        sentiment_result['overall_sentiment_score']
                    ),
                    "total_reviews": sentiment_result['total_reviews'],
                    "distribution": sentiment_result['sentiment_distribution'],
                    "counts": {
                        "positive": sentiment_result['positive_count'],
                        "negative": sentiment_result['negative_count'],
                        "neutral": sentiment_result['neutral_count']
                    }
                },
                "feature_analysis": {
                    "extracted_features": extracted_features,
                    "feature_summary": feature_result['feature_summary'],
                    "top_categories": feature_result['top_feature_categories'],
                    "total_mentions": feature_result['total_feature_mentions']
                },
                "ai_insights": {
                    "insights_text": insights['ai_insights'],
                    "recommendation_type": insights['recommendation_type'],
                    "generated_by": insights['generated_by']
                },
                "analysis_metadata": {
                    "total_reviews_analyzed": len(reviews),
                    "pipeline_version": "1.0.0"
                }
            }
            
            logger.info(f"✅ Analysis complete for {product_name}")
            return analysis
            
        except Exception as e:
            logger.error(f"Analysis pipeline failed: {str(e)}")
            return {
                "error": str(e),
                "product_name": product_name
            }
    
    def analyze_batch(
        self,
        products: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Analyze multiple products in batch
        
        Args:
            products: List of product dictionaries with 'name' and 'reviews' fields
            
        Returns:
            List of analysis results
        """
        results = []
        
        for i, product in enumerate(products, 1):
            logger.info(f"Processing product {i}/{len(products)}: {product.get('name', 'Unknown')}")
            
            analysis = self.analyze_product(
                product_name=product.get('name', 'Unknown'),
                reviews=product.get('reviews', []),
                product_metadata=product.get('metadata', {})
            )
            
            results.append(analysis)
        
        logger.info(f"✅ Batch analysis complete. Processed {len(results)} products")
        return results
    
    def get_quick_summary(self, analysis: Dict[str, Any]) -> str:
        """
        Get a quick text summary of the analysis
        
        Args:
            analysis: Analysis result dictionary
            
        Returns:
            Human-readable summary string
        """
        product_name = analysis.get('product_name', 'Unknown')
        sentiment = analysis.get('sentiment_analysis', {})
        score = sentiment.get('overall_score', 0)
        total_reviews = sentiment.get('total_reviews', 0)
        feature_count = len(analysis.get('feature_analysis', {}).get('extracted_features', []))
        
        summary = f"""
Product: {product_name}
Sentiment Score: {score}/100 ({sentiment.get('sentiment_summary', 'N/A')})
Total Reviews: {total_reviews}
Features Identified: {feature_count}
Positive: {sentiment.get('counts', {}).get('positive', 0)} | Negative: {sentiment.get('counts', {}).get('negative', 0)} | Neutral: {sentiment.get('counts', {}).get('neutral', 0)}
"""
        return summary.strip()


# Example usage
if __name__ == "__main__":
    import json
    
    # Initialize pipeline
    pipeline = AnalysisPipeline()
    
    # Sample data
    sample_reviews = [
        {"reviewId": "1", "text": "Amazing product! Great quality and performance.", "rating": 5},
        {"reviewId": "2", "text": "Good value for money. Battery life is excellent.", "rating": 4},
        {"reviewId": "3", "text": "Decent product but the display could be better.", "rating": 3},
        {"reviewId": "4", "text": "Poor quality. Not worth the price.", "rating": 2},
        {"reviewId": "5", "text": "Love it! Best purchase ever. Highly recommend.", "rating": 5}
    ]
    
    # Run analysis
    result = pipeline.analyze_product(
        product_name="Test Product",
        reviews=sample_reviews,
        product_metadata={"price": 299, "category": "Electronics"}
    )
    
    # Display results
    print("\n" + "="*60)
    print("ANALYSIS RESULTS")
    print("="*60)
    print(pipeline.get_quick_summary(result))
    print("\n" + "="*60)
    print("\nFull Analysis:")
    print(json.dumps(result, indent=2))

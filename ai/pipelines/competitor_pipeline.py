"""
Competitor Comparison Pipeline
Compares product features, sentiment, and identifies competitive gaps
"""

import logging
import sys
from typing import Dict, Any, List, Set
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from models.insight_generator import InsightGenerator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CompetitorPipeline:
    """
    Pipeline for competitor analysis and comparison
    """
    
    def __init__(self):
        """
        Initialize competitor comparison pipeline
        """
        logger.info("Initializing Competitor Pipeline...")
        
        try:
            self.insight_generator = InsightGenerator()
            logger.info("✓ Insight generator loaded")
        except Exception as e:
            logger.error(f"Failed to load insight generator: {str(e)}")
            raise
        
        logger.info("Competitor Pipeline initialized successfully")
    
    def compare_products(
        self,
        target_product: Dict[str, Any],
        competitors: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Compare target product with competitors
        
        Args:
            target_product: Target product data with features, price, sentiment
            competitors: List of competitor products
            
        Returns:
            Comprehensive comparison analysis
        """
        logger.info(f"Comparing {target_product.get('productName', 'Unknown')} with {len(competitors)} competitors")
        
        try:
            # Extract feature gaps
            feature_gaps = self._identify_feature_gaps(target_product, competitors)
            logger.info(f"✓ Identified {len(feature_gaps)} feature gaps")
            
            # Price comparison
            price_analysis = self._compare_pricing(target_product, competitors)
            logger.info("✓ Price analysis complete")
            
            # Sentiment comparison
            sentiment_comparison = self._compare_sentiment(target_product, competitors)
            logger.info("✓ Sentiment comparison complete")
            
            # Feature comparison
            feature_comparison = self._compare_features(target_product, competitors)
            logger.info("✓ Feature comparison complete")
            
            # Generate competitive insights
            logger.info("Generating competitive insights...")
            competitive_insights = self.insight_generator.generate_competitor_insights(
                product_data=target_product,
                competitors=competitors,
                feature_gaps=list(feature_gaps)
            )
            logger.info("✓ Insights generated")
            
            # Compile comparison result
            comparison = {
                "target_product": {
                    "name": target_product.get('productName', 'Unknown'),
                    "price": target_product.get('price', 0),
                    "sentiment_score": target_product.get('sentimentScore', 0),
                    "features": target_product.get('features', []),
                    "rating": target_product.get('avgRating', 0)
                },
                "competitors_analyzed": len(competitors),
                "feature_gaps": {
                    "gaps_identified": list(feature_gaps),
                    "total_gaps": len(feature_gaps),
                    "priority": self._prioritize_gaps(feature_gaps, competitors)
                },
                "price_comparison": price_analysis,
                "sentiment_comparison": sentiment_comparison,
                "feature_comparison": feature_comparison,
                "competitive_insights": competitive_insights,
                "overall_position": self._calculate_overall_position(
                    target_product,
                    competitors,
                    sentiment_comparison,
                    price_analysis
                )
            }
            
            logger.info(f"✅ Comparison complete")
            return comparison
            
        except Exception as e:
            logger.error(f"Comparison pipeline failed: {str(e)}")
            return {
                "error": str(e),
                "target_product": target_product.get('productName', 'Unknown')
            }
    
    def _identify_feature_gaps(
        self,
        target_product: Dict[str, Any],
        competitors: List[Dict[str, Any]]
    ) -> Set[str]:
        """
        Identify features that competitors have but target product doesn't
        
        Args:
            target_product: Target product data
            competitors: List of competitor products
            
        Returns:
            Set of missing features
        """
        target_features = set([f.lower() for f in (target_product.get('features') or [])])
        competitor_features = set()
        
        for competitor in competitors:
            comp_features = [f.lower() for f in (competitor.get('features') or [])]
            competitor_features.update(comp_features)
        
        # Features competitors have but target doesn't
        gaps = competitor_features - target_features
        
        return gaps
    
    def _compare_pricing(
        self,
        target_product: Dict[str, Any],
        competitors: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Compare pricing with competitors
        
        Args:
            target_product: Target product data
            competitors: List of competitor products
            
        Returns:
            Price comparison analysis
        """
        target_price = self._to_number(target_product.get('price'), 0.0)
        competitor_prices = []
        for competitor in competitors:
            price = self._to_number(competitor.get('price'), 0.0)
            if price > 0:
                competitor_prices.append(price)
        
        if not competitor_prices:
            return {
                "target_price": target_price,
                "position": "unknown",
                "price_range": {"min": 0, "max": 0, "avg": 0},
                "price_difference_from_avg": 0,
                "price_percentile": 50.0,
            }
        
        min_price = min(competitor_prices)
        max_price = max(competitor_prices)
        avg_price = sum(competitor_prices) / len(competitor_prices)
        
        # Determine price position
        if target_price < avg_price - (avg_price * 0.1):
            position = "budget"
        elif target_price > avg_price + (avg_price * 0.1):
            position = "premium"
        else:
            position = "competitive"
        
        return {
            "target_price": target_price,
            "position": position,
            "price_range": {
                "min": min_price,
                "max": max_price,
                "avg": round(avg_price, 2)
            },
            "price_difference_from_avg": round(target_price - avg_price, 2),
            "price_percentile": self._calculate_percentile(target_price, competitor_prices)
        }
    
    def _compare_sentiment(
        self,
        target_product: Dict[str, Any],
        competitors: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Compare sentiment scores with competitors
        
        Args:
            target_product: Target product data
            competitors: List of competitor products
            
        Returns:
            Sentiment comparison analysis
        """
        target_sentiment = self._to_number(target_product.get('sentimentScore'), 0.0)
        
        competitor_sentiments = [
            {
                "name": c.get('productName', 'Unknown'),
                "score": self._to_number(c.get('sentimentScore'), 0.0),
                "difference": self._to_number(c.get('sentimentScore'), 0.0) - target_sentiment
            }
            for c in competitors
        ]
        
        # Sort by sentiment score
        competitor_sentiments.sort(key=lambda x: x['score'], reverse=True)
        
        # Calculate statistics
        scores = [c['score'] for c in competitor_sentiments]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # Determine position
        better_count = sum(1 for c in competitor_sentiments if c['score'] > target_sentiment)
        rank = better_count + 1
        
        return {
            "target_sentiment": target_sentiment,
            "rank": rank,
            "total_products": len(competitors) + 1,
            "competitors": competitor_sentiments,
            "average_competitor_sentiment": round(avg_score, 2),
            "difference_from_average": round(target_sentiment - avg_score, 2),
            "position": self._get_sentiment_position(target_sentiment, avg_score)
        }
    
    def _compare_features(
        self,
        target_product: Dict[str, Any],
        competitors: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Compare feature counts and coverage
        
        Args:
            target_product: Target product data
            competitors: List of competitor products
            
        Returns:
            Feature comparison analysis
        """
        target_features = target_product.get('features') or []
        target_count = len(target_features)
        
        competitor_feature_counts = [
            {
                "name": c.get('productName', 'Unknown'),
                "count": len(c.get('features') or [])
            }
            for c in competitors
        ]
        
        avg_feature_count = sum(c['count'] for c in competitor_feature_counts) / len(competitor_feature_counts) if competitor_feature_counts else 0
        
        # Find common features
        common_features = set(target_features)
        for competitor in competitors:
            common_features &= set(competitor.get('features') or [])
        
        return {
            "target_feature_count": target_count,
            "average_competitor_count": round(avg_feature_count, 2),
            "competitor_counts": competitor_feature_counts,
            "common_features": list(common_features),
            "common_feature_count": len(common_features),
            "position": "above_average" if target_count > avg_feature_count else "below_average"
        }
    
    def _prioritize_gaps(
        self,
        feature_gaps: Set[str],
        competitors: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Prioritize feature gaps by how many competitors have them
        
        Args:
            feature_gaps: Set of missing features
            competitors: List of competitor products
            
        Returns:
            Prioritized list of features with frequency
        """
        gap_frequency = {}
        
        for gap in feature_gaps:
            count = sum(
                1 for c in competitors
                if gap.lower() in [f.lower() for f in (c.get('features') or [])]
            )
            gap_frequency[gap] = count
        
        # Sort by frequency (descending)
        prioritized = [
            {"feature": feature, "competitor_count": count}
            for feature, count in sorted(gap_frequency.items(), key=lambda x: x[1], reverse=True)
        ]
        
        return prioritized[:10]  # Top 10 priority gaps
    
    def _calculate_percentile(self, value: float, values: List[float]) -> float:
        """Calculate percentile position"""
        if not values:
            return 50.0
        
        sorted_values = sorted(values)
        position = sum(1 for v in sorted_values if v < value)
        percentile = (position / len(sorted_values)) * 100
        
        return round(percentile, 2)
    
    def _get_sentiment_position(self, target: float, avg: float) -> str:
        """Get sentiment position description"""
        diff = target - avg
        
        if diff > 10:
            return "strong_leader"
        elif diff > 5:
            return "above_average"
        elif diff > -5:
            return "competitive"
        elif diff > -10:
            return "below_average"
        else:
            return "needs_improvement"

    def _to_number(self, value: Any, default: float = 0.0) -> float:
        """Convert nullable/mixed values to float safely."""
        try:
            if value is None:
                return default
            return float(value)
        except (TypeError, ValueError):
            return default
    
    def _calculate_overall_position(
        self,
        target_product: Dict[str, Any],
        competitors: List[Dict[str, Any]],
        sentiment_comparison: Dict[str, Any],
        price_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate overall competitive position
        
        Args:
            target_product: Target product data
            competitors: List of competitors
            sentiment_comparison: Sentiment comparison results
            price_analysis: Price analysis results
            
        Returns:
            Overall position assessment
        """
        sentiment_rank = sentiment_comparison.get('rank', len(competitors) + 1)
        total_products = sentiment_comparison.get('total_products', 1)
        
        # Calculate overall score (0-100)
        sentiment_score = self._to_number(target_product.get('sentimentScore'), 0.0)
        rating_score = self._to_number(target_product.get('avgRating'), 0.0) * 20  # Convert 5-star to 100
        
        # Price competitiveness (lower price = higher score)
        price_position = price_analysis.get('position', 'competitive')
        price_score = 70  # Default
        if price_position == 'budget':
            price_score = 85
        elif price_position == 'premium':
            price_score = 55
        
        overall_score = (sentiment_score * 0.5) + (rating_score * 0.3) + (price_score * 0.2)
        
        # Determine position tier
        if sentiment_rank == 1:
            tier = "market_leader"
        elif sentiment_rank <= total_products * 0.3:
            tier = "top_tier"
        elif sentiment_rank <= total_products * 0.6:
            tier = "mid_tier"
        else:
            tier = "lower_tier"
        
        return {
            "overall_score": round(overall_score, 2),
            "tier": tier,
            "rank": sentiment_rank,
            "total_products": total_products,
            "strengths": self._identify_strengths(target_product, competitors),
            "weaknesses": self._identify_weaknesses(target_product, competitors)
        }
    
    def _identify_strengths(
        self,
        target_product: Dict[str, Any],
        competitors: List[Dict[str, Any]]
    ) -> List[str]:
        """Identify product strengths"""
        strengths = []
        
        target_sentiment = self._to_number(target_product.get('sentimentScore'), 0.0)
        target_price = self._to_number(target_product.get('price'), 0.0)
        
        avg_sentiment = sum(self._to_number(c.get('sentimentScore'), 0.0) for c in competitors) / len(competitors) if competitors else 0
        avg_price = sum(self._to_number(c.get('price'), 0.0) for c in competitors) / len(competitors) if competitors else 0
        
        if target_sentiment > avg_sentiment:
            strengths.append("Above average customer satisfaction")
        
        if target_price < avg_price:
            strengths.append("Competitive pricing")
        
        target_feature_count = len(target_product.get('features') or [])
        avg_feature_count = (sum(len(c.get('features') or []) for c in competitors) / len(competitors)) if competitors else 0
        if target_feature_count >= avg_feature_count:
            strengths.append("Comprehensive feature set")
        
        return strengths
    
    def _identify_weaknesses(
        self,
        target_product: Dict[str, Any],
        competitors: List[Dict[str, Any]]
    ) -> List[str]:
        """Identify product weaknesses"""
        weaknesses = []
        
        target_sentiment = self._to_number(target_product.get('sentimentScore'), 0.0)
        
        avg_sentiment = sum(self._to_number(c.get('sentimentScore'), 0.0) for c in competitors) / len(competitors) if competitors else 0
        
        if target_sentiment < avg_sentiment - 5:
            weaknesses.append("Below average customer satisfaction")
        
        # Check for missing common features
        target_features = set(target_product.get('features') or [])
        common_competitor_features = set()
        
        for competitor in competitors:
            common_competitor_features.update(competitor.get('features') or [])
        
        missing_common = common_competitor_features - target_features
        if len(missing_common) > 3:
            weaknesses.append(f"Missing {len(missing_common)} common competitor features")
        
        return weaknesses


# Example usage
if __name__ == "__main__":
    import json
    
    # Initialize pipeline
    pipeline = CompetitorPipeline()
    
    # Sample data
    target = {
        "productName": "Our Product",
        "price": 200,
        "sentimentScore": 75,
        "avgRating": 3.8,
        "features": ["feature A", "feature B", "feature C"]
    }
    
    competitors = [
        {
            "productName": "Competitor 1",
            "price": 180,
            "sentimentScore": 85,
            "avgRating": 4.2,
            "features": ["feature A", "feature B", "feature D", "feature E"]
        },
        {
            "productName": "Competitor 2",
            "price": 220,
            "sentimentScore": 70,
            "avgRating": 3.5,
            "features": ["feature A", "feature C", "feature F"]
        }
    ]
    
    # Run comparison
    result = pipeline.compare_products(target, competitors)
    
    # Display results
    print("\n" + "="*60)
    print("COMPETITOR COMPARISON")
    print("="*60)
    print(json.dumps(result, indent=2))

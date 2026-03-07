"""
Feature Extraction Module (model-free)
Extracts product features and attributes using keyword/rule logic.
"""

import logging
from typing import List, Dict, Any, Set
from collections import Counter
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FeatureExtractor:
    """
    Extract product features using lexical matching and phrase statistics.
    """
    
    def __init__(self, ner_model: str = "disabled"):
        """
        Initialize the feature extractor
        
        Args:
            ner_model: kept for backward compatibility (unused)
        """
        self.ner_model = ner_model
        self.ner_pipeline = None
        logger.info("Feature extractor initialized (model-free mode)")
        
        # Common product feature keywords by category
        self.feature_keywords = {
            "quality": ["quality", "build", "construction", "durability", "material", "premium", "sturdy"],
            "design": ["design", "look", "appearance", "style", "aesthetic", "ergonomic", "compact"],
            "performance": ["performance", "speed", "fast", "slow", "efficient", "powerful", "smooth"],
            "price": ["price", "cost", "value", "expensive", "cheap", "affordable", "worth"],
            "usability": ["easy", "difficult", "comfortable", "convenient", "user-friendly", "simple"],
            "battery": ["battery", "charge", "charging", "power", "lasting", "backup"],
            "display": ["display", "screen", "brightness", "resolution", "pixels", "AMOLED", "LCD"],
            "camera": ["camera", "photo", "picture", "image", "lens", "zoom", "MP"],
            "grip": ["grip", "handle", "hold", "comfortable", "ergonomic"],
            "blades": ["blade", "sharp", "cutting", "edge", "precision"],
            "connectivity": ["5G", "4G", "wifi", "bluetooth", "network", "signal"]
        }
    
    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract named entities from text
        
        Args:
            text: Input text
            
        Returns:
            List of entities with their types and scores
        """
        _ = text
        return []
    
    def extract_features_from_text(self, text: str) -> Dict[str, List[str]]:
        """
        Extract product features from a single text
        
        Args:
            text: Review text
            
        Returns:
            Dictionary of feature categories and mentioned features
        """
        text_lower = text.lower()
        extracted_features = {}
        
        for category, keywords in self.feature_keywords.items():
            found_keywords = []
            for keyword in keywords:
                if keyword in text_lower:
                    found_keywords.append(keyword)
            
            if found_keywords:
                extracted_features[category] = found_keywords
        
        return extracted_features
    
    def extract_features_from_reviews(self, reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract and aggregate features from multiple reviews
        
        Args:
            reviews: List of review dictionaries
            
        Returns:
            Aggregated feature analysis
        """
        all_features = {}
        feature_counts = Counter()
        feature_mentions = []
        
        for review in reviews:
            text = review.get('text', '')
            if not text:
                continue
            
            # Extract features
            features = self.extract_features_from_text(text)
            
            # Extract entities using NER
            entities = self.extract_entities(text)
            
            # Aggregate features
            for category, keywords in features.items():
                if category not in all_features:
                    all_features[category] = []
                all_features[category].extend(keywords)
                feature_counts[category] += len(keywords)
            
            feature_mentions.append({
                "review_id": review.get('reviewId', ''),
                "features": features,
                "entities": entities
            })
        
        # Count unique features per category
        feature_summary = {}
        for category, keywords in all_features.items():
            unique_keywords = list(set(keywords))
            feature_summary[category] = {
                "keywords": unique_keywords,
                "count": len(keywords),
                "unique_count": len(unique_keywords)
            }
        
        # Sort categories by frequency
        top_features = sorted(
            feature_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return {
            "feature_summary": feature_summary,
            "top_feature_categories": [
                {"category": cat, "mentions": count}
                for cat, count in top_features[:5]
            ],
            "total_feature_mentions": sum(feature_counts.values()),
            "feature_mentions": feature_mentions
        }
    
    def extract_key_phrases(self, reviews: List[Dict[str, Any]], top_n: int = 10) -> List[Dict[str, Any]]:
        """
        Extract most common phrases from reviews
        
        Args:
            reviews: List of reviews
            top_n: Number of top phrases to return
            
        Returns:
            List of common phrases with their frequencies
        """
        # Extract 2-3 word phrases
        phrase_counter = Counter()
        
        for review in reviews:
            text = review.get('text', '')
            words = re.findall(r'\b\w+\b', text.lower())
            
            # Extract 2-word phrases
            for i in range(len(words) - 1):
                phrase = f"{words[i]} {words[i+1]}"
                phrase_counter[phrase] += 1
            
            # Extract 3-word phrases
            for i in range(len(words) - 2):
                phrase = f"{words[i]} {words[i+1]} {words[i+2]}"
                phrase_counter[phrase] += 1
        
        top_phrases = phrase_counter.most_common(top_n)
        
        return [
            {"phrase": phrase, "frequency": count}
            for phrase, count in top_phrases
        ]
    
    def get_feature_list(self, reviews: List[Dict[str, Any]]) -> List[str]:
        """
        Get a simple list of product features mentioned
        
        Args:
            reviews: List of reviews
            
        Returns:
            List of unique feature strings
        """
        result = self.extract_features_from_reviews(reviews)
        features = set()
        
        for category, data in result['feature_summary'].items():
            features.update(data['keywords'])
        
        return sorted(list(features))


# Example usage
if __name__ == "__main__":
    extractor = FeatureExtractor()
    
    test_reviews = [
        {
            "reviewId": "1",
            "text": "The display quality is amazing with AMOLED screen. Battery life is excellent and 5G connectivity is fast."
        },
        {
            "reviewId": "2",
            "text": "Great camera performance with sharp images. The design is sleek and premium build quality."
        },
        {
            "reviewId": "3",
            "text": "Poor battery backup and slow charging. Display brightness is low. Price is too high for performance."
        }
    ]
    
    result = extractor.extract_features_from_reviews(test_reviews)
    print("Feature Summary:")
    for category, data in result['feature_summary'].items():
        print(f"  {category}: {data['keywords']}")
    
    print(f"\nTop Feature Categories:")
    for item in result['top_feature_categories']:
        print(f"  {item['category']}: {item['mentions']} mentions")
    
    key_phrases = extractor.extract_key_phrases(test_reviews, top_n=5)
    print(f"\nKey Phrases:")
    for phrase in key_phrases:
        print(f"  '{phrase['phrase']}' - {phrase['frequency']} times")

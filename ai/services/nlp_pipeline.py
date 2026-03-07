"""
NLP enrichment service: sentiment, keywords, and feature/competitor signals.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from models.sentiment_analyzer import SentimentAnalyzer

logger = logging.getLogger(__name__)


class NLPEnrichmentService:
    """
    Multi-step NLP pipeline with graceful fallback paths.
    """

    def __init__(self) -> None:
        self.lexical_sentiment = SentimentAnalyzer()
        logger.info("NLP enrichment running in fully local lexical/rule mode")

        self.feature_seed_map = {
            "ui_ux": ["ui", "ux", "interface", "design", "navigation", "usability"],
            "pricing": ["price", "pricing", "cost", "expensive", "affordable", "value"],
            "performance": ["fast", "slow", "performance", "lag", "speed", "responsive"],
            "support": ["support", "customer service", "help", "ticket", "response"],
            "reliability": ["bug", "stable", "crash", "downtime", "reliable", "uptime"],
        }

    def analyze_records(
        self,
        records: List[Dict[str, Any]],
        competitors: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        competitors = competitors or []
        enriched: List[Dict[str, Any]] = []

        for record in records:
            review_text = (record.get("review") or "").strip()
            if not review_text:
                continue

            sentiment = self._analyze_sentiment(review_text)
            keywords = self._extract_keywords(review_text)
            feature_tags = self._detect_features(review_text)
            competitor_similarity = self._competitor_similarity(review_text, competitors)

            enriched.append(
                {
                    **record,
                    "sentiment": sentiment["sentiment"],
                    "positive_score": sentiment["positive_score"],
                    "negative_score": sentiment["negative_score"],
                    "sentiment_strength": sentiment["sentiment_strength"],
                    "keywords": ", ".join(keywords),
                    "feature_tags": feature_tags,
                    "competitor_similarity": competitor_similarity,
                }
            )

        return enriched

    def extract_keywords_only(self, text: str, top_k: int = 8) -> List[str]:
        return self._extract_keywords(text, top_k=top_k)

    def competitor_discovery(self, text: str, candidates: List[str]) -> Dict[str, Any]:
        similarity = self._competitor_similarity(text, candidates)
        sorted_items = sorted(similarity.items(), key=lambda item: item[1], reverse=True)
        return {
            "top_matches": [{"competitor": name, "score": score} for name, score in sorted_items[:5]],
            "all_scores": similarity,
        }

    def _analyze_sentiment(self, text: str) -> Dict[str, Any]:
        lexical = self.lexical_sentiment.analyze_text(text)
        score_0_1 = float(lexical.get("sentiment_score", 50.0)) / 100.0
        positive_score = max(0.0, min(1.0, score_0_1))
        negative_score = 1.0 - positive_score

        return {
            "sentiment": lexical.get("label", "NEUTRAL").title(),
            "positive_score": round(positive_score, 4),
            "negative_score": round(negative_score, 4),
            "sentiment_strength": round(abs(positive_score - negative_score), 4),
        }

    def _extract_keywords(self, text: str, top_k: int = 8) -> List[str]:
        tokens = [token.strip(".,!?;:()[]{}\"'").lower() for token in text.split()]
        tokens = [token for token in tokens if len(token) > 3]
        token_counts: Dict[str, int] = {}
        for token in tokens:
            token_counts[token] = token_counts.get(token, 0) + 1
        ranked = sorted(token_counts.items(), key=lambda item: item[1], reverse=True)
        return [token for token, _ in ranked[:top_k]]

    def _detect_features(self, text: str) -> List[str]:
        lowered = text.lower()
        tags = []
        for tag, seeds in self.feature_seed_map.items():
            if any(seed in lowered for seed in seeds):
                tags.append(tag)
        return tags

    def _competitor_similarity(self, text: str, competitors: List[str]) -> Dict[str, float]:
        if not competitors:
            return {}

        lowered = text.lower()
        scores: Dict[str, float] = {}
        for competitor in competitors:
            hits = sum(1 for token in competitor.lower().split() if token in lowered)
            scores[competitor] = round(min(1.0, hits / 3.0), 4)
        return scores

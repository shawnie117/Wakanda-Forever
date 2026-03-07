"""
Market intelligence scoring from collected review data.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List


class MarketIntelligenceService:
    """
    Computes regional product intelligence metrics.
    """

    def compute(self, rows: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not rows:
            return {
                "overall": {
                    "adoption_score": 0,
                    "popularity_score": 0,
                    "competitor_density": 0,
                    "growth_indicator": 0,
                    "sentiment_score": 0,
                },
                "regions": [],
            }

        by_region: Dict[str, List[Dict[str, Any]]] = {}
        for row in rows:
            region = row.get("region") or "Global"
            by_region.setdefault(region, []).append(row)

        regional_results = [self._compute_region(region, items) for region, items in by_region.items()]
        regional_results.sort(key=lambda item: item["adoption_score"], reverse=True)

        overall = {
            "adoption_score": round(sum(item["adoption_score"] for item in regional_results) / len(regional_results), 2),
            "popularity_score": round(sum(item["popularity_score"] for item in regional_results) / len(regional_results), 2),
            "competitor_density": round(sum(item["competitor_density"] for item in regional_results) / len(regional_results), 2),
            "growth_indicator": round(sum(item["growth_indicator"] for item in regional_results) / len(regional_results), 2),
            "sentiment_score": round(sum(item["sentiment_score"] for item in regional_results) / len(regional_results), 4),
        }

        return {"overall": overall, "regions": regional_results}

    def _compute_region(self, region: str, rows: List[Dict[str, Any]]) -> Dict[str, Any]:
        review_volume = len(rows)

        sentiment_values = []
        for row in rows:
            pos = float(row.get("positive_score", 0) or 0)
            neg = float(row.get("negative_score", 0) or 0)
            sentiment_values.append(max(0.0, min(1.0, pos - (neg * 0.25))))
        sentiment_score = sum(sentiment_values) / len(sentiment_values) if sentiment_values else 0.0

        keyword_tokens = set()
        for row in rows:
            for token in str(row.get("keywords", "")).split(","):
                normalized = token.strip().lower()
                if normalized:
                    keyword_tokens.add(normalized)

        competitor_density = min(100.0, float(len(keyword_tokens) * 1.5))

        now = datetime.now(timezone.utc)
        recent_cutoff = now - timedelta(days=14)
        prev_cutoff = now - timedelta(days=28)
        recent_count = 0
        previous_count = 0

        for row in rows:
            date_value = self._parse_date(row.get("date"))
            if date_value is None:
                continue
            if date_value >= recent_cutoff:
                recent_count += 1
            elif date_value >= prev_cutoff:
                previous_count += 1

        growth_indicator = 0.0
        if previous_count > 0:
            growth_indicator = ((recent_count - previous_count) / previous_count) * 100.0
        elif recent_count > 0:
            growth_indicator = 100.0

        growth_indicator = round(max(-100.0, min(200.0, growth_indicator)), 2)

        adoption_score = round(
            max(0.0, min(100.0, (sentiment_score * 60.0) + min(40.0, review_volume * 1.8) - (competitor_density * 0.08))),
            2,
        )

        popularity_score = round(
            max(0.0, min(100.0, min(55.0, review_volume * 2.2) + (sentiment_score * 45.0))),
            2,
        )

        if adoption_score >= 80 and competitor_density <= 45:
            opportunity = "Very High"
        elif adoption_score >= 65:
            opportunity = "High"
        elif adoption_score >= 45:
            opportunity = "Medium"
        else:
            opportunity = "Low"

        return {
            "region": region,
            "review_volume": review_volume,
            "sentiment_score": round(sentiment_score, 4),
            "adoption_score": adoption_score,
            "popularity_score": popularity_score,
            "competitor_density": round(competitor_density, 2),
            "growth_indicator": growth_indicator,
            "opportunity": opportunity,
        }

    def _parse_date(self, value: Any) -> datetime | None:
        if not value:
            return None
        if isinstance(value, datetime):
            return value.astimezone(timezone.utc) if value.tzinfo else value.replace(tzinfo=timezone.utc)

        try:
            normalized = str(value).replace("Z", "+00:00")
            parsed = datetime.fromisoformat(normalized)
            return parsed.astimezone(timezone.utc) if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except Exception:
            return None

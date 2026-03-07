"""
Orchestration service for collection -> NLP -> storage -> analytics.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from services.collectors import DataCollectors
from services.market_intelligence import MarketIntelligenceService
from services.nlp_pipeline import NLPEnrichmentService
from services.sheets_repository import SheetsRepository

logger = logging.getLogger(__name__)


class DataPipelineService:
    """
    End-to-end backend data pipeline used by API routes and scheduler.
    """

    def __init__(self) -> None:
        self.collectors = DataCollectors()
        self.nlp = NLPEnrichmentService()
        self.sheets = SheetsRepository()
        self.market = MarketIntelligenceService()

    def collect_data(
        self,
        product_name: str,
        region: str = "Global",
        max_items_per_source: int = 20,
        competitors: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        raw_records = self.collectors.collect_all_sources(
            product_name=product_name,
            max_items_per_source=max_items_per_source,
            region=region,
        )

        enriched_records = self.nlp.analyze_records(raw_records, competitors=competitors or [])
        storage_result = self.sheets.append_records(enriched_records)

        return {
            "product": product_name,
            "region": region,
            "collected": len(raw_records),
            "stored": storage_result.get("stored", 0),
            "storage": storage_result.get("storage", "none"),
            "records": enriched_records,
        }

    def analyze_texts(
        self,
        product_name: str,
        texts: List[str],
        region: str = "Global",
        competitors: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        records = [
            {
                "product": product_name,
                "source": "ManualInput",
                "review": text,
                "date": None,
                "region": region,
            }
            for text in texts
            if text and text.strip()
        ]

        enriched = self.nlp.analyze_records(records, competitors=competitors or [])
        return {
            "product": product_name,
            "analyzed": len(enriched),
            "records": enriched,
        }

    def extract_keywords(self, text: str, top_k: int = 8) -> Dict[str, Any]:
        keywords = self.nlp.extract_keywords_only(text=text, top_k=top_k)
        return {"keywords": keywords, "count": len(keywords)}

    def discover_competitors(self, text: str, candidates: List[str]) -> Dict[str, Any]:
        return self.nlp.competitor_discovery(text=text, candidates=candidates)

    def get_sheet_data(self, product: Optional[str] = None, limit: Optional[int] = None) -> Dict[str, Any]:
        return self.sheets.read_records(limit=limit, product=product)

    def get_market_analysis(self, product: Optional[str] = None) -> Dict[str, Any]:
        sheet_data = self.get_sheet_data(product=product, limit=None)
        rows = sheet_data.get("rows", [])
        market = self.market.compute(rows)
        return {
            "product_filter": product,
            "data_source": sheet_data.get("source"),
            "record_count": sheet_data.get("count", 0),
            "market_intelligence": market,
        }

"""
Daily scheduler for automatic data collection.
"""

from __future__ import annotations

import logging
import os
from typing import List

logger = logging.getLogger(__name__)


class PipelineScheduler:
    """
    Wraps APScheduler to run the collector daily (default: 03:00).
    """

    def __init__(self, data_pipeline_service) -> None:
        self.data_pipeline_service = data_pipeline_service
        self.scheduler = None

    def start(self) -> bool:
        try:
            from apscheduler.schedulers.background import BackgroundScheduler  # type: ignore
            from apscheduler.triggers.cron import CronTrigger  # type: ignore
        except Exception as error:
            logger.warning("APScheduler unavailable; daily scheduling disabled: %s", str(error))
            return False

        if self.scheduler is not None:
            return True

        hour = int(os.getenv("DAILY_COLLECT_HOUR", "3"))
        minute = int(os.getenv("DAILY_COLLECT_MINUTE", "0"))

        self.scheduler = BackgroundScheduler(timezone="UTC")
        self.scheduler.add_job(
            self._run_daily_collection,
            trigger=CronTrigger(hour=hour, minute=minute),
            id="vibranium_daily_collection",
            replace_existing=True,
        )
        self.scheduler.start()
        logger.info("Daily collector scheduled at %02d:%02d UTC", hour, minute)
        return True

    def shutdown(self) -> None:
        if self.scheduler is not None:
            self.scheduler.shutdown(wait=False)
            self.scheduler = None

    def _run_daily_collection(self) -> None:
        products = self._get_daily_products()
        if not products:
            logger.info("No DAILY_COLLECT_PRODUCTS configured; skipping scheduled run")
            return

        logger.info("Starting scheduled collection for %d products", len(products))
        for product in products:
            try:
                self.data_pipeline_service.collect_data(product_name=product, region="Global", max_items_per_source=15)
                logger.info("Scheduled collection completed for: %s", product)
            except Exception as error:
                logger.warning("Scheduled collection failed for %s: %s", product, str(error))

    def _get_daily_products(self) -> List[str]:
        raw = os.getenv("DAILY_COLLECT_PRODUCTS", "")
        if not raw.strip():
            return []
        return [item.strip() for item in raw.split(",") if item.strip()]

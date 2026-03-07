"""
Live data collectors for product intelligence.
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class DataCollectors:
    """
    Aggregates review/opinion text from multiple free/low-cost sources.
    """

    def __init__(self) -> None:
        self.reddit_client_id = os.getenv("REDDIT_CLIENT_ID", "").strip()
        self.reddit_client_secret = os.getenv("REDDIT_CLIENT_SECRET", "").strip()
        self.reddit_user_agent = os.getenv("REDDIT_USER_AGENT", "vibranium-ai-collector/1.0").strip()
        self.producthunt_token = os.getenv("PRODUCTHUNT_ACCESS_TOKEN", "").strip()
        self.producthunt_client_id = os.getenv("PRODUCTHUNT_CLIENT_ID", "").strip()
        self.producthunt_client_secret = os.getenv("PRODUCTHUNT_CLIENT_SECRET", "").strip()

        ai_root = Path(__file__).resolve().parents[1]
        self.datasets_dir = ai_root / "datasets"
        self.datasets_dir.mkdir(parents=True, exist_ok=True)

    def collect_all_sources(
        self,
        product_name: str,
        max_items_per_source: int = 20,
        region: str = "Global",
    ) -> List[Dict[str, Any]]:
        """
        Collect data from all configured sources.
        """
        aggregated: List[Dict[str, Any]] = []

        collectors = [
            self.collect_reddit,
            self.collect_hackernews,
            self.collect_producthunt,
            self.collect_google_play,
            self.collect_app_store,
        ]

        for collector in collectors:
            try:
                items = collector(product_name=product_name, max_items=max_items_per_source, region=region)
                aggregated.extend(items)
            except Exception as error:
                logger.warning("Collector failed (%s): %s", collector.__name__, str(error))

        self._write_raw_snapshot(product_name=product_name, records=aggregated)
        return aggregated

    def collect_reddit(self, product_name: str, max_items: int, region: str) -> List[Dict[str, Any]]:
        """
        Collect opinion snippets from Reddit using PRAW.
        """
        try:
            import praw  # type: ignore
        except Exception:
            logger.info("praw unavailable; skipping Reddit collector")
            return []

        if not self.reddit_client_id or not self.reddit_client_secret:
            logger.info("Reddit credentials missing; skipping Reddit collector")
            return []

        reddit = praw.Reddit(
            client_id=self.reddit_client_id,
            client_secret=self.reddit_client_secret,
            user_agent=self.reddit_user_agent,
        )

        records: List[Dict[str, Any]] = []
        for submission in reddit.subreddit("all").search(product_name, limit=max_items):
            text_parts = [submission.title or "", submission.selftext or ""]
            text = " ".join(part.strip() for part in text_parts if part).strip()
            if not text:
                continue
            records.append(
                {
                    "product": product_name,
                    "source": "Reddit",
                    "review": text,
                    "date": datetime.fromtimestamp(submission.created_utc, tz=timezone.utc).isoformat(),
                    "region": region,
                }
            )
        return records

    def collect_hackernews(self, product_name: str, max_items: int, region: str) -> List[Dict[str, Any]]:
        """
        Collect posts/comments from Hacker News Algolia API.
        """
        url = "https://hn.algolia.com/api/v1/search"
        candidate_queries = [product_name]
        first_token = (product_name.split() or [""])[0].strip()
        if first_token and first_token.lower() != product_name.lower():
            candidate_queries.append(first_token)

        payload = {"hits": []}
        with httpx.Client(timeout=20.0) as client:
            for query_term in candidate_queries:
                params = {"query": query_term, "hitsPerPage": max_items}
                response = client.get(url, params=params)
                response.raise_for_status()
                payload = response.json()
                if payload.get("hits"):
                    break

        records: List[Dict[str, Any]] = []
        for hit in payload.get("hits", []):
            text = (hit.get("comment_text") or hit.get("story_text") or hit.get("title") or "").strip()
            if not text:
                continue
            records.append(
                {
                    "product": product_name,
                    "source": "HackerNews",
                    "review": text,
                    "date": hit.get("created_at") or _iso_now(),
                    "region": region,
                }
            )
        return records

    def collect_producthunt(self, product_name: str, max_items: int, region: str) -> List[Dict[str, Any]]:
        """
        Collect launch descriptions from Product Hunt GraphQL.
        """
        token = self.producthunt_token
        
        # If no direct token, try to get one using client credentials
        if not token and self.producthunt_client_id and self.producthunt_client_secret:
            try:
                with httpx.Client(timeout=10.0) as client:
                    token_res = client.post(
                        "https://api.producthunt.com/v2/oauth/token",
                        json={
                            "client_id": self.producthunt_client_id,
                            "client_secret": self.producthunt_client_secret,
                            "grant_type": "client_credentials"
                        }
                    )
                    token_res.raise_for_status()
                    token = token_res.json().get("access_token")
            except Exception as e:
                logger.warning("Failed to get Product Hunt token: %s", str(e))

        if not token:
            logger.info("Product Hunt token/credentials missing; skipping collector")
            return []

        query = """
        query SearchPosts($query: String!, $first: Int!) {
          posts(first: $first, order: VOTES, postedAfter: \"2020-01-01T00:00:00Z\", search: $query) {
            nodes {
              name
              tagline
              description
              createdAt
            }
          }
        }
        """
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        body = {"query": query, "variables": {"query": product_name, "first": max_items}}

        with httpx.Client(timeout=25.0) as client:
            response = client.post("https://api.producthunt.com/v2/api/graphql", headers=headers, json=body)
            response.raise_for_status()
            payload = response.json()

        nodes = payload.get("data", {}).get("posts", {}).get("nodes", [])
        records: List[Dict[str, Any]] = []
        for node in nodes:
            text = " ".join(
                segment.strip()
                for segment in [node.get("name") or "", node.get("tagline") or "", node.get("description") or ""]
                if segment
            ).strip()
            if not text:
                continue
            records.append(
                {
                    "product": product_name,
                    "source": "ProductHunt",
                    "review": text,
                    "date": node.get("createdAt") or _iso_now(),
                    "region": region,
                }
            )
        return records

    def collect_google_play(self, product_name: str, max_items: int, region: str) -> List[Dict[str, Any]]:
        """
        Collect app reviews from Google Play.
        """
        try:
            from google_play_scraper import Sort, reviews, search  # type: ignore
        except Exception:
            logger.info("google-play-scraper unavailable; skipping Google Play collector")
            return []

        try:
            app_results = search(product_name, n_hits=1)
            if not app_results:
                return []
            app_id = app_results[0].get("appId")
            if not app_id:
                return []

            play_reviews, _ = reviews(
                app_id,
                lang="en",
                country="us",
                sort=Sort.NEWEST,
                count=max_items,
            )
        except Exception as error:
            logger.warning("Google Play collection failed: %s", str(error))
            return []

        records: List[Dict[str, Any]] = []
        for item in play_reviews:
            text = (item.get("content") or "").strip()
            if not text:
                continue
            review_date = item.get("at")
            records.append(
                {
                    "product": product_name,
                    "source": "GooglePlay",
                    "review": text,
                    "date": review_date.isoformat() if hasattr(review_date, "isoformat") else _iso_now(),
                    "region": region,
                }
            )
        return records

    def collect_app_store(self, product_name: str, max_items: int, region: str) -> List[Dict[str, Any]]:
        """
        Collect app reviews from Apple App Store.
        """
        try:
            from app_store_scraper import AppStore  # type: ignore
        except Exception:
            logger.info("app-store-scraper unavailable; skipping App Store collector")
            return []

        with httpx.Client(timeout=20.0) as client:
            response = client.get(
                "https://itunes.apple.com/search",
                params={"term": product_name, "entity": "software", "limit": 1},
            )
            response.raise_for_status()
            payload = response.json()

        results = payload.get("results", [])
        if not results:
            return []

        first = results[0]
        app_id = first.get("trackId")
        app_name = first.get("trackName")
        if not app_id or not app_name:
            return []

        try:
            scraper = AppStore(country="us", app_name=app_name, app_id=app_id)
            scraper.review(how_many=max_items)
        except Exception as error:
            logger.warning("App Store collection failed: %s", str(error))
            return []

        records: List[Dict[str, Any]] = []
        for item in getattr(scraper, "reviews", [])[:max_items]:
            text = (item.get("review") or "").strip()
            if not text:
                continue
            review_date = item.get("date")
            records.append(
                {
                    "product": product_name,
                    "source": "AppStore",
                    "review": text,
                    "date": review_date.isoformat() if hasattr(review_date, "isoformat") else _iso_now(),
                    "region": region,
                }
            )
        return records

    def _write_raw_snapshot(self, product_name: str, records: List[Dict[str, Any]]) -> None:
        safe_name = "".join(ch if ch.isalnum() else "_" for ch in product_name.lower()).strip("_") or "product"
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        path = self.datasets_dir / f"collected_{safe_name}_{stamp}.json"
        with path.open("w", encoding="utf-8") as handle:
            json.dump({"product": product_name, "records": records}, handle, indent=2, ensure_ascii=False)

"""
Google Sheets storage repository with local fallback.
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class SheetsRepository:
    """
    Writes analysis rows to Google Sheets and supports local fallback storage.
    """

    COLUMNS = [
        "product",
        "source",
        "review",
        "sentiment",
        "positive_score",
        "negative_score",
        "keywords",
        "date",
        "region",
    ]

    def __init__(self) -> None:
        self.sheet_id = os.getenv("GOOGLE_SHEET_ID", "").strip()
        self.worksheet_name = os.getenv("GOOGLE_SHEET_WORKSHEET", "reviews").strip() or "reviews"
        self.service_account_file = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "").strip()
        self.service_account_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()

        ai_root = Path(__file__).resolve().parents[1]
        self.fallback_path = ai_root / "datasets" / "sheet_fallback.json"
        self.fallback_path.parent.mkdir(parents=True, exist_ok=True)

        self._gspread_client = None
        self._worksheet = None
        self._initialize_sheet()

    def _initialize_sheet(self) -> None:
        try:
            import gspread  # type: ignore
            from google.oauth2.service_account import Credentials  # type: ignore
        except Exception as error:
            logger.warning("gspread/google auth unavailable, using fallback storage: %s", str(error))
            return

        if not self.sheet_id:
            logger.info("GOOGLE_SHEET_ID not configured; sheet writes will use fallback storage")
            return

        try:
            credentials = None
            scopes = ["https://www.googleapis.com/auth/spreadsheets"]

            if self.service_account_json:
                parsed = json.loads(self.service_account_json)
                credentials = Credentials.from_service_account_info(parsed, scopes=scopes)
            elif self.service_account_file:
                credentials = Credentials.from_service_account_file(self.service_account_file, scopes=scopes)

            if credentials is None:
                logger.info("Google service account credentials missing; fallback storage enabled")
                return

            self._gspread_client = gspread.authorize(credentials)
            spreadsheet = self._gspread_client.open_by_key(self.sheet_id)
            self._worksheet = spreadsheet.worksheet(self.worksheet_name)

            values = self._worksheet.row_values(1)
            if values[: len(self.COLUMNS)] != self.COLUMNS:
                self._worksheet.update("A1:I1", [self.COLUMNS])
            logger.info("Google Sheets repository initialized")
        except Exception as error:
            logger.warning("Google Sheets initialization failed, fallback enabled: %s", str(error))
            self._gspread_client = None
            self._worksheet = None

    @property
    def is_sheet_ready(self) -> bool:
        return self._worksheet is not None

    def append_records(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not records:
            return {"stored": 0, "storage": "none"}

        rows = [self._record_to_row(item) for item in records]

        if self._worksheet is not None:
            try:
                self._worksheet.append_rows(rows, value_input_option="RAW")
                return {"stored": len(rows), "storage": "google_sheets"}
            except Exception as error:
                logger.warning("Sheet append failed; writing fallback: %s", str(error))

        self._append_fallback(records)
        return {"stored": len(rows), "storage": "local_fallback"}

    def read_records(self, limit: Optional[int] = None, product: Optional[str] = None) -> Dict[str, Any]:
        rows: List[Dict[str, Any]] = []
        source = "local_fallback"

        if self._worksheet is not None:
            try:
                values = self._worksheet.get_all_records()
                rows = [self._normalize_row(item) for item in values]
                source = "google_sheets"
            except Exception as error:
                logger.warning("Sheet read failed; using fallback: %s", str(error))

        if not rows:
            rows = self._read_fallback()
            source = "local_fallback"

        if product:
            rows = [item for item in rows if (item.get("product") or "").lower() == product.lower()]

        rows.sort(key=lambda item: item.get("date", ""), reverse=True)
        if limit is not None and limit > 0:
            rows = rows[:limit]

        return {"source": source, "rows": rows, "count": len(rows)}

    def _record_to_row(self, record: Dict[str, Any]) -> List[Any]:
        normalized = self._normalize_row(record)
        return [normalized.get(column, "") for column in self.COLUMNS]

    def _normalize_row(self, row: Dict[str, Any]) -> Dict[str, Any]:
        normalized = {
            "product": row.get("product", ""),
            "source": row.get("source", ""),
            "review": row.get("review", ""),
            "sentiment": row.get("sentiment", ""),
            "positive_score": float(row.get("positive_score", 0) or 0),
            "negative_score": float(row.get("negative_score", 0) or 0),
            "keywords": row.get("keywords", ""),
            "date": row.get("date") or datetime.now(timezone.utc).isoformat(),
            "region": row.get("region", "Global"),
        }
        return normalized

    def _append_fallback(self, records: List[Dict[str, Any]]) -> None:
        existing = self._read_fallback()
        existing.extend([self._normalize_row(item) for item in records])
        with self.fallback_path.open("w", encoding="utf-8") as handle:
            json.dump(existing, handle, indent=2, ensure_ascii=False)

    def _read_fallback(self) -> List[Dict[str, Any]]:
        if not self.fallback_path.exists():
            return []
        try:
            with self.fallback_path.open("r", encoding="utf-8") as handle:
                payload = json.load(handle)
            if isinstance(payload, list):
                return [self._normalize_row(item) for item in payload]
            return []
        except Exception:
            return []

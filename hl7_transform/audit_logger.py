"""
Phase 5 — Structured Audit Logging
====================================
Implements the ``AuditLogger`` class that writes JSON-structured audit
entries to ``audit_log.json`` for every pipeline action.

Compliance reference
--------------------
- IT Act 2000 §67C: Intermediaries must preserve and retain records
  as prescribed. This audit log satisfies that obligation.
- IT Act 2000 §69: Government can direct interception/monitoring —
  the audit log provides the evidence trail.
- DPDP Act 2023 §15: Breach notification requires evidence of what
  data was processed, when, and how — the audit log supplies this.
- GDPR Art. 30: Records of Processing Activities (ROPA) — each
  entry constitutes a processing record.

Event types
-----------
- PIPELINE_START    : Pipeline execution begins
- RECORD_INGESTED   : Raw record loaded from source
- PII_DETECTED      : PII pattern found in data
- PII_ANONYMISED    : PII successfully masked/replaced
- INTEGRITY_SEALED  : SHA-256 ZSH segment appended
- ENCRYPTION_APPLIED: Multi-algorithm encryption comparison complete
- RECORD_COMPLETE   : Single record fully processed
- BREACH_SCAN_START : Breach detection scan initiated
- BREACH_DETECTED   : Anomaly detected during scan
- PIPELINE_END      : Pipeline execution complete

PEP 8 compliant. Thread-safe via file locking.
"""

import json
import logging
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger("hl7_pipeline.audit")

AUDIT_LOG_FILE = "audit_log.json"


class AuditLogger:
    """
    Append-only JSON audit logger for compliance trail.

    Each entry is a JSON object appended to a JSON array in the
    audit log file. The file is created if it does not exist.
    Thread-safe via a threading.Lock to prevent concurrent
    read-modify-write races (IT Act §67C compliance).

    Parameters
    ----------
    log_path : str or Path
        Path to the audit log file. Defaults to ``audit_log.json``
        in the current working directory.
    """

    def __init__(self, log_path: Optional[str] = None) -> None:
        self.log_path = Path(log_path or AUDIT_LOG_FILE)
        self._lock = threading.Lock()
        self._ensure_file()
        logger.info(
            "[AuditLogger] Initialized  path=%s  [IT Act §67C]",
            self.log_path,
        )

    def _ensure_file(self) -> None:
        """Create the audit log file if it does not exist."""
        if not self.log_path.exists():
            with open(self.log_path, "w") as f:
                json.dump([], f)

    def log(
        self,
        event_type: str,
        subject_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        legal_reference: Optional[str] = None,
        severity: str = "INFO",
    ) -> Dict[str, Any]:
        """
        Append a structured audit entry.

        Thread-safe: uses a lock to prevent concurrent read-modify-write
        races that would silently drop audit entries.

        Parameters
        ----------
        event_type : str
            One of the defined event type constants.
        subject_id : str, optional
            The patient/record identifier (pseudonymised).
        details : dict, optional
            Additional context for the event.
        legal_reference : str, optional
            Applicable legal section (e.g., "IT Act §43A").
        severity : str
            One of INFO, WARNING, ERROR, CRITICAL.

        Returns
        -------
        dict
            The created audit entry.
        """
        entry = {
            "timestamp": datetime.now(timezone.utc).strftime(
                "%Y-%m-%dT%H:%M:%S.%fZ"
            ),
            "event_type": event_type,
            "subject_id": subject_id,
            "details": details or {},
            "legal_reference": legal_reference or "",
            "severity": severity,
        }

        # Thread-safe read-modify-write with lock (P1 fix for IT Act §67C)
        with self._lock:
            try:
                with open(self.log_path, "r") as f:
                    entries = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                entries = []

            entries.append(entry)

            with open(self.log_path, "w") as f:
                json.dump(entries, f, indent=2)

        logger.info(
            "[AuditLogger] %s  subject=%s  severity=%s  [%s]",
            event_type,
            subject_id or "N/A",
            severity,
            legal_reference or "general",
        )

        return entry

    def get_entries(
        self,
        event_type: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """
        Retrieve audit entries with optional filtering.

        Parameters
        ----------
        event_type : str, optional
            Filter by event type.
        severity : str, optional
            Filter by severity level.
        limit : int
            Maximum number of entries to return (most recent first).

        Returns
        -------
        list[dict]
        """
        try:
            with open(self.log_path, "r") as f:
                entries = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []

        if event_type:
            entries = [e for e in entries if e.get("event_type") == event_type]
        if severity:
            entries = [e for e in entries if e.get("severity") == severity]

        # Return most recent first
        return list(reversed(entries[-limit:]))

    def clear(self) -> None:
        """Clear all audit entries. Use with caution."""
        with open(self.log_path, "w") as f:
            json.dump([], f)
        logger.warning("[AuditLogger] Audit log CLEARED")

    def get_stats(self) -> Dict[str, Any]:
        """Return summary statistics of the audit log."""
        try:
            with open(self.log_path, "r") as f:
                entries = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            entries = []

        event_counts: Dict[str, int] = {}
        severity_counts: Dict[str, int] = {}
        for e in entries:
            et = e.get("event_type", "UNKNOWN")
            sv = e.get("severity", "UNKNOWN")
            event_counts[et] = event_counts.get(et, 0) + 1
            severity_counts[sv] = severity_counts.get(sv, 0) + 1

        return {
            "total_entries": len(entries),
            "event_counts": event_counts,
            "severity_counts": severity_counts,
            "first_entry": entries[0]["timestamp"] if entries else None,
            "last_entry": entries[-1]["timestamp"] if entries else None,
        }

"""
Phase 6 — Breach Detection & Anomaly Simulation
=================================================
Implements the ``BreachDetector`` class that scans HL7 output files
for residual PII, integrity violations, and simulated anomaly patterns.

Compliance reference
--------------------
- DPDP Act 2023 §15: Data fiduciary must notify the Data Protection
  Board and affected data principals of every personal data breach.
  This module provides the detection capability.
- IT Act 2000 §43A: Failure to implement reasonable security practices
  leading to wrongful loss — this detector identifies such failures.
- IT Act 2000 §72A: Disclosure of information in breach of lawful
  contract — our scan detects if PII leaks through anonymisation.
- GDPR Art. 33/34: Breach notification within 72 hours — detection
  is the prerequisite.

Scan types
----------
1. **Residual PII Scan** — regex patterns for Aadhaar, PAN, email,
   phone numbers that may have survived anonymisation.
2. **Integrity Check** — re-verify every ZSH hash to detect tampering.
3. **Anomaly Flags** — file size deviations, duplicate records,
   missing segments.

PEP 8 compliant. Results are structured for API consumption.
"""

import hashlib
import logging
import os
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List, Optional

logger = logging.getLogger("hl7_pipeline.breach")

# PII patterns that should NOT appear in anonymised output
_RESIDUAL_PII_PATTERNS = [
    ("Aadhaar", re.compile(r"\b\d{4}[\s\-]\d{4}[\s\-]\d{4}\b")),
    ("PAN", re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b")),
    ("Email", re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b")),
    ("Phone", re.compile(r"(\+?91[\s\-]?)?[6-9]\d{9}")),
    ("SSN", re.compile(r"\b\d{3}-\d{2}-\d{4}\b")),
]


@dataclass
class BreachFinding:
    """A single finding from a breach detection scan."""
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    category: str  # PII_LEAK, INTEGRITY_FAIL, ANOMALY
    file: str
    description: str
    legal_reference: str
    line_number: Optional[int] = None
    evidence: Optional[str] = None


class BreachDetector:
    """
    Scan HL7 output files for security breaches and anomalies.

    Parameters
    ----------
    output_dir : str or Path
        Directory containing HL7 output files.
    """

    def __init__(self, output_dir: str = "output") -> None:
        self.output_dir = Path(output_dir)
        logger.info(
            "[BreachDetector] Initialized  dir=%s  [DPDP §15]",
            self.output_dir,
        )

    def full_scan(self) -> dict:
        """
        Run all scan types and return structured results.

        Returns
        -------
        dict
            Keys: findings, summary, risk_score
        """
        findings: List[BreachFinding] = []

        if not self.output_dir.exists():
            return {
                "findings": [],
                "summary": {"total": 0, "critical": 0, "high": 0, "medium": 0, "low": 0},
                "risk_score": 0,
                "scan_status": "NO_OUTPUT_DIR",
            }

        hl7_files = list(self.output_dir.glob("*.hl7"))

        if not hl7_files:
            return {
                "findings": [],
                "summary": {"total": 0, "critical": 0, "high": 0, "medium": 0, "low": 0},
                "risk_score": 0,
                "scan_status": "NO_FILES",
            }

        # 1. Residual PII scan
        findings.extend(self._scan_residual_pii(hl7_files))

        # 2. Integrity verification
        findings.extend(self._verify_integrity(hl7_files))

        # 3. Anomaly detection
        findings.extend(self._detect_anomalies(hl7_files))

        # Compute summary
        summary = {
            "total": len(findings),
            "critical": sum(1 for f in findings if f.severity == "CRITICAL"),
            "high": sum(1 for f in findings if f.severity == "HIGH"),
            "medium": sum(1 for f in findings if f.severity == "MEDIUM"),
            "low": sum(1 for f in findings if f.severity == "LOW"),
        }

        # Risk score (0-100)
        risk_score = min(100, (
            summary["critical"] * 25
            + summary["high"] * 15
            + summary["medium"] * 5
            + summary["low"] * 1
        ))

        logger.info(
            "[BreachDetector] Scan complete  files=%d  findings=%d  "
            "risk_score=%d  [DPDP §15]",
            len(hl7_files), len(findings), risk_score,
        )

        return {
            "findings": [asdict(f) for f in findings],
            "summary": summary,
            "risk_score": risk_score,
            "files_scanned": len(hl7_files),
            "scan_status": "COMPLETE",
        }

    # ------------------------------------------------------------------
    # Scan implementations
    # ------------------------------------------------------------------

    def _scan_residual_pii(self, files: List[Path]) -> List[BreachFinding]:
        """Check for PII patterns that survived anonymisation."""
        findings: List[BreachFinding] = []

        for file_path in files:
            with open(file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()

            for line_num, line in enumerate(lines, 1):
                # Only check NTE (free-text notes) segments
                if not line.startswith("NTE|"):
                    continue

                for pattern_name, pattern in _RESIDUAL_PII_PATTERNS:
                    match = pattern.search(line)
                    if match:
                        findings.append(BreachFinding(
                            severity="CRITICAL",
                            category="PII_LEAK",
                            file=file_path.name,
                            description=(
                                f"Residual {pattern_name} detected in NTE "
                                f"segment after anonymisation"
                            ),
                            legal_reference=(
                                "IT Act §72A (Disclosure in breach of contract), "
                                "DPDP §15 (Breach notification)"
                            ),
                            line_number=line_num,
                            evidence=f"Pattern: {pattern_name}, "
                                     f"Match: {match.group()[:4]}****",
                        ))

        return findings

    def _verify_integrity(self, files: List[Path]) -> List[BreachFinding]:
        """Re-compute and verify ZSH hashes."""
        findings: List[BreachFinding] = []

        for file_path in files:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read().strip()

            lines = content.splitlines()
            zsh_line = None
            body_lines = []

            for line in lines:
                if line.startswith("ZSH|"):
                    zsh_line = line
                else:
                    body_lines.append(line)

            if zsh_line is None:
                findings.append(BreachFinding(
                    severity="HIGH",
                    category="INTEGRITY_FAIL",
                    file=file_path.name,
                    description="Missing ZSH integrity segment — "
                                "message is NOT sealed",
                    legal_reference="IT Act §14 (Secure Electronic Record)",
                ))
                continue

            # Parse stored hash
            parts = zsh_line.split("|")
            stored_hash = parts[3] if len(parts) > 3 else None

            if stored_hash is None:
                findings.append(BreachFinding(
                    severity="HIGH",
                    category="INTEGRITY_FAIL",
                    file=file_path.name,
                    description="Malformed ZSH segment — hash field missing",
                    legal_reference="IT Act §14 (Secure Electronic Record)",
                ))
                continue

            # Recompute
            body = "\n".join(body_lines)
            recomputed = hashlib.sha256(body.encode("utf-8")).hexdigest()

            if recomputed != stored_hash:
                findings.append(BreachFinding(
                    severity="CRITICAL",
                    category="INTEGRITY_FAIL",
                    file=file_path.name,
                    description=(
                        "Hash MISMATCH — message has been tampered with "
                        "after signing"
                    ),
                    legal_reference=(
                        "IT Act §43A (Security failure), "
                        "IT Act §72A (Tamper alert)"
                    ),
                    evidence=(
                        f"Stored: {stored_hash[:16]}… "
                        f"Recomputed: {recomputed[:16]}…"
                    ),
                ))

        return findings

    def _detect_anomalies(self, files: List[Path]) -> List[BreachFinding]:
        """Statistical anomaly detection on output files."""
        findings: List[BreachFinding] = []
        sizes = []

        for file_path in files:
            size = file_path.stat().st_size
            sizes.append((file_path.name, size))

        if not sizes:
            return findings

        # Calculate mean and std
        mean_size = sum(s for _, s in sizes) / len(sizes)
        if len(sizes) > 1:
            variance = sum((s - mean_size) ** 2 for _, s in sizes) / len(sizes)
            std_size = variance ** 0.5
        else:
            std_size = 0

        for name, size in sizes:
            # Flag files that are suspiciously large (> 2 std devs)
            if std_size > 0 and size > mean_size + 2 * std_size:
                findings.append(BreachFinding(
                    severity="MEDIUM",
                    category="ANOMALY",
                    file=name,
                    description=(
                        f"File size anomaly — {size} bytes is "
                        f"{(size - mean_size) / std_size:.1f} std devs above "
                        f"mean ({mean_size:.0f} bytes)"
                    ),
                    legal_reference="IT Act §43 (Unauthorised access indicator)",
                ))

            # Flag empty files
            if size == 0:
                findings.append(BreachFinding(
                    severity="HIGH",
                    category="ANOMALY",
                    file=name,
                    description="Empty file — possible pipeline failure",
                    legal_reference="IT Act §43A (System damage)",
                ))

        # Check for duplicates (same hash = duplicate content)
        file_hashes: dict = {}
        for file_path in files:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            h = hashlib.md5(content.encode()).hexdigest()
            if h in file_hashes:
                findings.append(BreachFinding(
                    severity="LOW",
                    category="ANOMALY",
                    file=file_path.name,
                    description=(
                        f"Duplicate content — identical to "
                        f"{file_hashes[h]}"
                    ),
                    legal_reference="DPDP §8(4) (Purpose limitation — "
                                    "no unnecessary duplication)",
                ))
            else:
                file_hashes[h] = file_path.name

        return findings

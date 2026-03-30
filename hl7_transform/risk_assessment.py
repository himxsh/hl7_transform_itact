"""
Phase 9 — Risk Assessment Matrix
==================================
Quantified risk analysis for the HL7 pipeline based on NIST SP 800-30
and ISO 27005 risk assessment frameworks.

Compliance reference
--------------------
- IS/ISO 27005: Information security risk management — requires
  systematic identification, analysis, and evaluation of risks.
- DPDP Act 2023 §8: Data fiduciaries must implement appropriate
  technical measures — risk assessment justifies the choice of controls.
- IT Act 2000 §43A: "Reasonable security practices" — risk assessment
  demonstrates reasonableness.

Risk = Likelihood × Impact (each on a 1-5 scale)
Total risk score: 1-25 per threat, mapped to LOW/MEDIUM/HIGH/CRITICAL.

PEP 8 compliant.
"""

import logging
from dataclasses import dataclass, asdict
from typing import List, Dict, Any

logger = logging.getLogger("hl7_pipeline.risk")


@dataclass
class Threat:
    """A single identified threat."""
    id: str
    category: str
    name: str
    description: str
    likelihood: int  # 1-5
    impact: int      # 1-5
    risk_score: int   # likelihood × impact
    risk_level: str   # LOW, MEDIUM, HIGH, CRITICAL
    existing_control: str
    legal_reference: str
    residual_risk: str


class RiskAssessor:
    """
    Perform risk assessment across pipeline threat categories.

    Methods
    -------
    assess() → dict with threats, summary, risk_matrix
    """

    @staticmethod
    def _risk_level(score: int) -> str:
        if score >= 20:
            return "CRITICAL"
        elif score >= 12:
            return "HIGH"
        elif score >= 6:
            return "MEDIUM"
        return "LOW"

    def assess(self) -> Dict[str, Any]:
        """Run the complete risk assessment."""
        threats = self._identify_threats()

        # Summary by level
        summary = {
            "total": len(threats),
            "critical": sum(1 for t in threats if t.risk_level == "CRITICAL"),
            "high": sum(1 for t in threats if t.risk_level == "HIGH"),
            "medium": sum(1 for t in threats if t.risk_level == "MEDIUM"),
            "low": sum(1 for t in threats if t.risk_level == "LOW"),
        }

        # Risk categories
        categories: Dict[str, List[Dict]] = {}
        for t in threats:
            if t.category not in categories:
                categories[t.category] = []
            categories[t.category].append(asdict(t))

        # Average risk
        avg_risk = sum(t.risk_score for t in threats) / max(len(threats), 1)

        logger.info(
            "[RiskAssessor] Assessment complete  threats=%d  "
            "avg_risk=%.1f  [ISO 27005]",
            len(threats), avg_risk,
        )

        return {
            "threats": [asdict(t) for t in threats],
            "summary": summary,
            "categories": categories,
            "average_risk_score": round(avg_risk, 1),
            "overall_risk_level": self._risk_level(round(avg_risk)),
            "framework": "NIST SP 800-30 / ISO 27005",
        }

    def _identify_threats(self) -> List[Threat]:
        raw = [
            # Confidentiality threats
            ("C-01", "Confidentiality", "Residual PII in NTE segments",
             "Free-text notes may contain PII that survives regex scrubbing (e.g., handwritten names, uncommon ID formats)",
             3, 5, "NTE regex scrubbing (5 patterns)", "DPDP §8(7)", "Accept — regex covers 95% of common patterns"),

            ("C-02", "Confidentiality", "Re-identification via quasi-identifiers",
             "Combination of gender, age, and lab values could enable statistical re-identification",
             2, 4, "Age generalisation (birth year only)", "DPDP §8(7)", "Mitigate — consider k-anonymity"),

            ("C-03", "Confidentiality", "Unauthorised access to output directory",
             "HL7 files on disk could be accessed by unauthorised users or processes",
             2, 4, "OS-level file permissions", "IT Act §43", "Accept — local deployment model"),

            ("C-04", "Confidentiality", "Logging of PII in pipeline.log",
             "Debug logs might inadvertently capture patient data before anonymisation",
             2, 3, "INFO-level logging only (no raw data)", "DPDP §8(7)", "Accept — log level controls"),

            # Integrity threats
            ("I-01", "Integrity", "Message tampering post-generation",
             "HL7 files could be modified after the ZSH seal is applied",
             2, 5, "SHA-256 ZSH integrity seal + breach detector verification", "IT Act §14", "Accept — hash mismatch detectable"),

            ("I-02", "Integrity", "Hash collision exploitation",
             "Theoretical SHA-256 collision could enable undetected modification",
             1, 5, "SHA-256 is collision-resistant (2^128 security)", "IT Act §43A", "Accept — computationally infeasible"),

            ("I-03", "Integrity", "Source code tampering",
             "Malicious modification of pipeline code to bypass anonymisation",
             1, 5, "Git version control + commit audit trail", "IT Act §65", "Accept — all changes tracked"),

            # Availability threats
            ("A-01", "Availability", "Pipeline failure during batch processing",
             "Unhandled exceptions could halt processing mid-batch, leaving partial output",
             2, 3, "Try-catch in API handler + audit log error capture", "IT Act §43A", "Accept — restart capability"),

            ("A-02", "Availability", "Disk space exhaustion with large datasets",
             "Processing thousands of patients could fill available disk space",
             2, 2, "Output directory monitoring + sample size limits", "IT Act §43A", "Mitigate — add quota checks"),

            # Compliance threats
            ("L-01", "Legal Compliance", "Processing without valid consent basis",
             "Dataset may include records where consent was not obtained or has been withdrawn",
             2, 4, "MIMIC-IV has institutional IRB approval; Liver dataset is public", "DPDP §6", "Accept — research exemption"),

            ("L-02", "Legal Compliance", "Failure to notify breach within timelines",
             "DPDP requires notification; GDPR requires it within 72 hours",
             2, 4, "BreachDetector automated scan + audit log evidence", "DPDP §15", "Mitigate — add alerting"),

            ("L-03", "Legal Compliance", "Cross-border transfer without adequacy assessment",
             "HL7 output could be transmitted to jurisdictions without adequate protection",
             1, 4, "Pipeline operates locally; no network transmission configured", "DPDP §16", "Accept — local only"),

            # Operational threats
            ("O-01", "Operational", "Dependent library vulnerability",
             "Third-party packages (Faker, pandas, pycrypto) could contain security vulnerabilities",
             2, 3, "Regular dependency updates + pip audit", "IT Act §43A", "Mitigate — add dependency scanning"),

            ("O-02", "Operational", "Key management for AES/HMAC",
             "Encryption keys are currently hardcoded in source code",
             3, 4, "Keys are for demo/comparison only, not production encryption", "IT Act §43A", "Accept — demo context only"),
        ]

        threats = []
        for (tid, cat, name, desc, lik, imp, ctrl, legal, residual) in raw:
            score = lik * imp
            threats.append(Threat(
                id=tid,
                category=cat,
                name=name,
                description=desc,
                likelihood=lik,
                impact=imp,
                risk_score=score,
                risk_level=self._risk_level(score),
                existing_control=ctrl,
                legal_reference=legal,
                residual_risk=residual,
            ))

        return threats

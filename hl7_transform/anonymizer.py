"""
Phase 2 — Privacy Layer (DPDP Act 2023, §8(7))
================================================
Implements the ``Anonymizer`` class that replaces Personally Identifiable
Information (PII) in HL7 PID segments and scrubs NTE free-text notes.

Compliance reference
--------------------
- DPDP Act 2023 §8(7): Data fiduciaries must ensure reasonable
  de-identification where the actual identity is not required for
  the processing purpose.
- DPDP Act 2023 §8(4): Purpose limitation — retain only data
  fields required for clinical lab reporting.

Design decisions
----------------
- Deterministic anonymization: the same ``subject_id`` always maps
  to the same fake identity, ensuring referential integrity across
  multiple lab events for the same patient without storing a mapping
  table (the seed IS the mapping).
- Locale ``en_IN``: generates Indian-sounding names / addresses
  appropriate for the Indian legal context.
- The ``scrub_notes`` method uses compiled regex patterns for speed
  and covers the most common PII leak vectors in clinical free text.

PEP 8 compliant. Logging enabled for compliance audit trail.
"""

import logging
import re

from faker import Faker

logger = logging.getLogger("hl7_pipeline.anonymizer")

# ---------------------------------------------------------------------------
# Compiled PII regex patterns (used by scrub_notes)
# ---------------------------------------------------------------------------

_PII_PATTERNS = [
    # US/International SSN  e.g. 123-45-6789
    (re.compile(r"\b\d{3}-\d{2}-\d{4}\b"), "[REDACTED-SSN]"),
    # Indian Aadhaar  e.g. 1234 5678 9012  or  1234-5678-9012
    (re.compile(r"\b\d{4}[\s\-]\d{4}[\s\-]\d{4}\b"), "[REDACTED-AADHAAR]"),
    # Indian PAN  e.g. ABCDE1234F
    (re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"), "[REDACTED-PAN]"),
    # Email address
    (re.compile(
        r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b"
    ), "[REDACTED-EMAIL]"),
    # International / Indian phone numbers
    (re.compile(
        r"(\+?91[\s\-]?)?[6-9]\d{9}"
        r"|(\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4})"
    ), "[REDACTED-PHONE]"),
    # MRN / patient ID patterns like MRN: 123456 or MR# 123456
    (re.compile(r"\bMR[N#:. ]+\d{4,}\b", re.IGNORECASE), "[REDACTED-MRN]"),
    # Any standalone 10–12 digit number (likely an ID)
    (re.compile(r"\b\d{10,12}\b"), "[REDACTED-ID]"),
]


class Anonymizer:
    """
    Deterministic PII anonymizer for MIMIC-IV → HL7 pipeline.

    Each unique ``subject_id`` is used as a numeric seed for the Faker
    instance, so the same patient always receives the same fake identity
    — consistent across all lab events — without persisting a lookup
    table.

    Parameters
    ----------
    locale : str
        Faker locale for generated names/addresses.  Default ``"en_IN"``.

    Usage
    -----
    >>> anon = Anonymizer()
    >>> last, first = anon.anonymize_name(10000032)
    >>> street, city, state, zipcode = anon.anonymize_address(10000032)
    >>> clean_note = anon.scrub_notes("Patient 1234 5678 9012 came in …")
    """

    def __init__(self, locale: str = "en_IN") -> None:
        self.locale = locale
        # Cache Faker instances keyed by subject_id to avoid re-seeding
        self._cache: dict = {}
        logger.info(
            "[Anonymizer] Initialized with locale=%s (DPDP Act §8(7))",
            locale,
        )

    def _get_faker(self, subject_id: int) -> Faker:
        """Return a deterministically seeded Faker for *subject_id*."""
        if subject_id not in self._cache:
            fk = Faker(self.locale)
            Faker.seed(subject_id)
            fk.seed_instance(subject_id)
            self._cache[subject_id] = fk
        return self._cache[subject_id]

    def anonymize_name(self, subject_id: int) -> tuple:
        """
        Generate a deterministic fake name for a patient.

        Parameters
        ----------
        subject_id : int

        Returns
        -------
        tuple[str, str]
            ``(last_name, first_name)``
        """
        fk = self._get_faker(subject_id)
        last = fk.last_name()
        first = fk.first_name()
        logger.info(
            "[Anonymizer] PID-5 anonymized for subject_id=%s  "
            "[DPDP Act §8(7)]",
            subject_id,
        )
        return last, first

    def anonymize_address(self, subject_id: int) -> tuple:
        """
        Generate a deterministic fake address for a patient.

        Parameters
        ----------
        subject_id : int

        Returns
        -------
        tuple[str, str, str, str]
            ``(street, city, state, zipcode)``
        """
        fk = self._get_faker(subject_id)
        street = fk.street_address()
        city = fk.city()
        state = fk.state()
        zipcode = fk.postcode()
        logger.info(
            "[Anonymizer] PID-11 anonymized for subject_id=%s  "
            "[DPDP Act §8(7)]",
            subject_id,
        )
        return street, city, state, zipcode

    def scrub_notes(self, text: str) -> str:
        """
        Regex-scrub a free-text NTE note for PII leakage.

        Replaces all matched patterns with labelled ``[REDACTED-*]``
        tokens so that the data remains useful (structure preserved) but
        identifying information is removed.

        Parameters
        ----------
        text : str
            Raw note text (e.g. from ``labevents.comments``).

        Returns
        -------
        str
            Scrubbed text.
        """
        if not text or not text.strip():
            return text

        original = text
        n_replacements = 0
        for pattern, replacement in _PII_PATTERNS:
            scrubbed, count = pattern.subn(replacement, text)
            n_replacements += count
            text = scrubbed

        if n_replacements > 0:
            logger.warning(
                "[Anonymizer] NTE scrubbed: %d pattern(s) replaced  "
                "[DPDP Act §8(4) / §8(7)]  original_len=%d  "
                "scrubbed_len=%d",
                n_replacements, len(original), len(text),
            )
        return text

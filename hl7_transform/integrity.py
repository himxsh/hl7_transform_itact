"""
Phase 3 — Security Layer (IT Act 2000, §43A / §72A)
=====================================================
Implements the ``IntegrityManager`` class that computes a SHA-256 hash
of every HL7 message and appends a tamper-evident ``ZSH`` Z-segment.

Compliance reference
--------------------
- IT Act 2000 §43A: Organisations handling sensitive personal data must
  implement and maintain reasonable security practices and procedures.
  SHA-256 hashing provides tamper-evidence at the message level.
- IT Act 2000 §72A: Wrongful disclosure of personal information is a
  criminal offence — the ZSH seal ensures any post-generation
  modification is detectable.

ZSH segment format
------------------
    ZSH|1|SHA256|<hex_hash>|SIGNED|<ISO-8601 timestamp>

Where
- Field 1 (ZSH.1) : Segment set ID — always "1"
- Field 2 (ZSH.2) : Hash algorithm name — "SHA256"
- Field 3 (ZSH.3) : Hex-encoded SHA-256 digest of the message body
                     (all content BEFORE the ZSH line)
- Field 4 (ZSH.4) : Status — always "SIGNED"
- Field 5 (ZSH.5) : ISO 8601 UTC timestamp of signing

PEP 8 compliant. Logging enabled for compliance audit trail.
"""

import hashlib
import logging
from datetime import datetime, timezone

logger = logging.getLogger("hl7_pipeline.integrity")


class IntegrityManager:
    """
    Tamper-evident signing and verification for HL7 messages.

    Methods
    -------
    sign_message(hl7_string)   → signed HL7 string (ZSH appended)
    verify_message(hl7_string) → True if hash matches, False otherwise

    Both methods are stateless — no instance state is modified.
    """

    ALGORITHM = "sha256"
    SEGMENT_ID = "ZSH"

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def sign_message(self, hl7_string: str) -> str:
        """
        Compute SHA-256 hash of *hl7_string* and append a ``ZSH`` segment.

        Parameters
        ----------
        hl7_string : str
            Serialised HL7 message in ER7 format (pipe-delimited).
            Must NOT already contain a ZSH segment.

        Returns
        -------
        str
            The original message with a ZSH segment appended as the
            final line.
        """
        body = hl7_string.strip()
        digest = self._hash(body)
        timestamp = self._timestamp()
        zsh = self._build_zsh(digest, timestamp)

        signed = body + "\n" + zsh + "\n"

        logger.info(
            "[IntegrityManager] Message signed  "
            "algo=%s  hash=%s…%s  ts=%s  "
            "[IT Act §43A]",
            self.ALGORITHM.upper(),
            digest[:8], digest[-8:],
            timestamp,
        )
        return signed

    def verify_message(self, hl7_string: str) -> bool:
        """
        Verify the SHA-256 hash stored in the ``ZSH`` segment.

        Parameters
        ----------
        hl7_string : str
            Signed HL7 message that contains a ``ZSH`` segment as the
            last line.

        Returns
        -------
        bool
            ``True`` if the stored hash matches a freshly computed hash
            of the message body (everything before ZSH).  ``False``
            if the hash does not match or no ZSH segment is found.
        """
        body, stored_hash = self._split_message(hl7_string)

        if stored_hash is None:
            logger.warning(
                "[IntegrityManager] FAIL — no ZSH segment found  "
                "[IT Act §72A alert]"
            )
            return False

        recomputed = self._hash(body.strip())

        if recomputed == stored_hash:
            logger.info(
                "[IntegrityManager] PASS — hash verified  "
                "hash=%s…%s  [IT Act §43A]",
                recomputed[:8], recomputed[-8:],
            )
            return True

        logger.error(
            "[IntegrityManager] FAIL — hash MISMATCH  "
            "stored=%s…%s  recomputed=%s…%s  "
            "[IT Act §72A TAMPER ALERT]",
            stored_hash[:8], stored_hash[-8:],
            recomputed[:8], recomputed[-8:],
        )
        return False

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _hash(text: str) -> str:
        """Return the hex-encoded SHA-256 digest of *text*."""
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    @staticmethod
    def _timestamp() -> str:
        """Return the current UTC time as an ISO 8601 string."""
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    @classmethod
    def _build_zsh(cls, digest: str, timestamp: str) -> str:
        """Construct the raw ZSH segment line."""
        return "|".join([cls.SEGMENT_ID, "1", "SHA256", digest, "SIGNED", timestamp])

    @classmethod
    def _split_message(cls, hl7_string: str):
        """
        Separate the message body from its ZSH segment.

        Returns
        -------
        tuple[str, str | None]
            ``(body, stored_hash)`` — *stored_hash* is ``None`` if no
            ZSH segment is present.
        """
        lines = hl7_string.strip().splitlines()

        # Find the ZSH line (could be anywhere but expected last)
        zsh_line = None
        body_lines = []
        for line in lines:
            if line.startswith(cls.SEGMENT_ID + "|"):
                zsh_line = line
            else:
                body_lines.append(line)

        if zsh_line is None:
            return hl7_string, None

        # Parse ZSH fields: ZSH|1|SHA256|<hash>|SIGNED|<ts>
        parts = zsh_line.split("|")
        stored_hash = parts[3] if len(parts) > 3 else None

        body = "\n".join(body_lines)
        return body, stored_hash

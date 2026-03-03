"""
Secure HL7 Orchestration Pipeline — AI Agent Registry
======================================================

This package defines the modular AI agent components that collaborate to
execute the Secure HL7 Orchestration Pipeline.  Each agent encapsulates a
single responsibility aligned with one pipeline phase and exposes a
uniform ``run()`` interface so the orchestrator can chain them.

Agent Inventory
---------------
1. **PreprocessingAgent**  — Phase 1
   Loads compressed MIMIC-IV CSVs, merges on ``subject_id`` / ``itemid``,
   selects a configurable patient subset, and emits a clean DataFrame.

2. **AnonymizerAgent**     — Phase 2 (DPDP Act 2023)
   Wraps the ``Anonymizer`` class.  Replaces PID-5 (Name) and PID-11
   (Address) with faker-generated data; regex-scrubs NTE segments for
   leaked PII (SSN, phone, email, Aadhaar).

3. **IntegrityAgent**      — Phase 3 (IT Act 2000)
   Wraps the ``IntegrityManager`` class.  Computes SHA-256 hashes of
   serialised HL7 messages and appends tamper-evident ZSH segments.

4. **TransformAgent**      — Phase 4 (Orchestration core)
   Drives the end-to-end loop: reads merged data → builds HL7 messages
   via ``HL7Transform`` → invokes AnonymizerAgent → invokes
   IntegrityAgent → writes ``.hl7`` files to the output directory.

5. **ValidationAgent**     — Phase 4 (Post-hoc verification)
   Reads generated ``.hl7`` files, strips ZSH, recomputes hashes, and
   reports PASS / FAIL per file.

Configuration
-------------
All agents read from a shared ``PipelineConfig`` dataclass that
centralises paths, feature flags, and compliance settings.

Usage
-----
>>> from agents import PipelineConfig, Orchestrator
>>> config = PipelineConfig(data_dir="data/", output_dir="output/")
>>> orchestrator = Orchestrator(config)
>>> orchestrator.run()          # executes Phases 1-4 in sequence
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

__all__ = [
    "PipelineConfig",
    "AgentBase",
    "PreprocessingAgent",
    "AnonymizerAgent",
    "IntegrityAgent",
    "TransformAgent",
    "ValidationAgent",
    "Orchestrator",
]

logger = logging.getLogger("hl7_pipeline.agents")


# ---------------------------------------------------------------------------
# Shared configuration
# ---------------------------------------------------------------------------


@dataclass
class PipelineConfig:
    """Centralised configuration for every agent in the pipeline."""

    # Paths
    data_dir: str = "data/"
    output_dir: str = "output/"
    mapping_file: str = "mappings/mimic_to_hl7.json"
    log_file: str = "pipeline.log"

    # MIMIC-IV source files (relative to data_dir)
    patients_file: str = "patients.csv.gz"
    labevents_file: str = "labevents.csv.gz"
    d_labitems_file: str = "d_labitems.csv.gz"

    # Preprocessing
    patient_sample_size: int = 50

    # Privacy — DPDP Act
    anonymize: bool = True
    faker_locale: str = "en_IN"
    scrub_nte: bool = True

    # Security — IT Act 2000
    sign_messages: bool = True
    hash_algorithm: str = "sha256"

    # Logging
    log_level: str = "INFO"

    def resolve_data_path(self, filename: str) -> Path:
        return Path(self.data_dir) / filename

    def resolve_output_path(self) -> Path:
        p = Path(self.output_dir)
        p.mkdir(parents=True, exist_ok=True)
        return p


# ---------------------------------------------------------------------------
# Abstract base agent
# ---------------------------------------------------------------------------


class AgentBase:
    """
    Base class for all pipeline agents.

    Every concrete agent must implement ``run(**kwargs)`` and should use
    ``self.logger`` for compliance-grade audit logging.
    """

    name: str = "BaseAgent"

    def __init__(self, config: PipelineConfig) -> None:
        self.config = config
        self.logger = logging.getLogger(f"hl7_pipeline.agents.{self.name}")

    def run(self, **kwargs):
        raise NotImplementedError(f"{self.name}.run() is not implemented")

    def __repr__(self) -> str:
        return f"<{self.name} config={self.config!r}>"


# ---------------------------------------------------------------------------
# Concrete agents (stubs — implementations in their own modules)
# ---------------------------------------------------------------------------


class PreprocessingAgent(AgentBase):
    """
    Phase 1 — Data Preprocessing Engine.

    Loads MIMIC-IV compressed CSVs, merges datasets, selects a patient
    subset, and returns a pandas DataFrame ready for HL7 transformation.
    """

    name = "PreprocessingAgent"

    def run(self, **kwargs):
        """
        Returns
        -------
        pandas.DataFrame
            Merged and filtered MIMIC-IV data for the configured number
            of patients.
        """
        self.logger.info(
            "Starting MIMIC-IV preprocessing (sample=%d patients)",
            self.config.patient_sample_size,
        )
        # Concrete implementation will be in preprocess_mimic.py
        # and invoked here.
        raise NotImplementedError("Implement in Phase 1")


class AnonymizerAgent(AgentBase):
    """
    Phase 2 — Privacy Layer (DPDP Act 2023 compliance).

    Wraps :class:`hl7_transform.anonymizer.Anonymizer` to replace PII in
    PID-5, PID-11 and scrub NTE segments.
    """

    name = "AnonymizerAgent"

    def run(self, *, message=None, subject_id=None, **kwargs):
        """
        Parameters
        ----------
        message : hl7_transform.message.HL7Message
            The HL7 message to anonymize **in-place**.
        subject_id : str | int
            Patient identifier used as the faker seed for deterministic
            anonymization.

        Returns
        -------
        hl7_transform.message.HL7Message
            The same message object, now with PII replaced.
        """
        self.logger.info(
            "Anonymizing message for subject_id=%s", subject_id
        )
        # Concrete implementation will use hl7_transform.anonymizer.Anonymizer
        raise NotImplementedError("Implement in Phase 2")


class IntegrityAgent(AgentBase):
    """
    Phase 3 — Security Layer (IT Act 2000, §43A / §72A compliance).

    Wraps :class:`hl7_transform.integrity.IntegrityManager` to append a
    SHA-256 hash in a custom ZSH segment.
    """

    name = "IntegrityAgent"

    def run(self, *, hl7_string: str = "", **kwargs) -> str:
        """
        Parameters
        ----------
        hl7_string : str
            The serialised HL7 message (ER7 format).

        Returns
        -------
        str
            The message with the ZSH integrity segment appended.
        """
        self.logger.info("Signing HL7 message (algo=%s)", self.config.hash_algorithm)
        # Concrete implementation will use hl7_transform.integrity.IntegrityManager
        raise NotImplementedError("Implement in Phase 3")


class ValidationAgent(AgentBase):
    """
    Phase 4b — Post-hoc Integrity Verification.

    Reads ``.hl7`` files from the output directory and verifies each
    ZSH hash.
    """

    name = "ValidationAgent"

    def run(self, *, file_paths: Optional[List[str]] = None, **kwargs) -> dict:
        """
        Parameters
        ----------
        file_paths : list[str], optional
            Specific files to validate.  If *None*, validates all files
            in ``config.output_dir``.

        Returns
        -------
        dict
            ``{filepath: bool}`` — *True* if hash verification passed.
        """
        self.logger.info("Starting integrity validation")
        # Concrete implementation will use hl7_transform.integrity.IntegrityManager
        raise NotImplementedError("Implement in Phase 4")


class TransformAgent(AgentBase):
    """
    Phase 4a — Orchestration Core.

    Pulls merged data through the modified ``HL7Transform`` pipeline,
    invoking the AnonymizerAgent and IntegrityAgent for each message.
    """

    name = "TransformAgent"

    def run(self, *, dataframe=None, **kwargs) -> List[str]:
        """
        Parameters
        ----------
        dataframe : pandas.DataFrame
            Preprocessed MIMIC-IV data (output of PreprocessingAgent).

        Returns
        -------
        list[str]
            Paths to the generated ``.hl7`` output files.
        """
        self.logger.info(
            "Starting HL7 transformation pipeline (anonymize=%s, sign=%s)",
            self.config.anonymize,
            self.config.sign_messages,
        )
        # Concrete implementation will be in main.py
        raise NotImplementedError("Implement in Phase 4")


# ---------------------------------------------------------------------------
# Orchestrator — chains all agents
# ---------------------------------------------------------------------------


class Orchestrator:
    """
    Top-level controller that executes the full pipeline.

    Instantiates every agent with a shared :class:`PipelineConfig` and
    runs them in the correct order, passing outputs between phases.
    """

    def __init__(self, config: Optional[PipelineConfig] = None) -> None:
        self.config = config or PipelineConfig()
        self.preprocessing = PreprocessingAgent(self.config)
        self.anonymizer = AnonymizerAgent(self.config)
        self.integrity = IntegrityAgent(self.config)
        self.transform = TransformAgent(self.config)
        self.validation = ValidationAgent(self.config)
        self.logger = logging.getLogger("hl7_pipeline.orchestrator")

    def setup_logging(self) -> None:
        """Configure pipeline-wide logging to file and console."""
        log_fmt = (
            "%(asctime)s | %(name)-35s | %(levelname)-7s | %(message)s"
        )
        logging.basicConfig(
            level=getattr(logging, self.config.log_level, logging.INFO),
            format=log_fmt,
            handlers=[
                logging.FileHandler(self.config.log_file),
                logging.StreamHandler(),
            ],
        )

    def run(self) -> None:
        """
        Execute the full Secure HL7 Orchestration Pipeline.

        Phases
        ------
        1. Preprocessing  → merged DataFrame
        2. Anonymization  → (applied inside Phase 4 per-message)
        3. Integrity      → (applied inside Phase 4 per-message)
        4. Transformation → .hl7 files in output/
        4b. Validation    → PASS/FAIL report
        """
        self.setup_logging()
        self.logger.info("=" * 60)
        self.logger.info("Secure HL7 Orchestration Pipeline — START")
        self.logger.info("=" * 60)

        # Phase 1
        self.logger.info("[Phase 1] Data Preprocessing")
        df = self.preprocessing.run()

        # Phase 4 (encompasses Phases 2 & 3 per-message)
        self.logger.info("[Phase 4] Transformation + Privacy + Integrity")
        output_files = self.transform.run(dataframe=df)

        # Phase 4b
        self.logger.info("[Phase 4b] Validation")
        results = self.validation.run(file_paths=output_files)
        passed = sum(1 for v in results.values() if v)
        total = len(results)
        self.logger.info(
            "Validation complete: %d / %d PASSED", passed, total
        )

        self.logger.info("=" * 60)
        self.logger.info("Secure HL7 Orchestration Pipeline — DONE")
        self.logger.info("=" * 60)

"""
Phase 8 — Data Lineage Tracker
================================
Tracks the provenance and transformation of every data field from
source (CSV) through anonymisation to final HL7 output.

Compliance reference
--------------------
- DPDP Act 2023 §8: Data fiduciaries must maintain records of
  processing activities and be able to demonstrate accountability.
- GDPR Art. 30: Records of Processing Activities (ROPA) must
  document the purpose, categories, and recipients of data.
- IT Act 2000 §67C: Preservation of records and data lineage.

The lineage graph tracks:
- Source field → Processing step → Output field
- Transformation type (copy, anonymise, hash, derive, drop)
- Legal justification for each transformation

PEP 8 compliant.
"""

import logging
from dataclasses import dataclass, asdict
from typing import List, Dict, Any

logger = logging.getLogger("hl7_pipeline.lineage")


@dataclass
class LineageNode:
    """A single data field in the lineage graph."""
    field: str
    stage: str  # source, preprocessing, anonymisation, hl7_mapping, integrity
    description: str


@dataclass
class LineageEdge:
    """A transformation between two fields."""
    source_field: str
    target_field: str
    transformation: str  # copy, anonymise, hash, derive, drop
    legal_reference: str
    description: str


class DataLineageTracker:
    """
    Generate the complete data lineage graph for the pipeline.

    This is a static/declarative lineage — it describes the design-time
    data flow rather than tracking runtime values.

    Methods
    -------
    get_lineage()          → full lineage graph
    get_field_lineage(f)   → lineage for a specific field
    """

    def __init__(self) -> None:
        self._nodes = self._build_nodes()
        self._edges = self._build_edges()
        logger.info("[DataLineageTracker] Initialized  nodes=%d  edges=%d",
                     len(self._nodes), len(self._edges))

    @staticmethod
    def _build_nodes() -> List[LineageNode]:
        return [
            # Source (CSV columns)
            LineageNode("subject_id", "source", "Patient identifier from MIMIC-IV"),
            LineageNode("gender", "source", "Biological sex of patient"),
            LineageNode("anchor_age", "source", "Age at anchor year"),
            LineageNode("anchor_year", "source", "Year when age was recorded"),
            LineageNode("dod", "source", "Date of death (if applicable)"),
            LineageNode("charttime", "source", "Timestamp of observation"),
            LineageNode("itemid", "source", "Lab test identifier"),
            LineageNode("label", "source", "Lab test name"),
            LineageNode("valuenum", "source", "Numeric result value"),
            LineageNode("valueuom", "source", "Unit of measurement"),
            LineageNode("ref_range_lower", "source", "Reference range lower bound"),
            LineageNode("ref_range_upper", "source", "Reference range upper bound"),
            LineageNode("flag", "source", "Abnormality flag"),
            LineageNode("comments", "source", "Free-text clinical notes"),

            # Preprocessing
            LineageNode("filtered_df", "preprocessing", "Filtered DataFrame (sample_size limit applied)"),
            LineageNode("patient_groups", "preprocessing", "Grouped by subject_id for per-patient processing"),

            # Anonymisation
            LineageNode("pseudonym_name", "anonymisation", "Faker-generated Indian name (en_IN)"),
            LineageNode("pseudonym_address", "anonymisation", "Faker-generated Indian address"),
            LineageNode("scrubbed_notes", "anonymisation", "NTE text with PII patterns replaced by [REDACTED-*]"),
            LineageNode("birth_year", "anonymisation", "Derived from anchor_year - anchor_age (age shifted)"),

            # HL7 Mapping
            LineageNode("MSH", "hl7_mapping", "Message Header — sender, receiver, timestamp, control ID"),
            LineageNode("PID", "hl7_mapping", "Patient Identification — pseudonym, DOB, gender, address"),
            LineageNode("OBR", "hl7_mapping", "Observation Request — order info, observation period"),
            LineageNode("OBX", "hl7_mapping", "Observation Result — lab test ID, value, unit, flag"),
            LineageNode("NTE", "hl7_mapping", "Notes — scrubbed clinical comments"),

            # Integrity
            LineageNode("sha256_hash", "integrity", "SHA-256 digest of full message body"),
            LineageNode("ZSH", "integrity", "Tamper-evident seal segment: ZSH|1|SHA256|<hash>|SIGNED|<ts>"),

            # Encryption comparison
            LineageNode("aes256_ct", "encryption", "AES-256-CBC ciphertext (key-encrypted)"),
            LineageNode("hmac_sha512", "encryption", "HMAC-SHA512 authentication tag"),
            LineageNode("sha3_256", "encryption", "SHA3-256 Keccak-family hash"),
        ]

    @staticmethod
    def _build_edges() -> List[LineageEdge]:
        return [
            # Source → Preprocessing
            LineageEdge("subject_id", "patient_groups", "group_by",
                        "DPDP §8(4)", "Group records by patient for per-patient HL7 messages"),
            LineageEdge("subject_id", "filtered_df", "filter",
                        "DPDP §8(4)", "Sample limitation applied — data minimisation"),

            # Source → Anonymisation
            LineageEdge("subject_id", "pseudonym_name", "anonymise",
                        "DPDP §8(7)", "Deterministic pseudonymisation via seeded Faker (en_IN locale)"),
            LineageEdge("subject_id", "pseudonym_address", "anonymise",
                        "DPDP §8(7)", "Fake address generated with same seed as name for consistency"),
            LineageEdge("comments", "scrubbed_notes", "anonymise",
                        "DPDP §8(7)", "Regex scrubbing: Aadhaar, PAN, email, phone, SSN, MRN patterns → [REDACTED-*]"),
            LineageEdge("anchor_age", "birth_year", "derive",
                        "DPDP §8(7)", "Birth year = anchor_year - anchor_age (indirect de-identification)"),
            LineageEdge("anchor_year", "birth_year", "derive",
                        "DPDP §8(7)", "Combined with anchor_age to derive approximate birth year"),

            # Anonymisation → HL7
            LineageEdge("pseudonym_name", "PID", "copy",
                        "DPDP §8(7)", "Pseudonym placed in PID-5 (Patient Name)"),
            LineageEdge("pseudonym_address", "PID", "copy",
                        "DPDP §8(7)", "Fake address placed in PID-11 (Address)"),
            LineageEdge("birth_year", "PID", "copy",
                        "DPDP §8(7)", "Derived year placed in PID-7 (Date of Birth)"),
            LineageEdge("gender", "PID", "copy",
                        "DPDP §8(3)", "Gender copied directly — required for clinical reporting"),
            LineageEdge("scrubbed_notes", "NTE", "copy",
                        "DPDP §8(7)", "Scrubbed notes placed in NTE-3 (Comment)"),

            # Source → HL7 (direct)
            LineageEdge("subject_id", "MSH", "derive",
                        "IT Act §14", "Used to generate unique Message Control ID (MD5-based)"),
            LineageEdge("subject_id", "PID", "copy",
                        "IT Act §14", "Subject ID retained as patient MRN in PID-3"),
            LineageEdge("itemid", "OBX", "copy",
                        "DPDP §8(3)", "Lab test ID mapped to OBX-3 (Observation Identifier)"),
            LineageEdge("label", "OBX", "copy",
                        "DPDP §8(3)", "Lab test name mapped to OBX-3 component 2"),
            LineageEdge("valuenum", "OBX", "copy",
                        "DPDP §8(3)", "Numeric result mapped to OBX-5 (Observation Value)"),
            LineageEdge("valueuom", "OBX", "copy",
                        "DPDP §8(3)", "Unit placed in OBX-6 (Units)"),
            LineageEdge("ref_range_lower", "OBX", "derive",
                        "DPDP §8(3)", "Combined with upper bound → OBX-7 (Reference Range)"),
            LineageEdge("ref_range_upper", "OBX", "derive",
                        "DPDP §8(3)", "Combined with lower bound → OBX-7 (Reference Range)"),
            LineageEdge("flag", "OBX", "copy",
                        "DPDP §8(3)", "Abnormality flag placed in OBX-8"),
            LineageEdge("charttime", "OBX", "copy",
                        "DPDP §8(3)", "Observation timestamp placed in OBX-14"),
            LineageEdge("charttime", "OBR", "derive",
                        "DPDP §8(3)", "Min/Max charttime → OBR observation period"),

            # HL7 → Integrity
            LineageEdge("MSH", "sha256_hash", "hash",
                        "IT Act §14", "All segments hashed together by SHA-256"),
            LineageEdge("PID", "sha256_hash", "hash",
                        "IT Act §14", "Included in hash input"),
            LineageEdge("OBX", "sha256_hash", "hash",
                        "IT Act §14", "Included in hash input"),
            LineageEdge("sha256_hash", "ZSH", "derive",
                        "IT Act §43A", "Hash + timestamp → ZSH tamper-evident segment"),

            # HL7 → Encryption comparison
            LineageEdge("MSH", "aes256_ct", "encrypt",
                        "IT Act §43A", "Full message encrypted with AES-256-CBC for at-rest comparison"),
            LineageEdge("MSH", "hmac_sha512", "mac",
                        "DPDP §8(7)", "HMAC-SHA512 computed with secret key for authentication"),
            LineageEdge("MSH", "sha3_256", "hash",
                        "IS/ISO 27001", "SHA3-256 computed for future-proof hash comparison"),

            # Dropped fields (data minimisation)
            LineageEdge("dod", "PID", "drop",
                        "DPDP §8(4)", "Date of death retained only as death indicator (Y/N) — detail dropped"),
        ]

    def get_lineage(self) -> Dict[str, Any]:
        """Return the full lineage graph."""
        stages = {}
        for node in self._nodes:
            if node.stage not in stages:
                stages[node.stage] = []
            stages[node.stage].append(asdict(node))

        transformations = {}
        for edge in self._edges:
            t = edge.transformation
            if t not in transformations:
                transformations[t] = []
            transformations[t].append(asdict(edge))

        return {
            "nodes": [asdict(n) for n in self._nodes],
            "edges": [asdict(e) for e in self._edges],
            "stages": stages,
            "transformation_summary": {
                t: len(edges) for t, edges in transformations.items()
            },
            "total_nodes": len(self._nodes),
            "total_edges": len(self._edges),
        }

    def get_field_lineage(self, field_name: str) -> Dict[str, Any]:
        """Trace lineage for a specific field (both upstream and downstream)."""
        upstream = [asdict(e) for e in self._edges if e.target_field == field_name]
        downstream = [asdict(e) for e in self._edges if e.source_field == field_name]
        node = next((asdict(n) for n in self._nodes if n.field == field_name), None)

        return {
            "field": field_name,
            "node": node,
            "upstream": upstream,
            "downstream": downstream,
        }

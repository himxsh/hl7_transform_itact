"""
Phase 4 — Orchestration Core
==============================
Reads preprocessed MIMIC-IV data and produces one HL7 v2.5.1 ORU^R01
message per patient, applying the Privacy Layer (DPDP Act §8(7)) and
the Security Layer (IT Act §43A / §72A) before writing each file.

Usage
-----
    python main.py                         # uses default paths
    python main.py --data-dir dataset/ --out output/ --sample 50

Output
------
    output/<subject_id>.hl7    one file per patient

PEP 8 compliant. Full audit logging to pipeline.log.
"""

import argparse
import hashlib
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

from hl7_transform.anonymizer import Anonymizer
from hl7_transform.integrity import IntegrityManager
from preprocess_mimic import preprocess

# ---------------------------------------------------------------------------
# Logging — file + console
# ---------------------------------------------------------------------------
LOG_FILE = "pipeline.log"
LOG_FMT = "%(asctime)s | %(name)-30s | %(levelname)-7s | %(message)s"


def setup_logging(log_level: str = "INFO") -> None:
    logging.basicConfig(
        level=getattr(logging, log_level.upper(), logging.INFO),
        format=LOG_FMT,
        handlers=[
            logging.FileHandler(LOG_FILE, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )


logger = logging.getLogger("hl7_pipeline.main")

# ---------------------------------------------------------------------------
# HL7 building helpers
# ---------------------------------------------------------------------------
_HL7_DATE_FMT = "%Y%m%d"
_HL7_DT_FMT = "%Y%m%d%H%M%S"


def _hl7_dt(dt) -> str:
    """Convert pandas Timestamp or datetime to HL7 datetime string."""
    if dt is None or (hasattr(dt, "isnull") and dt.isnull()):
        return ""
    try:
        return dt.strftime(_HL7_DT_FMT)
    except Exception:
        return ""


def _now_hl7() -> str:
    return datetime.now(timezone.utc).strftime(_HL7_DT_FMT)


def _msg_control_id(subject_id: int) -> str:
    """Deterministic message control ID based on subject_id + timestamp."""
    raw = f"{subject_id}-{_now_hl7()}"
    return hashlib.md5(raw.encode()).hexdigest()[:20].upper()


def _safe(val) -> str:
    """Return string representation, replacing NaN/None with empty string."""
    if val is None:
        return ""
    try:
        import math
        if math.isnan(float(val)):
            return ""
    except (TypeError, ValueError):
        pass
    return str(val).strip()


def _ref_range(lower, upper) -> str:
    lo, hi = _safe(lower), _safe(upper)
    if lo and hi:
        return f"{lo}-{hi}"
    return ""


def _value_type(valuenum) -> str:
    """OBX.2: NM if numeric value present, else ST."""
    try:
        import math
        if not math.isnan(float(valuenum)):
            return "NM"
    except (TypeError, ValueError):
        pass
    return "ST"


# ---------------------------------------------------------------------------
# HL7 message builder
# ---------------------------------------------------------------------------

def build_hl7_message(subject_id: int,
                      patient_rows,
                      anonymizer: Anonymizer) -> str:
    """
    Build a complete HL7 v2.5.1 ORU^R01 message for one patient.

    Parameters
    ----------
    subject_id : int
    patient_rows : pd.DataFrame
        All lab event rows for this patient (already merged with patient
        demographics).
    anonymizer : Anonymizer

    Returns
    -------
    str
        HL7 message in ER7 (pipe-delimited) format, WITHOUT ZSH segment.
        ZSH is added by IntegrityManager after this function returns.
    """
    # --- Demographics (same for every row in the group) ---
    first_row = patient_rows.iloc[0]
    gender = _safe(first_row.get("gender", ""))
    anchor_age = int(first_row.get("anchor_age", 0))
    anchor_year = int(first_row.get("anchor_year", 2000))
    birth_year = anchor_year - anchor_age
    dob = f"{birth_year}0101"
    dod_raw = _safe(first_row.get("dod", ""))
    dod_hl7 = dod_raw.replace("-", "")[:8] if dod_raw else ""
    death_indicator = "Y" if dod_hl7 else "N"

    # --- Anonymized identity (DPDP Act §8(7)) ---
    last_name, first_name = anonymizer.anonymize_name(subject_id)
    street, city, state, zipcode = anonymizer.anonymize_address(subject_id)

    # --- Observation timing ---
    charttimes = patient_rows["charttime"].dropna()
    start_dt = charttimes.min() if not charttimes.empty else None
    end_dt = charttimes.max() if not charttimes.empty else None
    start_hl7 = _hl7_dt(start_dt)
    end_hl7 = _hl7_dt(end_dt)

    msg_id = _msg_control_id(subject_id)
    now = _now_hl7()

    # --- First lab item for OBR.4 ---
    first_itemid = _safe(first_row.get("itemid", ""))
    first_label = _safe(first_row.get("label", ""))

    # =======================================================================
    # Segment construction
    # =======================================================================
    segments = []

    # MSH — Message Header
    # MSH|^~\&|SendApp|SendFac|RecApp|RecFac|DateTime||MsgType|CtrlID|ProcID|Version
    segments.append(
        f"MSH|^~\\&|MIMIC_PIPELINE|MIMIC||MIMICDEMO|{now}||"
        f"ORU^R01^ORU_R01|{msg_id}|P|2.5.1"
    )

    # PID — Patient Identification
    # PID|1||PatientID^^^AssignAuth^IDType||Last^First^^^||DOB|Sex|||Address
    pid_address = f"{street}^^{city}^{state}^{zipcode}"
    segments.append(
        f"PID|1||{subject_id}^^^MIMIC^MR||"
        f"{last_name}^{first_name}^^^||"
        f"{dob}|{gender}|||"
        f"{pid_address}|||||||||"
        f"{subject_id}||||||{dod_hl7}||{death_indicator}"
    )

    # OBR — Observation Request
    # OBR|1|PlacerID|FillerID|ServiceID|||ObsDateTime|||||||...|||ResultStatus
    segments.append(
        f"OBR|1|{subject_id}|{subject_id}|"
        f"{first_itemid}^{first_label}^MIMIC|||"
        f"{start_hl7}||||||||||||||||{end_hl7}||F"
    )

    # OBX + NTE — one OBX per lab event, with optional NTE for comments
    obx_set_id = 0
    nte_set_id = 0

    for _, row in patient_rows.iterrows():
        obx_set_id += 1
        itemid = _safe(row.get("itemid", ""))
        label = _safe(row.get("label", ""))
        valuenum = row.get("valuenum", None)
        value_str = _safe(valuenum) if _value_type(valuenum) == "NM" \
            else _safe(row.get("value", ""))
        vtype = _value_type(valuenum)
        uom = _safe(row.get("valueuom", ""))
        ref = _ref_range(row.get("ref_range_lower"), row.get("ref_range_upper"))
        flag = _safe(row.get("flag", ""))
        obs_dt = _hl7_dt(row.get("charttime"))

        # OBX|SetID|ValueType|ObsID^ObsText^CodingSys||Value|Units|RefRange|Flag|||Status|||ObsDateTime
        segments.append(
            f"OBX|{obx_set_id}|{vtype}|"
            f"{itemid}^{label}^MIMIC||"
            f"{value_str}|{uom}|{ref}|{flag}|||F|||{obs_dt}"
        )

        # NTE — scrub any free-text comments for PII (DPDP Act §8(4))
        comment = _safe(row.get("comments", ""))
        if comment:
            scrubbed = anonymizer.scrub_notes(comment)
            nte_set_id += 1
            segments.append(f"NTE|{nte_set_id}||{scrubbed}")

    message = "\n".join(segments)
    logger.info(
        "[main] Built HL7 message for subject_id=%s  "
        "segments=%d  obx_count=%d",
        subject_id, len(segments), obx_set_id,
    )
    return message


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def run_pipeline(
    data_dir: str = "dataset",
    out_dir: str = "output",
    sample_size: int = 50,
    log_level: str = "INFO",
) -> list:
    """
    Execute the full Secure HL7 Orchestration Pipeline.

    Parameters
    ----------
    data_dir : str
    out_dir : str
    sample_size : int
    log_level : str

    Returns
    -------
    list[str]
        Paths of all written .hl7 files.
    """
    setup_logging(log_level)
    logger.info("=" * 65)
    logger.info("Secure HL7 Orchestration Pipeline — START")
    logger.info("  data_dir=%s  out_dir=%s  sample=%d", data_dir, out_dir, sample_size)
    logger.info("=" * 65)

    # ------------------------------------------------------------------
    # Phase 1 — Preprocessing
    # ------------------------------------------------------------------
    logger.info("[Pipeline] Phase 1: Data Preprocessing")
    df = preprocess(data_dir=data_dir, sample_size=sample_size)

    # ------------------------------------------------------------------
    # Initialise privacy and security modules
    # ------------------------------------------------------------------
    anonymizer = Anonymizer(locale="en_IN")    # DPDP Act §8(7)
    integrity = IntegrityManager()             # IT Act §43A

    # ------------------------------------------------------------------
    # Phase 4 — Transform, Anonymize, Sign, Write
    # ------------------------------------------------------------------
    logger.info("[Pipeline] Phase 4: Transformation + Privacy + Integrity")

    out_path = Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    written_files = []
    patient_groups = list(df.groupby("subject_id"))

    for idx, (subject_id, group) in enumerate(patient_groups, start=1):
        logger.info(
            "[Pipeline] Processing patient %d/%d  subject_id=%s  rows=%d",
            idx, len(patient_groups), subject_id, len(group),
        )

        # Phase 2 — Privacy (anonymize_name / anonymize_address / scrub_notes
        #            are called inside build_hl7_message)
        hl7_msg = build_hl7_message(
            subject_id=int(subject_id),
            patient_rows=group,
            anonymizer=anonymizer,
        )

        # Phase 3 — Integrity (sign → appends ZSH segment)
        signed_msg = integrity.sign_message(hl7_msg)

        # Write output file
        out_file = out_path / f"{subject_id}.hl7"
        with open(out_file, "w", encoding="utf-8") as fh:
            fh.write(signed_msg)

        written_files.append(str(out_file))
        logger.info("[Pipeline] Written: %s", out_file)

    logger.info("=" * 65)
    logger.info(
        "[Pipeline] DONE — %d .hl7 files written to %s",
        len(written_files), out_dir,
    )
    logger.info("=" * 65)
    return written_files


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _build_parser():
    parser = argparse.ArgumentParser(
        description="Secure HL7 Orchestration Pipeline — main runner."
    )
    parser.add_argument(
        "--data-dir", default="dataset",
        help="Directory with MIMIC-IV .csv.gz files (default: dataset/)",
    )
    parser.add_argument(
        "--out", default="output",
        help="Output directory for .hl7 files (default: output/)",
    )
    parser.add_argument(
        "--sample", type=int, default=50,
        help="Number of patients to process (default: 50)",
    )
    parser.add_argument(
        "--log-level", default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging verbosity (default: INFO)",
    )
    return parser


if __name__ == "__main__":
    args = _build_parser().parse_args()
    run_pipeline(
        data_dir=args.data_dir,
        out_dir=args.out,
        sample_size=args.sample,
        log_level=args.log_level,
    )

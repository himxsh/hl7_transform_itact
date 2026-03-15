"""
MIMIC-IV Specialized HL7 Pipeline (IT Act & DPDP Act compliant)
==============================================================
"""

import hashlib
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

from hl7_transform.anonymizer import Anonymizer
from hl7_transform.integrity import IntegrityManager
from preprocess_mimic import preprocess

# ---------------------------------------------------------------------------
# Logging
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

logger = logging.getLogger("hl7_pipeline.mimic")

# ---------------------------------------------------------------------------
# HL7 building helpers
# ---------------------------------------------------------------------------
_HL7_DT_FMT = "%Y%m%d%H%M%S"

def _hl7_dt(dt) -> str:
    if dt is None or (hasattr(dt, "isnull") and dt.isnull()):
        return ""
    try:
        return dt.strftime(_HL7_DT_FMT)
    except Exception:
        return ""

def _now_hl7() -> str:
    return datetime.now(timezone.utc).strftime(_HL7_DT_FMT)

def _msg_control_id(subject_id: int) -> str:
    raw = f"{subject_id}-{_now_hl7()}"
    return hashlib.md5(raw.encode()).hexdigest()[:20].upper()

def _safe(val) -> str:
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
    try:
        import math
        if not math.isnan(float(valuenum)):
            return "NM"
    except (TypeError, ValueError):
        pass
    return "ST"

def build_hl7_message(subject_id: int, patient_rows, anonymizer: Anonymizer) -> str:
    first_row = patient_rows.iloc[0]
    gender = _safe(first_row.get("gender", ""))
    anchor_age = int(first_row.get("anchor_age", 0))
    anchor_year = int(first_row.get("anchor_year", 2000))
    birth_year = anchor_year - anchor_age
    dob = f"{birth_year}0101"
    dod_raw = _safe(first_row.get("dod", ""))
    dod_hl7 = dod_raw.replace("-", "")[:8] if dod_raw else ""
    death_indicator = "Y" if dod_hl7 else "N"

    last_name, first_name = anonymizer.anonymize_name(subject_id)
    street, city, state, zipcode = anonymizer.anonymize_address(subject_id)

    charttimes = patient_rows["charttime"].dropna()
    start_dt = charttimes.min() if not charttimes.empty else None
    end_dt = charttimes.max() if not charttimes.empty else None
    start_hl7 = _hl7_dt(start_dt)
    end_hl7 = _hl7_dt(end_dt)

    msg_id = _msg_control_id(subject_id)
    now = _now_hl7()

    first_itemid = _safe(first_row.get("itemid", ""))
    first_label = _safe(first_row.get("label", ""))

    segments = []
    segments.append(
        f"MSH|^~\\&|MIMIC_PIPELINE|MIMIC||MIMICDEMO|{now}||"
        f"ORU^R01^ORU_R01|{msg_id}|P|2.5.1"
    )

    pid_address = f"{street}^^{city}^{state}^{zipcode}"
    segments.append(
        f"PID|1||{subject_id}^^^MIMIC^MR||"
        f"{last_name}^{first_name}^^^||"
        f"{dob}|{gender}|||"
        f"{pid_address}|||||||||"
        f"{subject_id}||||||{dod_hl7}||{death_indicator}"
    )

    segments.append(
        f"OBR|1|{subject_id}|{subject_id}|"
        f"{first_itemid}^{first_label}^MIMIC|||"
        f"{start_hl7}||||||||||||||||{end_hl7}||F"
    )

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

        segments.append(
            f"OBX|{obx_set_id}|{vtype}|"
            f"{itemid}^{label}^MIMIC||"
            f"{value_str}|{uom}|{ref}|{flag}|||F|||{obs_dt}"
        )

        comment = _safe(row.get("comments", ""))
        if comment:
            scrubbed = anonymizer.scrub_notes(comment)
            nte_set_id += 1
            segments.append(f"NTE|{nte_set_id}||{scrubbed}")

    return "\n".join(segments)

def run_mimic_pipeline(data_dir: str = "dataset", out_dir: str = "output", sample_size: int = 50, log_level: str = "INFO"):
    setup_logging(log_level)
    logger.info("=" * 65)
    logger.info("MIMIC Pipeline — START")
    
    df = preprocess(data_dir=data_dir, sample_size=sample_size)
    anonymizer = Anonymizer(locale="en_IN")
    integrity = IntegrityManager()

    out_path = Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    patient_groups = list(df.groupby("subject_id"))
    for idx, (subject_id, group) in enumerate(patient_groups, start=1):
        hl7_msg = build_hl7_message(subject_id=int(subject_id), patient_rows=group, anonymizer=anonymizer)
        signed_msg = integrity.sign_message(hl7_msg)
        out_file = out_path / f"{subject_id}.hl7"
        with open(out_file, "w", encoding="utf-8") as fh:
            fh.write(signed_msg)
            
    logger.info(f"MIMIC Pipeline DONE — {len(patient_groups)} files written.")

"""
Phase 1 — Data Preprocessing Engine
=====================================
Merges the three MIMIC-IV v2.2 compressed CSV files into a single
DataFrame containing 50 patient records, ready for HL7 transformation.

Usage
-----
    python preprocess_mimic.py                    # prints summary
    python preprocess_mimic.py --out data/        # saves mimic_subset.csv.gz

PEP 8 compliant. Logging enabled for compliance audit trail.
"""

import argparse
import logging
import sys
from pathlib import Path

import pandas as pd

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-25s | %(levelname)-7s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("hl7_pipeline.preprocess")

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------
DEFAULT_DATA_DIR = Path("dataset")
PATIENTS_FILE = "patients.csv.gz"
LABEVENTS_FILE = "labevents.csv.gz"
D_LABITEMS_FILE = "d_labitems.csv.gz"
PATIENT_SAMPLE_SIZE = 50
CHUNK_SIZE = 100_000  # rows per labevents streaming chunk

# Columns we actually need — drop the rest early to save memory
PATIENTS_COLS = [
    "subject_id", "gender", "anchor_age", "anchor_year", "dod",
]
LABEVENTS_COLS = [
    "subject_id", "itemid", "charttime", "value", "valuenum",
    "valueuom", "ref_range_lower", "ref_range_upper", "flag", "comments",
]
D_LABITEMS_COLS = ["itemid", "label", "fluid", "category"]


# ---------------------------------------------------------------------------
# Core functions
# ---------------------------------------------------------------------------

def load_patients(data_dir: Path, sample_size: int = PATIENT_SAMPLE_SIZE):
    """
    Load patients.csv.gz and return a sampled patient DataFrame plus the
    set of sampled subject_ids.

    Parameters
    ----------
    data_dir : Path
        Directory that contains the MIMIC-IV .csv.gz files.
    sample_size : int
        Number of distinct patients to select.

    Returns
    -------
    tuple[pd.DataFrame, set]
        (patients_df, subject_id_set)
    """
    path = data_dir / PATIENTS_FILE
    logger.info("[Phase 1] Loading patients from %s", path)

    patients = pd.read_csv(path, usecols=PATIENTS_COLS)
    logger.info("  Total patients loaded: %d", len(patients))

    sample_ids = set(patients["subject_id"].unique()[:sample_size])
    patients = patients[patients["subject_id"].isin(sample_ids)].copy()
    logger.info("  Sampled %d patients (subject_ids selected)", len(patients))

    return patients, sample_ids


def load_d_labitems(data_dir: Path):
    """
    Load the lab item dictionary (d_labitems.csv.gz).

    Returns
    -------
    pd.DataFrame
    """
    path = data_dir / D_LABITEMS_FILE
    logger.info("[Phase 1] Loading d_labitems from %s", path)
    df = pd.read_csv(path, usecols=D_LABITEMS_COLS)
    logger.info("  d_labitems rows: %d", len(df))
    return df


def stream_labevents(data_dir: Path, subject_ids: set):
    """
    Stream labevents.csv.gz in chunks, retaining only rows whose
    subject_id is in *subject_ids*.  Avoids loading the full ~2.4 GB
    file into memory.

    Parameters
    ----------
    data_dir : Path
    subject_ids : set
        Set of subject_ids to keep.

    Returns
    -------
    pd.DataFrame
    """
    path = data_dir / LABEVENTS_FILE
    logger.info(
        "[Phase 1] Streaming labevents from %s (chunk_size=%d)",
        path, CHUNK_SIZE,
    )

    kept_chunks = []
    total_rows_read = 0

    for chunk in pd.read_csv(path, usecols=LABEVENTS_COLS, chunksize=CHUNK_SIZE):
        total_rows_read += len(chunk)
        matched = chunk[chunk["subject_id"].isin(subject_ids)]
        if not matched.empty:
            kept_chunks.append(matched)

    labevents = pd.concat(kept_chunks, ignore_index=True) if kept_chunks else pd.DataFrame()
    logger.info(
        "  Total labevents rows read: %d | kept for 50 patients: %d",
        total_rows_read, len(labevents),
    )
    return labevents


def merge_datasets(patients: pd.DataFrame,
                   labevents: pd.DataFrame,
                   d_labitems: pd.DataFrame) -> pd.DataFrame:
    """
    Merge the three DataFrames into a single flat table.

    Merge order
    -----------
    1. labevents  LEFT JOIN  d_labitems  ON itemid
    2. result     LEFT JOIN  patients    ON subject_id

    Returns
    -------
    pd.DataFrame
    """
    logger.info("[Phase 1] Merging labevents ← d_labitems on itemid …")
    merged = labevents.merge(d_labitems, on="itemid", how="left")
    logger.info("  After d_labitems merge: %d rows, %d columns", *merged.shape)

    logger.info("[Phase 1] Merging ← patients on subject_id …")
    merged = merged.merge(patients, on="subject_id", how="left")
    logger.info("  After patients merge: %d rows, %d columns", *merged.shape)

    # -----------------------------------------------------------------------
    # Data cleaning
    # -----------------------------------------------------------------------
    # Parse charttime to datetime
    merged["charttime"] = pd.to_datetime(merged["charttime"], errors="coerce")

    # Fill missing text cols with empty string
    for col in ("value", "valueuom", "flag", "comments", "label",
                "fluid", "category", "dod"):
        if col in merged.columns:
            merged[col] = merged[col].fillna("")

    # Derive birth_year for PID.7 (approximate — MIMIC uses anchor_year)
    merged["birth_year"] = merged["anchor_year"] - merged["anchor_age"]

    # Null-counts for audit log
    null_summary = merged.isnull().sum()
    cols_with_nulls = null_summary[null_summary > 0]
    if not cols_with_nulls.empty:
        logger.info("  Null counts after merge:\n%s", cols_with_nulls.to_string())
    else:
        logger.info("  No null values remaining in key columns.")

    return merged


def preprocess(data_dir: str = str(DEFAULT_DATA_DIR),
               sample_size: int = PATIENT_SAMPLE_SIZE,
               out_dir: str = None) -> pd.DataFrame:
    """
    Main entry point.  Loads, streams, merges, and optionally saves the
    MIMIC-IV subset.

    Parameters
    ----------
    data_dir : str
    sample_size : int
    out_dir : str, optional
        If provided, saves ``mimic_subset.csv.gz`` here.

    Returns
    -------
    pd.DataFrame
        Merged and cleaned subset ready for HL7 transformation.
    """
    data_path = Path(data_dir)

    patients, sample_ids = load_patients(data_path, sample_size)
    d_labitems = load_d_labitems(data_path)
    labevents = stream_labevents(data_path, sample_ids)
    merged = merge_datasets(patients, labevents, d_labitems)

    # -----------------------------------------------------------------------
    # Summary statistics
    # -----------------------------------------------------------------------
    n_patients = merged["subject_id"].nunique()
    n_events = len(merged)
    logger.info(
        "[Phase 1] DONE — %d patients | %d lab events | %d columns",
        n_patients, n_events, merged.shape[1],
    )

    if out_dir:
        out_path = Path(out_dir) / "mimic_subset.csv.gz"
        Path(out_dir).mkdir(parents=True, exist_ok=True)
        merged.to_csv(out_path, index=False, compression="gzip")
        logger.info("[Phase 1] Saved subset to %s", out_path)

    return merged


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _build_parser():
    parser = argparse.ArgumentParser(
        description="Phase 1: Preprocess MIMIC-IV data for HL7 transformation."
    )
    parser.add_argument(
        "--data-dir", default=str(DEFAULT_DATA_DIR),
        help="Directory containing MIMIC-IV .csv.gz files (default: dataset/)",
    )
    parser.add_argument(
        "--sample-size", type=int, default=PATIENT_SAMPLE_SIZE,
        help="Number of patients to sample (default: 50)",
    )
    parser.add_argument(
        "--out", default=None,
        help="Output directory to save mimic_subset.csv.gz",
    )
    return parser


if __name__ == "__main__":
    args = _build_parser().parse_args()
    df = preprocess(
        data_dir=args.data_dir,
        sample_size=args.sample_size,
        out_dir=args.out,
    )
    print(df.head())

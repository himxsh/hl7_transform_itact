import argparse
import logging
import sys
import io
from pathlib import Path
import pandas as pd
from datetime import datetime, timezone

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
CHUNK_SIZE = 100_000

PATIENTS_COLS = ["subject_id", "gender", "anchor_age", "anchor_year", "dod"]
LABEVENTS_COLS = ["subject_id", "itemid", "charttime", "value", "valuenum", "valueuom", "ref_range_lower", "ref_range_upper", "flag", "comments"]
D_LABITEMS_COLS = ["itemid", "label", "fluid", "category"]

def merge_datasets(patients: pd.DataFrame,
                   labevents: pd.DataFrame,
                   d_labitems: pd.DataFrame) -> pd.DataFrame:
    """Merge DataFrames and clean for HL7 transformation."""
    logger.info("[Phase 1] Merging labevents ← d_labitems on itemid …")
    merged = labevents.merge(d_labitems, on="itemid", how="left")
    
    logger.info("[Phase 1] Merging ← patients on subject_id …")
    merged = merged.merge(patients, on="subject_id", how="left")

    # Data cleaning
    merged["charttime"] = pd.to_datetime(merged["charttime"], errors="coerce")
    for col in ("value", "valueuom", "flag", "comments", "label", "fluid", "category", "dod"):
        if col in merged.columns:
            merged[col] = merged[col].fillna("")

    merged["birth_year"] = merged["anchor_year"] - merged["anchor_age"]
    return merged

def preprocess_from_buffers(patients_buf, labevents_buf, d_labitems_buf, sample_size=PATIENT_SAMPLE_SIZE, random_seed=42):
    """Stateless MIMIC ingestion from in-memory buffers."""
    logger.info("[Stateless] Loading MIMIC-IV archive components from buffers...")
    
    # Load DataFrames
    patients = pd.read_csv(patients_buf, usecols=PATIENTS_COLS)
    d_labitems = pd.read_csv(d_labitems_buf, usecols=D_LABITEMS_COLS)
    labevents = pd.read_csv(labevents_buf, usecols=LABEVENTS_COLS)
    
    # Sampling
    all_ids = patients["subject_id"].unique()
    n = min(sample_size, len(all_ids))
    sample_ids = set(pd.Series(all_ids).sample(n=n, random_state=random_seed))
    
    patients = patients[patients["subject_id"].isin(sample_ids)].copy()
    labevents = labevents[labevents["subject_id"].isin(sample_ids)].copy()
    
    merged = merge_datasets(patients, labevents, d_labitems)
    return merged

def preprocess(data_dir: str = str(DEFAULT_DATA_DIR),
               sample_size: int = PATIENT_SAMPLE_SIZE,
               out_dir: str = None,
               random_seed=None) -> pd.DataFrame:
    """Standard preprocessor (Disk based with caching)."""
    data_path = Path(data_dir)
    subset_path = data_path / "mimic_subset.csv.gz"

    if subset_path.exists():
        logger.info("[Phase 1] CACHE HIT — Loading pre-processed subset")
        merged = pd.read_csv(subset_path, compression="gzip")
        # Just sample from cache
        all_ids = merged["subject_id"].unique()
        n = min(sample_size, len(all_ids))
        sample_ids = set(pd.Series(all_ids).sample(n=n, random_state=random_seed))
        return merged[merged["subject_id"].isin(sample_ids)]

    # Full Pipeline
    logger.info("[Phase 1] Cache miss — Processing raw files from disk...")
    patients = pd.read_csv(data_path / PATIENTS_FILE, usecols=PATIENTS_COLS)
    d_labitems = pd.read_csv(data_path / D_LABITEMS_FILE, usecols=D_LABITEMS_COLS)
    
    # Efficient streaming for labevents
    all_ids = patients["subject_id"].unique()
    sample_ids = set(pd.Series(all_ids).sample(n=min(sample_size * 2, len(all_ids)), random_state=random_seed))
    
    kept_chunks = []
    for chunk in pd.read_csv(data_path / LABEVENTS_FILE, usecols=LABEVENTS_COLS, chunksize=CHUNK_SIZE):
        matched = chunk[chunk["subject_id"].isin(sample_ids)]
        if not matched.empty:
            kept_chunks.append(matched)
    
    labevents = pd.concat(kept_chunks, ignore_index=True)
    merged = merge_datasets(patients[patients["subject_id"].isin(sample_ids)], labevents, d_labitems)
    
    # Save cache
    merged.to_csv(subset_path, index=False, compression="gzip")
    return merged

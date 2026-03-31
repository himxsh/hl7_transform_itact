import logging
import pandas as pd
from datetime import datetime, timezone
from pathlib import Path
from hl7_transform.anonymizer import Anonymizer
from hl7_transform.integrity import IntegrityManager

logger = logging.getLogger("hl7_pipeline.generic")

def process_records(df, id_column, mapping):
    """
    Core hl7 transformation logic that operates on a DataFrame.
    Returns a list of tuples containing (subject_id, signed_message, record_metadata).
    """
    anonymizer = Anonymizer(locale="en_IN")
    integrity = IntegrityManager()
    results = []

    for index, row in df.iterrows():
        # Use the provided ID column or the row index as the unique seed
        subject_id = row.get(id_column, index)
        
        # Build Message Segments
        segments = []
        now = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        
        # MSH
        segments.append(f"MSH|^~\\&|GENERIC_PIPELINE|CSV_SOURCE|||{now}||ORU^R01^ORU_R01|{index}|P|2.5.1")
        
        # PID (Anonymized)
        last, first = anonymizer.anonymize_name(int(subject_id) if str(subject_id).isdigit() else index)
        
        # Safe extraction of metadata (using gender/age mappings)
        gender_col = mapping.get('gender', 'Gender')
        age_col = mapping.get('age', 'Age')
        
        gender = str(row.get(gender_col, 'U'))[0].upper() if pd.notnull(row.get(gender_col)) else 'U'
        age = 0
        try:
            age = int(row.get(age_col, 0))
        except (ValueError, TypeError):
            pass
            
        birth_year = datetime.now().year - age
        segments.append(f"PID|1||{subject_id}^^^CSV^MR||{last}^{first}^^^||{birth_year}0101|{gender}")
        
        # OBX (Dynamic for all lab features)
        obx_id = 1
        observations = mapping.get('observations', {})
        for hl7_name, csv_col in observations.items():
            value = row.get(csv_col, "")
            segments.append(f"OBX|{obx_id}|NM|{hl7_name}^MIMIC||{value}||||||F")
            obx_id += 1
            
        hl7_msg = "\n".join(segments)
        
        # Sign with SHA-256 (Security Layer)
        signed_msg = integrity.sign_message(hl7_msg)
        
        # Metadata for frontend display
        record_metadata = {
            "id": str(subject_id),
            "pseudonym": f"{first} {last}",
            "sex": gender,
            "cohort": "Stateless Ingestion",
            "labEvents": len(observations),
            "output": f"patient_{subject_id}.hl7",
            "seal": "Valid",
            "raw_data": {k: v for k, v in observations.items() if v in row.index}
        }
        
        results.append((subject_id, signed_msg, record_metadata))
    
    return results

def run_generic_pipeline(csv_path, id_column, mapping, out_dir="output", sample_size=50):
    # Load Data
    df = pd.read_csv(csv_path)
    if sample_size and len(df) > sample_size:
        df = df.sample(n=sample_size, random_state=42).reset_index(drop=True)
    
    logger.info(f"[Generic] Processing {len(df)} rows from {csv_path}")
    
    # Process
    results = process_records(df, id_column, mapping)
    
    # Write to Disk (Compatibility Layer)
    out_path = Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    for subject_id, signed_msg, _ in results:
        with open(out_path / f"patient_{subject_id}.hl7", "w") as f:
            f.write(signed_msg)
            
    logger.info(f"[Generic] Successfully generated {len(df)} signed HL7 messages in {out_dir}.")

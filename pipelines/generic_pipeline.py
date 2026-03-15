"""
Generic HL7 Pipeline for Single CSV Datasets (IT Act & DPDP Act compliant)
========================================================================
This pipeline can handle any flat CSV dataset (like indian_liver_patient.csv)
by mapping its columns to HL7 segments.
"""

import logging
import pandas as pd
from datetime import datetime, timezone
from pathlib import Path
from hl7_transform.anonymizer import Anonymizer
from hl7_transform.integrity import IntegrityManager

logger = logging.getLogger("hl7_pipeline.generic")

def run_generic_pipeline(csv_path, id_column, mapping, out_dir="output", sample_size=50):
    # Initialize Compliance Modules
    anonymizer = Anonymizer(locale="en_IN")
    integrity = IntegrityManager()
    
    # 1. Load Data
    df = pd.read_csv(csv_path)
    if sample_size and len(df) > sample_size:
        df = df.sample(n=sample_size, random_state=None).reset_index(drop=True)
    logger.info(f"[Generic] Processing {len(df)} rows from {csv_path} (Randomly sampled from total)")
    
    out_path = Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    # 2. Process each row
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
        gender = row.get(mapping.get('gender', 'Gender'), 'U')[0].upper() # M or F
        age = int(row.get(mapping.get('age', 'Age'), 0))
        birth_year = datetime.now().year - age
        
        segments.append(f"PID|1||{subject_id}^^^CSV^MR||{last}^{first}^^^||{birth_year}0101|{gender}")
        
        # OBX (Dynamic for all lab features)
        obx_id = 1
        for hl7_name, csv_col in mapping.get('observations', {}).items():
            value = row.get(csv_col, "")
            segments.append(f"OBX|{obx_id}|NM|{hl7_name}^MIMIC||{value}||||||F")
            obx_id += 1
            
        hl7_msg = "\n".join(segments)
        
        # Sign with SHA-256 (Security Layer)
        signed_msg = integrity.sign_message(hl7_msg)
        
        # Write Output
        with open(out_path / f"patient_{subject_id}.hl7", "w") as f:
            f.write(signed_msg)
            
    logger.info(f"[Generic] Successfully generated {len(df)} signed HL7 messages.")

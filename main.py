"""
Secure HL7 Orchestration Pipeline — Switchboard Entry Point
==========================================================
Usage:
    # Run original MIMIC-IV pipeline
    python main.py --type mimic

    # Run generic CSV pipeline (e.g. Indian Liver Patient)
    python main.py --type generic --csv dataset/indian_liver_patient.csv
"""

import argparse
import logging
import sys
from pipelines.mimic_pipeline import run_mimic_pipeline
from pipelines.generic_pipeline import run_generic_pipeline

def main():
    parser = argparse.ArgumentParser(description="Secure HL7 Orchestration Pipeline")
    parser.add_argument("--type", choices=["mimic", "generic"], required=True, 
                        help="Select the dataset pipeline to use.")
    parser.add_argument("--csv", help="Path to CSV file (required for 'generic' type).")
    parser.add_argument("--out", default="output", help="Output directory.")
    parser.add_argument("--sample", type=int, default=50, help="Number of records to process (default: 50).")
    
    args = parser.parse_args()

    # Generic Liver Patient Mapping Rules
    LIVER_MAP = {
        'age': 'Age',
        'gender': 'Gender',
        'observations': {
            'BIL-TOT': 'Total_Bilirubin',
            'BIL-DIR': 'Direct_Bilirubin',
            'ALP': 'Alkaline_Phosphotase',
            'ALT': 'Alamine_Aminotransferase',
            'AST': 'Aspartate_Aminotransferase',
            'PRO-TOT': 'Total_Protiens',
            'ALB': 'Albumin',
            'ALB-GLOB': 'Albumin_and_Globulin_Ratio'
        }
    }

    if args.type == "mimic":
        print(f"Launching specialized MIMIC-IV pipeline (Sample Size: {args.sample})...")
        run_mimic_pipeline(out_dir=args.out, sample_size=args.sample)
    
    elif args.type == "generic":
        if not args.csv:
            print("Error: --csv is required when using --type generic")
            sys.exit(1)
        print(f"Launching generic pipeline for dataset: {args.csv} (Sample Size: {args.sample})")
        # Note: In a production environment, LIVER_MAP could be loaded from a JSON file.
        run_generic_pipeline(csv_path=args.csv, id_column='index', 
                             mapping=LIVER_MAP, out_dir=args.out, sample_size=args.sample)

if __name__ == "__main__":
    main()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
from pathlib import Path
from pipelines.mimic_pipeline import run_mimic_pipeline, build_hl7_message
from pipelines.generic_pipeline import run_generic_pipeline
from hl7_transform.anonymizer import Anonymizer
from hl7_transform.integrity import IntegrityManager
from hl7_transform.encryption import EncryptionComparator
from hl7_transform.audit_logger import AuditLogger
from hl7_transform.breach_detector import BreachDetector
from preprocess_mimic import preprocess
import pandas as pd
import json
from dataclasses import asdict

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = "dataset"
OUT_DIR = "output"

# Shared instances
audit_logger = AuditLogger()
encryption_comparator = EncryptionComparator()
breach_detector = BreachDetector(output_dir=OUT_DIR)

# Cache for latest encryption comparison results
_latest_encryption_results: list = []

class RunConfig(BaseModel):
    dataset: str
    sampleSize: int

class Record(BaseModel):
    id: str
    pseudonym: str
    sex: str
    cohort: str
    labEvents: int
    output: str
    seal: str

@app.get("/api/datasets")
async def get_datasets():
    return [
        {"id": "mimic", "name": "MIMIC-IV v3.1", "description": "Clinical research database (PhysioNet)"},
        {"id": "liver", "name": "Indian Liver Patient", "description": "Generic medical CSV workload"}
    ]

from fastapi.responses import StreamingResponse
import asyncio

@app.post("/api/run")
async def run_pipeline(config: RunConfig):
    global _latest_encryption_results
    _latest_encryption_results = []

    async def event_generator():
        global _latest_encryption_results
        try:
            if config.dataset.lower().startswith("mimic"):
                # Audit: Pipeline start
                audit_logger.log(
                    event_type="PIPELINE_START",
                    details={"dataset": config.dataset, "sample_size": config.sampleSize},
                    legal_reference="IT Act §67C (Record preservation)",
                    severity="INFO",
                )

                yield f"data: {json.dumps({'status': 'progress', 'stage': 0, 'message': 'Initializing Preprocessor'})}\n\n"
                await asyncio.sleep(0.1)

                df = preprocess(data_dir=DATA_DIR, sample_size=config.sampleSize)
                anonymizer = Anonymizer(locale="en_IN")
                integrity = IntegrityManager()

                out_path = Path(OUT_DIR)
                out_path.mkdir(parents=True, exist_ok=True)

                patient_groups = list(df.groupby("subject_id"))
                total = len(patient_groups)

                yield f"data: {json.dumps({'status': 'progress', 'stage': 1, 'message': f'Ready to process {total} patients'})}\n\n"
                await asyncio.sleep(0.1)

                all_encryption_results = []

                for i, (subject_id, group) in enumerate(patient_groups):
                    # Audit: Record ingested
                    audit_logger.log(
                        event_type="RECORD_INGESTED",
                        subject_id=str(subject_id),
                        details={"lab_events": len(group), "index": i},
                        legal_reference="DPDP §8(1) (Processing grounds)",
                        severity="INFO",
                    )

                    # Progress update before starting
                    yield f"data: {json.dumps({'status': 'processing', 'subject_id': str(subject_id), 'index': i, 'total': total})}\n\n"
                    
                    # Build message
                    hl7_msg = build_hl7_message(subject_id=int(subject_id), patient_rows=group, anonymizer=anonymizer)

                    # Audit: PII anonymised
                    audit_logger.log(
                        event_type="PII_ANONYMISED",
                        subject_id=str(subject_id),
                        details={"method": "deterministic_pseudonymisation", "locale": "en_IN"},
                        legal_reference="DPDP §8(7) (De-identification)",
                        severity="INFO",
                    )

                    signed_msg = integrity.sign_message(hl7_msg)

                    # Audit: Integrity sealed
                    audit_logger.log(
                        event_type="INTEGRITY_SEALED",
                        subject_id=str(subject_id),
                        details={"algorithm": "SHA-256", "segment": "ZSH"},
                        legal_reference="IT Act §14 (Secure Electronic Record)",
                        severity="INFO",
                    )

                    # Multi-algorithm encryption comparison
                    enc_results = encryption_comparator.compare(hl7_msg)
                    enc_dicts = [asdict(r) for r in enc_results]
                    all_encryption_results.append({
                        "subject_id": str(subject_id),
                        "results": enc_dicts,
                    })

                    # Audit: Encryption applied
                    audit_logger.log(
                        event_type="ENCRYPTION_APPLIED",
                        subject_id=str(subject_id),
                        details={
                            "algorithms": [r.name for r in enc_results],
                            "fastest_ms": min(r.time_ms for r in enc_results),
                            "slowest_ms": max(r.time_ms for r in enc_results),
                        },
                        legal_reference="IT Act §43A (Reasonable security practices)",
                        severity="INFO",
                    )
                    
                    # Write to file
                    filename = f"{subject_id}.hl7"
                    out_file = out_path / filename
                    with open(out_file, "w", encoding="utf-8") as fh:
                        fh.write(signed_msg)
                    
                    # Prepare record for frontend
                    first_row = group.iloc[0]
                    last_name, first_name = anonymizer.anonymize_name(int(subject_id))
                    
                    record = {
                        "id": str(subject_id),
                        "pseudonym": f"{first_name} {last_name}",
                        "sex": str(first_row.get("gender", "U")),
                        "cohort": str(first_row.get("anchor_year", "N/A")),
                        "labEvents": len(group),
                        "output": filename,
                        "seal": "Valid",
                        "encryption": enc_dicts,
                    }
                    
                    # Audit: Record complete
                    audit_logger.log(
                        event_type="RECORD_COMPLETE",
                        subject_id=str(subject_id),
                        details={"output_file": filename},
                        legal_reference="IT Act §67C (Record preserved)",
                        severity="INFO",
                    )

                    yield f"data: {json.dumps({'status': 'completed', 'record': record})}\n\n"
                    # Small sleep to allow frontend to breathe and see the updates
                    await asyncio.sleep(0.05)

                # Store for API retrieval
                _latest_encryption_results = all_encryption_results

                # Audit: Pipeline end
                audit_logger.log(
                    event_type="PIPELINE_END",
                    details={"total_records": total, "output_dir": OUT_DIR},
                    legal_reference="IT Act §67C (Record preservation)",
                    severity="INFO",
                )

                yield f"data: {json.dumps({'status': 'success', 'message': f'Processed {total} records successfully'})}\n\n"
            
            elif config.dataset.lower().startswith("liver"):
                yield f"data: {json.dumps({'status': 'error', 'message': 'Liver pipeline not yet optimized for streaming'})}\n\n"
            else:
                yield f"data: {json.dumps({'status': 'error', 'message': 'Unsupported dataset'})}\n\n"
        except Exception as e:
            logging.error(f"Streaming error: {str(e)}")
            audit_logger.log(
                event_type="PIPELINE_END",
                details={"error": str(e)},
                legal_reference="DPDP §15 (Breach notification)",
                severity="ERROR",
            )
            yield f"data: {json.dumps({'status': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/hl7/{filename}")
async def get_hl7_content(filename: str):
    file_path = Path(OUT_DIR) / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    with open(file_path, "r") as f:
        content = f.read()
    
    return {"content": content}

@app.get("/api/logs")
async def get_logs():
    log_file = Path("pipeline.log")
    if not log_file.exists():
        return {"logs": []}
    
    with open(log_file, "r") as f:
        lines = f.readlines()
    
    # Return last 50 lines
    return {"logs": lines[-50:]}

# ---------------------------------------------------------------
# NEW: Encryption Comparison Endpoint
# ---------------------------------------------------------------

@app.get("/api/encryption-comparison")
async def get_encryption_comparison():
    """Return the latest encryption comparison results from the last pipeline run."""
    return {
        "results": _latest_encryption_results,
        "algorithms": ["SHA-256", "AES-256-CBC", "HMAC-SHA512", "SHA3-256"],
    }

# ---------------------------------------------------------------
# NEW: Audit Log Endpoints
# ---------------------------------------------------------------

@app.get("/api/audit-log")
async def get_audit_log(event_type: Optional[str] = None, severity: Optional[str] = None, limit: int = 100):
    """Return structured audit log entries with optional filtering."""
    entries = audit_logger.get_entries(event_type=event_type, severity=severity, limit=limit)
    stats = audit_logger.get_stats()
    return {
        "entries": entries,
        "stats": stats,
    }

@app.post("/api/audit-log/clear")
async def clear_audit_log():
    """Clear the audit log."""
    audit_logger.clear()
    return {"status": "cleared"}

# ---------------------------------------------------------------
# NEW: Breach Detection Endpoints
# ---------------------------------------------------------------

@app.post("/api/breach-scan")
async def run_breach_scan():
    """Run a full breach detection scan on the output directory."""
    audit_logger.log(
        event_type="BREACH_SCAN_START",
        details={"output_dir": OUT_DIR},
        legal_reference="DPDP §15 (Breach detection)",
        severity="INFO",
    )

    results = breach_detector.full_scan()

    if results["summary"]["critical"] > 0 or results["summary"]["high"] > 0:
        audit_logger.log(
            event_type="BREACH_DETECTED",
            details=results["summary"],
            legal_reference="DPDP §15 (Breach notification required)",
            severity="CRITICAL",
        )

    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

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
from preprocess_mimic import preprocess
import pandas as pd
import json

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
    async def event_generator():
        try:
            if config.dataset.lower().startswith("mimic"):
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

                for i, (subject_id, group) in enumerate(patient_groups):
                    # Progress update before starting
                    yield f"data: {json.dumps({'status': 'processing', 'subject_id': str(subject_id), 'index': i, 'total': total})}\n\n"
                    
                    # Build message
                    hl7_msg = build_hl7_message(subject_id=int(subject_id), patient_rows=group, anonymizer=anonymizer)
                    signed_msg = integrity.sign_message(hl7_msg)
                    
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
                        "seal": "Valid"
                    }
                    
                    yield f"data: {json.dumps({'status': 'completed', 'record': record})}\n\n"
                    # Small sleep to allow frontend to breathe and see the updates
                    await asyncio.sleep(0.05)

                yield f"data: {json.dumps({'status': 'success', 'message': f'Processed {total} records successfully'})}\n\n"
            
            elif config.dataset.lower().startswith("liver"):
                yield f"data: {json.dumps({'status': 'error', 'message': 'Liver pipeline not yet optimized for streaming'})}\n\n"
            else:
                yield f"data: {json.dumps({'status': 'error', 'message': 'Unsupported dataset'})}\n\n"
        except Exception as e:
            logging.error(f"Streaming error: {str(e)}")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

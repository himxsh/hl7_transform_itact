# HL7 Orchestrator: Backend Architecture & Database Specification

This document provides a technical deep-dive into the backend orchestration and database handling of the HL7 Orchestrator pipeline. The system is designed for high-throughput, legally-compliant transformation of clinical data into structured HL7 v2.5.1 messages.

---

## 1. Database Specifications

The pipeline supports two primary data ingestion modes: specialized clinical research databases and generic medical CSV formats.

### 1.1 MIMIC-IV v3.1 (PhysioNet)
The system is optimized for the **MIMIC-IV** (Medical Information Mart for Intensive Care) database, which contains de-identified electronic health records from intensive care units.
- **Source Files**: 
    - `patients.csv.gz`: Demographic core (Subject ID, Gender, Anchor Age).
    - `labevents.csv.gz`: High-volume clinical observations (~158 million rows).
    - `d_labitems.csv.gz`: Dictionary to map `itemid` to human-readable lab test labels.
- **Data Normalization**: The backend performs a multi-stage LEFT JOIN (LabEvents → D_LabItems → Patients) to produce a denormalized view suitable for HL7 segment generation.

### 1.2 Generic Medical CSVs
The pipeline includes a "Dataset Neutral" mode for arbitrary medical datasets (e.g., the **Indian Liver Patient Dataset**).
- **Ingestion**: Ingests flat CSVs via a configurable schema mapping.
- **Mapping Logic**: Uses a declarative JSON-based mapping registry to translate CSV column headers into internal clinical attributes (`Bilirubin`, `BUN`, etc.).

---

## 2. Backend Architecture: The Modular Pipeline

The backend follows a **Modular Switchboard Architecture**, where compliance and security layers are injected into the data flow without modifying the core transformation library.

### 2.1 Phase 1: High-Efficiency Preprocessing
To handle multi-gigabyte datasets on standard hardware, the preprocessing engine (`preprocess_mimic.py`) implements:
- **Chunked Streaming**: Reads the 2.4GB+ `labevents` file in blocks of 100,000 rows (`chunksize` logic).
- **Memory Optimization**: Filters patient records on-the-fly, ensuring only the target sample (e.g., 50 patients) is materialized in memory.
- **Privacy-by-Design**: Computes `birth_year` using `anchor_year` and `anchor_age` to avoid handling raw dates, maintaining MIMIC-IV's privacy guarantees.

### 2.2 Phase 2: Privacy Layer (DPDP Act 2023)
The `Anonymizer` engine ensures compliance with Section 8(7) of the DPDP Act by stripping PII before it enters the HL7 serialization stage.
- **Deterministic Pseudonymization**: Uses the patient’s ID to seed a `Faker(en_IN)` generator. This ensures that the same `subject_id` consistently maps to the same fake identity across different lab events without requiring a stateful lookup table.
- **Regex Scrubbing**: A multi-pass regex engine scans free-text `NTE` (Notes and Comments) segments for:
    - **Indian IDs**: Aadhaar (12 digits), PAN (Alpha-numeric).
    - **Standard PII**: SSN, Email, Phone Numbers, MRN (Medical Record Numbers).
    - **Generic Identifiers**: 10-12 digit standalone numeric sequences.

### 2.3 Phase 3: HL7 Transformation Engine
The core logic utilizes an extended version of the `hl7_transform` library.
- **Mapping Loader**: Parses JSON/CSV rules that define how source data fields map to HL7 segments (`PID.5.1`, `OBX.5`, etc.).
- **Operation Factory**: Supports complex transformations including:
    - `Concatenate`: Merging multiple source columns into a single field.
    - `GenerateCurrentDatetime`: Standardizing timestamps to ISO-8601.
    - `AddValues`: Scientific unit adjustments and range calculations.
- **Serialization**: The `HL7Message` wrapper generates the pipe-delimited (`|`) and caret-delimited (`^`) HL7 structure.

### 2.4 Phase 4: Cryptographic Security (IT Act 2000)
To meet IT Act §43A requirements for "reasonable security practices," the `IntegrityManager` provides tamper-evidence.
- **Hashing Algorithm**: SHA-256.
- **Seal Generation**: The payload (entire HL7 message) is hashed immediately after serialization.
- **ZSH Segment**: A custom segment is appended to the message:
  `ZSH|1|SHA256|<64-char-hash>|SIGNED|<timestamp>`
  This serves as a digital seal that breaks if any field (even a single character) is modified post-generation.

---

## 3. Backend Orchestration & Validation

### 3.1 Pipeline Orchestrator (`main.py`)
The orchestrator manages the end-to-end execution flow:
1.  Initialize source-specific Preprocessor.
2.  Inject `Anonymizer` rules into the mapping stack.
3.  Execute `HL7Transform` for each data record.
4.  Wrap the output in the `IntegrityManager` to sign the message.
5.  Write to `output/<subject_id>.hl7` and generate audit logs in `pipeline.log`.

### 3.2 Integrity Validator (`validate_integrity.py`)
A stand-alone backend utility for post-hoc compliance auditing.
- **Process**: Iterates through generated HL7 files, strips the `ZSH` segment, re-calculates the SHA-256 hash of the content, and compares it to the value stored in the seal.
- **Return Codes**: Exits with `0` on success and `1` on tamper detection, allowing it to be integrated into CI/CD or automated compliance monitors.

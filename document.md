# Secure and Versatile HL7 Orchestration Pipeline

## Academic Context

This project was developed as the **Short Project** for the course **IT Act and Data Protection (ECE-4272)** under **Professor Dr. Abhishek Sharma**. The goal was to demonstrate a practical, working implementation of how Indian data protection and cybersecurity laws apply to real-world healthcare data processing.

---

## What is HL7?

HL7 (Health Level Seven) is the universal **"language" that hospitals, labs, and clinics use to talk to each other electronically**. When a doctor orders a blood test and the lab sends back results, that information travels as an HL7 message — a structured, pipe-delimited text format that every healthcare IT system understands.

Think of it like a standardised form: every hospital fills in the same fields (patient name, date of birth, test results, timestamps) in the same order, so any system on the receiving end can read it without confusion.

An HL7 message is made up of **segments** — each segment is a single line starting with a three-letter code:

- **MSH** — Message Header (who sent it, when, what type of message)
- **PID** — Patient Identification (name, date of birth, gender, address)
- **OBR** — Observation Request (which test was ordered)
- **OBX** — Observation Result (the actual lab value, units, reference range)
- **NTE** — Notes (any free-text comments from the lab)

---

## The Original Repository — hl7_transform

Our project is built on top of an open-source Python library called **hl7_transform**, created by Pavlo Dyban (Doctolib GmbH) and hosted on GitHub. This library is designed to **transform HL7 messages using simple mapping files**.

### What It Does

In a hospital, different systems often store the same information in different HL7 fields. For example, one system might put the patient's name in field `PID.5.1`, while another expects it in `PID.3.2`. An integration engine re-maps these fields on the fly. The `hl7_transform` library lets you **define those mappings in a plain JSON or CSV file** and run them programmatically — no need for an expensive integration engine.

### How It Works (Core Modules)

The library is organised into five clean modules:

- **Field Parser** — Understands dot-notation addresses like `PID.5.1` and translates them into the correct position inside an HL7 message.
- **Message Wrapper** — Reads, creates, and modifies HL7 messages. You can load a message from a file, create a blank one, or read/write individual fields.
- **Mapping Loader** — Reads a JSON or CSV file containing rules like "copy the value from field A to field B" or "set field C to today's date."
- **Operations Engine** — A library of actions you can perform on fields: copy values, set fixed values, concatenate fields, generate unique IDs, insert timestamps, and more.
- **Transform Engine** — The orchestrator that takes a mapping file and a message, then applies every rule one by one to produce the transformed output.

### What It Could NOT Do

The original library was built purely for **message routing and testing**. It had:

- No concept of **source data** (it expected you to already have an HL7 message)
- No concept of **patient privacy** (it would happily copy real names and addresses)
- No concept of **message security** (HL7 files are plain text — anyone could edit them undetected)

---

## The Problem — Real Hospital Data Meets Indian Law

For this project, we introduced **real hospital data** from the **MIMIC-IV v3.1** clinical database. MIMIC (Medical Information Mart for Intensive Care) is a large, freely available dataset of de-identified ICU patient records from Beth Israel Deaconess Medical Center, Boston. Access to MIMIC-IV requires becoming a **credentialed user on PhysioNet** — a process that involves completing human research ethics training and signing a data use agreement.

Once real patient records enter the picture, two Indian laws are immediately triggered:

### 1. Digital Personal Data Protection Act (DPDP Act), 2023

India's equivalent of Europe's GDPR. The key provision for us:

> **Section 8(7)** — If you are handling someone's personal data and you don't need their actual identity to do your job, **you must de-identify it**.

We are processing lab results. We need the blood glucose value, not the patient's real name or home address. The law mandates that we strip out identity information before processing.

### 2. Information Technology Act (IT Act), 2000

India's foundational cybersecurity law. The relevant sections:

> **Section 43A** — Organisations handling sensitive personal data (which medical data is) must implement **reasonable security practices**.

> **Section 72A** — **Wrongful disclosure** of personal information is a criminal offence.

HL7 files are plain text — anyone can open them in Notepad and change a lab value. There's no built-in way to know if a file was tampered with after creation. The law requires us to have a mechanism to detect such tampering.

---

### A Versatile and Modular Architecture

We extended the original library with **four new phases**, following a **Modular Switchboard Architecture**. Instead of building a single-use tool, we created a pipeline that can handle different types of databases (MIMIC-IV vs. Generic CSVs) with the same security and privacy guarantees.

### Phase 1 — Data Preprocessing

**The Problem:** MIMIC-IV data comes as three separate compressed CSV files — patient demographics, lab test events (2.4 GB+), and a lab test dictionary. These need to be merged into a single, clean dataset before HL7 messages can be built.

**What We Built:**

- A preprocessing script that reads all three compressed files and merges them using two JOIN operations (similar to Excel VLOOKUP)
- **Memory-efficient streaming**: The 2.4 GB lab events file is read in small chunks of 100,000 rows at a time — only the rows matching our 50 selected patients are kept in memory
- The output is a single flat table where each row contains everything needed to build one HL7 observation: patient demographics + lab test name + lab result + reference ranges + timestamps
- Every step is logged for a compliance audit trail

### Phase 2 — Privacy Layer (DPDP Act 2023)

**The Problem:** The merged data contains patient identifiers. Under Section 8(7) of the DPDP Act, we must de-identify this data before processing.

**What We Built — The Anonymizer:**

- **Name Replacement**: Every patient's real name is replaced with a **fake but realistic Indian name** generated by a library called Faker (configured with the `en_IN` locale for Indian names)
- **Address Replacement**: Every patient's real address is replaced with a fake Indian address
- **Deterministic Seeding**: The same patient always gets the **same fake identity** across all their lab events. This is achieved by using the patient's ID number as a random seed — no lookup table needed, and referential integrity is preserved
- **Free-Text Scrubbing**: Any notes or comments attached to lab results are scanned with regex patterns to automatically detect and redact:
  - SSN numbers
  - Aadhaar numbers (India's national ID)
  - PAN card numbers
  - Email addresses
  - Phone numbers
  - Medical Record Numbers (MRNs)
  - Any standalone 10–12 digit number that could be an ID

Detected patterns are replaced with labelled tokens like `[REDACTED-AADHAAR]` so the structure of the note is preserved but identifying information is removed.

### New: The Generic CSV Pipeline (Multi-Database Support)

**The Problem:** Every hospital stores data differently. One hospital might use a column called `Total_Bilirubin` while another uses `BIL-TOT`. To make our project truly useful, it couldn't just work with MIMIC-IV.

**What We Built:**
- **Dataset Neutrality**: A new generic pipeline that can ingest *any* flat medical CSV file (like the **Indian Liver Patient dataset**).
- **Declarative Label Mapping**: Instead of rewriting code for every new file, we use a mapping rulebook. You simply tell the code: *"In this CSV, 'Col_A' means 'Bilirubin'."*
- **Automatic compliance**: No matter which dataset you use, the code automatically applies the same Anonymizer (DPDP Act) and Integrity Manager (IT Act) layers to the output.

### Phase 3 — Security Layer (IT Act 2000)

**The Problem:** HL7 files are plain text. If someone opens a file and changes a lab value (e.g., changing a blood glucose result from 180 to 80), there's no way to know the file was tampered with. Under Section 43A of the IT Act, we must implement reasonable security practices.

**What We Built — The Integrity Manager:**

- After building the complete HL7 message, we run the entire message through a **SHA-256 hashing algorithm** — this produces a unique 64-character "digital fingerprint" of the message
- If even a single character in the message is changed, the fingerprint changes completely
- This fingerprint is attached at the bottom of the message in a custom **ZSH segment** (a Z-segment is HL7's standard extension mechanism for custom data):

```
ZSH|1|SHA256|<64-character hash>|SIGNED|<timestamp>
```

- Think of this as a **tamper-evident seal** — like the seal on a medicine bottle. You can break it, but everyone will know it was broken.

### Phase 4 — Orchestration and Validation

**The Problem:** All the individual components (preprocessing, anonymization, signing) need to be wired together into a single, automated pipeline. And there needs to be a way to verify the seals after the fact.

**What We Built:**

- **Pipeline Orchestrator (`main.py`)**: A single "Switchboard" script that lets the user choose their database type:
  - `--type mimic`: Runs the specialized, memory-efficient pipeline for the large MIMIC-IV dataset.
  - `--type generic`: Runs the flexible pipeline for any custom CSV (like our Indian Liver Patient example).
- **Default Sample Size**: To ensure fast and consistent demonstration, the code is hardcoded to automatically process **50 patient records** by default, though this remains configurable.
- **Full Audit Logging**: Every step from every pipeline is logged to `pipeline.log`.

- **Integrity Validator (`validate_integrity.py`)**: A separate verification script that:
  1. Reads every `.hl7` file in the output folder
  2. Strips the ZSH segment from the bottom
  3. Recomputes the SHA-256 hash of the remaining message
  4. Compares it against the hash stored in ZSH — reports **PASS** or **FAIL** for each file
  5. If any file fails, the script exits with an error code (useful for automated compliance checks)

---

## Architecture Overview

```
MIMIC-IV 3.1 CSVs ──► Data Preprocessing ──► Merged Patient + Lab Data
        (PhysioNet)                                    │
                                                       ▼
                                              For each patient:
                                              ┌────────────────────┐
                                              │  Build HL7 Message │
                                              └────────┬───────────┘
                                                       │
                                              ┌────────▼───────────┐
                                              │  Anonymize PII     │  ◄── DPDP Act §8(7)
                                              │  (Names, Address,  │
                                              │   Notes Scrubbing) │
                                              └────────┬───────────┘
                                                       │
                                              ┌────────▼───────────┐
                                              │  SHA-256 Signing   │  ◄── IT Act §43A
                                              │  (ZSH Segment)     │
                                              └────────┬───────────┘
                                                       │
                                                       ▼
                                              output/<patient_id>.hl7
                                                       │
                                              ┌────────▼───────────┐
                                              │  Integrity Check   │  ◄── Post-hoc Verification
                                              │  (validate_integrity)│
                                              └────────────────────┘
```

---

## How the Two Laws Map to Our Implementation

| Law | What It Protects | Our Implementation |
|---|---|---|
| **DPDP Act 2023, §8(7)** | Patient's **identity** — who they are | Anonymizer replaces real names and addresses with fake Indian identities; regex scrubber removes leaked PII from notes |
| **DPDP Act 2023, §8(4)** | **Purpose limitation** — only use data you need | Only clinical columns required for lab reporting are retained; demographic columns beyond what's needed are dropped |
| **IT Act 2000, §43A** | Data **integrity** — reasonable security practices | SHA-256 hash of every message, stored in a tamper-evident ZSH segment |
| **IT Act 2000, §72A** | **Wrongful disclosure** — criminal liability for data breach | `validate_integrity.py` detects any post-generation modification; full audit trail in `pipeline.log` |

---

## Key Technical Highlights

- **Modular Switchboard Architecture**: Zero modifications to original library files; use of a "Factory" pattern to switch between different database types (MIMIC vs. Generic).
- **Dataset Agnostic**: By using declarative mappings, the same pipeline can process data from any hospital or clinical research source.
- **Deterministic Anonymization**: Same patient ID always maps to the same fake identity, preserving data consistency across multiple lab events without a lookup table.
- **Memory-Efficient Streaming**: The 2.4 GB+ lab events file is processed in 100K-row chunks — only ~14,000 matched rows are loaded into memory
- **SHA-256 Tamper Detection**: A cryptographic hash function that produces a unique 64-character fingerprint — changing even one character in the message produces a completely different hash
- **Regex-Based PII Scrubbing**: Seven compiled regex patterns covering SSN, Aadhaar, PAN, email, phone, MRN, and generic long-digit IDs
- **Full Audit Logging**: Every anonymization action, signing event, and verification result is logged to `pipeline.log` for compliance review
- **MIMIC-IV v3.1 Dataset**: Real ICU patient data from PhysioNet, accessed after completing credentialed user requirements (ethics training + data use agreement)

---

## Data Source — MIMIC-IV v3.1 (PhysioNet)

The project uses the **MIMIC-IV v3.1** (Medical Information Mart for Intensive Care) dataset, a large publicly available database of de-identified health records from Beth Israel Deaconess Medical Center, Boston. To access this dataset, the following steps were completed:

1. **CITI Training**: Completed the "Data or Specimens Only Research" course on human subjects research ethics
2. **PhysioNet Credentialed Access**: Registered as a credentialed user on PhysioNet, which involves identity verification and signing a Data Use Agreement (DUA)
3. **Dataset Download**: Downloaded three compressed source files:
   - `patients.csv.gz` — Patient demographics (subject ID, gender, age, date of death)
   - `labevents.csv.gz` — 158+ million lab event rows (test results, timestamps, reference ranges)
   - `d_labitems.csv.gz` — Lab test dictionary (test names, fluid type, category)

This credentialed access process itself demonstrates compliance with ethical data handling practices, which is directly relevant to the DPDP Act's requirements around responsible data fiduciary behaviour.

---

## Conclusion

This project demonstrates a complete, end-to-end pipeline that takes real hospital data and produces legally compliant HL7 medical messages. By layering privacy protection (DPDP Act) and tamper-evident security (IT Act) on top of an existing open-source HL7 transformation library, we show how Indian data protection laws can be practically implemented in a healthcare data pipeline — without modifying the underlying library's code.

The result: **50 HL7 messages**, each with anonymized patient identities and a cryptographic seal, produced from real ICU data and verifiable at any point in the future.

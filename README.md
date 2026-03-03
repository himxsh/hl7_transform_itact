# Secure HL7 Orchestration Pipeline

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity)
![Docs build status](https://readthedocs.org/projects/hl7-transform/badge/?version=latest)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/pdyban/hl7_transform/CI)
[![PyPI license](https://img.shields.io/pypi/l/hl7-transform.svg)](https://pypi.python.org/pypi/hl7-transform/)
[![PyPI pyversions](https://img.shields.io/pypi/pyversions/hl7-transform.svg)](https://pypi.python.org/pypi/hl7-transform/)

A privacy-first, compliance-ready HL7 v2.5.1 message generation pipeline built on top of the [`hl7_transform`](https://github.com/pdyban/hl7_transform) library. This project extends the original fork to process real hospital data (MIMIC-IV), anonymize patient identity under the **DPDP Act 2023**, and sign every output message with a SHA-256 tamper-evident seal under the **IT Act 2000**.

---

## Table of Contents

- [Secure HL7 Orchestration Pipeline](#secure-hl7-orchestration-pipeline)
  - [Table of Contents](#table-of-contents)
  - [Original Fork — Features](#original-fork--features)
    - [Core Modules](#core-modules)
    - [Key Capabilities](#key-capabilities)
  - [Our Additions](#our-additions)
    - [Architecture Overview](#architecture-overview)
    - [Phase 1 — Data Preprocessing](#phase-1--data-preprocessing)
    - [Phase 2 — Privacy Layer](#phase-2--privacy-layer)
    - [Phase 3 — Security Layer](#phase-3--security-layer)
    - [Phase 4 — Orchestration and Validation](#phase-4--orchestration-and-validation)
  - [Project Structure](#project-structure)
  - [Requirements](#requirements)
  - [Installation](#installation)
    - [From PyPI (original library only)](#from-pypi-original-library-only)
    - [From source (this fork, with all additions)](#from-source-this-fork-with-all-additions)
  - [Usage](#usage)
    - [Run the full pipeline](#run-the-full-pipeline)
    - [Validate output integrity](#validate-output-integrity)
    - [Use the library API directly](#use-the-library-api-directly)
    - [CLI (original library)](#cli-original-library)
    - [Walkthrough agent](#walkthrough-agent)
  - [Running Tests](#running-tests)
  - [Compliance Notes](#compliance-notes)
  - [License](#license)

---

## Original Fork — Features

This project is forked from [`pdyban/hl7_transform`](https://github.com/pdyban/hl7_transform), a lightweight Python package built on top of [`hl7apy`](https://github.com/crs4/hl7apy) that transforms HL7 v2.x messages using declarative field-mapping schemes.

As a standard, HL7 permits different ways of implementing message interfaces between systems. Two systems exchanging ADT or SIU messages often carry the same information in different fields. In a hospital, an integration engine re-maps those messages on the fly. The original library lets you test those transformations without an integration engine in place.

### Core Modules

| Module | Class | Responsibility |
|---|---|---|
| `field.py` | `HL7Field` | Parses dot-notation addresses like `PID.5.1` into segment / field / component indices. |
| `message.py` | `HL7Message` | Wraps an `hl7apy` message object. Exposes `__getitem__` / `__setitem__` via `HL7Field` keys and factory methods `from_string()`, `from_file()`, `new()`. |
| `mapping.py` | `HL7Mapping` | Loads a list of `{target_field → operation}` rules from **JSON** or **CSV**. A custom `object_hook` hydrates `HL7Field` and `HL7Operation` instances automatically. |
| `operations.py` | `HL7Operation` (ABC) | Abstract base for all field-level operations. Concrete implementations: `CopyValue`, `SetValue`, `AddValues`, `Concatenate`, `GenerateAlphanumericID`, `GenerateNumericID`, `GenerateCurrentDatetime`, `SetEndTime`. New operations are registered via the `from_name()` class factory. |
| `transform.py` | `HL7Transform` | The execution engine — iterates the mapping rules and sets `message[target_field] = operation(message)` for each rule. |
| `__main__.py` | CLI | Reads a mapping file and an optional input `.hl7`, runs the transform, and writes the output. |

### Key Capabilities

- **Mapping-driven transformations** — define field-to-field rules in a plain JSON or CSV file; no code changes required.
- **Rich operation library** — copy, set, add, concatenate, generate IDs, generate timestamps.
- **CLI support** — `hl7_transform --help` for direct shell usage.
- **Composable Python API** — import `HL7Mapping`, `HL7Transform`, and `HL7Message` directly into your own scripts or Jupyter notebooks.
- **Sphinx documentation** hosted on [ReadTheDocs](https://hl7-transform.readthedocs.io/en/latest/).
- **MIT licensed**, with a live web demo at [hl7_transform_web](https://github.com/pdyban/hl7_transform_web).

---

## Our Additions

The original library was designed for message routing and testing — it had no concept of source data, patient privacy, or message security. Once real hospital records (MIMIC-IV) are introduced, two Indian laws are immediately triggered:

- **DPDP Act 2023 §8(7)** — data fiduciaries must de-identify personal data where the actual identity is not required for the processing purpose.
- **IT Act 2000 §43A / §72A** — organisations handling sensitive personal data must implement reasonable security practices; wrongful disclosure is a criminal offence.

We added **five new components** to address these requirements, following the **Open/Closed Principle** — none of the original five library files were modified.

### Architecture Overview

```
MIMIC-IV CSVs ──► preprocess_mimic.py ──► merged DataFrame
                                               │
                        JSON mapping file ◄────┘
                               │
                   HL7Mapping.from_json()
                               │
                      HL7Transform(mapping)
                               │
                    for each patient row:
                      HL7Message.new()
                           │
                      Anonymizer            ← INJECT 1 (before PID values are written)
                  (name, address, NTE)
                           │
                      transform(msg)
                           │
                      msg.to_string()
                           │
                      IntegrityManager      ← INJECT 2 (after serialization)
                      (SHA-256 + ZSH)
                           │
                    output/<subject_id>.hl7
                           │
              validate_integrity.py         (post-hoc verification)
```

Both injection points wrap the original library — the library itself is never touched.

---

### Phase 1 — Data Preprocessing

**File:** `preprocess_mimic.py`

Merges three MIMIC-IV v2.2 compressed CSV files into a single clean pandas DataFrame containing 50 patient records, ready for HL7 message construction.

| Source file | Size | Columns used |
|---|---|---|
| `patients.csv.gz` | ~3 MB | `subject_id`, `gender`, `anchor_age`, `anchor_year`, `dod` |
| `labevents.csv.gz` | ~2.4 GB | `subject_id`, `itemid`, `charttime`, `value`, `valuenum`, `valueuom`, `ref_range_lower`, `ref_range_upper`, `flag`, `comments` |
| `d_labitems.csv.gz` | ~50 KB | `itemid`, `label`, `fluid`, `category` |

**Key engineering decisions:**

- **Chunked streaming** (`chunksize=100_000`) on the 2.4 GB labevents file — only ~14,000 matched rows are materialised in memory instead of 158 million.
- **Denormalized output** via two LEFT JOINs (labevents → d_labitems → patients) puts all demographics and lab metadata on a single row, making per-patient HL7 construction trivial.
- `birth_year = anchor_year − anchor_age` respects MIMIC's privacy-by-design (no raw date-of-birth stored).
- All null counts are logged to `pipeline.log` for a compliance audit trail.

```python
from preprocess_mimic import preprocess

df = preprocess(data_dir="dataset/", sample_size=50)
```

---

### Phase 2 — Privacy Layer

**File:** `hl7_transform/anonymizer.py`

Implements the `Anonymizer` class that replaces real patient PII before any value is written into an HL7 field. Injected **before** `HL7Transform` runs.

| Target | Method |
|---|---|
| Patient name (`PID.5.1`, `PID.5.2`) | Deterministic `Faker(locale="en_IN")` seeded with `subject_id` |
| Patient address (`PID.11`) | Deterministic fake Indian address seeded with `subject_id` |
| NTE free-text notes | Regex scrubbing of SSN, Aadhaar, PAN, email, phone, MRN, and 10–12 digit IDs |

Deterministic seeding ensures the same `subject_id` always maps to the same fake identity — referential integrity is preserved across multiple lab events without storing a lookup table.

**Compliance reference:** DPDP Act 2023 §8(7), §8(4).

---

### Phase 3 — Security Layer

**File:** `hl7_transform/integrity.py`

Implements the `IntegrityManager` class that computes a SHA-256 hash of the fully serialized HL7 message and appends a tamper-evident `ZSH` Z-segment. Injected **after** `msg.to_string()`.

**ZSH segment format:**

```
ZSH|1|SHA256|<hex_digest>|SIGNED|<ISO-8601 UTC timestamp>
```

| Field | Value |
|---|---|
| `ZSH.1` | Segment set ID — always `"1"` |
| `ZSH.2` | Hash algorithm — `"SHA256"` |
| `ZSH.3` | Hex-encoded SHA-256 digest of all message content before the ZSH line |
| `ZSH.4` | Status — `"SIGNED"` |
| `ZSH.5` | ISO 8601 UTC signing timestamp |

**Compliance reference:** IT Act 2000 §43A, §72A.

---

### Phase 4 — Orchestration and Validation

**`main.py`** chains all components into a single pipeline:

```
read MIMIC-IV data → build HL7 message → anonymize PII → sign with ZSH → write .hl7
```

- Produces one `output/<subject_id>.hl7` file per patient.
- Full audit logging to `pipeline.log`.
- Configurable via CLI flags (`--data-dir`, `--out`, `--sample`).

**`validate_integrity.py`** provides post-hoc tamper detection:

- Re-reads every `.hl7` file in `output/`.
- Strips the `ZSH` segment, recomputes the SHA-256 hash, and compares it against `ZSH.3`.
- Exits with code `0` if all files pass, `1` if any fail.

---

## Project Structure

```
hl7_transform_itact/
├── main.py                        # Orchestration script (Phase 4a)
├── preprocess_mimic.py            # MIMIC-IV data pipeline (Phase 1)
├── validate_integrity.py          # Tamper-detection verifier (Phase 4b)
├── requirements.txt
├── setup.py / setup.cfg
├── agents/
│   └── explanation_plan.py        # AI walkthrough agent scripts
├── dataset/                       # MIMIC-IV CSV source files (not tracked in git)
├── mappings/                      # JSON/CSV HL7 mapping definitions
├── output/                        # Generated .hl7 files
└── hl7_transform/                 # Extended library (original + additions)
    ├── anonymizer.py              # Privacy Layer        ← NEW
    ├── integrity.py               # Security Layer       ← NEW
    ├── field.py                   # Original
    ├── message.py                 # Original
    ├── mapping.py                 # Original
    ├── operations.py              # Original
    ├── transform.py               # Original
    └── test/
        ├── test_transform.py
        ├── test_mapping.py
        ├── test_message.py
        ├── test_operations.py
        └── test_cli.py
```

---

## Requirements

- Python ≥ 3.8
- [hl7apy](https://github.com/crs4/hl7apy)
- [pandas](https://pandas.pydata.org/)
- [Faker](https://faker.readthedocs.io/)

---

## Installation

### From PyPI (original library only)

```bash
pip install hl7_transform
```

### From source (this fork, with all additions)

```bash
git clone https://github.com/your-org/hl7_transform_itact.git
cd hl7_transform_itact
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python setup.py install
```

---

## Usage

### Run the full pipeline

```bash
python main.py
# with explicit paths:
python main.py --data-dir dataset/ --out output/ --sample 50
```

Reads MIMIC-IV data, anonymizes patient PII, generates one HL7 v2.5.1 `ORU^R01` message per patient, signs each with a SHA-256 `ZSH` segment, and writes all files to `output/`.

### Validate output integrity

```bash
python validate_integrity.py                          # verify all files in output/
python validate_integrity.py output/10000032.hl7      # verify a single file
```

Exit code `0` = all passed. Exit code `1` = one or more files failed.

### Use the library API directly

```python
from hl7_transform.mapping import HL7Mapping
from hl7_transform.transform import HL7Transform
from hl7_transform.message import HL7Message

mapping = HL7Mapping.from_json('mappings/test_transform.json')
message = HL7Message.from_file('hl7_transform/test/test_msg.hl7')
transform = HL7Transform(mapping)
transformed_message = transform(message)
```

### CLI (original library)

```bash
hl7_transform --help
```

### Walkthrough agent

```bash
python agents/explanation_plan.py                      # full walkthrough
python agents/explanation_plan.py --topic overview     # single topic
```

Available topics: `overview`, `architecture`, `phase1`, `phase2`, `phase3`, `phase4`, `validator`, `dataflow`, `compliance`, `testing`.

---

## Running Tests

```bash
python -m pytest hl7_transform/test/ -v
```

Lint check:

```bash
bash run_flake.sh
```

---

## Compliance Notes

| Regulation | Section | How we address it |
|---|---|---|
| DPDP Act 2023 | §8(7) — De-identification | `Anonymizer` replaces all PII before it enters any HL7 field |
| DPDP Act 2023 | §8(4) — Purpose limitation | Only columns required for clinical lab reporting are retained |
| IT Act 2000 | §43A — Reasonable security practices | SHA-256 `ZSH` segment provides tamper-evidence at the message level |
| IT Act 2000 | §72A — Wrongful disclosure | `validate_integrity.py` detects any post-generation modification |

All pipeline events are logged to `pipeline.log` for a full compliance audit trail.

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

The original `hl7_transform` library is authored by Pavlo Dyban (Doctolib GmbH) and is also MIT licensed.

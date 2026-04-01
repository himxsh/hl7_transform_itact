# AGENTS.md — HL7 Transform IT Act Repository

This file contains essential information for agentic coding agents working in this repository.

## Project Overview

A privacy-first, compliance-ready HL7 v2.5.1 message generation pipeline. Extends the `hl7_transform` library to process MIMIC-IV hospital data, anonymize patient identity under the **DPDP Act 2023**, and sign every output with a SHA-256 tamper-evident seal under the **IT Act 2000**.

**Stack:** Python 3.8+ (FastAPI backend) + React 19/TypeScript (Vite frontend) + Tailwind CSS v4.

---

## Build / Lint / Test Commands

### Python Backend

```bash
# Install dependencies
pip install -r requirements.txt
python setup.py install

# Run ALL tests
python -m pytest hl7_transform/test/ -v

# Run a SINGLE test file
python -m pytest hl7_transform/test/test_transform.py -v

# Run a SINGLE test method
python -m pytest hl7_transform/test/test_transform.py::TestHL7Transform::test_execution -v

# Lint (flake8 with project-specific ignores)
bash run_flake.sh
# Equivalent: flake8 --ignore E501,E128,E126,E241 hl7_transform

# Validate output integrity (post-hoc tamper detection)
python validate_integrity.py                          # all files in output/
python validate_integrity.py output/10000032.hl7      # single file

# Run full MIMIC pipeline
python main.py --type mimic --sample 50

# Run generic CSV pipeline
python main.py --type generic --csv dataset/indian_liver_patient.csv --out output/liver/
```

### FastAPI Backend Server

```bash
python app.py
# or
./venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000
```

### Frontend (React + Vite + TypeScript)

```bash
cd frontend
npm install

# Dev server (port 3000)
npm run dev

# Production build
npm run build

# Type check (lint)
npm run lint          # runs: tsc --noEmit

# Clean build artifacts
npm run clean
```

### Both Together

```bash
bash start.sh          # starts backend (8000) + frontend (3000) concurrently
```

---

## Code Style Guidelines

### Python

| Convention | Rule |
|---|---|
| **Style guide** | PEP 8 |
| **Line length** | Soft limit; E501 ignored in flake8 config |
| **Indentation** | 4 spaces |
| **Imports** | Standard lib → third-party → local; absolute imports preferred |
| **Naming** | `snake_case` for functions/variables/modules; `PascalCase` for classes; `_leading_underscore` for private |
| **Types** | Type hints on all public method signatures (use `-> None`, `-> str`, etc.) |
| **Docstrings** | NumPy-style for classes and public methods (see `anonymizer.py`, `integrity.py`) |
| **Logging** | Use `logging.getLogger("hl7_pipeline.<module>")`; structured log messages with compliance references |
| **Error handling** | Raise specific exceptions; log before raising; FastAPI uses `HTTPException` |
| **String formatting** | `%`-style in logging calls (lazy evaluation); f-strings elsewhere |
| **Flake8 ignores** | E501 (line length), E128/E126 (indentation), E241 (whitespace) |

### TypeScript / React

| Convention | Rule |
|---|---|
| **Strict mode** | `tsc --noEmit` as lint; no explicit ESLint |
| **Naming** | `camelCase` for variables/functions; `PascalCase` for components; `kebab-case` for files |
| **Components** | Functional components with hooks; no class components |
| **State** | React Context / Hooks; no Redux |
| **Styling** | Tailwind CSS v4 utility classes; no custom CSS files |
| **Imports** | Absolute or relative; group by external → internal |
| **Types** | Prefer `interface` for object shapes; `type` for unions/aliases |

---

## Architecture Notes

### Key Directories

| Path | Purpose |
|---|---|
| `hl7_transform/` | Core library (original + new modules) |
| `hl7_transform/test/` | Unit tests (unittest framework) |
| `pipelines/` | Pipeline implementations (mimic, generic) |
| `frontend/` | React + Vite dashboard |
| `mappings/` | HL7 field mapping JSON/CSV files |
| `output/` | Generated `.hl7` files (not tracked in git) |
| `dataset/` | Source CSV files (not tracked in git) |

### New Modules (Our Additions)

| Module | Purpose |
|---|---|
| `anonymizer.py` | Deterministic PII pseudonymization (DPDP Act §8(7)) |
| `integrity.py` | SHA-256 tamper-evident ZSH segment (IT Act §43A) |
| `encryption.py` | Multi-algorithm encryption comparison |
| `audit_logger.py` | Structured JSON audit trail |
| `breach_detector.py` | Automated PII leak scanning |
| `compliance_scorer.py` | Real-time compliance scoring |
| `data_lineage.py` | Source-to-HL7 field tracing |
| `risk_assessment.py` | 5x5 risk matrix |
| `access_control.py` | RBAC simulation |

### Design Principles

1. **Zero modification to original library** — all new code wraps around `hl7_transform` via injection points.
2. **Deterministic anonymization** — same `subject_id` → same fake identity (no lookup table needed).
3. **Compliance-first logging** — every pipeline event logged with legal section reference.
4. **SSE streaming** — pipeline progress streamed to frontend via Server-Sent Events.

---

## Important Conventions

- **NEVER modify** files in `hl7_transform/` that are part of the original library: `field.py`, `message.py`, `mapping.py`, `operations.py`, `transform.py`, `__main__.py`.
- All new modules must include compliance reference comments (e.g., `[DPDP Act §8(7)]`).
- Every module should have a module-level docstring explaining its compliance role.
- Use `logging` — not `print` — for all runtime output.
- Frontend components follow the `*Content` pattern for modal/page parity.

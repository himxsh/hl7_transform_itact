"""
AI Agent Explanation Plan — Secure HL7 Orchestration Pipeline
==============================================================

PURPOSE
-------
This module defines the structured walkthrough plan that AI explanation
agents follow to give a deep, step-by-step explanation of every addition
made to the base ``hl7_transform`` library.

Each ExplanationAgent covers exactly ONE component. They are designed to
be called in sequence by a WalkthroughOrchestrator, but can also be
invoked independently for targeted Q&A.

HOW TO USE THIS FILE
--------------------
- Run ``python agents/explanation_plan.py`` for a full walkthrough.
- Run ``python agents/explanation_plan.py --topic <topic>`` for one section.

Available topics:
    overview, architecture, phase1, phase2, phase3, phase4, validator,
    dataflow, compliance, testing
"""

from __future__ import annotations

import argparse
import textwrap

# ---------------------------------------------------------------------------
# Explanation topics — ordered by recommended walkthrough sequence
# ---------------------------------------------------------------------------
TOPICS = [
    "overview",
    "architecture",
    "phase1",
    "phase2",
    "phase3",
    "phase4",
    "validator",
    "dataflow",
    "compliance",
    "testing",
]

# ---------------------------------------------------------------------------
# Agent explanation scripts
# ---------------------------------------------------------------------------

EXPLANATIONS: dict[str, dict] = {

    # =========================================================================
    "overview": {
        "title": "Project Overview — What Was Added and Why",
        "agent": "OverviewAgent",
        "files_involved": [
            "preprocess_mimic.py",
            "main.py",
            "validate_integrity.py",
            "hl7_transform/anonymizer.py",
            "hl7_transform/integrity.py",
            "agents/__init__.py",
            "agents/explanation_plan.py",
        ],
        "explanation": """
        WHAT EXISTED BEFORE
        -------------------
        The hl7_transform library was a pure message transformation tool:
          - You gave it an HL7 mapping (JSON/CSV) and an HL7 message file.
          - It applied field-by-field operations (copy, set, add, concatenate).
          - It output a transformed .hl7 file.
          - It had NO concept of source data, privacy, or security.

        WHAT WE ADDED (the 5 new components)
        -------------------------------------
        1. preprocess_mimic.py
           A data pipeline that reads real hospital data (MIMIC-IV), merges
           three datasets, and produces a clean DataFrame ready for HL7 conversion.
           The library previously needed pre-built .hl7 INPUT files — we now
           generate those messages programmatically from raw CSV data.

        2. hl7_transform/anonymizer.py
           A privacy protection module injected into the message-building step.
           Before any patient name or address is written into the HL7 message,
           this module replaces the real values with deterministically fake ones.

        3. hl7_transform/integrity.py
           A security module injected after the message is fully serialized.
           It calculates a SHA-256 fingerprint of the entire message and appends
           it as a custom ZSH segment — a tamper-evident seal.

        4. main.py
           The orchestration script that chains all components together:
           read data → build HL7 → anonymize → sign → write .hl7 files.

        5. validate_integrity.py
           A verification script that re-reads output files, strips the ZSH
           segment, recomputes the hash, and confirms nothing was altered.

        WHY THESE ADDITIONS WERE NEEDED
        --------------------------------
        The base library was designed for message routing/testing, not for
        handling real patient data. Once you introduce real hospital records
        (MIMIC-IV), you immediately trigger two Indian laws:
          - DPDP Act 2023: you cannot process real patient identity — it must
            be de-identified first.
          - IT Act 2000: you must implement reasonable security practices —
            a plain text .hl7 file with no tamper detection is not sufficient.
        """,
        "key_concepts": [
            "hl7_transform was a transformation library — we turned it into a full pipeline",
            "The Privacy Layer (anonymizer.py) was added to comply with DPDP Act 2023",
            "The Security Layer (integrity.py) was added to comply with IT Act 2000",
            "main.py is the glue — it orchestrates all components in the correct order",
        ],
    },

    # =========================================================================
    "architecture": {
        "title": "Architecture — How the New Code Connects to the Old Library",
        "agent": "ArchitectureAgent",
        "files_involved": [
            "hl7_transform/transform.py",
            "hl7_transform/message.py",
            "hl7_transform/mapping.py",
            "hl7_transform/operations.py",
            "hl7_transform/field.py",
            "hl7_transform/anonymizer.py",
            "hl7_transform/integrity.py",
            "main.py",
        ],
        "explanation": """
        ORIGINAL LIBRARY ARCHITECTURE
        ------------------------------
        The library has 5 core classes, each with a single responsibility:

          HL7Field (field.py)
          │  Parses dot-notation like "PID.5.1" into:
          │    segment="PID", field=5, component=1
          │  This is just a named address — it points to a location in a message.

          HL7Operation (operations.py) ← ABC
          │  An abstract base class for all field-level operations.
          │  Concrete operations: CopyValue, SetValue, AddValues, Concatenate,
          │  GenerateAlphanumericID, GenerateNumericID, GenerateCurrentDatetime,
          │  SetEndTime.
          │  Each operation has:
          │    - __init__(source_fields, args): configure the operation
          │    - __call__(message): execute it to produce a string value
          │  The class factory HL7Operation.from_name("set_value", ...) is how
          │  JSON mappings get turned into live Python objects.

          HL7Message (message.py)
          │  Wraps an hl7apy.core.Message object.
          │  Exposes __getitem__ / __setitem__ using HL7Field as the key.
          │  Example: message[HL7Field("PID.5.1")] = "Smith"
          │  Factory methods: from_string(), from_file(), new()

          HL7Mapping (mapping.py)
          │  A list of {target_field → operation} pairs loaded from JSON or CSV.
          │  The JSON hook (my_hook) converts each dict entry into
          │  {HL7Field instance → HL7Operation instance} automatically.

          HL7Transform (transform.py)
          │  The execution engine. __call__(message) iterates the mapping list
          │  and sets message[target_field] = operation(message) for each rule.

        HOW WE HOOK IN WITHOUT MODIFYING CORE CLASSES
        ---------------------------------------------
        We deliberately chose NOT to modify any of the 5 original classes.
        Instead, both new modules (anonymizer.py and integrity.py) are
        injected at specific points in main.py's orchestration loop:

          INJECT POINT 1 — During message construction (before HL7Transform)
            In main.py → build_hl7_message():
              last, first = anonymizer.anonymize_name(subject_id)
              street, city, state, zipcode = anonymizer.anonymize_address(subject_id)
              scrubbed = anonymizer.scrub_notes(comment)
            The Anonymizer runs BEFORE the PID/NTE values are written into
            the message structure, so the library never sees real PII.

          INJECT POINT 2 — After message serialization (after to_string())
            In main.py → run_pipeline():
              hl7_string = message.to_string()        ← library produces ER7 text
              signed = integrity.sign_message(hl7_string)  ← we append ZSH
            IntegrityManager runs AFTER the library has finished, operating
            purely on the final string — it does not touch HL7 objects at all.

        THIS IS THE OPEN/CLOSED PRINCIPLE IN ACTION
        -------------------------------------------
        The library is "closed for modification" — we didn't change a single
        line of the original 5 files. It's "open for extension" — we wrapped
        it in an orchestration layer that adds privacy and security.
        """,
        "key_concepts": [
            "HL7Field = an address (where to read/write in a message)",
            "HL7Operation = a rule (what value to produce)",
            "HL7Mapping = a list of address→rule pairs",
            "HL7Transform = the executor that applies all rules to a message",
            "Anonymizer hooks in BEFORE message construction (during value building)",
            "IntegrityManager hooks in AFTER message serialization (on the string)",
            "Neither new module modifies any original library class",
        ],
    },

    # =========================================================================
    "phase1": {
        "title": "Phase 1 — preprocess_mimic.py: The Data Preprocessing Engine",
        "agent": "PreprocessingExplainerAgent",
        "files_involved": ["preprocess_mimic.py"],
        "explanation": """
        WHAT THIS FILE DOES
        -------------------
        Transforms three compressed CSV files into one clean pandas DataFrame
        that contains everything needed to build HL7 messages.

        THE THREE SOURCE FILES
        ----------------------
        patients.csv.gz (3 MB)
          Columns used: subject_id, gender, anchor_age, anchor_year, dod
          - subject_id: unique patient identifier (becomes PID.3.1)
          - gender: 'M' or 'F' (becomes PID.8)
          - anchor_age + anchor_year: MIMIC's de-risked age representation
            (real DOB not stored — we compute birth_year = anchor_year - anchor_age)
          - dod: date of death, if applicable (becomes PID.29 + PID.30)

        labevents.csv.gz (2.4 GB — the big one)
          Columns used: subject_id, itemid, charttime, value, valuenum,
                        valueuom, ref_range_lower, ref_range_upper, flag, comments
          - Each row = one lab test result for one patient at one time
          - valuenum: numeric result (e.g. 95.0 for glucose)
          - value: text result for non-numeric tests (e.g. "NEG" for drug screens)
          - comments: free-text clinical notes — potential PII leak vector

        d_labitems.csv.gz (50 KB — tiny dictionary)
          Columns used: itemid, label, fluid, category
          - itemid: numeric code for the lab test (e.g. 50931 = Glucose)
          - label: human-readable name (becomes OBX.3.2)

        KEY ENGINEERING DECISION — STREAMING
        -------------------------------------
        The labevents file is 2.4 GB. Loading it fully would require ~8 GB RAM
        after pandas parsing. Instead, we use chunked streaming:

          for chunk in pd.read_csv(path, chunksize=100_000):
              matched = chunk[chunk["subject_id"].isin(sample_ids)]
              kept_chunks.append(matched)

        This reads 100,000 rows at a time, filters to our 50 patients immediately,
        and discards the rest. Result: we only materialise ~14,000 rows in memory
        instead of 158 million.

        MERGE ORDER AND WHY IT MATTERS
        --------------------------------
        Step 1: labevents LEFT JOIN d_labitems ON itemid
          → adds 'label', 'fluid', 'category' columns to every lab event row
          → LEFT JOIN so lab events with unknown item codes are still kept

        Step 2: result LEFT JOIN patients ON subject_id
          → adds demographic columns to every lab event row
          → each patient's gender/age/dod gets repeated for all their lab rows
          → this "denormalized" format makes HL7 construction trivial —
            building one message only needs one groupby

        DATA CLEANING
        -------------
        - charttime → parsed to pandas Timestamp (needed for HL7 datetime format)
        - NaN text columns → filled with "" (safe default for HL7 fields)
        - birth_year column added: anchor_year - anchor_age
        - Null counts logged for compliance audit trail

        FUNCTION SIGNATURES
        -------------------
        preprocess(data_dir, sample_size, out_dir) → pd.DataFrame
          The main public function. Called by main.py with:
            df = preprocess(data_dir="dataset", sample_size=50)

        load_patients(data_dir, sample_size) → (DataFrame, set of ids)
        load_d_labitems(data_dir) → DataFrame
        stream_labevents(data_dir, subject_ids) → DataFrame
        merge_datasets(patients, labevents, d_labitems) → DataFrame
        """,
        "key_concepts": [
            "Streaming with chunksize=100_000 avoids loading 2.4 GB into RAM",
            "labevents merged with d_labitems to add human-readable lab names",
            "Patients merged in to add demographics to every lab row",
            "birth_year = anchor_year - anchor_age (MIMIC privacy design)",
            "Denormalized output: one row per lab event with all patient data duplicated",
        ],
    },

    # =========================================================================
    "phase2": {
        "title": "Phase 2 — anonymizer.py: The Privacy Layer (DPDP Act §8(7))",
        "agent": "AnonymizerExplainerAgent",
        "files_involved": ["hl7_transform/anonymizer.py", "main.py"],
        "explanation": """
        WHAT THIS FILE DOES
        -------------------
        Provides the Anonymizer class — responsible for ensuring no real
        patient identity enters the HL7 messages. Every name, address, and
        free-text note is sanitized before it is written.

        THE CORE DESIGN DECISION — DETERMINISTIC SEEDING
        -------------------------------------------------
        A naive approach would generate a completely random fake name for
        every lab event. Problem: patient 10000032 has 623 lab events.
        If each got a different fake name, the message would look inconsistent
        and would break any system that tries to match records to a patient.

        Solution: we seed the Faker instance with the patient's subject_id.
          Faker.seed(subject_id)          ← global seed
          fk.seed_instance(subject_id)    ← instance-level seed

        Effect: subject_id=10000032 ALWAYS produces "Ramachandran^Gaurang"
        and the same fake address — across all 623 lab events, across multiple
        pipeline runs. No lookup table needed. The seed IS the mapping.

        THREE METHODS
        -------------
        1. anonymize_name(subject_id) → (last_name, first_name)
           - Creates/retrieves a seeded Faker for this subject_id
           - Returns fk.last_name(), fk.first_name()
           - Used in main.py to fill PID.5.1 (surname) and PID.5.2 (given name)
           - Locale "en_IN" → Indian-sounding names appropriate for DPDP context

        2. anonymize_address(subject_id) → (street, city, state, zipcode)
           - Same deterministic seeding
           - Returns fk.street_address(), fk.city(), fk.state(), fk.postcode()
           - Used to fill PID.11 (patient address) components

        3. scrub_notes(text) → cleaned_text
           - Runs a series of compiled regex patterns against free-text
           - Patterns cover: SSN, Aadhaar, PAN card, email, phone numbers
             (both Indian and international), MRN references, 10-12 digit IDs
           - Each matched pattern is replaced with a labelled token:
             "[REDACTED-SSN]", "[REDACTED-AADHAAR]", "[REDACTED-EMAIL]", etc.
           - Logs a WARNING with: how many patterns were replaced, original length,
             scrubbed length — this creates a DPDP audit trail
           - Used in main.py for every row's 'comments' column before NTE segment

        THE REGEX PATTERN SET (8 patterns)
        -----------------------------------
        Pattern 1: r"\\b\\d{3}-\\d{2}-\\d{4}\\b"
          Catches US Social Security Numbers like 123-45-6789
          (MIMIC is US data, SSNs may appear in clinical notes)

        Pattern 2: r"\\b\\d{4}[\\s\\-]\\d{4}[\\s\\-]\\d{4}\\b"
          Catches Indian Aadhaar numbers like 1234 5678 9012 or 1234-5678-9012

        Pattern 3: r"\\b[A-Z]{5}[0-9]{4}[A-Z]\\b"
          Catches Indian PAN card numbers like ABCDE1234F

        Pattern 4: Email regex — standard RFC-5322 approximation

        Pattern 5: Indian + International phone numbers
          r"(\\+?91[\\s\\-]?)?[6-9]\\d{9}" — Indian mobile (starts 6-9, 10 digits)
          r"(\\(?\\d{3}\\)?[\\s\\-]?\\d{3}[\\s\\-]?\\d{4})" — US format (xxx) xxx-xxxx

        Pattern 6: r"\\bMR[N#:. ]+\\d{4,}\\b" case-insensitive
          Catches Medical Record Number references like "MRN: 123456" or "MR# 4567"

        Pattern 7: r"\\b\\d{10,12}\\b"
          Catches any standalone 10-12 digit number that is likely an ID

        WHY PEP 8 COMPLIANCE MATTERS HERE
        ----------------------------------
        Compliance-grade code must be auditable. PEP 8 formatting ensures
        that any legal/technical reviewer can read and verify the anonymization
        logic without needing to untangle inconsistent style.
        """,
        "key_concepts": [
            "Deterministic seeding: same subject_id → always same fake identity",
            "Faker locale 'en_IN': produces Indian-appropriate names/addresses",
            "3 methods: anonymize_name(), anonymize_address(), scrub_notes()",
            "scrub_notes() uses 8 compiled regex patterns covering SSN, Aadhaar, PAN, email, phone, MRN",
            "WARNING-level log on every scrub event = DPDP compliance audit trail",
            "Runs BEFORE PID/NTE segments are written — real PII never enters the HL7 object",
        ],
    },

    # =========================================================================
    "phase3": {
        "title": "Phase 3 — integrity.py: The Security Layer (IT Act §43A / §72A)",
        "agent": "IntegrityExplainerAgent",
        "files_involved": ["hl7_transform/integrity.py", "main.py", "validate_integrity.py"],
        "explanation": """
        WHAT THIS FILE DOES
        -------------------
        Provides the IntegrityManager class — a completely stateless utility
        that signs HL7 messages with SHA-256 and verifies those signatures.

        THE PROBLEM IT SOLVES
        ---------------------
        HL7 messages are plain text files (ER7 format). Anyone with file system
        access can open one in any text editor and change a lab value:
          OBX|1|NM|50931^Glucose^MIMIC||95.0|mg/dL|...
        Change 95.0 to 5.0 → the patient now appears hypoglycemic. No one
        would know. IT Act §72A says this kind of tampering is a criminal
        offence — but only if you can PROVE it happened.

        SHA-256 HASHING — HOW IT WORKS
        --------------------------------
        SHA-256 is a one-way mathematical function:
          input:  any text (the full HL7 message)
          output: a fixed 64-character hex string (the "digest")

        Properties:
          1. Deterministic: same input → always same output
          2. Avalanche: changing ONE character completely changes the digest
          3. One-way: you cannot reverse the digest back to the input
          4. Collision-resistant: two different inputs almost never produce
             the same digest

        These properties make it perfect for tamper detection.

        THE ZSH SEGMENT FORMAT
        -----------------------
        After hashing, we build a custom Z-segment (Z = user-defined in HL7):
          ZSH|1|SHA256|<64_hex_chars>|SIGNED|2026-03-03T18:41:55Z

          ZSH.1 = "1"        → set ID (always 1 in our case)
          ZSH.2 = "SHA256"   → algorithm name (makes the segment self-describing)
          ZSH.3 = <hash>     → the 64-char hex digest of everything ABOVE this line
          ZSH.4 = "SIGNED"   → status flag
          ZSH.5 = timestamp  → UTC ISO 8601 — when was this message signed

        The segment is appended as the LAST line of the .hl7 file.

        sign_message(hl7_string) STEP BY STEP
        ----------------------------------------
        Step 1: body = hl7_string.strip()
                → normalize whitespace
        Step 2: digest = hashlib.sha256(body.encode("utf-8")).hexdigest()
                → compute the SHA-256 of the message body
        Step 3: timestamp = datetime.now(timezone.utc).strftime(...)
                → get current UTC time
        Step 4: zsh = "ZSH|1|SHA256|" + digest + "|SIGNED|" + timestamp
                → build the ZSH line
        Step 5: return body + "\\n" + zsh + "\\n"
                → return the complete signed message

        verify_message(hl7_string) STEP BY STEP
        ------------------------------------------
        Step 1: Split the message into body_lines and ZSH line
                → scan every line for lines starting with "ZSH|"
        Step 2: Extract stored_hash from ZSH.3 (parts[3] of the split)
        Step 3: Rejoin body_lines (everything except the ZSH line)
        Step 4: Recompute SHA-256 of the body
        Step 5: Compare recomputed == stored_hash
                → True = PASS (message was not modified)
                → False = FAIL (message was tampered with OR corrupted)

        IMPORTANT DESIGN CHOICE — what gets hashed
        -------------------------------------------
        We hash the message BODY — all lines EXCEPT the ZSH segment itself.
        This is intentional: if we included ZSH in the hash, we'd have a
        circular dependency (the hash would need to include itself).

        WHY stdlib ONLY (no extra install)
        -----------------------------------
        hashlib and datetime are Python standard library modules.
        Using only stdlib means the security layer:
          - Has no external supply-chain risk
          - Works in any Python 3 environment without additional installs
          - Is easy to audit (well-known, well-documented modules)
        """,
        "key_concepts": [
            "SHA-256: changing one character completely changes the 64-char digest",
            "ZSH segment: custom user-defined HL7 segment that stores the hash",
            "ZSH.3 stores the hash, ZSH.5 stores the UTC signing timestamp",
            "Hashing covers the BODY only — ZSH is excluded to avoid circular dependency",
            "verification: strip ZSH, recompute hash, compare — PASS or FAIL",
            "Uses stdlib only (hashlib + datetime) — no external dependency, no supply-chain risk",
        ],
    },

    # =========================================================================
    "phase4": {
        "title": "Phase 4 — main.py: The Orchestration Core",
        "agent": "OrchestrationExplainerAgent",
        "files_involved": ["main.py"],
        "explanation": """
        WHAT THIS FILE DOES
        -------------------
        main.py is the conductor. It has no logic of its own — it calls the
        other components in the right order and passes data between them.

        THE FULL EXECUTION FLOW (run_pipeline)
        ----------------------------------------
        1. setup_logging()
           → Creates dual-output logging to pipeline.log AND stdout
           → Every compliance action from every module is recorded here

        2. preprocess(data_dir, sample_size)
           → Calls Phase 1 — returns merged DataFrame with 14,418 rows
           → Each row = one lab event + patient demographics + lab name

        3. Anonymizer() and IntegrityManager() instantiated once
           → These are shared across all patients — efficient
           → Anonymizer's Faker cache grows as patients are processed

        4. df.groupby("subject_id")
           → Splits the flat DataFrame into patient groups
           → Each group = all lab events for one patient
           → This is how we get "one message per patient"

        5. For each patient group:
           a. build_hl7_message(subject_id, group, anonymizer)
              → Builds the complete HL7 message as a plain string
              → Calls anonymizer.anonymize_name() and anonymize_address()
              → Calls anonymizer.scrub_notes() for each comment
           b. integrity.sign_message(hl7_string)
              → Appends ZSH segment with SHA-256 hash
           c. Write to output/{subject_id}.hl7

        build_hl7_message() — THE HL7 CONSTRUCTION LOGIC
        --------------------------------------------------
        This function builds the ER7 (pipe-delimited) format manually as
        Python f-strings, one segment at a time. It does NOT use HL7Mapping
        or HL7Transform — those are designed for message-to-message transformation.
        Since our source is a DataFrame (not an existing HL7 message), we build
        from scratch.

        MSH segment (1 per patient)
          MSH|^~\\&|MIMIC_PIPELINE|MIMIC||MIMICDEMO|{now}||ORU^R01^ORU_R01|{msg_id}|P|2.5.1
          - ORU^R01 = Observation Result message (standard for lab results)
          - 2.5.1 = HL7 version as per the spec requirement
          - msg_id = MD5(subject_id + timestamp) → unique per message

        PID segment (1 per patient)
          - PID.3.1 = subject_id (MIMIC patient ID)
          - PID.3.4 = "MIMIC" (assigning authority)
          - PID.5 = fake_last^fake_first (from Anonymizer)
          - PID.7 = birth_year + "0101" (approximate — MIMIC strips real DOB)
          - PID.8 = gender (M/F direct from dataset)
          - PID.11 = fake_street^^fake_city^fake_state^fake_zip (from Anonymizer)
          - PID.29 = date of death (if present, from 'dod' column)
          - PID.30 = "Y" or "N" death indicator

        OBR segment (1 per patient — summary of the observation batch)
          - OBR.4 = first itemid + label (representative test)
          - OBR.7 = earliest charttime across all events
          - OBR.8 = latest charttime across all events

        OBX segment (one per lab event row — the bulk of the message)
          - OBX.1 = set ID (incrementing counter)
          - OBX.2 = value type: "NM" if valuenum is not NaN, else "ST"
          - OBX.3 = itemid^label^MIMIC (observation identifier)
          - OBX.5 = the actual test result value
          - OBX.6 = unit of measure
          - OBX.7 = reference range formatted as "low-high"
          - OBX.8 = flag (e.g. "abnormal")
          - OBX.11 = "F" (Final result status)
          - OBX.14 = charttime in HL7 datetime format

        NTE segment (0 or 1 per lab event, only if comments exist)
          - Each comment is first passed through anonymizer.scrub_notes()
          - Written as NTE|{set_id}||{scrubbed_comment}

        HELPER FUNCTIONS IN main.py
        ---------------------------
        _hl7_dt(dt): converts pandas Timestamp → "YYYYMMDDHHMMSS" string
        _now_hl7(): current time in HL7 format
        _msg_control_id(subject_id): MD5-based unique message ID
        _safe(val): converts any value including NaN/None to safe string ""
        _ref_range(lower, upper): formats "70.0-100.0" or "" if missing
        _value_type(valuenum): returns "NM" or "ST" based on numeric presence
        """,
        "key_concepts": [
            "run_pipeline() is stateless — no instance variables, pure function",
            "df.groupby('subject_id') is what produces 'one message per patient'",
            "build_hl7_message() uses plain f-strings, not HL7Transform (source is DataFrame not HL7)",
            "ORU^R01 is the standard HL7 message type for lab observation results",
            "OBX.2 = 'NM' vs 'ST' is auto-detected based on whether valuenum is numeric",
            "NTE comments are always scrubbed before being written",
        ],
    },

    # =========================================================================
    "validator": {
        "title": "validate_integrity.py — The Tamper Detection Script",
        "agent": "ValidatorExplainerAgent",
        "files_involved": ["validate_integrity.py", "hl7_transform/integrity.py"],
        "explanation": """
        WHAT THIS FILE DOES
        -------------------
        Reads signed .hl7 files, calls IntegrityManager.verify_message() on
        each one, and produces a PASS/FAIL report. This is the compliance
        verification tool — it proves the messages have not been altered.

        HOW TO TEST TAMPER DETECTION MANUALLY
        ----------------------------------------
        1. Open any .hl7 file in output/
        2. Change one character in an OBX value (e.g. 95.0 → 85.0)
        3. Save the file
        4. Run: python validate_integrity.py output/<that_file>.hl7
        5. You will see: FAIL ✗ — hash MISMATCH — TAMPER ALERT logged

        This demonstrates the IT Act §72A requirement: you can now PROVE
        in a court of law that the clinical data was specifically altered
        and when.

        THE verify_message FLOW (in IntegrityManager)
        -----------------------------------------------
        1. Split all lines into:
              body_lines = all lines NOT starting with "ZSH|"
              zsh_line   = the line starting with "ZSH|"

        2. If no ZSH line found → return False (missing signature)
              log level: WARNING ("no ZSH segment found")

        3. Parse ZSH fields: zsh_line.split("|")
              stored_hash = parts[3] (index 3 = ZSH.3)

        4. Rejoin body_lines with newline
        5. recomputed = sha256(body.encode()).hexdigest()
        6. if recomputed == stored_hash → PASS, else FAIL

        EXIT CODES FOR CI/CD INTEGRATION
        ----------------------------------
        sys.exit(0) if all files passed — signals success to any calling process
        sys.exit(1) if any file failed  — can trigger pipeline alerts / CI failure

        This means validate_integrity.py can be added to a CI/CD pipeline
        to automatically re-verify every generated file after any batch run.

        REPORT FORMAT
        -------------
        =======================================================
                     INTEGRITY VALIDATION REPORT
        =======================================================
        File                                    Status
        -------------------------------------------------------
        10000032.hl7                            PASS ✓
        10000048.hl7                            PASS ✓
        ...
        -------------------------------------------------------
        Total:                                      36
        Passed:                                     36
        Failed:                                      0
        =======================================================
        """,
        "key_concepts": [
            "verify_message() only needs the final .hl7 file — no separate signature file",
            "The hash is self-contained inside the ZSH segment of the .hl7 file",
            "Exit code 0=all passed, 1=any failed — suitable for CI/CD integration",
            "Missing ZSH segment → FAIL (message was stripped of its seal)",
            "Try it: change one character in a .hl7 file, run validator → FAIL",
        ],
    },

    # =========================================================================
    "dataflow": {
        "title": "End-to-End Data Flow — From CSV to Signed .hl7 File",
        "agent": "DataFlowExplainerAgent",
        "files_involved": [
            "dataset/patients.csv.gz",
            "dataset/labevents.csv.gz",
            "dataset/d_labitems.csv.gz",
            "preprocess_mimic.py",
            "main.py",
            "hl7_transform/anonymizer.py",
            "hl7_transform/integrity.py",
            "output/*.hl7",
        ],
        "explanation": """
        TRACE A SINGLE PATIENT (subject_id = 10000032) THROUGH THE PIPELINE
        -----------------------------------------------------------------------

        STEP 1 — patients.csv.gz
          Input row:
            subject_id=10000032, gender=F, anchor_age=52,
            anchor_year=2180, dod=2180-09-09

          After processing:
            gender="F", birth_year=2128, dob="21280101",
            dod_hl7="21800909", death_indicator="Y"

        STEP 2 — labevents.csv.gz (623 rows for this patient)
          Sample input row:
            subject_id=10000032, itemid=50931, charttime="2180-03-23 11:51:00",
            valuenum=95.0, valueuom="mg/dL",
            ref_range_lower=70.0, ref_range_upper=100.0, flag=NaN,
            comments="IF FASTING, 70-100 NORMAL, >125 PROVISIONAL DIABETES."

          After streaming + merge with d_labitems:
            label="Glucose", fluid="Blood", category="Chemistry"

        STEP 3 — Anonymizer runs on subject_id=10000032
          anonymize_name(10000032)    → ("Ramachandran", "Gaurang")
          anonymize_address(10000032) → ("05/56 Sane Zila", "Maheshtala", "Bihar", "322259")
          scrub_notes("IF FASTING...") → no PII found → returned unchanged

        STEP 4 — MSH segment built
          MSH|^~\\&|MIMIC_PIPELINE|MIMIC||MIMICDEMO|20260303184155||
              ORU^R01^ORU_R01|9759640B3DFA21167F0E|P|2.5.1

        STEP 5 — PID segment built (real identity replaced)
          PID|1||10000032^^^MIMIC^MR||
              Ramachandran^Gaurang^^^||    ← fake name (DPDP compliant)
              21280101|F|||
              05/56 Sane Zila^^Maheshtala^Bihar^322259|  ← fake address
              ...||||||10000032||||||21800909||Y

        STEP 6 — OBR segment built
          OBR|1|10000032|10000032|50931^Glucose^MIMIC|||
              21800323115100||||||||||||||||21800810120000||F

        STEP 7 — 623 OBX segments built (one per lab event)
          OBX|1|NM|50931^Glucose^MIMIC||95.0|mg/dL|70.0-100.0||||F|||21800323115100
          OBX|2|ST|51071^Amphetamine Screen, Urine^MIMIC||NEG||||||F|||21800323115100
          ...

        STEP 8 — NTE segments built for rows with comments
          NTE|1||IF FASTING, 70-100 NORMAL, >125 PROVISIONAL DIABETES.
          (comment passed through scrub_notes first)

        STEP 9 — IntegrityManager.sign_message()
          body = everything above (all 765 lines)
          digest = sha256(body.encode("utf-8")).hexdigest()
                 = "97ab8dc4d1fd474580233569f2e2fb4f0b8b1b3da940bbae75f1743cf109110d"
          ZSH line appended:
          ZSH|1|SHA256|97ab8dc4...f109110d|SIGNED|2026-03-03T18:41:55Z

        STEP 10 — Written to output/10000032.hl7
          Total segments: 765 (MSH + PID + OBR + 623 OBX + 139 NTE + ZSH)

        VERIFICATION (validate_integrity.py)
          Read file → split at ZSH → recompute sha256 of body
          → compare with stored hash → PASS ✓
        """,
        "key_concepts": [
            "Each patient produces exactly ONE .hl7 file containing ALL their lab events",
            "One OBX segment per lab event row — 623 OBX means 623 lab tests",
            "NTE segments are conditional — only written when 'comments' column is non-empty",
            "The ZSH hash covers all 765 lines above it, including the NTE comments",
            "Real subject_id IS preserved in PID.3.1 — it's the ID, not the identity",
        ],
    },

    # =========================================================================
    "compliance": {
        "title": "Compliance Details — DPDP Act 2023 + IT Act 2000",
        "agent": "ComplianceExplainerAgent",
        "files_involved": [
            "hl7_transform/anonymizer.py",
            "hl7_transform/integrity.py",
            "main.py",
        ],
        "explanation": """
        DPDP ACT 2023 — DIGITAL PERSONAL DATA PROTECTION ACT
        ======================================================

        Section 8(7) — De-identification obligation
        "A data fiduciary shall take reasonable steps to ensure that personal
        data is not retained beyond the period for which it was collected and
        that it is de-identified or anonymized once it is no longer required
        for the purpose for which it was collected."

        HOW WE COMPLY:
          - PID.5 (Patient Name): replaced by Anonymizer.anonymize_name()
            → Real name NEVER written into the HL7 file
          - PID.11 (Address): replaced by Anonymizer.anonymize_address()
            → Real address NEVER written into the HL7 file
          - NTE (Notes/Comments): passed through Anonymizer.scrub_notes()
            → Any accidentally leaked PII is redacted BEFORE being written

        Section 8(4) — Purpose limitation
        "A data fiduciary shall collect only such personal data as is
        necessary for the specified purpose."

        HOW WE COMPLY:
          - preprocess_mimic.py selects ONLY the columns needed for HL7:
            PATIENTS_COLS = ["subject_id", "gender", "anchor_age", "anchor_year", "dod"]
            LABEVENTS_COLS = ["subject_id", "itemid", "charttime", "value", ...]
          - Columns like 'order_provider_id', 'storetime', 'priority' are dropped
            at load time — they serve no purpose for lab reporting.

        AUDIT TRAIL FOR DPDP COMPLIANCE:
          Every anonymization action logs:
            [Anonymizer] PID-5 anonymized for subject_id=XXXX  [DPDP Act §8(7)]
            [Anonymizer] PID-11 anonymized for subject_id=XXXX  [DPDP Act §8(7)]
            [Anonymizer] NTE scrubbed: N pattern(s) replaced  [DPDP Act §8(4)/§8(7)]
          These audit logs are written to pipeline.log — a permanent record.

        IT ACT 2000 — INFORMATION TECHNOLOGY ACT
        ==========================================

        Section 43A — Reasonable security practices
        "Where a body corporate, possessing, dealing or handling any sensitive
        personal data or information in a computer resource which it owns,
        controls or operates, is negligent in implementing and maintaining
        reasonable security practices and procedures and thereby causes wrongful
        loss or wrongful gain to any person, such body corporate shall be liable
        to pay damages by way of compensation."

        HOW WE COMPLY:
          - SHA-256 integrity hashing of every message
          - ZSH segment provides a tamper-evident seal
          - Tampering with any byte of the message content will change the hash
          - validate_integrity.py provides a repeatable verification tool
          - All signing/verification events logged with hash values + timestamps

        Section 72A — Wrongful disclosure
        "Save as otherwise provided under this Act or any other law for the
        time being in force, any person including an intermediary who, while
        providing services under the terms of lawful contract, has secured
        access to any electronic record... and discloses such material to any
        other person without the consent of the person concerned... shall be
        punished with imprisonment for a term which may extend to three years."

        HOW WE COMPLY:
          - The ZSH hash proves, forensically, WHEN and IN WHAT STATE the message
            was created. If the data is later disclosed, the hash demonstrates
            whether the disclosed version matches the originally produced version.
          - All access to signing/verification is logged with timestamps:
            [IntegrityManager] Message signed  algo=SHA256  hash=...  ts=...  [IT Act §43A]
            [IntegrityManager] PASS — hash verified  [IT Act §43A]
            [IntegrityManager] FAIL — hash MISMATCH — TAMPER ALERT  [IT Act §72A alert]

        SUMMARY TABLE
        -------------
        Law                 Section  Requirement            Our Implementation
        ─────────────────── ──────── ────────────────────── ──────────────────────────────
        DPDP Act 2023       §8(7)    De-identification       Anonymizer: PID-5, PID-11
        DPDP Act 2023       §8(4)    Purpose limitation      Column filtering in preprocess
        DPDP Act 2023       §8(7)    PII in free text        NTE regex scrubber
        IT Act 2000         §43A     Reasonable security     SHA-256 ZSH signing
        IT Act 2000         §72A     Tamper evidence         verify_message() + audit log
        """,
        "key_concepts": [
            "DPDP §8(7): real name/address NEVER enters the HL7 file — anonymizer runs first",
            "DPDP §8(4): only required columns are loaded — others dropped at read time",
            "IT §43A: SHA-256 proves the message content at creation time",
            "IT §72A: audit logs + hash = forensic evidence chain for any dispute",
            "pipeline.log is the legal audit trail — survives process termination",
        ],
    },

    # =========================================================================
    "testing": {
        "title": "How to Test, Extend, and Verify Each Component",
        "agent": "TestingExplainerAgent",
        "files_involved": [
            "validate_integrity.py",
            "preprocess_mimic.py",
            "hl7_transform/anonymizer.py",
            "hl7_transform/integrity.py",
        ],
        "explanation": """
        MANUAL TESTS YOU CAN RUN RIGHT NOW
        ------------------------------------

        TEST 1 — Tamper Detection (most dramatic demo)
          1. Open output/10000032.hl7
          2. Find an OBX line, change any value (e.g. 95.0 → 85.0)
          3. Save the file
          4. Run: python validate_integrity.py output/10000032.hl7
          5. Expected: FAIL ✗ with "TAMPER ALERT" in logs
          6. Undo your change, run again → PASS ✓

        TEST 2 — Anonymization is Deterministic
          python -c "
          from hl7_transform.anonymizer import Anonymizer
          a = Anonymizer()
          print(a.anonymize_name(10000032))  # run twice
          print(a.anonymize_name(10000032))  # must be identical
          "

        TEST 3 — NTE Scrubber
          python -c "
          from hl7_transform.anonymizer import Anonymizer
          a = Anonymizer()
          dirty = 'Patient Aadhaar: 1234 5678 9012 called +919876543210'
          print(a.scrub_notes(dirty))
          # Expected: 'Patient Aadhaar: [REDACTED-AADHAAR] called [REDACTED-PHONE]'
          "

        TEST 4 — Sign and Verify Roundtrip
          python -c "
          from hl7_transform.integrity import IntegrityManager
          m = IntegrityManager()
          test_msg = 'MSH|^~\\\\&|TEST|||\\nPID|1||12345'
          signed = m.sign_message(test_msg)
          print('ZSH line:', signed.strip().split('\\n')[-1])
          print('Verify:', m.verify_message(signed))  # must be True
          "

        TEST 5 — Run Only Preprocessing (dry run)
          python preprocess_mimic.py --data-dir dataset --sample-size 10
          # Should print row counts and a sample of the merged DataFrame

        TEST 6 — Full Pipeline with Smaller Sample
          python main.py --data-dir dataset --out output_test --sample 5
          python validate_integrity.py --dir output_test
          # Should produce 5 files, all PASS

        EXTENDING THE PIPELINE
        -----------------------

        Adding a new PII pattern to the scrubber (anonymizer.py):
          Add to _PII_PATTERNS list:
            (re.compile(r"YOUR_PATTERN"), "[REDACTED-LABEL]"),

        Adding a new anonymization field (e.g. PID.6 — mother's maiden name):
          1. Add method to Anonymizer:
               def anonymize_maiden_name(self, subject_id):
                   return self._get_faker(subject_id).last_name()
          2. Call it in main.py's build_hl7_message() when building PID

        Supporting a different hash algorithm in IntegrityManager:
          Change ALGORITHM = "sha256" to "sha512"
          Update _hash() to use hashlib.sha512(...)
          Update ZSH.2 field value from "SHA256" to "SHA512"
          Update _split_message() parsing if needed

        Running with full 50-patient coverage:
          python main.py --sample 50
          (note: only 36 of the first 50 patients have labevents data)
        """,
        "key_concepts": [
            "Tamper test: change one char in .hl7, run validator → FAIL is the expected success",
            "Determinism test: same subject_id → identical fake name across runs",
            "Scrubber test: provide dirty string with Aadhaar/phone, verify [REDACTED-*] output",
            "New PII patterns: just append to _PII_PATTERNS list in anonymizer.py",
            "New anonymized fields: add Anonymizer method + call it in build_hl7_message()",
        ],
    },
}


# ---------------------------------------------------------------------------
# Walkthrough runner
# ---------------------------------------------------------------------------

class ExplanationAgent:
    """
    A single-topic explanation agent.

    Parameters
    ----------
    topic : str
        One of the keys in the EXPLANATIONS dict.
    """

    def __init__(self, topic: str) -> None:
        if topic not in EXPLANATIONS:
            raise ValueError(
                f"Unknown topic '{topic}'. Available: {', '.join(TOPICS)}"
            )
        self.topic = topic
        self.data = EXPLANATIONS[topic]

    def explain(self) -> None:
        """Print a formatted explanation for this topic."""
        width = 70
        title = self.data["title"]
        agent = self.data["agent"]
        files = self.data["files_involved"]
        explanation = textwrap.dedent(self.data["explanation"])
        key_concepts = self.data["key_concepts"]

        print("\n" + "=" * width)
        print(f"  [{agent}]")
        print(f"  {title}")
        print("=" * width)

        print("\n  FILES INVOLVED:")
        for f in files:
            print(f"    • {f}")

        print("\n" + explanation)

        print("  KEY CONCEPTS:")
        for concept in key_concepts:
            wrapped = textwrap.fill(
                concept, width=width - 4,
                initial_indent="    → ",
                subsequent_indent="       ",
            )
            print(wrapped)
        print()


class WalkthroughOrchestrator:
    """
    Chains all ExplanationAgents in the recommended order.
    """

    def run(self, topics: list = None) -> None:
        selected = topics if topics else TOPICS
        print("\n" + "█" * 70)
        print("  SECURE HL7 ORCHESTRATION PIPELINE — AGENT WALKTHROUGH")
        print(f"  Topics: {', '.join(selected)}")
        print("█" * 70)
        for topic in selected:
            if topic in EXPLANATIONS:
                ExplanationAgent(topic).explain()
                input("  ── Press ENTER to continue to next topic ──\n")
        print("█" * 70)
        print("  WALKTHROUGH COMPLETE")
        print("█" * 70 + "\n")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _build_parser():
    parser = argparse.ArgumentParser(
        description="AI Agent Explanation Plan — Secure HL7 Pipeline walkthrough."
    )
    parser.add_argument(
        "--topic", choices=TOPICS, default=None,
        help="Explain a specific topic. If omitted, runs full walkthrough.",
    )
    parser.add_argument(
        "--list", action="store_true",
        help="List all available topics and exit.",
    )
    parser.add_argument(
        "--no-pause", action="store_true",
        help="Run full walkthrough without pausing between topics.",
    )
    return parser


if __name__ == "__main__":
    args = _build_parser().parse_args()

    if args.list:
        print("\nAvailable explanation topics:")
        for t in TOPICS:
            title = EXPLANATIONS[t]["title"]
            print(f"  {t:<15} — {title}")
        print()
    elif args.topic:
        ExplanationAgent(args.topic).explain()
    else:
        if args.no_pause:
            # Override input() to skip pauses
            import builtins
            builtins.input = lambda _: None
        WalkthroughOrchestrator().run()

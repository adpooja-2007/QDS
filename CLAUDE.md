# CLAUDE.md — Quantum Digital Signature Security API (QDS)

> **Claude Code CLI Reference & Development Guide**  
> Problem Statement 26141 — Smart India Hackathon (SIH 2026)  
> System: Quantum-Inspired Cyber Threat Detection for Digital Signature Security

---

## 🚀 Common Commands & Workflow Cheat Sheet

### 1. Running the FastAPI Server
```powershell
# Start Uvicorn development server on localhost:8000
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --cwd backend

# Interactive Swagger Documentation: http://localhost:8000/docs
# Interactive ReDoc Documentation:   http://localhost:8000/redoc
```

### 2. Running Automated Tests
```powershell
# Run complete test suite (83 test cases across all modules)
.\.venv\Scripts\pytest.exe backend/tests

# Run specific module test suites
.\.venv\Scripts\pytest.exe backend/tests/quantum/    # Module 1 Quantum Core tests (20 passed)
.\.venv\Scripts\pytest.exe backend/tests/engine/     # Module 2 Threat Engine tests (36 passed)
.\.venv\Scripts\pytest.exe backend/tests/test_*.py   # Module 3 API & DB tests (27 passed)

# Run single test file with verbosity
.\.venv\Scripts\pytest.exe backend/tests/engine/test_pipeline.py -v
```

### 3. Verification & Demo Scripts
```powershell
# Run complete multi-module integration verification script
.\.venv\Scripts\python.exe backend/scripts/verify_all_modules.py

# Run standalone Module 2 Threat Engine demo script
.\.venv\Scripts\python.exe backend/scripts/run_threat_engine_demo.py
```

### 4. PostgreSQL Service & Database Management
```bash
# Start PostgreSQL service in WSL (Linux)
wsl -u root service postgresql start

# Verify PostgreSQL service status
wsl -u root service postgresql status

# List tables in qds_db
wsl -u postgres psql -d qds_db -c "\dt"

# Query active quantum sessions
wsl -u postgres psql -d qds_db -c "SELECT session_id, status, created_at FROM quantum_sessions;"

# Query request performance telemetry logs
wsl -u postgres psql -d qds_db -c "SELECT request_id, endpoint, method, execution_time_ms FROM telemetry_logs ORDER BY id DESC LIMIT 10;"
```

---

## 🏗️ Core Architecture & Repository Layout

```text
DIGSIGN/
├── CLAUDE.md                           <-- Claude Code CLI Guide (Root)
├── MASTER_SPEC.md                      <-- Single Source of Truth Engineering Specification
├── CHANGELOG.md                        <-- Version release notes & changelog
├── POSTGRES_SETUP.md                   <-- Local PostgreSQL installation & setup guide
├── SYSTEM_ARCHITECTURE_ANALYSIS.md     <-- Deep-dive architectural & mathematical analysis
├── docs/
│   ├── CLAUDE.md                       <-- Documentation copy of Claude Code guide
│   └── features/                       <-- Feature-by-feature explanation guides
│       ├── 01_MODULE1_QUANTUM_CORE.md
│       ├── 02_MODULE2_THREAT_DETECTION_ENGINE.md
│       ├── 03_MODULE3_DISTRIBUTED_API_FRAMEWORK.md
│       ├── 04_POSTGRESQL_PERSISTENCE_DATABASE.md
│       ├── 05_RED_TEAM_ATTACK_SANDBOX.md
│       └── 06_TESTING_VERIFICATION_SUITE.md
└── backend/
    ├── .env                            <-- Environment variables (PostgreSQL settings)
    ├── requirements.txt                <-- Python dependencies
    ├── app/
    │   ├── api/                        <-- API Routers (Alice, Bob, Arbitrator, Security, Attacks, Engine)
    │   ├── core/                       <-- Database engine (database.py), config.py, middleware.py
    │   ├── engine/                     <-- [MODULE 2] Threat Engine (Hoeffding, CHSH, QBER, XOR, Decoy)
    │   ├── mock/                       <-- [MODULE 2] Synthetic Threat Dataset Generator
    │   ├── models/                     <-- SQLAlchemy DB models & Pydantic request/response schemas
    │   ├── quantum/                    <-- [MODULE 1] Qiskit Quantum Core (EPR, BSM, Pauli, Teleportation)
    │   ├── schemas/                    <-- Pydantic API input/output models
    │   ├── services/                   <-- Business logic (QuantumService, SecurityService, SessionService)
    │   └── main.py                     <-- FastAPI application entry point
    ├── scripts/                        <-- Verification & demonstration scripts
    └── tests/                          <-- 83 Pytest automated test cases
```

---

## 🧩 Architectural Principles & Key Patterns

1. **FastAPI Integration Boundary**:
   - `FastAPI` owns the HTTP API layer and request routing.
   - Core modules (`quantum`, `engine`) do not import FastAPI or web framework code.
   - `app/services/` acts as the bridge connecting API routers to core modules.

2. **Deterministic Non-AI Security**:
   - Threat detection is strictly mathematical — **zero AI/ML dependencies**.
   - Security decisions rely on statistical bounds (**Hoeffding's Inequality**) and quantum physics laws (**CHSH Bell Violation**).

3. **Dual Persistence & Write-Through Caching**:
   - Primary persistence: **PostgreSQL 18.3** (`quantum_sessions` and `telemetry_logs` tables).
   - Fast access: `SessionService` maintains an in-memory dictionary cache synced on create/update.
   - Offline fallback: If PostgreSQL is unreachable, `database.py` seamlessly falls back to in-memory SQLite (`sqlite+aiosqlite:///:memory:`).

4. **Code Conventions & Standards**:
   - Use Python type hints (`typing`, Pydantic `BaseModel`).
   - Use `Pydantic v2` with `ConfigDict(extra="ignore", populate_by_name=True)`.
   - Use `SQLAlchemy 2.0` `Mapped` & `mapped_column` syntax.
   - Return clean JSON models matching OpenAPI contracts.

---

## 🔑 Environment Settings (`backend/.env`)

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_SERVER=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=qds_db

APP_TITLE="QDS — Quantum Digital Signature Security API"
APP_VERSION="1.0.0"
API_PREFIX="/api/v1"
```

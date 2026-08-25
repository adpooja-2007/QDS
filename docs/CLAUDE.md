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
    │   ├── services/                   <-- Service orchestrators (QuantumService, SecurityService, SessionService)
    │   └── main.py                     <-- FastAPI application entry point
    ├── scripts/                        <-- Verification & demonstration scripts
    └── tests/                          <-- 83 Pytest automated test cases
```

# CLAUDE.md — Quantum Digital Signature Security System (QDS)

> **Claude Code Master Reference & Engineering Guidelines**  
> Problem Statement 26141 — Smart India Hackathon (SIH 2026)  
> System: Quantum-Inspired Cyber Threat Detection for Digital Signature Security (QDS)  
> Full-Stack: Python FastAPI (Backend) + React TypeScript Vite + shadcn UI (Frontend)

---

## ⚡ Quick Start & Development Commands

### 1. Starting Backend & Frontend
```powershell
# --- 1. Python FastAPI Backend (Port 8000) ---
# From repository root:
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --cwd backend --host 127.0.0.1 --port 8000

# Swagger Documentation: http://localhost:8000/docs
# ReDoc Documentation:   http://localhost:8000/redoc

# --- 2. React Vite Frontend (Port 3000) ---
# In a separate terminal (from q-email directory):
cd q-email
npm run dev

# Frontend Web Application: http://localhost:3000
```

### 2. Testing & Verification
```powershell
# Run full backend test suite (83 test cases across all modules)
.\.venv\Scripts\pytest.exe backend/tests

# Run specific module test suites
.\.venv\Scripts\pytest.exe backend/tests/quantum/    # Module 1: Quantum Core (20 passed)
.\.venv\Scripts\pytest.exe backend/tests/engine/     # Module 2: Threat Detection Engine (36 passed)
.\.venv\Scripts\pytest.exe backend/tests/test_*.py   # Module 3: API & Database tests (27 passed)

# Run full integration verification script
.\.venv\Scripts\python.exe backend/scripts/verify_all_modules.py

# Run standalone Threat Engine demonstration
.\.venv\Scripts\python.exe backend/scripts/run_threat_engine_demo.py

# Validate frontend production build (TypeScript + Vite)
cd q-email
npm run build
```

### 3. PostgreSQL Database Service (WSL/Linux or Local)
```bash
# Start PostgreSQL service in WSL
wsl -u root service postgresql start

# Verify PostgreSQL status
wsl -u root service postgresql status

# Connect & query tables in qds_db
wsl -u postgres psql -d qds_db -c "\dt"
wsl -u postgres psql -d qds_db -c "SELECT session_id, status, created_at FROM quantum_sessions;"
```

---

## 🏛️ System Architecture Overview

```
                      +------------------------------------------+
                      |         QDS Web Frontend (React)        |
                      |  - Interactive 6-Step Quantum Sim        |
                      |  - Red-Team Attack Sandbox & Terminals  |
                      |  - Live SOC Telemetry & Threat Ledger    |
                      |  - Database Inspector & Visualizer       |
                      +--------------------+---------------------+
                                           | HTTP REST / SSE Stream / BroadcastChannel
                                           v
                      +------------------------------------------+
                      |       FastAPI Distributed Gateway        |
                      |  /api/v1/alice  /api/v1/bob  /arbitrator|
                      |  /api/v1/attacks /api/v1/security /engine|
                      +--------------------+---------------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
                    v                                             v
+---------------------------------------+     +---------------------------------------+
|      [MODULE 1] Quantum Core          |     |    [MODULE 2] Threat Detection Engine |
| - Qiskit EPR Pair Generation (SPDC)   |     | - Hoeffding Statistical Bound (alpha) |
| - Bell State Measurement (BSM)        |     | - CHSH Bell Non-Locality Test (S >= 2)|
| - Pauli Frame Transformation (X, Z)   |     | - Decoy State Multi-Photon Filter     |
| - Quantum State Teleportation         |     | - Shannon Key Entropy Estimation      |
+---------------------------------------+     +---------------------------------------+
                    |                                             |
                    +----------------------+----------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |    [MODULE 3] Persistence & Telemetry    |
                      | - PostgreSQL 18.3 (Async SQLAlchemy 2.0) |
                      | - Write-Through Memory Cache (Fallback)  |
                      | - Real-time JSON Stream & Audit Ledger   |
                      +------------------------------------------+
```

---

## 📁 Repository Structure & Key File Map

```text
DIGSIGN/
├── CLAUDE.md                           <-- THIS FILE (Claude Code master guide)
├── README.md                           <-- Production-grade project overview
├── ARCHITECTURE.md                     <-- End-to-end technical system architecture
├── UI_GUIDELINES.md                    <-- shadcn UI, typography & styling guidelines
├── API_REFERENCE.md                    <-- Complete REST API specification
├── DEVELOPMENT.md                      <-- Environment setup, build & debugging guide
├── ATTACK_SANDBOX_GUIDE.md             <-- Red-team attack vectors and defense math
├── MASTER_SPEC.md                      <-- Single Source of Truth Engineering Specification
├── CHANGELOG.md                        <-- Version history & release notes
├── POSTGRES_SETUP.md                   <-- PostgreSQL installation & table schemas
│
├── q-email/                            <-- [FRONTEND] React + TypeScript + Vite Console
│   ├── index.html                      <-- Entry HTML with Zegion font preloading
│   ├── vite.config.ts                  <-- Vite configuration (proxy to :8000, port 3000)
│   ├── src/
│   │   ├── index.css                   <-- Global CSS, Zegion font-face, rounded-full base rules
│   │   ├── components/
│   │   │   └── ui/                     <-- Complete shadcn UI Component Suite
│   │   │       ├── button.tsx          <-- shadcn Button (all sizes, rounded-full)
│   │   │       ├── button-group.tsx    <-- shadcn ButtonGroup (rounded-full container)
│   │   │       ├── card.tsx            <-- shadcn Card, CardHeader, CardContent, CardAction
│   │   │       ├── badge.tsx           <-- Status and subsystem badges
│   │   │       ├── input.tsx           <-- Form inputs & search bars
│   │   │       ├── dialog.tsx          <-- Modal dialogs
│   │   │       ├── tabs.tsx            <-- Navigation tabs
│   │   │       ├── table.tsx           <-- Data tables
│   │   │       └── tooltip.tsx         <-- Interactive tooltips
│   │   ├── pages/
│   │   │   ├── Home/                   <-- Bento grid navigation & system status
│   │   │   ├── Demonstration/          <-- 6-step interactive quantum handshake simulation
│   │   │   ├── AttackSandbox/          <-- Red-team attack dashboard & live streaming terminals
│   │   │   ├── Monitoring/             <-- SOC dashboard (Overview, Threats, Incidents, Network)
│   │   │   └── DatabaseInspector/      <-- PostgreSQL table inspector & schema explorer
│   │   └── services/
│   │       ├── api.ts                  <-- Axios HTTP client connected to FastAPI backend
│   │       └── sentinelService.ts      <-- Real-time reactive stream, attack classifier & store
│
├── backend/                            <-- [BACKEND] Python FastAPI Server
│   ├── .env                            <-- Environment variables (PostgreSQL settings)
│   ├── requirements.txt                <-- Python dependencies (qiskit, fastapi, sqlalchemy, etc.)
│   ├── app/
│   │   ├── api/                        <-- API Routers (Alice, Bob, Arbitrator, Security, Attacks)
│   │   ├── core/                       <-- Database engine (database.py), config.py, middleware.py
│   │   ├── engine/                     <-- [MODULE 2] Threat Engine (Hoeffding, CHSH, QBER, Decoy)
│   │   ├── models/                     <-- SQLAlchemy DB models & Pydantic schemas
│   │   ├── quantum/                    <-- [MODULE 1] Qiskit Quantum Core (EPR, BSM, Pauli)
│   │   ├── services/                   <-- Business logic (QuantumService, SecurityService)
│   │   └── main.py                     <-- FastAPI application entry point
│   ├── scripts/                        <-- Verification & demonstration scripts
│   └── tests/                          <-- 83 Pytest automated test cases
│
└── docs/                               <-- Documentation & Feature Guides
    └── features/
        ├── 01_MODULE1_QUANTUM_CORE.md
        ├── 02_MODULE2_THREAT_DETECTION_ENGINE.md
        ├── 03_MODULE3_DISTRIBUTED_API_FRAMEWORK.md
        ├── 04_POSTGRESQL_PERSISTENCE_DATABASE.md
        ├── 05_RED_TEAM_ATTACK_SANDBOX.md
        ├── 06_TESTING_VERIFICATION_SUITE.md
        ├── 07_FRONTEND_SECURITY_CONSOLE.md
        └── 08_UI_DESIGN_SYSTEM_AND_SHADCN.md
```

---

## 🎨 UI Guidelines & Strict Design Rules

When making changes to any frontend component or page, strictly enforce the following rules:

1. **Typography — Zegion Custom Font**:
   - The primary font across the entire web application is **Zegion** (`font-family: 'Zegion', sans-serif`).
   - Defined via `@font-face` in [`src/index.css`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/index.css).
   - Monospace telemetry and logs use standard high-legibility mono stacks (`font-mono`).

2. **Buttons & Button Groups — `rounded-full`**:
   - All action buttons and button groups must use `rounded-full` (pill shape).
   - Base CSS includes: `button:not(:disabled), [role="button"]:not(:disabled) { border-radius: 9999px; cursor: pointer; }`.
   - Use the official shadcn components in `src/components/ui/button.tsx` and `src/components/ui/button-group.tsx`.

3. **No Underscores in UI Text**:
   - **Never display raw underscores (`_`) in user-facing UI labels, badges, table headers, or log messages.**
   - Replace underscores with spaces (` `) or hyphens (`-`):
     - `ARBITRATOR_MAC` $\rightarrow$ `ARBITRATOR MAC`
     - `NONCE_AUDIT` $\rightarrow$ `NONCE AUDIT`
     - `DECOY_ANALYSIS` $\rightarrow$ `DECOY ANALYSIS`
     - `FIBER_TELEMETRY` $\rightarrow$ `FIBER TELEMETRY`
     - `QKD_NODE_07` $\rightarrow$ `QKD-NODE-07`
     - `quantum_sessions` $\rightarrow$ `Quantum Sessions`
     - `vw_active_threats` $\rightarrow$ `Active Threats`
     - `DEGRADED_OPERATIONAL` $\rightarrow$ `DEGRADED OPERATIONAL`

4. **Curated Color Palette**:
   - Dark Slate / Brand Navy: `#091426`
   - Sapphire Accent: `#0058BE`
   - Emerald Success: `#065F46` / `#34D399`
   - Amber Warning: `#C2410C` / `#F59E0B`
   - Crimson Breach: `#BA1A1A` / `#EF4444`
   - Background Slate: `#FBF8FA` (Light) / `#0B132B` (Dark)

---

## 🛡️ Quantum Threat Detection Principles

1. **Zero AI/ML Dependencies**:
   - All threat detection decisions are purely deterministic and mathematical.
   - **Hoeffding's Inequality Bound**: Guarantees with confidence $1 - \alpha = 0.999$ that if sampled QBER exceeds threshold $\tau = 5.0\%$, the channel is declared compromised.
   - **CHSH Bell Non-Locality Inequality**: Measures $S = \langle A_0 B_0 \rangle + \langle A_0 B_1 \rangle + \langle A_1 B_0 \rangle - \langle A_1 B_1 \rangle$. If $S < 2.0$, entanglement has collapsed and interception is detected.

2. **Categorized Attack Vectors**:
   - **MitM Intercept-Resend**: Subsystem `EVE PROBE` | QBER $14.2\%$ | $S = 1.94$ | Handshake REJECTED.
   - **Classical Signature Forgery**: Subsystem `ARBITRATOR MAC` | QBER $18.5\%$ | $S = 1.82$ | OTP Tag Mismatch.
   - **Quantum Replay Attack**: Subsystem `NONCE AUDIT` | QBER $8.4\%$ | $S = 1.98$ | Stale Nonce & Skew $+4.82\text{s}$.
   - **Photon Number Splitting (PNS)**: Subsystem `DECOY ANALYSIS` | QBER $6.2\%$ | $S = 2.05$ | Decoy Yield Anomaly.
   - **Optical Thermal Noise**: Subsystem `FIBER TELEMETRY` | QBER $9.8\%$ | $S = 2.12$ | Status `DEGRADED OPERATIONAL`.
   - **Broadband Laser Jamming (DoS)**: Subsystem `OPTICAL JAMMER` | QBER $42.0\%$ | $S = 1.20$ | Link Quarantined.

---

## 💻 Environment Variables (`backend/.env`)

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

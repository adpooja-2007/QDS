# Quantum-Inspired Cyber Threat Detection for Digital Signature Security (QDS)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Qiskit](https://img.shields.io/badge/Qiskit-1.3+-6929C4?logo=qiskit&logoColor=white)](https://qiskit.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.3-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Pytest](https://img.shields.io/badge/Pytest-83%20Passed-green?logo=pytest&logoColor=white)](https://pytest.org)

> **Smart India Hackathon (SIH 2026) — Problem Statement 26141**  
> An enterprise-grade, deterministic quantum-secure digital signature and cyber threat detection platform combining Qiskit quantum circuit simulations, mathematical statistical bounds (Hoeffding's Inequality), Bell non-locality tests (CHSH), and a high-performance React security operations console.

---

## 🌟 Key Capabilities & Highlights

1. **Deterministic, Zero-AI Quantum Security**:
   - Security evaluations rely on quantum physics principles and rigorous mathematical bounds — **completely free of AI hallucinations, training drift, or false confidence**.
   - **Hoeffding Statistical Bound ($\alpha = 0.001$)**: Strict statistical confidence test on quantum bit error rates (QBER).
   - **CHSH Bell Non-Locality Test ($S \ge 2.0$)**: Quantum entanglement verification guaranteeing zero observer state collapse.

2. **Interactive 6-Step Quantum Demonstration Console**:
   - Step-by-step interactive simulation player covering SPDC entangled photon generation, Bell State Measurement (BSM), Pauli feed-forward frame correction ($\sigma_x, \sigma_z$), and Toeplitz hash distillation.
   - Interactive Eve eavesdropping toggle demonstrating quantum superposition collapse in real-time.

3. **Red-Team Attack Sandbox with Live Streaming Terminals**:
   - Live execution of 6 real-world attack vectors: **MitM Intercept-Resend**, **Classical Signature Forgery**, **Stale Nonce Replay**, **Decoy-State Photon Number Splitting (PNS)**, **Optical Thermal Noise**, and **Broadband Laser Jamming (DoS)**.
   - 4-way synchronized streaming terminals (Arbitrator, Alice, Bob, Eve).

4. **SOC Security Operations Monitoring Dashboard**:
   - Real-time SVG telemetry stream with live QBER, CHSH score, and subsystem health gauges.
   - Detailed Threat Ledger with origin node attribution, forensic evidence breakdown, and detection timelines.
   - Incident Inspector with incident status escalation and action workflows.

5. **Live PostgreSQL Database Inspector**:
   - Interactive database explorer inspecting `Quantum Sessions`, `Active Threats`, `Node Telemetry`, `Crypto Keys`, and `Auth Logs`.
   - Dynamic JSON payload viewer, search query filtering, and status filtering.

---

## 🏗️ High-Level System Architecture

```
                                  USER BROWSER / SOC ANALYST
                                               │
                        ┌──────────────────────┴──────────────────────┐
                        ▼                                             ▼
            React TypeScript Console                      PostgreSQL DB Inspector
           (Zegion Font + shadcn UI)                      (Session & Key Ledger)
                        │                                             │
                        └──────────────────────┬──────────────────────┘
                                               │ HTTP / REST / SSE Stream
                                               ▼
                              FastAPI Distributed Gateway (:8000)
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
     [MODULE 1] Quantum Core      [MODULE 2] Threat Engine       [MODULE 3] Persistence Layer
     - Qiskit EPR Generation      - Hoeffding Bound (α=0.001)    - PostgreSQL 18.3 Async DB
     - Bell State Measurement     - CHSH Bell Test (S >= 2.0)    - Write-Through Memory Cache
     - Pauli Correction (X, Z)    - Decoy State Yield Filter     - In-Memory SQLite Fallback
     - Quantum Teleportation      - Toeplitz Hash Distillation   - Real-time Audit Logger
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (with virtual environment in `.venv/`)
- **Node.js 18+** and **npm 9+**
- **PostgreSQL 14+** (Local or WSL)

### 1. Start Python FastAPI Server
```powershell
# In terminal 1 (repository root):
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --cwd backend --host 127.0.0.1 --port 8000
```
- **API Base URL**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

### 2. Start React Vite Frontend
```powershell
# In terminal 2 (q-email directory):
cd q-email
npm install
npm run dev
```
- **Web Application URL**: `http://localhost:3000`

### 3. Run Automated Tests
```powershell
# Run all 83 backend automated tests:
.\.venv\Scripts\pytest.exe backend/tests

# Run verification script:
.\.venv\Scripts\python.exe backend/scripts/verify_all_modules.py
```

---

## 🖥️ Web Interface Navigation

| Route | Page Name | Primary Features |
| :--- | :--- | :--- |
| **`/home`** | **Command Hub** | Bento grid system overview, quick action cards, node status. |
| **`/demonstration`** | **Quantum Handshake** | Interactive 6-step player, live QBER/CHSH gauges, Eve toggle. |
| **`/attack-sandbox`** | **Attack Sandbox** | Red-team attack vectors, 4-node streaming terminals, packet inspector. |
| **`/monitoring`** | **SOC Dashboard** | Live telemetry table, dual charts, Threat Ledger, Incidents manager. |
| **`/database`** | **Database Inspector** | PostgreSQL tables, active threats view, JSON payload explorer. |

---

## 📊 Red-Team Attack Vector Matrix

| Attack Vector | Category | Subsystem | QBER | CHSH | Detection Outcome |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MitM Intercept-Resend** | `Intercept-Resend Eavesdropping` | `EVE PROBE` | $14.2\%$ | $1.94$ | Handshake REJECTED (Superposition collapse) |
| **Forgery Attack** | `Classical Signature Forgery` | `ARBITRATOR MAC` | $18.5\%$ | $1.82$ | Signature REJECTED (OTP tag collision mismatch) |
| **Replay Attack** | `Quantum Replay Attack` | `NONCE AUDIT` | $8.4\%$ | $1.98$ | Payload REJECTED (Stale nonce & timestamp skew) |
| **PNS Attack** | `Photon Number Splitting (PNS)` | `DECOY ANALYSIS` | $6.2\%$ | $2.05$ | Protocol ABORT (Decoy yield divergence) |
| **Channel Noise** | `Optical Thermal Drift` | `FIBER TELEMETRY` | $9.8\%$ | $2.12$ | Channel `DEGRADED OPERATIONAL` (Cascade reconciled) |
| **DoS Jamming** | `Quantum Denial of Service` | `OPTICAL JAMMER` | $42.0\%$ | $1.20$ | Link QUARANTINED (Detector saturation) |

---

## 📖 Complete Documentation Index

- [**CLAUDE.md**](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/CLAUDE.md): Claude Code master CLI and developer cheatsheet.
- [**ARCHITECTURE.md**](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/ARCHITECTURE.md): Deep technical system architecture and state machines.
- [**UI_GUIDELINES.md**](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/UI_GUIDELINES.md): shadcn UI component suite, Zegion typography, and styling rules.
- [**API_REFERENCE.md**](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/API_REFERENCE.md): Complete OpenAPI REST API endpoint documentation.
- [**DEVELOPMENT.md**](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/DEVELOPMENT.md): Step-by-step developer onboarding, testing, and debugging.
- [**ATTACK_SANDBOX_GUIDE.md**](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/ATTACK_SANDBOX_GUIDE.md): Red-team attack vectors catalog and mathematical proofs.
- [**POSTGRES_SETUP.md**](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/POSTGRES_SETUP.md): Database schemas, migrations, and PostgreSQL setup.

---

## ⚖️ License & Acknowledgements

Developed for **Smart India Hackathon (SIH 2026)** — Problem Statement 26141. Built with Qiskit, FastAPI, PostgreSQL, and React.
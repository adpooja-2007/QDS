# Changelog

All notable changes to the **QDS — Quantum Digital Signature Security API** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-25

### Added
- **Local PostgreSQL Integration**:
  - Configured PostgreSQL 18.3 engine integration running on local port `5432` connected to `qds_db`.
  - Added `.env` configuration file for database credentials (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_SERVER`, `POSTGRES_PORT`, `POSTGRES_DB`).
  - Updated `database.py` with explicit SQLAlchemy ORM model discovery (`SessionModel` & `TelemetryModel`) during `init_db()`.
  - Added `load_sessions_from_db()` method in `SessionService` to automatically hydrate in-memory cache from PostgreSQL on server startup.
  - Enhanced `TelemetryMiddleware` with automatic persistent write-through logging into PostgreSQL `telemetry_logs` table.

- **Module 3 — Distributed Node API Framework**:
  - **Arbitrator Router (`/api/v1/arbitrator`)**:
    - `POST /epr-distribute`: Simulates EPR entangled state pair generation between Alice and Bob.
    - `GET /session/{session_id}`: Retrieves full status and parameters of a quantum session.
    - `POST /session/{session_id}/reset`: Resets session states back to `EPR_READY`.
  - **Alice Signer Router (`/api/v1/alice`)**:
    - `POST /sign`: Accepts document hash, prepares state, performs Bell measurement, and extracts classical feed-forward bits ($M_{a1}, M_{a2}$).
    - `GET /signature/{session_id}`: Retrieves Alice's generated signature payload and Bell measurement outcomes.
  - **Bob Verifier Router (`/api/v1/bob`)**:
    - `POST /verify`: Receives classical bits, applies Pauli correction ($X^{M_{a2}} Z^{M_{a1}}$), and performs randomized measurement.
    - `POST /sift`: Performs basis reconciliation, sifts matching bases, and calculates raw Quantum Bit Error Rate (QBER).
  - **Security Threat Router (`/api/v1/security`)**:
    - `POST /analyze`: Computes deterministic security decision, QBER upper bound using Hoeffding's Inequality, CHSH inequality parameter ($S \le 2\sqrt{2}$), and decoy-state yield analysis.
    - `GET /audit/{session_id}`: Generates audit trail and threat intelligence log for SOC dashboard.
  - **Attacks Red-Team Sandbox Router (`/api/v1/attacks`)**:
    - `POST /inject`: Injects adversary attacks including Man-in-the-Middle (Intercept-Resend), Signature Forgery, Replay Attack, Thermal Noise, and Photon Number Splitting (PNS).
    - `GET /history/{session_id}`: Retrieves all attack records injected into a specific session.
  - **Sessions & Telemetry Router (`/api/v1/sessions`)**:
    - `GET /sessions`: Lists active quantum sessions.
    - `DELETE /sessions/{session_id}`: Terminates and closes a quantum session.
    - `GET /telemetry`: Returns recent API performance telemetry entries (execution time ms, status codes, endpoints).

- **Database Schemas & ORM Models**:
  - `SessionModel` (`quantum_sessions` table): Primary key `session_id`, `status`, `nonce`, `created_at`, `updated_at`, and structured JSON columns (`parameters`, `alice`, `bob`, `sifting`, `attacks`, `security`).
  - `TelemetryModel` (`telemetry_logs` table): Auto-increment `id`, `request_id`, `endpoint`, `method`, `timestamp`, `execution_time_ms`, `status_code`, `session_id`, and `error`.

- **Module 1 — Quantum Simulation Core Integration (`backend/app/quantum`)**:
  - Integrated Qiskit-backed Quantum Core modules for EPR entangled Bell state generation (`epr.py`), Alice signature state preparation (`state_preparation.py`), Joint Bell measurement (`bell_measurement.py`), Bob Pauli unitary correction (`correction.py`), randomized projective measurement (`measurement.py`), basis reconciliation (`sifting.py`), and quantum teleportation circuit (`teleportation.py`).
  - Added 20 unit tests in `backend/tests/quantum/` testing quantum circuit execution and state transformation.

- **Module 2 — Deterministic Threat Engine Integration (`backend/app/engine`)**:
  - Integrated deterministic threat detection algorithms for XOR bitwise mismatch evaluation (`xor_evaluator.py`), QBER statistics calculation (`qber.py`), Hoeffding statistical threshold derivation (`hoeffding.py`), CHSH Bell inequality test ($S \le 2\sqrt{2}$) (`chsh.py`), decoy-state yield evaluation (`decoy.py`), threat classifier (`classifier.py`), deterministic decision gate (`decision.py`), and transaction orchestrator (`orchestrator.py`).
  - Integrated synthetic telemetry mock dataset generator (`backend/app/mock`) for MITM, Forgery, Replay, Noise, and PNS attack scenarios.
  - Added 36 unit and pipeline tests in `backend/tests/engine/`.
  - Added Engine REST endpoints in `engine_routes.py` mounted at `/api/v1/security/` (`/xor`, `/qber`, `/threshold`, `/chsh`, `/decoy`, `/analyze`, `/audit`, `/mock`, `/health`, `/config`).

- **Comprehensive Unified Test Suite**:
  - 83 unit and integration tests across Module 1, Module 2, and Module 3 (`83 passed in 20.03s`).
  - 100% test pass rate using Qiskit, pytest-asyncio, FastAPI TestClient, and local PostgreSQL database persistence.

- **System Documentation**:
  - `POSTGRES_SETUP.md`: Step-by-step setup, startup, configuration, and SQL query verification guide.
  - `SYSTEM_ARCHITECTURE_ANALYSIS.md`: Architectural deep dive into QDS simulation engine, mathematical security bounds, threat engine, and API schemas.

### Changed
- Refactored `database.py` startup routine to fallback seamlessly to in-memory SQLite (`sqlite+aiosqlite:///:memory:`) if local PostgreSQL service is unreachable.
- Updated CORS configuration in `config.py` to allow cross-origin requests from React/Vite development servers on ports 3000, 5173, 5174, and 8000.

---

## [0.9.0] - 2026-08-15

### Added
- Initial prototype layout for SIH 2026 Problem Statement 26141.
- Core quantum simulation state definitions (`QuantumSession`, `SessionParameters`, `AliceData`, `BobData`, `SiftingData`, `SecurityResult`).
- Baseline FastAPI application setup with Swagger (`/docs`) and ReDoc (`/redoc`) documentation endpoints.

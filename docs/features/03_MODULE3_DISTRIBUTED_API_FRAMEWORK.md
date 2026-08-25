# Feature 03: Module 3 — Distributed Node API Framework

> **Location**: `backend/app/api/`, `backend/app/services/`, `backend/app/main.py`  
> **Tests**: `backend/tests/test_*.py` (27 Integration Tests)

---

## 1. Overview & Purpose

Module 3 is the **Distributed Node API Framework** built on FastAPI. It models Alice (Signer Node), Bob (Verifier Node), Arbitrator (Trusted Third-Party Node), Security Threat Engine, and Red-Team Sandbox as independent API microservice nodes communicating over REST/JSON.

---

## 2. API Router Node Specs

### A. Arbitrator Node Router (`backend/app/api/arbitrator.py`)
- `POST /api/v1/arbitrator/epr-distribute`: Generates $N$ Bell state pairs $\lvert \Phi^+ \rangle$ and creates session record `QKD-{YYYYMMDD}-{counter}`.
- `GET /api/v1/arbitrator/session/{session_id}`: Retrieves complete session state.
- `POST /api/v1/arbitrator/session/{session_id}/reset`: Resets session states back to `EPR_READY`.

### B. Alice Signer Node Router (`backend/app/api/alice.py`)
- `POST /api/v1/alice/sign`: Hashes document $H(d)$, prepares signature state, runs Bell measurement, extracts classical bits $(M_{a1}, M_{a2})$.
- `GET /api/v1/alice/signature/{session_id}`: Fetches Alice's signature payload and Bell measurement outcome.

### C. Bob Verifier Node Router (`backend/app/api/bob.py`)
- `POST /api/v1/bob/verify`: Receives classical feed-forward bits, applies Pauli correction $\sigma = X^{M_{a2}} Z^{M_{a1}}$, measures reconstructed qubits.
- `POST /api/v1/bob/sift`: Reconciles bases over public channel and extracts sifted bit arrays.

### D. Security Threat Node Router (`backend/app/api/security.py`)
- `POST /api/v1/security/threshold-audit`: Computes QBER, Hoeffding bound threshold $T$, CHSH Bell score $S$, and outputs `ACCEPT` or `REJECT` verdict.
- `GET /api/v1/security/audit/{session_id}`: Fetches detailed threat audit report for SOC dashboard visualization.

### E. Red-Team Attacks Sandbox Router (`backend/app/api/attacks.py`)
- `POST /api/v1/attacks/intercept-resend`: Injects MitM attack with specified fraction.
- `POST /api/v1/attacks/forgery`: Corrupts classical feed-forward bits.
- `POST /api/v1/attacks/replay`: Injects replayed uncorrelated bit sequence.
- `POST /api/v1/attacks/noise`: Simulates thermal noise on optical channel.
- `POST /api/v1/attacks/pns`: Simulates Photon Number Splitting attack.
- `GET /api/v1/attacks/history/{session_id}`: Retrieves attack logs for a session.

### F. Security Threat Engine Granular Router (`backend/app/api/engine_routes.py`)
- `POST /api/v1/security/sift`: Direct basis sifting calculation.
- `POST /api/v1/security/xor`: Direct bitwise XOR mismatch calculation.
- `POST /api/v1/security/qber`: Direct QBER calculation.
- `POST /api/v1/security/threshold`: Direct Hoeffding threshold calculation.
- `POST /api/v1/security/chsh`: Direct CHSH Bell score evaluation.
- `POST /api/v1/security/decoy`: Direct decoy state yield analysis.
- `POST /api/v1/security/analyze`: Full security transaction pipeline.
- `POST /api/v1/security/mock`: Executes synthetic scenario simulation.
- `GET /api/v1/security/health`: Engine health status.
- `GET /api/v1/security/config`: Active threshold configuration parameters.

### G. Sessions & Telemetry Router (`backend/app/api/sessions.py`)
- `GET /api/v1/sessions`: Lists active quantum sessions.
- `DELETE /api/v1/sessions/{session_id}`: Closes session.
- `GET /api/v1/telemetry`: Retrieves performance telemetry ring-buffer entries.

---

## 3. CORS & Telemetry Middleware

- **CORS Configuration**: Configured in `backend/app/core/config.py` to allow origins from React/Vite development ports (`3000`, `5173`, `5174`, `8000`).
- **Telemetry Middleware**: Intercepts every API call, injects `X-Request-ID` header, measures execution latency in milliseconds via `time.perf_counter()`, logs into PostgreSQL `telemetry_logs` table and populates bounded ring buffer `telemetry_store`.

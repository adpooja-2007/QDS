# Feature 06: Comprehensive Testing & Verification Suite

> **Location**: `backend/tests/`, `backend/scripts/`  
> **Total Test Cases**: 83 Passed (100% Pass Rate)

---

## 1. Overview & Test Coverage

The test suite consists of **83 unit and integration tests** verifying quantum circuit simulation (Module 1), non-AI threat engine calculations (Module 2), FastAPI REST routes, and PostgreSQL persistence (Module 3).

```text
============================= 83 passed in 17.51s =============================
```

---

## 2. Test Directory Breakdown

### A. Module 1 Quantum Core Tests (`backend/tests/quantum/`) — 20 Tests
- `test_epr.py`: Verifies EPR Bell pair $\lvert \Phi^+ \rangle$ creation & statevector entanglement.
- `test_state_preparation.py`: Tests Alice signature state mapping for bases $Z$ and $X$.
- `test_bell_measurement.py`: Tests Joint Bell Measurement outcome probabilities.
- `test_correction.py`: Tests Bob Pauli unitary corrections ($\sigma = X^{M_{a2}} Z^{M_{a1}}$).
- `test_measurement.py`: Tests randomized projective measurement logic.
- `test_sifting.py`: Tests basis reconciliation and matched key extraction.
- `test_teleportation.py`: Verifies quantum teleportation state fidelity.
- `test_service.py`: Tests high-level `QuantumService` lifecycle.

### B. Module 2 Threat Engine Tests (`backend/tests/engine/`) — 36 Tests
- `test_xor.py`: Tests bitwise mismatch calculation algorithms.
- `test_qber.py`: Tests QBER metric calculations & zero-bit edge cases.
- `test_hoeffding.py`: Tests Hoeffding statistical threshold bound $\Delta = \sqrt{\frac{\ln(1/\alpha)}{2N}}$.
- `test_chsh.py`: Tests CHSH Bell inequality score classification ($S \ge 2.4$, $2.0 \le S < 2.4$, $S < 2.0$).
- `test_decoy.py`: Tests signal vs decoy state error discrepancy checks.
- `test_classifier.py`: Tests threat categorization logic.
- `test_decision.py`: Tests deterministic decision gate (`ACCEPT` / `REJECT`).
- `test_validation.py`: Tests Pydantic input schema validation.
- `test_pipeline.py`: Tests full threat engine transaction orchestrator.

### C. Module 3 API & Database Tests (`backend/tests/test_*.py`) — 27 Tests
- `test_arbitrator.py`: Tests `/api/v1/arbitrator` EPR distribution & session reset.
- `test_alice.py`: Tests `/api/v1/alice` document signing & signature extraction.
- `test_bob.py`: Tests `/api/v1/bob` verification & sifting endpoints.
- `test_security.py`: Tests `/api/v1/security` audit endpoints & threat information responses.
- `test_attacks.py`: Tests `/api/v1/attacks` red-team attack injections (MitM, Forgery, Replay, Noise, PNS).
- `test_sessions.py`: Tests `/api/v1/sessions` session CRUD, telemetry ring-buffer, and PostgreSQL database hydration.

---

## 3. Test Execution & Verification Commands

### Run Full Test Suite
```powershell
.\.venv\Scripts\pytest.exe backend/tests
```

### Run Cross-Module Verification Script
```powershell
.\.venv\Scripts\python.exe backend/scripts/verify_all_modules.py
```

### Run Standalone Threat Engine Demo Script
```powershell
.\.venv\Scripts\python.exe backend/scripts/run_threat_engine_demo.py
```

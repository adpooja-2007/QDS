# Module 2 — Deterministic Statistical Threat Detection Engine

## Overview
Module 2 is the mathematical security judge for the Quantum Key Distribution (QKD) system. It receives quantum measurement and channel telemetry from Alice and Bob (or Module 1/Module 4 simulators) and deterministically evaluates whether the key transmission channel is secure (`ACCEPT`) or compromised (`REJECT`).

It is completely decoupled from Qiskit and the UI, stateless, pure Python/NumPy based, and exposes a REST API via FastAPI for team integration.

---

## 1. Feature Coverage List (M2-F01 to M2-F25)

| ID | Feature | Implementation File | Status |
|---|---|---|---|
| **M2-F01** | Input Validation | `app/engine/validation.py` | Complete |
| **M2-F02** | Basis Reconciliation | `app/engine/sifting.py` | Complete |
| **M2-F03** | Base Sifting | `app/engine/sifting.py` | Complete |
| **M2-F04** | XOR Match Evaluation | `app/engine/xor_evaluator.py` | Complete |
| **M2-F05** | Mismatch Counter | `app/engine/xor_evaluator.py` | Complete |
| **M2-F06** | QBER Calculator | `app/engine/qber.py` | Complete |
| **M2-F07** | Baseline Noise Model | `app/engine/qber.py` | Complete |
| **M2-F08** | Hoeffding Bound Calculator | `app/engine/hoeffding.py` | Complete |
| **M2-F09** | Security Threshold Calculator | `app/engine/hoeffding.py` | Complete |
| **M2-F10** | QBER-vs-Threshold Evaluation | `app/engine/orchestrator.py` | Complete |
| **M2-F11** | CHSH Evaluation | `app/engine/chsh.py` | Complete |
| **M2-F12** | Decoy-State Statistics | `app/engine/decoy.py` | Complete |
| **M2-F13** | Attack Classification | `app/engine/classifier.py` | Complete |
| **M2-F14** | Deterministic Decision Gate | `app/engine/decision.py` | Complete |
| **M2-F15** | Confidence/Statistics Report | `app/engine/audit.py` | Complete |
| **M2-F16** | Block-Level Analysis | `app/engine/orchestrator.py` | Complete |
| **M2-F17** | Session-Level Analysis | `app/engine/orchestrator.py` | Complete |
| **M2-F18** | Attack Comparison | `app/engine/classifier.py` | Complete |
| **M2-F19** | Security Audit | `app/engine/audit.py` | Complete |
| **M2-F20** | Mock Data Engine | `app/mock/generator.py` | Complete |
| **M2-F21** | REST API | `app/api/routes.py` | Complete |
| **M2-F22** | Unit Test Suite | `tests/` | Complete (36 tests) |
| **M2-F23** | Deterministic Reproducibility | `app/engine/orchestrator.py` | Complete |
| **M2-F24** | Performance Metrics | `app/engine/orchestrator.py` | Complete |
| **M2-F25** | Dashboard Adapter | `app/engine/audit.py` | Complete |

---

## 2. Directory Architecture

```
MODULE2/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application entry point
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py             # Global constants & security parameters
│   ├── models/
│   │   ├── __init__.py
│   │   ├── enums.py                # Enums (Basis, AttackType, SecurityDecision, etc.)
│   │   ├── input_models.py         # Request Pydantic schemas
│   │   └── output_models.py        # Response Pydantic schemas
│   ├── engine/
│   │   ├── __init__.py
│   │   ├── constants.py            # Physical limits and bounds
│   │   ├── exceptions.py           # Domain exceptions
│   │   ├── validation.py           # Feature M2-F01
│   │   ├── sifting.py              # Features M2-F02, M2-F03
│   │   ├── xor_evaluator.py        # Features M2-F04, M2-F05
│   │   ├── qber.py                 # Features M2-F06, M2-F07
│   │   ├── hoeffding.py            # Features M2-F08, M2-F09
│   │   ├── chsh.py                 # Feature M2-F11
│   │   ├── decoy.py                # Feature M2-F12
│   │   ├── classifier.py           # Features M2-F13, M2-F18
│   │   ├── decision.py             # Feature M2-F14
│   │   ├── audit.py                # Features M2-F15, M2-F19, M2-F25
│   │   └── orchestrator.py         # Features M2-F10, M2-F16, M2-F17, M2-F23, M2-F24
│   ├── mock/
│   │   ├── __init__.py
│   │   ├── generator.py            # Stochastic & deterministic mock data generator
│   │   ├── scenarios.py            # Scenario dataset builder
│   │   └── datasets/               # JSON dataset files (normal, mitm, noise, etc.)
│   └── api/
│       ├── __init__.py
│       └── routes.py               # REST API endpoints
├── scripts/
│   └── run_threat_engine_demo.py   # CLI demonstration script
├── tests/
│   ├── test_validation.py
│   ├── test_sifting.py
│   ├── test_xor.py
│   ├── test_qber.py
│   ├── test_hoeffding.py
│   ├── test_chsh.py
│   ├── test_decoy.py
│   ├── test_classifier.py
│   ├── test_decision.py
│   └── test_pipeline.py
├── pyproject.toml
├── requirements.txt
└── README.md
```

---

## 3. Mathematical Formulas

### Sifting & Reconciliation
Matching positions are identified where $A_{\text{basis}} == B_{\text{basis}}$.
$$\text{Sifting Ratio} = \frac{\text{matching\_bits}}{\text{total\_bits}}$$

### Quantum Bit Error Rate (QBER)
$$M_i = A_i \oplus B_i$$
$$\text{QBER} = \frac{\sum M_i}{N_{\text{sifted}}}$$

### Hoeffding Bound & Security Threshold
Solving the one-sided Bernoulli tail probability $P(\hat{e} - e_0 \ge \Delta) \le \alpha$:
$$\Delta = \sqrt{\frac{\ln(1/\alpha)}{2 N_{\text{sifted}}}}$$
$$\text{Threshold } T = \min(1.0, e_0 + \Delta)$$

### CHSH Entanglement Bound
Classical limit $S \le 2.0$, Quantum limit $S \le 2\sqrt{2} \approx 2.8284$.
- $S \ge 2.4$: `STRONG_ENTANGLEMENT` (Pass)
- $2.0 \le S < 2.4$: `WEAK_ENTANGLEMENT` (Pass)
- $S < 2.0$: `BELL_TEST_FAILED` (Fail / Entanglement Test Failed)

### Deterministic Decision Gate
$$\text{Decision} = (\text{QBER} \le T) \land \text{CHSH\_PASS}$$

---

## 4. API Endpoints

FastAPI server runs at `http://localhost:8000`. Interactive docs available at `http://localhost:8000/docs`.

- `GET /api/v1/security/health`: Health status.
- `GET /api/v1/security/config`: Active thresholds.
- `POST /api/v1/security/sift`: Basis reconciliation.
- `POST /api/v1/security/xor`: XOR error comparison.
- `POST /api/v1/security/qber`: QBER calculation.
- `POST /api/v1/security/threshold`: Hoeffding threshold calculation.
- `POST /api/v1/security/chsh`: CHSH score evaluation.
- `POST /api/v1/security/decoy`: Decoy-state statistics evaluation.
- `POST /api/v1/security/analyze`: Full end-to-end security pipeline execution.
- `POST /api/v1/security/audit`: Security audit report.
- `POST /api/v1/security/mock`: Generate and evaluate mock scenario.

---

## 5. Quick Start & Running Locally

### Install Dependencies
```powershell
pip install -r requirements.txt
```

### Run Unit Tests
```powershell
python -m pytest
```

### Run Demonstration CLI
```powershell
python -m scripts.run_threat_engine_demo --scenario mitm
python -m scripts.run_threat_engine_demo --scenario normal
```

### Run Web Server
```powershell
uvicorn app.main:app --reload --port 8000
```

---

## 6. Team Integration Contracts

### Module 1 → Module 2
Module 1 passes `SecurityAnalysisRequest` containing Alice/Bob measurement telemetry (`bits`, `bases`) and `chsh.correlation_score`.

### Module 2 → Module 5
Module 5 (SOC Dashboard) consumes `SecurityAuditResponse` containing:
- `decision.decision`: `ACCEPT` or `REJECT`
- `qber_analysis.qber`: Observed QBER
- `threshold_analysis.threshold`: Calculated threshold
- `chsh_analysis.score`: CHSH score
- `diagnostics.classification`: Diagnostic attack classification
- `decision.reason_codes`: Standardized reason codes

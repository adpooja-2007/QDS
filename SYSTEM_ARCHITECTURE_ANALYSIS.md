# Comprehensive System Architecture & Deep-Dive Technical Analysis
## Quantum-Inspired Cyber Threat Detection for Digital Signature Security (SIH 2026 — PS 26141)

---

# 1. Executive Summary

This document provides a complete technical analysis of the **Quantum-Inspired Cyber Threat Detection System for Digital Signature Security**. Built for SIH 2026 (Problem Statement 26141), the system integrates quantum-simulation protocols, deterministic statistical threat analysis, red-team attack sandboxing, a distributed FastAPI REST microservices architecture, local PostgreSQL persistent storage, and a real-time React SOC dashboard.

---

# 2. High-Level System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            REACT SOC DASHBOARD                              │
│                            (Frontend Module 5)                              │
│                                                                             │
│ [QBER / Noise Charts] [CHSH Gauge] [Node Topology] [Red-Team Sandbox]       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST / JSON (CORS Enabled)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FASTAPI DISTRIBUTED API                             │
│                            (Backend Module 3)                               │
│                                                                             │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐ │
│ │ Arbitrator    │ │ Alice Signer  │ │ Bob Verifier  │ │ Security & Attack │ │
│ └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └─────────┬─────────┘ │
└─────────┼─────────────────┼─────────────────┼───────────────────┼───────────┘
          │                 │                 │                   │
          ▼                 ▼                 ▼                   ▼
┌──────────────────┐ ┌──────────────┐ ┌───────────────┐ ┌───────────────────┐
│ QUANTUM CORE     │ │ THREAT ENGINE│ │ ATTACK ENGINE │ │ POSTGRESQL DB     │
│ (Module 1)       │ │ (Module 2)   │ │ (Module 4)    │ │ Persistence       │
│                  │ │              │ │               │ │                   │
│ • EPR Generation │ │ • XOR Error  │ │ • Intercept   │ │ • quantum_sessions│
│ • Bell Measurement││ • QBER Calc  │ │   Resend      │ │ • telemetry_logs  │
│ • Pauli Correct  │ │ • Hoeffding  │ │ • Forgery     │ │                   │
│ • Basis Sifting  │ │ • CHSH Test  │ │ • Replay/PNS  │ │                   │
└──────────────────┘ └──────────────┘ └───────────────┘ └───────────────────┘
```

---

# 3. Quantum Protocol Lifecycle

The system simulates a **Quantum Teleportation-based Quantum Digital Signature (QDS)** workflow:

1. **EPR Pair Distribution (Arbitrator Node)**:
   - Entangled Bell pairs $\lvert \Phi^+ \rangle = \frac{1}{\sqrt{2}} (\lvert 00 \rangle + \lvert 11 \rangle)$ are generated and distributed between Alice and Bob.

2. **Alice's State Preparation & Bell Measurement**:
   - Alice binds the document hash digest $H(d)$ into quantum state $\lvert \psi_A \rangle$.
   - Alice performs joint Bell State Measurement (BSM) on her state and her half of the EPR pair, collapsing her qubits and obtaining classical outcome bits $(M_{a1}, M_{a2}) \in \{0,1\}^2$.

3. **Classical Feed-Forward & Bob's Pauli Correction**:
   - Alice sends classical feed-forward bits $(M_{a1}, M_{a2})$ to Bob across the public network.
   - Bob applies Pauli unitary transformation $\sigma = X^{M_{a2}} Z^{M_{a1}}$ to restore state $\lvert \psi_B \rangle$.

4. **Randomized Measurement & Basis Reconciliation (Sifting)**:
   - Bob measures qubits in randomly selected bases ($Z$ or $X$).
   - Alice and Bob reconcile bases over a public channel, keeping only matching-basis positions.

5. **QBER & Threat Analysis**:
   - The Threat Engine compares sifted bitstrings and evaluates Quantum Bit Error Rate (QBER):
     $$\text{QBER} = \frac{\sum_{i=1}^N a_i \oplus b_i}{N}$$
   - Compares QBER against statistically derived upper bound via Hoeffding's Inequality:
     $$\text{Threshold} = \text{Baseline Noise} + \sqrt{\frac{\ln(1/\alpha)}{2N}}$$

6. **CHSH Bell Test Verification**:
   - Evaluates CHSH inequality parameter $S$:
     $$S = \lvert E(A, B) - E(A, B') + E(A', B) + E(A', B') \rvert$$
   - A threshold $S > 2$ confirms quantum entanglement and rules out classical local hidden-variable eavesdropping ($S \le 2$).

---

# 4. Database Architecture & Persistence Layer

The backend uses **SQLAlchemy 2.0** ORM with an in-memory write-through cache backed by **PostgreSQL 18.3**.

### Table 1: `quantum_sessions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `session_id` | `VARCHAR(64)` | `PRIMARY KEY, INDEX` | Format: `QKD-{YYYYMMDD}-{counter:04d}` |
| `status` | `VARCHAR(32)` | `INDEX` | State: `CREATED`, `EPR_READY`, `SIGNED`, `VERIFIED`, `SIFTED`, `ANALYZED`, `CLOSED` |
| `nonce` | `VARCHAR(64)` | — | Cryptographic UUID4 for replay protection |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT utc_now()` | Session creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT utc_now()` | Last modification timestamp |
| `parameters` | `JSON` | — | Session parameters (`num_pairs`, `baseline_noise`, `alpha`) |
| `alice` | `JSON` | — | Alice state preparation & Bell measurement results |
| `bob` | `JSON` | — | Bob Pauli corrections & basis measurement results |
| `sifting` | `JSON` | — | Matching key length, raw QBER, sifted bits |
| `attacks` | `JSON` | — | List of injected attack records |
| `security` | `JSON` | — | Final security verdict, Hoeffding bound, CHSH score |

### Table 2: `telemetry_logs`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY, AUTOINCREMENT` | Telemetry log ID |
| `request_id` | `VARCHAR(64)` | `INDEX` | Unique UUID4 request trace ID |
| `endpoint` | `VARCHAR(256)` | `INDEX` | HTTP request path |
| `method` | `VARCHAR(16)` | — | HTTP method (`GET`, `POST`, `DELETE`) |
| `timestamp` | `VARCHAR(64)` | — | ISO 8601 execution timestamp |
| `execution_time_ms` | `FLOAT` | — | Endpoint latency in milliseconds |
| `status_code` | `INTEGER` | — | HTTP status code (200, 400, 404, 500) |
| `session_id` | `VARCHAR(64)` | `NULLABLE, INDEX` | Associated session ID |
| `error` | `TEXT` | `NULLABLE` | Exception message or error description |

---

# 5. Verification & Test Suite Summary

- **Total Test Cases**: 27
- **Test Modules**:
  - `test_alice.py`: Signature state creation, Bell measurement output.
  - `test_arbitrator.py`: EPR pair generation, session management, reset.
  - `test_attacks.py`: MitM, Forgery, Replay, Noise, PNS attack injection.
  - `test_bob.py`: Pauli correction, basis measurement, sifting.
  - `test_security.py`: QBER evaluation, Hoeffding threshold, CHSH score, decision logic.
  - `test_sessions.py`: Session CRUD lifecycle, database hydration, telemetry endpoints.
- **Pass Rate**: 100% (27/27 passed in 17.56s).

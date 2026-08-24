# Quantum-Inspired Cyber Threat Detection for Digital Signature Security
## SIH 2026 — Problem Statement 26141
### Master Engineering Specification, API Contract, Database Schema, Mock Contract & Team Handoff

> **Purpose of this document**
>
> This is the single source of truth for the development team and for AI coding agents such as Antigravity. Every developer should be able to work independently using the contracts, schemas, mock data, endpoint definitions, and acceptance criteria in this document. Real implementations must preserve these contracts.

---

# 1. Project Identity

**Project:** Quantum-Inspired Cyber Threat Detection for Digital Signature Security  
**SIH:** Smart India Hackathon 2026  
**Problem Statement ID:** 26141  
**Sponsor:** Egreen Quanta

## 1.1 Product Goal

Build a production-style working prototype that demonstrates how quantum-inspired/quantum-simulation techniques can be combined with deterministic statistical security checks to detect tampering against a digital-signature verification workflow.

The prototype simulates:

1. Entangled EPR-pair distribution.
2. Alice's signature-state preparation.
3. Quantum teleportation using Bell measurement and classical feed-forward.
4. Bob's Pauli correction and measurement.
5. Basis reconciliation and sifting.
6. QBER calculation.
7. Statistical threshold calculation.
8. CHSH correlation testing.
9. Deterministic security decisions.
10. Active attack injection.
11. Real-time SOC visualization.

The system is a **simulation/prototype**, not a claim of operating a physical quantum network.

---

# 2. Core Architecture

```text
                           ┌────────────────────────────┐
                           │       REACT SOC             │
                           │       MODULE 5              │
                           │                            │
                           │ Dashboard                  │
                           │ QBER / Threshold Charts   │
                           │ CHSH Gauge                 │
                           │ Attack Controls            │
                           │ Network Flow               │
                           │ Node Console               │
                           │ Security Alarm             │
                           └─────────────┬──────────────┘
                                         │
                                  REST / JSON
                                         │
                                         ▼
                    ┌──────────────────────────────────────┐
                    │             FASTAPI                  │
                    │             MODULE 3                 │
                    │                                      │
                    │ API Routers                           │
                    │ Session Orchestrator                  │
                    │ Pydantic Validation                   │
                    │ Database                              │
                    │ Telemetry Middleware                  │
                    │ Mock/Real Service Switching           │
                    └──────────┬──────────┬─────────┬───────┘
                               │          │         │
                               ▼          ▼         ▼
                     ┌─────────────┐ ┌────────┐ ┌─────────────┐
                     │ MODULE 1    │ │MODULE 2│ │ MODULE 4   │
                     │ QUANTUM     │ │THREAT  │ │ ATTACK     │
                     │ CORE        │ │ENGINE  │ │ ENGINE     │
                     │             │ │        │ │            │
                     │ EPR         │ │ XOR    │ │ MITM       │
                     │ Alice       │ │ QBER   │ │ Forgery    │
                     │ Teleport    │ │ Bound   │ │ Replay     │
                     │ Bell        │ │ CHSH   │ │ Noise      │
                     │ Correction  │ │ Decision│ │ PNS        │
                     │ Measurement │ │ Decoy  │ │            │
                     │ Sifting     │ │        │ │            │
                     └──────┬──────┘ └───┬────┘ └──────┬─────┘
                            │            │             │
                            └────────────┼─────────────┘
                                         ▼
                              ┌────────────────────┐
                              │     POSTGRESQL     │
                              │                    │
                              │ Sessions           │
                              │ Documents          │
                              │ EPR resources      │
                              │ Alice states       │
                              │ Bell measurements  │
                              │ Bob measurements   │
                              │ Sifting            │
                              │ Security audits    │
                              │ CHSH                │
                              │ Attacks            │
                              │ Noise              │
                              │ Events             │
                              │ Telemetry          │
                              └────────────────────┘
```

## 2.1 Architectural Rule

**FastAPI is the orchestration/integration boundary.**

Modules must not create undocumented dependencies on each other.

- Module 1 does not know about React.
- Module 2 does not know about Qiskit implementation details.
- Module 4 does not manipulate the frontend.
- Module 5 does not calculate security metrics.
- Module 3 coordinates the modules and owns the HTTP API.

---

# 3. Modules and Ownership

## Module 1 — Quantum Simulation Core

### Owns

- EPR/Bell state generation.
- Alice state preparation.
- Bell measurement.
- Classical feed-forward extraction.
- Bob Pauli correction.
- Randomized projective measurement.
- Basis reconciliation/sifting.
- Qiskit/Aer implementation.

### Main package

```text
backend/app/quantum/
```

### Required service interface

```python
QuantumService.generate_epr(...)
QuantumService.prepare_signature(...)
QuantumService.run_bell_measurement(...)
QuantumService.apply_correction(...)
QuantumService.measure(...)
QuantumService.sift(...)
```

---

## Module 2 — Deterministic Threat Engine

### Owns

- XOR comparison.
- Error count.
- QBER.
- Statistical threshold.
- CHSH correlation evaluation.
- Decoy-state statistics.
- Final deterministic decision.

### Main package

```text
backend/app/threat/
```

### Required service interface

```python
ThreatService.calculate_xor(...)
ThreatService.calculate_qber(...)
ThreatService.calculate_threshold(...)
ThreatService.calculate_chsh(...)
ThreatService.calculate_decoy_statistics(...)
ThreatService.run_audit(...)
```

---

## Module 3 — FastAPI / Integration

### Owns

- API routes.
- Pydantic request/response schemas.
- Session lifecycle.
- Database.
- Service orchestration.
- Error handling.
- Telemetry middleware.
- Swagger/OpenAPI.
- Mock/real implementation switching.

### Main packages

```text
backend/app/api/
backend/app/services/
backend/app/models/
backend/app/schemas/
backend/app/core/
```

---

## Module 4 — Adversary Attack Engine

### Owns

- Intercept-resend.
- Classical feed-forward forgery.
- Replay.
- Physical channel noise.
- Photon-number-splitting statistical model.
- Attack metadata and affected-qubit tracking.

### Main package

```text
backend/app/attacks/
```

### Required service interface

```python
AttackService.intercept_resend(...)
AttackService.forge(...)
AttackService.replay(...)
AttackService.inject_noise(...)
AttackService.pns(...)
```

---

## Module 5 — React Cyber-SOC

### Owns

- Dashboard.
- Real-time metrics.
- Charts.
- Attack console.
- Network flow visualization.
- Node console.
- Security alarms.
- API client.

### Main package

```text
frontend/src/
```

---

# 4. Technology Contract

| Layer | Technology |
|---|---|
| Frontend | React 18+ |
| Build | Vite |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Charts | Recharts |
| Backend | FastAPI |
| Server | Uvicorn |
| Validation | Pydantic v2 |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2 |
| Migrations | Alembic |
| Quantum | Qiskit 1.x-compatible implementation |
| Simulator | Qiskit Aer |
| Numerical | NumPy |
| Statistics | SciPy |
| Hashing | Python hashlib |
| Testing | pytest + httpx |
| API documentation | FastAPI Swagger/OpenAPI |

---

# 5. Repository Structure

```text
quantum-signature-security/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── health.py
│   │   │       ├── sessions.py
│   │   │       ├── arbitrator.py
│   │   │       ├── alice.py
│   │   │       ├── bob.py
│   │   │       ├── quantum.py
│   │   │       ├── security.py
│   │   │       ├── attacks.py
│   │   │       └── telemetry.py
│   │   │
│   │   ├── quantum/
│   │   │   ├── epr.py
│   │   │   ├── state_preparation.py
│   │   │   ├── teleportation.py
│   │   │   ├── bell_measurement.py
│   │   │   ├── correction.py
│   │   │   ├── measurement.py
│   │   │   ├── sifting.py
│   │   │   └── service.py
│   │   │
│   │   ├── threat/
│   │   │   ├── xor.py
│   │   │   ├── qber.py
│   │   │   ├── threshold.py
│   │   │   ├── chsh.py
│   │   │   ├── decoy.py
│   │   │   ├── decision.py
│   │   │   └── service.py
│   │   │
│   │   ├── attacks/
│   │   │   ├── base.py
│   │   │   ├── intercept_resend.py
│   │   │   ├── forgery.py
│   │   │   ├── replay.py
│   │   │   ├── noise.py
│   │   │   ├── pns.py
│   │   │   └── service.py
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── mocks/
│   │   └── core/
│   │
│   ├── migrations/
│   ├── tests/
│   ├── seed/
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── charts/
│       ├── attacks/
│       ├── network/
│       ├── telemetry/
│       ├── hooks/
│       └── types/
│
├── docs/
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# 6. Shared Conventions

These values are frozen.

## 6.1 Bases

Only:

```text
Z
X
```

## 6.2 Bits

Only:

```text
0
1
```

## 6.3 Bell result

A two-character string:

```text
b1b2
```

Examples:

```text
00
01
10
11
```

## 6.4 Correction mapping

Use the project's explicitly defined teleportation convention consistently.

For the default contract:

```text
00 → I
01 → X
10 → Z
11 → Y
```

If the circuit implementation uses a different bit ordering, the implementation must normalize its result to this public contract before returning it.

## 6.5 Attack enum

```text
INTERCEPT_RESEND
FORGERY
REPLAY
PHYSICAL_NOISE
PNS
```

## 6.6 Node enum

```text
ALICE
BOB
ARBITRATOR
EVE
SECURITY_ENGINE
QUANTUM_ENGINE
SYSTEM
```

## 6.7 Decision enum

```text
ACCEPT
REJECT
FLAG
```

---

# 7. Session Lifecycle

```text
CREATED
   │
   ▼
EPR_READY
   │
   ▼
SIGNED
   │
   ▼
VERIFIED
   │
   ▼
SIFTED
   │
   ▼
AUDITED
   │
   ├──────────────┐
   ▼              ▼
ACCEPTED        REJECTED
   │              │
   └──────┬───────┘
          ▼
        CLOSED
```

An active attack may be attached to a session between EPR creation and audit.

---

# 8. PostgreSQL Database Schema

Use one PostgreSQL database.

Suggested database:

```text
quantum_security
```

## 8.1 `sessions`

Central session table.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| session_id | VARCHAR(64) | UNIQUE NOT NULL |
| status | VARCHAR(32) | NOT NULL |
| protocol_version | VARCHAR(32) | NOT NULL |
| num_pairs | INTEGER | NOT NULL |
| key_length | INTEGER | NOT NULL |
| baseline_qber | DOUBLE | NOT NULL |
| alpha | DOUBLE | NOT NULL |
| attack_enabled | BOOLEAN | NOT NULL DEFAULT FALSE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| closed_at | TIMESTAMP | NULL |

---

## 8.2 `documents`

Stores document metadata and hash, not necessarily the document itself.

| Column | Type |
|---|---|
| id | UUID PK |
| session_id | UUID FK |
| document_name | VARCHAR |
| hash_algorithm | VARCHAR |
| document_hash | VARCHAR |
| document_size | BIGINT NULL |
| created_at | TIMESTAMP |

---

## 8.3 `epr_sessions`

| Column | Type |
|---|---|
| id | UUID PK |
| session_id | UUID FK |
| pair_count | INTEGER |
| state_type | VARCHAR |
| generator | VARCHAR |
| simulator | VARCHAR |
| status | VARCHAR |
| created_at | TIMESTAMP |

Default state:

```text
PHI_PLUS
```

---

## 8.4 `epr_pairs`

| Column | Type |
|---|---|
| id | UUID PK |
| epr_session_id | UUID FK |
| pair_index | INTEGER |
| alice_qubit | INTEGER |
| bob_qubit | INTEGER |
| state_label | VARCHAR |
| status | VARCHAR |
| attack_affected | BOOLEAN |

`pair_index` is the stable index used across quantum, attack, measurement, sifting and telemetry records.

---

## 8.5 `signatures`

| Column | Type |
|---|---|
| id | UUID PK |
| session_id | UUID FK |
| document_id | UUID FK |
| signature_id | VARCHAR UNIQUE |
| source_hash | VARCHAR |
| bit_length | INTEGER |
| status | VARCHAR |
| created_at | TIMESTAMP |

---

## 8.6 `alice_states`

| Column | Type |
|---|---|
| id | UUID PK |
| signature_id | UUID FK |
| pair_index | INTEGER |
| private_bit | SMALLINT |
| basis | CHAR(1) |
| state_label | VARCHAR |
| preparation_gate | VARCHAR |
| created_at | TIMESTAMP |

Valid `basis`:

```text
X
Z
```

Valid `private_bit`:

```text
0
1
```

---

## 8.7 `bell_measurements`

| Column | Type |
|---|---|
| id | UUID PK |
| signature_id | UUID FK |
| pair_index | INTEGER |
| bell_bit_1 | SMALLINT |
| bell_bit_2 | SMALLINT |
| bell_result | CHAR(2) |
| correction_required | VARCHAR |
| created_at | TIMESTAMP |

---

## 8.8 `bob_measurements`

| Column | Type |
|---|---|
| id | UUID PK |
| session_id | UUID FK |
| pair_index | INTEGER |
| correction | VARCHAR |
| measurement_basis | CHAR(1) |
| measurement_result | SMALLINT |
| expected_bit | SMALLINT NULL |
| is_match | BOOLEAN NULL |
| created_at | TIMESTAMP |

---

## 8.9 `sifting_results`

| Column | Type |
|---|---|
| id | UUID PK |
| session_id | UUID FK |
| pair_index | INTEGER |
| alice_basis | CHAR(1) |
| bob_basis | CHAR(1) |
| basis_match | BOOLEAN |
| alice_bit | SMALLINT |
| bob_bit | SMALLINT |
| kept | BOOLEAN |
| created_at | TIMESTAMP |

---

## 8.10 `security_audits`

| Column | Type |
|---|---|
| id | UUID PK |
| session_id | UUID FK |
| sifted_count | INTEGER |
| error_count | INTEGER |
| qber | DOUBLE |
| baseline_qber | DOUBLE |
| alpha | DOUBLE |
| delta | DOUBLE |
| threshold | DOUBLE |
| chsh_score | DOUBLE NULL |
| qber_pass | BOOLEAN |
| chsh_pass | BOOLEAN |
| session_valid | BOOLEAN |
| attack_detected | BOOLEAN |
| attack_type | VARCHAR NULL |
| decision | VARCHAR |
| decision_reason | TEXT |
| created_at | TIMESTAMP |

---

## 8.11 `chsh_measurements`

| Column | Type |
|---|---|
| id | UUID PK |
| session_id | UUID FK |
| setting_a | VARCHAR |
| setting_b | VARCHAR |
| correlation | DOUBLE |
| sample_count | INTEGER |
| created_at | TIMESTAMP |

Store the underlying correlation values, not only final `S`.

---

## 8.12 `attacks`

| Column | Type |
|---|---|
| id | UUID PK |
| session_id | UUID FK |
| attack_id | VARCHAR UNIQUE |
| attack_type | VARCHAR |
| attack_fraction | DOUBLE |
| intensity | DOUBLE NULL |
| status | VARCHAR |
| affected_count | INTEGER |
| parameters | JSONB |
| started_at | TIMESTAMP |
| finished_at | TIMESTAMP NULL |

`attack_fraction` must satisfy:

```text
0.0 <= attack_fraction <= 1.0
```

---

## 8.13 `attack_events`

| Column | Type |
|---|---|
| id | UUID PK |
| attack_id | UUID FK |
| pair_index | INTEGER NULL |
| event_type | VARCHAR |
| original_value | JSONB |
| modified_value | JSONB |
| description | TEXT |
| created_at | TIMESTAMP |

---

## 8.14 `channel_noise`

| Column | Type |
|---|---|
| id | UUID PK |
| session_id | UUID FK |
| noise_model | VARCHAR |
| probability | DOUBLE |
| affected_count | INTEGER |
| parameters | JSONB |
| created_at | TIMESTAMP |

Supported prototype models:

```text
DEPOLARIZING
BIT_FLIP
PHASE_FLIP
AMPLITUDE_DAMPING
PHASE_DAMPING
```

---

## 8.15 `decoy_statistics`

| Column | Type |
|---|---|
| id | UUID PK |
| session_id | UUID FK |
| pulse_class | VARCHAR |
| intensity | DOUBLE |
| pulse_count | INTEGER |
| detection_count | INTEGER |
| error_count | INTEGER |
| observed_error_rate | DOUBLE |
| created_at | TIMESTAMP |

Pulse classes:

```text
SIGNAL
DECOY
VACUUM
```

---

## 8.16 `replay_records`

| Column | Type |
|---|---|
| id | UUID PK |
| session_id | UUID FK |
| transaction_id | VARCHAR |
| nonce_hash | VARCHAR |
| signature_id | VARCHAR |
| created_at | TIMESTAMP |
| expires_at | TIMESTAMP |
| used | BOOLEAN |

---

## 8.17 `protocol_events`

SOC event stream.

| Column | Type |
|---|---|
| id | UUID PK |
| session_id | UUID FK |
| node | VARCHAR |
| event_type | VARCHAR |
| message | TEXT |
| metadata | JSONB |
| created_at | TIMESTAMP |

---

## 8.18 `telemetry`

| Column | Type |
|---|---|
| id | UUID PK |
| session_id | UUID FK |
| module | VARCHAR |
| component | VARCHAR |
| operation | VARCHAR |
| duration_ms | DOUBLE |
| status | VARCHAR |
| metadata | JSONB |
| created_at | TIMESTAMP |

---

## 8.19 `system_nodes`

| Column | Type |
|---|---|
| id | UUID PK |
| node_name | VARCHAR UNIQUE |
| node_type | VARCHAR |
| status | VARCHAR |
| last_heartbeat | TIMESTAMP |
| version | VARCHAR |

Seed nodes:

```text
ALICE
BOB
ARBITRATOR
EVE
SECURITY_ENGINE
QUANTUM_ENGINE
```

---

# 9. Database Relationship Model

```text
sessions
│
├── documents
│
├── epr_sessions
│     └── epr_pairs
│
├── signatures
│     ├── alice_states
│     └── bell_measurements
│
├── bob_measurements
│
├── sifting_results
│
├── security_audits
│     └── chsh_measurements
│
├── attacks
│     └── attack_events
│
├── channel_noise
├── decoy_statistics
├── replay_records
├── protocol_events
└── telemetry
```

---

# 10. REST API Contract

Base path:

```text
/api/v1
```

Every endpoint returns the common response wrapper.

## 10.1 Success wrapper

```json
{
  "success": true,
  "request_id": "REQ-000001",
  "timestamp": "2026-08-24T12:30:00Z",
  "data": {}
}
```

## 10.2 Error wrapper

```json
{
  "success": false,
  "request_id": "REQ-000002",
  "timestamp": "2026-08-24T12:30:01Z",
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "The requested session does not exist."
  }
}
```

---

# 11. System Endpoints

```http
GET /api/v1/health
GET /api/v1/health/ready
GET /api/v1/nodes
```

### `GET /health`

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0"
  }
}
```

---

# 12. Session Endpoints

```http
POST   /api/v1/sessions
GET    /api/v1/sessions
GET    /api/v1/sessions/{session_id}
DELETE /api/v1/sessions/{session_id}
POST   /api/v1/sessions/{session_id}/close
POST   /api/v1/sessions/{session_id}/reset
POST   /api/v1/sessions/{session_id}/run
POST   /api/v1/sessions/{session_id}/simulate-attack
```

## Create session

### Request

```json
{
  "num_pairs": 1000,
  "key_length": 256,
  "baseline_qber": 0.02,
  "alpha": 0.000001,
  "protocol_version": "1.0"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "session_id": "QSEC-2026-000001",
    "status": "CREATED"
  }
}
```

---

# 13. Arbitrator Endpoints

```http
POST /api/v1/arbitrator/epr-distribute
GET  /api/v1/arbitrator/epr-status/{session_id}
POST /api/v1/arbitrator/chsh-sample
GET  /api/v1/arbitrator/telemetry/{session_id}
```

## EPR distribution request

```json
{
  "session_id": "QSEC-2026-000001",
  "num_pairs": 1000
}
```

## Response

```json
{
  "success": true,
  "data": {
    "session_id": "QSEC-2026-000001",
    "pair_count": 1000,
    "state_type": "PHI_PLUS",
    "status": "EPR_READY"
  }
}
```

---

# 14. Alice Endpoints

```http
POST /api/v1/alice/sign
GET  /api/v1/alice/signatures/{session_id}
GET  /api/v1/alice/states/{session_id}
GET  /api/v1/alice/bell-results/{session_id}
```

## Sign request

```json
{
  "session_id": "QSEC-2026-000001",
  "document_name": "contract.pdf",
  "document_hash": "a8f91c..."
}
```

## Sign response

```json
{
  "success": true,
  "data": {
    "session_id": "QSEC-2026-000001",
    "signature_id": "SIG-000001",
    "bit_length": 256,
    "bell_results": [
      "00",
      "10",
      "01",
      "11"
    ],
    "status": "SIGNED"
  }
}
```

---

# 15. Bob Endpoints

```http
POST /api/v1/bob/verify
POST /api/v1/bob/measure
GET  /api/v1/bob/measurements/{session_id}
GET  /api/v1/bob/corrections/{session_id}
```

## Verify request

```json
{
  "session_id": "QSEC-2026-000001"
}
```

## Response

```json
{
  "success": true,
  "data": {
    "session_id": "QSEC-2026-000001",
    "measurement_count": 256,
    "status": "VERIFIED"
  }
}
```

---

# 16. Quantum Development Endpoints

These are useful for isolated module testing.

```http
POST /api/v1/quantum/epr
POST /api/v1/quantum/prepare
POST /api/v1/quantum/teleport
POST /api/v1/quantum/correct
POST /api/v1/quantum/measure
POST /api/v1/quantum/sift
```

These endpoints expose the Module 1 operations without requiring the entire end-to-end workflow.

---

# 17. Security Endpoints

```http
POST /api/v1/security/xor
POST /api/v1/security/qber
POST /api/v1/security/threshold
POST /api/v1/security/chsh
POST /api/v1/security/decoy
POST /api/v1/security/threshold-audit
GET  /api/v1/security/report/{session_id}
```

## XOR request

```json
{
  "alice_bits": [0,1,1,0,1],
  "bob_bits":   [0,1,0,0,1]
}
```

## XOR response

```json
{
  "success": true,
  "data": {
    "mismatch_bits": [0,0,1,0,0],
    "error_count": 1,
    "total_bits": 5
  }
}
```

---

# 18. QBER Contract

QBER is:

```text
QBER = error_count / sifted_count
```

The endpoint:

```http
POST /api/v1/security/qber
```

Request:

```json
{
  "alice_bits": [0,1,1,0,1],
  "bob_bits":   [0,1,0,0,1]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "error_count": 1,
    "sifted_count": 5,
    "qber": 0.2
  }
}
```

---

# 19. Threshold Contract

Endpoint:

```http
POST /api/v1/security/threshold
```

Request:

```json
{
  "sample_size": 500,
  "baseline_qber": 0.02,
  "alpha": 0.000001
}
```

Response:

```json
{
  "success": true,
  "data": {
    "baseline_qber": 0.02,
    "alpha": 0.000001,
    "delta": 0.08,
    "threshold": 0.10
  }
}
```

### Important implementation rule

The exact finite-sample bound used by the prototype must be implemented in one function and documented in `backend/app/threat/threshold.py`.

Do not duplicate the threshold equation across frontend, API and threat modules.

The frontend only displays the returned value.

---

# 20. CHSH Contract

Endpoint:

```http
POST /api/v1/security/chsh
```

Request:

```json
{
  "correlations": {
    "E_AB": 0.71,
    "E_AB_PRIME": -0.69,
    "E_A_PRIME_B": 0.70,
    "E_A_PRIME_B_PRIME": 0.71
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "S": 2.81,
    "bell_violation": true,
    "status": "ENTANGLEMENT_CORRELATION_PRESENT"
  }
}
```

### Interpretation

The prototype may use:

```text
S > 2
```

as evidence of Bell inequality violation under the selected convention.

Do not claim that:

```text
S < 2
```

alone mathematically proves a particular attack. Noise, finite samples and implementation effects can also reduce the observed violation.

---

# 21. Full Security Audit

This is the primary security endpoint.

```http
POST /api/v1/security/threshold-audit
```

Request:

```json
{
  "session_id": "QSEC-2026-000001"
}
```

The endpoint internally performs:

```text
Retrieve session
      ↓
Retrieve sifted bits
      ↓
XOR
      ↓
QBER
      ↓
Threshold
      ↓
CHSH
      ↓
Session/replay checks
      ↓
Attack context
      ↓
Deterministic decision
```

Response:

```json
{
  "success": true,
  "data": {
    "session_id": "QSEC-2026-000001",
    "metrics": {
      "sifted_count": 500,
      "error_count": 8,
      "qber": 0.016,
      "threshold": 0.10,
      "chsh": 2.71
    },
    "checks": {
      "qber_pass": true,
      "chsh_pass": true,
      "session_valid": true
    },
    "security": {
      "attack_detected": false,
      "attack_type": null,
      "decision": "ACCEPT"
    },
    "reason": "All configured security checks passed."
  }
}
```

---

# 22. Attack Endpoints

```http
POST /api/v1/attacks/intercept-resend
POST /api/v1/attacks/forgery
POST /api/v1/attacks/replay
POST /api/v1/attacks/noise
POST /api/v1/attacks/pns

GET  /api/v1/attacks/{session_id}
GET  /api/v1/attacks/{session_id}/{attack_id}
POST /api/v1/attacks/{attack_id}/stop
```

---

# 23. Intercept-Resend

```http
POST /api/v1/attacks/intercept-resend
```

Request:

```json
{
  "session_id": "QSEC-2026-000001",
  "attack_fraction": 0.25,
  "basis_strategy": "RANDOM"
}
```

Validation:

```text
0.0 <= attack_fraction <= 1.0
```

Response:

```json
{
  "success": true,
  "data": {
    "attack_id": "ATT-000001",
    "attack_type": "INTERCEPT_RESEND",
    "attack_fraction": 0.25,
    "affected_count": 250,
    "status": "INJECTED"
  }
}
```

The attack engine should modify the simulated transmission/measurement path rather than simply setting QBER to a hard-coded value.

---

# 24. Forgery

```http
POST /api/v1/attacks/forgery
```

Request:

```json
{
  "session_id": "QSEC-2026-000001",
  "attack_fraction": 0.10
}
```

The engine modifies classical feed-forward values before Bob processes them.

It must record:

- original Bell result;
- modified Bell result;
- pair index;
- attack event;
- resulting measurement effects.

---

# 25. Replay

```http
POST /api/v1/attacks/replay
```

Request:

```json
{
  "session_id": "QSEC-2026-000002",
  "replay_session_id": "QSEC-2026-000001"
}
```

The system must reject replay when the transaction/session/nonce does not belong to the active session.

Response:

```json
{
  "success": true,
  "data": {
    "attack_type": "REPLAY",
    "replay_detected": true,
    "session_valid": false,
    "decision": "REJECT",
    "reason": "REPLAYED_TRANSACTION"
  }
}
```

---

# 26. Physical Noise

```http
POST /api/v1/attacks/noise
```

Request:

```json
{
  "session_id": "QSEC-2026-000001",
  "noise_model": "DEPOLARIZING",
  "probability": 0.02
}
```

The attack/noise module should modify the quantum simulation through Qiskit Aer noise channels where practical.

---

# 27. PNS / Decoy Model

```http
POST /api/v1/attacks/pns
```

Request:

```json
{
  "session_id": "QSEC-2026-000001",
  "intensity": 0.20
}
```

The prototype may use a mathematical Poisson/decoy model rather than full optical hardware simulation.

The result must contain enough information for the threat engine to compare signal and decoy statistics.

---

# 28. Combined Run Endpoint

For the main demo:

```http
POST /api/v1/sessions/{session_id}/run
```

This performs:

```text
EPR distribution
     ↓
Alice sign
     ↓
Bob verify
     ↓
Sifting
     ↓
Security audit
```

Response:

```json
{
  "success": true,
  "data": {
    "session_id": "QSEC-2026-000001",
    "status": "COMPLETED",
    "security": {
      "qber": 0.018,
      "threshold": 0.10,
      "chsh": 2.74,
      "decision": "ACCEPT"
    }
  }
}
```

---

# 29. Combined Attack Demo Endpoint

```http
POST /api/v1/sessions/{session_id}/simulate-attack
```

Request:

```json
{
  "attack_type": "INTERCEPT_RESEND",
  "attack_fraction": 0.25
}
```

Execution:

```text
Attack injection
      ↓
Quantum simulation
      ↓
Bob measurement
      ↓
Sifting
      ↓
Threat engine
      ↓
Security audit
```

Response:

```json
{
  "success": true,
  "data": {
    "session_id": "QSEC-2026-000001",
    "attack": {
      "type": "INTERCEPT_RESEND",
      "fraction": 0.25
    },
    "security": {
      "qber": 0.237,
      "threshold": 0.10,
      "chsh": 1.91,
      "decision": "REJECT"
    }
  }
}
```

---

# 30. Telemetry Endpoints

```http
GET /api/v1/telemetry/{session_id}
GET /api/v1/telemetry/{session_id}/timeline
GET /api/v1/events/{session_id}
GET /api/v1/events/{session_id}/stream
```

Optional later:

```http
WS /api/v1/ws/{session_id}
```

For the MVP, regular polling is acceptable.

---

# 31. Standard Error Codes

Use only these error codes unless a new code is formally added to this document.

```text
SESSION_NOT_FOUND
SESSION_EXPIRED
SESSION_ALREADY_CLOSED
INVALID_SESSION_STATE

INVALID_DOCUMENT_HASH
INVALID_BIT_SEQUENCE
INVALID_BASIS
INVALID_BELL_RESULT

EPR_NOT_READY
SIGNATURE_NOT_FOUND
MEASUREMENT_NOT_FOUND
SIFTING_NOT_COMPLETE

INVALID_ATTACK_FRACTION
ATTACK_NOT_FOUND
ATTACK_ALREADY_ACTIVE

INSUFFICIENT_SAMPLES
SECURITY_AUDIT_FAILED

REPLAY_DETECTED
INVALID_NONCE
INVALID_TRANSACTION

QUANTUM_SIMULATION_ERROR
DATABASE_ERROR
INTERNAL_ERROR
```

---

# 32. Mock Mode

Every module must support independent development.

Environment variable:

```env
MOCK_MODE=true
```

Recommended additional settings:

```env
MOCK_QUANTUM=true
MOCK_THREAT=true
MOCK_ATTACK=true
```

When mock mode is enabled, API contracts do not change.

Only the implementation behind the service interface changes.

---

# 33. Mock Service Rule

Bad:

```text
Frontend directly invents QBER.
```

Good:

```text
Frontend
   ↓
Mock API
   ↓
Mock Threat Service
   ↓
same response schema as real Threat Service
```

Bad:

```text
Attack Engine returns "QBER = 25%"
```

Good:

```text
Attack Engine modifies simulation inputs
       ↓
Quantum result changes
       ↓
Threat Engine calculates QBER
```

Mock implementations may return deterministic fixture values, but the response structure must exactly match the real implementation.

---

# 34. Canonical Mock Sessions

Everyone must use these identifiers.

```text
MOCK-QSEC-001       CLEAN
MOCK-NOISE-001      NORMAL NOISE
MOCK-MITM-001       INTERCEPT-RESEND
MOCK-FORGERY-001    CLASSICAL FORGERY
MOCK-REPLAY-001     REPLAY
MOCK-PNS-001        PNS
```

---

# 35. Canonical Clean Mock Data

```json
{
  "session_id": "MOCK-QSEC-001",
  "status": "AUDITED",
  "num_pairs": 20,
  "key_length": 8,
  "baseline_qber": 0.02,
  "alpha": 0.000001,
  "alice_bits": [0,1,1,0,1,0,1,1],
  "alice_bases": ["Z","X","X","Z","X","Z","X","X"],
  "bell_results": ["00","10","01","11","00","10","01","00"],
  "bob_bases": ["Z","X","X","Z","Z","Z","X","X"],
  "bob_measurements": [0,1,1,0,0,0,1,1],
  "matched_indices": [0,1,2,3,6,7],
  "sifted_alice_bits": [0,1,1,0,1,1],
  "sifted_bob_bits": [0,1,1,0,1,1],
  "qber": 0.0,
  "threshold": 0.10,
  "chsh": 2.72,
  "decision": "ACCEPT"
}
```

---

# 36. Canonical Noise Mock

```json
{
  "session_id": "MOCK-NOISE-001",
  "attack_type": "PHYSICAL_NOISE",
  "noise_model": "DEPOLARIZING",
  "noise_probability": 0.02,
  "qber": 0.021,
  "threshold": 0.10,
  "chsh": 2.55,
  "attack_detected": false,
  "decision": "ACCEPT"
}
```

This scenario demonstrates that normal channel noise can exist without necessarily causing rejection.

---

# 37. Canonical MITM Mock

```json
{
  "session_id": "MOCK-MITM-001",
  "attack_type": "INTERCEPT_RESEND",
  "attack_fraction": 0.25,
  "qber": 0.24,
  "threshold": 0.10,
  "chsh": 1.86,
  "attack_detected": true,
  "decision": "REJECT"
}
```

---

# 38. Canonical Forgery Mock

```json
{
  "session_id": "MOCK-FORGERY-001",
  "attack_type": "FORGERY",
  "attack_fraction": 0.10,
  "original_bell_bits": ["10","01","00"],
  "modified_bell_bits": ["11","01","10"],
  "qber": 0.31,
  "threshold": 0.10,
  "attack_detected": true,
  "decision": "REJECT"
}
```

---

# 39. Canonical Replay Mock

```json
{
  "session_id": "MOCK-REPLAY-001",
  "replay_session_id": "OLD-SESSION-001",
  "attack_type": "REPLAY",
  "session_valid": false,
  "replay_detected": true,
  "decision": "REJECT",
  "reason": "REPLAYED_TRANSACTION"
}
```

---

# 40. Canonical PNS Mock

```json
{
  "session_id": "MOCK-PNS-001",
  "attack_type": "PNS",
  "intensity": 0.20,
  "signal_error_rate": 0.018,
  "decoy_error_rate": 0.087,
  "decoy_anomaly_detected": true,
  "decision": "FLAG"
}
```

PNS detection may use `FLAG` rather than `REJECT` if the selected protocol configuration requires additional analysis.

---

# 41. Canonical SOC Events

```json
[
  {
    "node": "ARBITRATOR",
    "event_type": "SESSION_CREATED",
    "message": "Quantum security session created."
  },
  {
    "node": "ARBITRATOR",
    "event_type": "EPR_DISTRIBUTED",
    "message": "EPR pairs distributed."
  },
  {
    "node": "ALICE",
    "event_type": "SIGNATURE_CREATED",
    "message": "Document hash converted to signature states."
  },
  {
    "node": "ALICE",
    "event_type": "BELL_MEASUREMENT",
    "message": "Joint Bell measurement completed."
  },
  {
    "node": "BOB",
    "event_type": "PAULI_CORRECTION",
    "message": "Pauli correction operations applied."
  },
  {
    "node": "BOB",
    "event_type": "MEASUREMENT",
    "message": "Projective measurements completed."
  },
  {
    "node": "SECURITY_ENGINE",
    "event_type": "QBER_CALCULATED",
    "message": "QBER calculated."
  },
  {
    "node": "SECURITY_ENGINE",
    "event_type": "THRESHOLD_CALCULATED",
    "message": "Statistical threshold calculated."
  },
  {
    "node": "SECURITY_ENGINE",
    "event_type": "CHSH_CALCULATED",
    "message": "CHSH correlation score calculated."
  },
  {
    "node": "SECURITY_ENGINE",
    "event_type": "DECISION",
    "message": "Security decision generated."
  }
]
```

---

# 42. End-to-End Normal Workflow

```text
1. Create session
2. Generate EPR pairs
3. Alice hashes document
4. Alice generates private bits/bases
5. Alice prepares signature states
6. Alice performs Bell measurements
7. Classical feed-forward bits are recorded
8. Bob applies Pauli corrections
9. Bob chooses measurement bases
10. Bob measures
11. Alice/Bob bases are reconciled
12. Mismatched bases are discarded
13. Sifted bits are compared
14. XOR mismatch array is generated
15. QBER is calculated
16. Statistical threshold is calculated
17. CHSH score is evaluated
18. Session/replay validity is checked
19. Deterministic security decision is generated
20. SOC receives telemetry and displays result
```

---

# 43. End-to-End Attack Workflow

```text
1. Create normal session
2. Generate EPR
3. Sign document
4. Activate attack
5. Attack modifies the appropriate simulation layer
6. Bob verifies
7. Sifting occurs
8. Threat engine evaluates changed data
9. QBER/CHSH/security checks run
10. Attack is classified
11. Decision is generated
12. Attack event is persisted
13. SOC alarm is triggered
14. Timeline displays attack progression
```

---

# 44. Frontend Requirements

The dashboard must consume backend results and must not duplicate security logic.

Required sections:

## Header

Display:

- Project name.
- Session ID.
- Current system status.
- Active threat status.

## Security status

Display:

- ACCEPT / REJECT / FLAG.
- QBER.
- Threshold.
- CHSH.
- Attack status.

## QBER chart

Plot:

```text
Observed QBER
Threshold
Baseline QBER
```

over time or simulation runs.

## CHSH gauge

Suggested display:

```text
> 2.4       strong observed Bell violation
2.0–2.4    weaker observed correlation
< 2.0      no Bell violation observed
```

Do not label this as absolute proof of a specific attack.

## Attack console

Buttons:

```text
MITM
FORGERY
REPLAY
PHYSICAL NOISE
PNS
```

## Node console

Display:

```text
ALICE
BOB
ARBITRATOR
EVE
SECURITY ENGINE
```

with event logs.

## Network flow

Display:

```text
ARBITRATOR
    ↓
Alice ← quantum/EPR → Bob
    ↓                 ↓
    └── classical ────┘
            ↓
       Security Engine
```

---

# 45. Frontend API Client

Do not place API URLs throughout React components.

Create:

```text
frontend/src/api/client.ts
```

or:

```text
frontend/src/api/client.js
```

Functions:

```javascript
createSession()
getSession()
runSession()
signDocument()
verifySession()
runSecurityAudit()

triggerMitm()
triggerForgery()
triggerReplay()
triggerNoise()
triggerPns()

getSecurityReport()
getEvents()
getTelemetry()
getNodes()
```

---

# 46. Frontend Mock Mode

Frontend must also work independently.

Example:

```env
VITE_USE_MOCK_API=true
```

When enabled:

```text
React
 ↓
Mock API adapter
 ↓
fixture JSON
```

When disabled:

```text
React
 ↓
Axios/fetch
 ↓
FastAPI
```

No UI component should care which mode is active.

---

# 47. Telemetry Requirements

Every significant operation should create a telemetry record.

Minimum events:

```text
SESSION_CREATED
EPR_GENERATION_STARTED
EPR_GENERATION_COMPLETED
SIGNATURE_CREATED
BELL_MEASUREMENT_STARTED
BELL_MEASUREMENT_COMPLETED
FEED_FORWARD_GENERATED
PAULI_CORRECTION_COMPLETED
BOB_MEASUREMENT_COMPLETED
SIFTING_COMPLETED
QBER_CALCULATED
THRESHOLD_CALCULATED
CHSH_CALCULATED
ATTACK_STARTED
ATTACK_COMPLETED
SECURITY_AUDIT_STARTED
SECURITY_AUDIT_COMPLETED
DECISION_GENERATED
```

---

# 48. Attack Detection and Alarm Contract

The frontend displays an alarm when:

```text
attack_detected == true
```

or:

```text
decision == REJECT
```

The backend is responsible for deciding this.

Frontend must not independently calculate:

```text
QBER > threshold
```

to determine the official decision.

It may use the values for visualization only.

---

# 49. Security Decision Logic

The baseline decision can be represented as:

```text
QBER_PASS = QBER <= threshold
CHSH_PASS = CHSH >= configured_chsh_minimum
SESSION_PASS = session_valid

DECISION =
    ACCEPT if all required checks pass
    REJECT if a mandatory check fails
    FLAG if the configured policy requires investigation
```

The exact policy must live in:

```text
backend/app/threat/decision.py
```

Do not duplicate decision logic in React.

---

# 50. Quantum Module Acceptance Tests

Module 1 must pass:

```text
[ ] EPR generator creates requested number of pairs
[ ] Bell state is correctly initialized
[ ] Alice basis values are only X/Z
[ ] Alice bits are only 0/1
[ ] Bell measurement returns 00/01/10/11
[ ] Feed-forward output is JSON serializable
[ ] Bob correction mapping is deterministic
[ ] Bob measurement returns 0/1
[ ] Basis sifting keeps only matching bases
[ ] Clean teleportation/reconstruction has expected correlations
[ ] Mock mode works without Qiskit execution
```

---

# 51. Threat Module Acceptance Tests

```text
[ ] XOR produces correct mismatch vector
[ ] Error count is correct
[ ] QBER is correct
[ ] Empty input is rejected safely
[ ] Mismatched array lengths are rejected
[ ] Threshold calculation is deterministic
[ ] CHSH calculation is deterministic
[ ] Decision gate is deterministic
[ ] Mock data produces expected ACCEPT
[ ] MITM fixture produces expected REJECT
[ ] Noise fixture can remain ACCEPT
```

---

# 52. Attack Module Acceptance Tests

```text
[ ] attack_fraction validates 0..1
[ ] MITM identifies affected pairs
[ ] MITM records attack events
[ ] Forgery records original and modified Bell bits
[ ] Replay identifies old session
[ ] Replay records reason
[ ] Noise records noise model
[ ] PNS records decoy statistics
[ ] Attacks do not directly write final security decision
[ ] Attack output can be consumed by Quantum/Threat services
```

---

# 53. API Module Acceptance Tests

```text
[ ] Every endpoint is documented in Swagger
[ ] Pydantic rejects invalid requests
[ ] Session lifecycle is enforced
[ ] All responses use common wrapper
[ ] Errors use standard error codes
[ ] Database writes are transactional
[ ] Mock mode works
[ ] Real service mode works
[ ] Request IDs are generated
[ ] Telemetry is recorded
```

---

# 54. Frontend Acceptance Tests

```text
[ ] Dashboard loads without backend using mock mode
[ ] Session ID is visible
[ ] QBER is displayed
[ ] Threshold is displayed
[ ] CHSH is displayed
[ ] ACCEPT state is visible
[ ] REJECT state is visible
[ ] Alarm appears for attack fixture
[ ] Attack buttons work in mock mode
[ ] Telemetry timeline renders
[ ] Network flow renders
[ ] Charts update after new results
[ ] No security calculation is duplicated in frontend
```

---

# 55. Testing Strategy

Use three levels.

## Unit tests

Each module tests itself.

```text
quantum tests
threat tests
attack tests
API tests
frontend tests
```

## Integration tests

Test:

```text
FastAPI
 ↓
Quantum service
 ↓
Threat service
 ↓
Database
```

## End-to-end tests

Run:

```text
CLEAN
NOISE
MITM
FORGERY
REPLAY
PNS
```

---

# 56. Required E2E Scenarios

## Scenario A — Clean

Expected:

```text
QBER below threshold
CHSH acceptable
No attack
ACCEPT
```

## Scenario B — Normal noise

Expected:

```text
QBER slightly elevated
Still below threshold
No confirmed attack
ACCEPT
```

## Scenario C — MITM

Expected:

```text
QBER increases
CHSH may decrease
Attack recorded
REJECT
```

## Scenario D — Forgery

Expected:

```text
Feed-forward values changed
Bob's reconstruction affected
QBER increases
REJECT
```

## Scenario E — Replay

Expected:

```text
Session/nonce mismatch
Replay detected
REJECT
```

## Scenario F — PNS

Expected:

```text
Signal/decoy statistics become anomalous
PNS flagged according to configured policy
```

---

# 57. Environment Configuration

Example `.env.example`:

```env
APP_NAME=Quantum Signature Security
APP_ENV=development
APP_VERSION=1.0.0

DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/quantum_security

MOCK_MODE=true
MOCK_QUANTUM=true
MOCK_THREAT=true
MOCK_ATTACK=true

CORS_ORIGINS=http://localhost:5173

DEFAULT_NUM_PAIRS=1000
DEFAULT_KEY_LENGTH=256
DEFAULT_BASELINE_QBER=0.02
DEFAULT_ALPHA=0.000001

LOG_LEVEL=INFO
```

---

# 58. Docker Services

Recommended local development:

```text
docker-compose.yml
```

Services:

```text
postgres
backend
frontend
```

Optional:

```text
pgadmin
```

---

# 59. API Documentation

FastAPI automatically exposes:

```text
/docs
/redoc
/openapi.json
```

Swagger tags must match the module groups:

```text
SYSTEM
SESSIONS
ARBITRATOR
ALICE
BOB
QUANTUM
SECURITY
ATTACKS
TELEMETRY
```

---

# 60. Git Branching

Recommended branches:

```text
main
develop

feature/quantum-core
feature/threat-engine
feature/fastapi-integration
feature/attack-engine
feature/frontend
```

No developer should modify another module's public contract without agreement.

---

# 61. Pull Request Rule

Every PR must state:

```text
Module:
Files changed:
API changes:
Database changes:
Schema changes:
Mock fixture changes:
Tests added:
Breaking changes: YES/NO
```

If an API or database contract changes, update this document.

---

# 62. Definition of Done

A feature is not complete merely because the function works.

A feature is complete when:

```text
[ ] Implementation exists
[ ] Service interface exists
[ ] Pydantic schema exists
[ ] API endpoint exists if externally required
[ ] Mock implementation exists
[ ] Mock fixture exists
[ ] Database persistence exists if required
[ ] Unit tests exist
[ ] Integration test exists if required
[ ] Swagger documentation exists
[ ] Telemetry event exists
[ ] Frontend integration exists if user-facing
```

---

# 63. Important Scientific/Technical Constraints

This project is a **quantum simulation and security-research prototype**.

Do not claim:

- physical quantum hardware operation;
- absolute security;
- zero false alarms;
- mathematical certainty from finite samples;
- that CHSH < 2 alone proves intercept-resend;
- that simulation performance represents physical quantum-network performance.

Use language such as:

```text
simulated
quantum-inspired
Qiskit-based
deterministic statistical detector
prototype
observed correlation
configured threshold
simulated attack
```

---

# 64. Performance Requirements

The dashboard should report:

```text
EPR generation time
State preparation time
Bell measurement time
Bob correction time
Measurement time
Sifting time
QBER calculation time
Threshold calculation time
CHSH calculation time
Total audit time
API latency
```

Use:

```python
time.perf_counter()
```

for backend operation timing.

Do not make unsupported claims such as "sub-millisecond quantum execution" unless measured and reproducible on the actual environment.

---

# 65. Security/Privacy Requirements

Do not store:

- raw sensitive documents unless explicitly required;
- private keys outside the simulation context;
- unnecessary user information.

Prefer:

```text
document hash
session ID
simulation metadata
```

For demo data, use synthetic documents and synthetic hashes.

---

# 66. Important Implementation Boundary

The frontend must never become the source of truth for:

```text
QBER
threshold
CHSH
attack decision
session validity
replay validity
```

The backend is authoritative.

Frontend is presentation.

---

# 67. Important Module Boundary

The API layer must not contain the actual mathematical implementation.

Bad:

```python
@app.post("/security/qber")
def qber():
    # 100 lines of NumPy logic here
```

Good:

```python
@app.post("/security/qber")
def qber(request):
    result = threat_service.calculate_qber(request)
    return success(result)
```

Likewise, quantum algorithms belong in Module 1, not inside route handlers.

---

# 68. Recommended Service Dependency Graph

```text
API
 │
 ├── SessionService
 │
 ├── QuantumService
 │
 ├── ThreatService
 │
 └── AttackService

AttackService
 │
 └── QuantumService / simulation adapters

SecurityService
 │
 └── ThreatService

OrchestrationService
 ├── SessionService
 ├── QuantumService
 ├── AttackService
 └── ThreatService
```

Avoid circular dependencies.

---

# 69. AI Coding Agent Instructions

Any AI coding agent working on this repository must follow these rules:

1. Read this `MASTER_SPEC.md` before modifying code.
2. Do not invent new endpoint names when an existing contract applies.
3. Do not change database column names casually.
4. Do not change JSON field names without updating this specification.
5. Preserve `session_id` throughout the workflow.
6. Preserve `pair_index` across all quantum/measurement/attack records.
7. Keep security calculations in Module 2.
8. Keep quantum calculations in Module 1.
9. Keep attacks in Module 4.
10. Keep HTTP orchestration in Module 3.
11. Keep presentation in Module 5.
12. Add tests for every new behavior.
13. Add mock data before requiring another module.
14. Never hard-code security decisions in the frontend.
15. Never silently change the mathematical convention.
16. Update documentation when a public contract changes.

---

# 70. Parallel Development Rule

Developers must be able to work without waiting.

## Quantum developer

Uses:

```text
shared fixtures
mock EPR inputs
mock signatures
```

## Threat developer

Uses:

```text
mock sifted arrays
mock CHSH correlations
```

## Attack developer

Uses:

```text
mock quantum/session state
```

## API developer

Uses:

```text
mock QuantumService
mock ThreatService
mock AttackService
```

## Frontend developer

Uses:

```text
mock API adapter
```

When real modules become available, replace implementations behind interfaces rather than changing consumers.

---

# 71. Master Workflow for the SIH Demonstration

## Normal demonstration

```text
1. Open SOC dashboard.
2. Create session.
3. Set N, baseline noise and alpha.
4. Generate EPR.
5. Sign synthetic document.
6. Verify signature.
7. Run audit.
8. Show:
   - QBER
   - threshold
   - CHSH
   - ACCEPT
9. Show node console.
10. Show protocol flow.
```

## Attack demonstration

```text
1. Keep the same session configuration.
2. Trigger MITM.
3. Run verification/audit.
4. Show QBER increase.
5. Show CHSH/correlation change.
6. Show attack event.
7. Show REJECT.
8. Show red security alarm.
9. Show attack details.
```

Then repeat for:

```text
FORGERY
REPLAY
NOISE
PNS
```

---

# 72. Minimal MVP Priority

If implementation time becomes limited, prioritize in this exact order:

## P0 — Must work

```text
EPR
Alice state preparation
Bell measurement
Bob correction
Bob measurement
Sifting
XOR
QBER
Threshold
Decision
FastAPI
PostgreSQL
React dashboard
Clean scenario
MITM scenario
```

## P1 — Strongly recommended

```text
CHSH
Forgery
Replay
Noise
Telemetry
Network visualization
```

## P2 — Extension

```text
PNS
Decoy states
Advanced Aer noise
WebSockets
Historical analytics
```

---

# 73. Final Architecture Checklist

Before declaring the prototype integrated:

```text
[ ] PostgreSQL starts
[ ] FastAPI starts
[ ] Swagger works
[ ] React starts
[ ] Database migrations work
[ ] Seed fixtures load
[ ] Session creation works
[ ] EPR distribution works
[ ] Alice signing works
[ ] Bob verification works
[ ] Sifting works
[ ] QBER works
[ ] Threshold works
[ ] CHSH works
[ ] Security audit works
[ ] Clean scenario ACCEPTS
[ ] Noise scenario behaves correctly
[ ] MITM scenario REJECTS
[ ] Forgery scenario REJECTS
[ ] Replay scenario REJECTS
[ ] PNS scenario produces configured result
[ ] Events appear in SOC
[ ] Telemetry appears in SOC
[ ] Charts update
[ ] Alarm works
[ ] Mock mode works
[ ] Real mode works
[ ] API tests pass
[ ] End-to-end tests pass
```

---

# 74. Single Source of Truth

This file is the authoritative engineering contract.

If another README, code comment, mock file, or developer assumption conflicts with this document:

1. Stop.
2. Identify the conflict.
3. Decide which contract is correct.
4. Update the specification.
5. Update schemas/tests.
6. Then implement.

Do not silently create multiple incompatible versions of the architecture.

---

# 75. Final Team Principle

The project is not five independent applications.

It is one coordinated system:

```text
                QUANTUM
                   │
                   ▼
ALICE ──────── TELEPORTATION ──────── BOB
                   │
                   ▼
                SIFTING
                   │
                   ▼
                QBER/XOR
                   │
                   ▼
              THRESHOLD + CHSH
                   │
                   ▼
              DECISION ENGINE
                   │
        ┌──────────┴──────────┐
        │                     │
      ACCEPT                REJECT
        │                     │
        │                 ATTACK ALERT
        │                     │
        └──────────┬──────────┘
                   ▼
                SOC UI
```

The database provides persistent state.

FastAPI provides orchestration.

The service interfaces provide module independence.

The mock fixtures provide parallel development.

The REST contracts provide integration.

The React SOC provides the judge-facing experience.

**All modules must preserve these contracts so that independently developed components can be assembled into one working SIH prototype without rewriting each other’s work.**

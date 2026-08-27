# Module 3 — Distributed Node API Framework

FastAPI orchestration layer for the **Quantum Digital Signature Security** system (SIH 2026).

## Architecture

```
Alice ──── POST /api/v1/alice/sign ─────┐
                                         │
Arbitrator ── POST /api/v1/arbitrator/ ──┼── FastAPI (Module 3) ──→ Module 1/2/4
                                         │
Bob ─────── POST /api/v1/bob/verify ────┘
```

Module 3 is the **communication and orchestration layer**. It does not perform quantum mathematics itself — it delegates to:

| Module | Role | Integration |
|--------|------|-------------|
| Module 1 | Qiskit Quantum Core | `quantum_service.py` |
| Module 2 | Threat Detection Engine | `security_service.py` |
| Module 4 | Attack Sandbox | `attack_service.py` |
| Module 5 | React Dashboard | REST API consumers |

## Quick Start

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open Swagger at **http://localhost:8000/docs**

## API Endpoints

### Arbitrator (EPR Distribution)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/arbitrator/epr-distribute` | Generate EPR pairs & create session |
| `GET`  | `/api/v1/arbitrator/session/{id}` | Get session details |
| `GET`  | `/api/v1/arbitrator/sessions` | List all sessions |

### Alice (Signer)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/alice/sign` | Sign a document |
| `GET`  | `/api/v1/alice/state/{id}` | Get Alice's state |

### Bob (Verifier)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/bob/verify` | Verify signature |
| `POST` | `/api/v1/bob/sift` | Basis sifting |
| `GET`  | `/api/v1/bob/state/{id}` | Get Bob's state |

### Security
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/security/threshold-audit` | **Full security audit** |
| `POST` | `/api/v1/security/qber` | Calculate QBER |
| `POST` | `/api/v1/security/threshold` | Calculate Hoeffding threshold |
| `POST` | `/api/v1/security/chsh` | Calculate CHSH score |

### Attacks (Red Team)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/attacks/intercept-resend` | MitM attack |
| `POST` | `/api/v1/attacks/forgery` | Signature forgery |
| `POST` | `/api/v1/attacks/replay` | Replay attack |
| `POST` | `/api/v1/attacks/noise` | Channel noise |
| `POST` | `/api/v1/attacks/pns` | PNS attack |

## Demo Flow

```
1. POST /api/v1/arbitrator/epr-distribute    →  session_id
2. POST /api/v1/alice/sign                   →  bell_bits
3. POST /api/v1/bob/verify                   →  measurements
4. POST /api/v1/bob/sift                     →  sifted bits
5. POST /api/v1/security/threshold-audit     →  ACCEPT ✅

# With attack:
6. POST /api/v1/attacks/intercept-resend     →  attack injected
7. POST /api/v1/security/threshold-audit     →  REJECT ❌
```

## Running Tests

```bash
cd backend
python -m pytest tests/ -v
```

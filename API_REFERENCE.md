# FastAPI REST API Reference

> **Base URL**: `http://localhost:8000/api/v1`  
> **Interactive Swagger UI**: `http://localhost:8000/docs`  
> **Interactive ReDoc**: `http://localhost:8000/redoc`

---

## 1. Alice (Signer) Router — `/api/v1/alice`

### `POST /api/v1/alice/prepare-state`
Prepares arbitrary document quantum state $|\psi_{\text{doc}}\rangle$ using state angles $(\theta, \phi)$ or generates random BB84 qubit stream.

- **Request Body**:
```json
{
  "theta": 1.5707963,
  "phi": 0.0,
  "batch_size": 1024,
  "document_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```
- **Response**: `200 OK`
```json
{
  "status": "PREPARED",
  "document_hash": "e3b0c442...",
  "bases": ["+", "x", "+", "+", "x", ...],
  "qubits_count": 1024,
  "state_vector_fidelity": 0.9998
}
```

---

## 2. Bob (Verifier) Router — `/api/v1/bob`

### `POST /api/v1/bob/measure-stream`
Measures incoming photon stream using randomly generated basis vectors and applies classical feed-forward Pauli frames ($\sigma_x^{b_1} \cdot \sigma_z^{b_2}$).

- **Request Body**:
```json
{
  "session_id": "QDS-2026-CLEAN-1001",
  "feed_forward_bits": [0, 1, 1, 0, 0, 1],
  "detector_efficiency": 0.95
}
```
- **Response**: `200 OK`
```json
{
  "status": "MEASURED",
  "sifted_key_length": 512,
  "observed_errors": 10,
  "raw_qber": 0.0195
}
```

---

## 3. Arbitrator Router — `/api/v1/arbitrator`

### `POST /api/v1/arbitrator/pump-entanglement`
Generates SPDC entangled Bell state pairs $|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ and distributes one photon to Alice and one to Bob.

### `POST /api/v1/arbitrator/evaluate-handshake`
Evaluates statistical Hoeffding bound and CHSH non-locality score to generate final `ACCEPT` or `REJECT` verdict.

- **Request Body**:
```json
{
  "session_id": "QDS-2026-CLEAN-1001",
  "test_bits_alice": "101100101101...",
  "test_bits_bob": "101100101101...",
  "alpha": 0.001
}
```
- **Response**: `200 OK`
```json
{
  "verdict": "ACCEPT",
  "threat_detected": false,
  "threat_type": null,
  "qber": 0.019,
  "hoeffding_threshold": 0.055,
  "chsh_score": 2.78,
  "classical_limit": 2.00,
  "confidence_level": 0.999,
  "reason": "All quantum security tests verified. Non-locality passed (S=2.78 > 2.00), QBER nominal (1.9%)."
}
```

---

## 4. Red-Team Attacks Router — `/api/v1/attacks`

### `POST /api/v1/attacks/trigger`
Executes simulated quantum channel attacks against live or synthetic sessions.

- **Supported Attack Types**:
  - `mitm`: Intercept-resend eavesdropping on quantum channel.
  - `forgery`: One-time pad classical signature tag forging.
  - `replay`: Stale nonce and historical packet replay.
  - `pns`: Decoy state photon number splitting.
  - `noise`: Dark fiber thermal drift and dark counts.
  - `dos`: Broadband continuous-wave laser jamming.

- **Request Body**:
```json
{
  "attack_type": "mitm",
  "intensity": 0.85,
  "session_id": "QDS-2026-ATTACK-0042"
}
```
- **Response**: `200 OK`
```json
{
  "attack_type": "mitm",
  "status": "INTERCEPTED",
  "qber_induced": 0.142,
  "chsh_collapsed": 1.94,
  "detection_expected": true,
  "subsystem": "EVE PROBE"
}
```

---

## 5. Security & SOC Router — `/api/v1/security`

- `GET /api/v1/security/threats`: List all active threats and anomalies flagged by the Threat Engine.
- `GET /api/v1/security/incidents`: Query all security incidents with multi-step detection timelines.
- `POST /api/v1/security/incidents/{incident_id}/status`: Update incident investigation status (`INVESTIGATING`, `ESCALATED`, `RESOLVED`).
- `POST /api/v1/security/nodes/{node_id}/quarantine`: Immediately quarantine or restore a compromised quantum node.

---

## 6. Telemetry & Sessions Router — `/api/v1/telemetry` & `/api/v1/sessions`

- `GET /api/v1/telemetry/stream`: SSE or live polling stream of subsystem events, latencies, and QBER readings.
- `GET /api/v1/telemetry/logs`: Paginated search across persistent database telemetry audit logs.
- `GET /api/v1/sessions`: List all quantum signature handshake sessions stored in PostgreSQL.
- `GET /api/v1/sessions/{session_id}`: Retrieve detailed metrics, document hashes, and verdicts for a specific session.

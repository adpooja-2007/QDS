# System Architecture & Technical Specification

> **System: Quantum-Inspired Cyber Threat Detection for Digital Signature Security (QDS)**  
> Problem Statement 26141 — Smart India Hackathon (SIH 2026)

---

## 1. System Overview & Core Philosophy

The **Quantum Digital Signature (QDS)** system provides mathematically guaranteed, unforgeable digital signatures and real-time cyber threat detection. Unlike conventional public-key cryptography (RSA, ECDSA) which relies on unproven computational complexity assumptions, QDS security is anchored in the fundamental laws of **quantum mechanics** and **statistical probability**:

1. **No-Cloning Theorem**: An arbitrary unknown quantum state cannot be copied without disturbance.
2. **State Collapse on Measurement**: Any eavesdropper measuring a transmitted photon collapses its superposition, introducing an unavoidable Quantum Bit Error Rate (QBER).
3. **Bell Non-Locality Violation**: Entangled photon pairs distributed to legitimate parties violate the classical CHSH Bell inequality ($S > 2.0$), proving the absence of local hidden-variable eavesdropping.
4. **Deterministic Non-AI Decision Engine**: Security verdicts are derived from closed-form mathematical equations (**Hoeffding's Inequality**) rather than statistical machine learning models.

---

## 2. Multi-Tier System Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          1. PRESENTATION LAYER                              │
│  React 18 + TypeScript + Vite + Tailwind CSS + shadcn UI Component Suite    │
│  - /home: Bento Grid Navigation & Real-Time System Status                   │
│  - /demonstration: 6-Step Interactive Quantum Simulation Console            │
│  - /attack-sandbox: Red-Team Attack Matrix & 4-Node Streaming Terminals     │
│  - /monitoring: SOC Dashboard (Overview, Threats, Incidents, Network)       │
│  - /database: PostgreSQL Database Inspector & Dynamic JSON Schema Explorer  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST / SSE Stream / BroadcastChannel
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                       2. DISTRIBUTED API GATEWAY                            │
│  FastAPI (Python 3.10+) · Uvicorn ASGI Server · Port 8000                   │
│  - /api/v1/alice: Qubit state preparation, basis selection, document hash   │
│  - /api/v1/bob: Measurement basis execution, feed-forward correction, sift  │
│  - /api/v1/arbitrator: Entanglement pump, BSM, Hoeffding audit, verdict     │
│  - /api/v1/attacks: Red-team vector triggers (MitM, Forgery, Replay, PNS)   │
│  - /api/v1/security: Bell test, QBER threshold, node quarantine endpoints   │
│  - /api/v1/telemetry: Live metric streaming, log search, health telemetry   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────┐
│     3. QUANTUM CORE ENGINE           │  │   4. DETERMINISTIC THREAT ENGINE  │
│  Qiskit 1.3+ State Simulation        │  │  Pure Mathematical Decision Engine│
│  - SPDC Entangled Pair Distribution  │  │  - Hoeffding Bound (α=0.001)      │
│  - Bell State Measurement (BSM)      │  │  - CHSH Bell Inequality (S >= 2.0)│
│  - Pauli Frame Transformations (X, Z)│  │  - Decoy State Yield Analysis     │
│  - Quantum State Teleportation       │  │  - Shannon Key Entropy Estimation │
│  - Toeplitz Hash Amplification       │  │  - Parity Cascade Reconciler      │
└──────────────────┬───────────────────┘  └───────────────────┬───────────────┘
                   │                                          │
                   └─────────────────────┬────────────────────┘
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       5. PERSISTENCE & AUDIT LAYER                          │
│  PostgreSQL 18.3 (Async SQLAlchemy 2.0) + Write-Through In-Memory Cache     │
│  - quantum_sessions: Session ledger, document hashes, metrics, verdicts     │
│  - telemetry_logs: Subsystem event logs, latencies, error states            │
│  - active_threats_view: Materialized query view for SOC alerts              │
│  - SQLite Fallback: In-memory failover if PostgreSQL connection is absent   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Quantum Protocol Flow (The 6-Step Quantum Handshake)

```
ALICE (Signer)                ARBITRATOR (Entanglement Source)              BOB (Verifier)
     │                                      │                                      │
     │                           1. PUMP SPDC PHOTONS                       │
     │                      (λ=1550nm Entangled Bell Pairs)                 │
     │ <────────────────────────────────────┼────────────────────────────────────> │
     │  Photon A                            │                           Photon B   │
     │                                      │                                      │
     │ 2. JOINT BELL MEASUREMENT (BSM)      │                                      │
     │    |ψ_doc⟩ ⊗ |Φ+⟩                    │                                      │
     │ ──── Classical BSM Bits (b1, b2) ──> │                                      │
     │                                      │ 3. CLASSICAL FEED-FORWARD            │
     │                                      │ ── Forward bits (b1, b2) ──────────> │
     │                                      │                                      │
     │                                      │                            4. APPLY PAULI
     │                                      │                               RECON (σ_x^b1 · σ_z^b2)
     │                                      │                                      │
     │ 5. HOEFFDING STATISTICAL AUDIT       │                                      │
     │ ── Test Qubits Sample ─────────────> │ <── Bob Test Bits ────────────────── │
     │                                      │                                      │
     │                                      │ 6. EVALUATE VERDICT                  │
     │                                      │    - QBER <= 5.0%?                   │
     │                                      │    - CHSH S >= 2.00?                 │
     │                                      │    - OTP Hash Matches?               │
     │ <── SIGNATURE ACCEPT / REJECT ────── │ ── SIGNATURE ACCEPT / REJECT ──────> │
```

---

## 4. Threat Engine Mathematical Specifications

### 4.1. Hoeffding's Statistical Inequality Bound
Given $N$ sampled qubits and an empirical error count $k$, the observed error rate is $\hat{e} = k / N$. Under confidence level $1 - \alpha = 0.999$, the upper bound on true channel QBER is:

$$\epsilon_{\text{bound}} = \sqrt{\frac{\ln(1/\alpha)}{2N}}$$

$$\text{QBER}_{\text{upper}} = \hat{e} + \epsilon_{\text{bound}}$$

- **Verdict Rule**: If $\text{QBER}_{\text{upper}} > \tau_{\text{threshold}}$ (where $\tau = 5.0\%$), the session is immediately **ABORTED**.

### 4.2. CHSH Bell Inequality (Clauser-Horne-Shimony-Holt)
Measures quantum correlation between measurement bases:

$$S = |E(A_0, B_0) + E(A_0, B_1) + E(A_1, B_0) - E(A_1, B_1)|$$

- **Classical Local Hidden Variable Bound**: $S \le 2.00$
- **Quantum Entangled State (Tsirelson's Bound)**: $S \le 2\sqrt{2} \approx 2.828$
- **Verdict Rule**: If $S < 2.00$, quantum entanglement has collapsed into a classical state, proving active eavesdropping.

### 4.3. Decoy State Yield Analysis (PNS Defense)
Legitimate parties interleave signal pulses ($\mu = 0.5$) with decoy pulses ($\nu = 0.1$). Single-photon yield $Y_1$ and gain $Q_\mu$ are monitored:

$$Y_1 \ge \frac{\mu}{\mu\nu - \nu^2} \left[ Q_\nu e^\nu - Q_\mu e^\mu \frac{\nu^2}{\mu^2} - \frac{\mu^2 - \nu^2}{\mu^2} Y_0 \right]$$

- If multi-photon pulse splitting occurs, $Y_{\text{signal}} / Y_{\text{decoy}}$ diverges from theoretical bounds, triggering immediate photon number splitting alerts.

---

## 5. Frontend State Management & Telemetry Pipeline

- **`SentinelService` Singleton**: Manages in-memory telemetry streams, live session cache, security incident registry, and dynamic attack metadata classification.
- **Cross-Tab Synchronization**: Uses `BroadcastChannel('qds_telemetry_stream')` and `window.dispatchEvent` to synchronize state changes across multiple browser tabs instantaneously without page reloads.
- **Fail-Safe Fallbacks**: If the FastAPI backend is offline, SentinelService generates mathematically sound synthetic live streams with proper IST timestamps and statistical variances.

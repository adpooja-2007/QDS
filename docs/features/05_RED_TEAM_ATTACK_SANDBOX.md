# Feature 05: Red-Team Attack Sandbox Engine

> **Location**: `backend/app/services/attack_service.py`, `backend/app/api/attacks.py`  
> **Target**: Adversary Attack Injections & SOC Dashboard Real-Time Visualizations

---

## 1. Overview & Purpose

The **Red-Team Attack Sandbox** enables cybersecurity operators, threat researchers, and SOC analysts to inject active cyber attacks into ongoing Quantum Digital Signature (QDS) sessions. It tests the Threat Engine's ability to detect, classify, and reject tampered signature workflows.

---

## 2. Supported Attack Types & Algorithms

```text
                                 ┌───────────────────────────┐
                                 │   RED-TEAM ATTACK ENGINE  │
                                 └─────────────┬─────────────┘
                                               │
       ┌──────────────────┬────────────────────┼──────────────────┬──────────────────┐
       ▼                  ▼                    ▼                  ▼                  ▼
┌──────────────┐   ┌─────────────┐     ┌──────────────┐   ┌─────────────┐    ┌──────────────┐
│ INTERCEPT-   │   │ FEEDFORWARD │     │ REPLAY       │   │ THERMAL     │    │ PHOTON       │
│ RESEND (MITM)│   │ FORGERY     │     │ ATTACK       │   │ NOISE       │    │ SPLITTING    │
└──────────────┘   └─────────────┘     └──────────────┘   └─────────────┘    └──────────────┘
```

### A. Intercept-Resend Attack (MITM) — `POST /api/v1/attacks/intercept-resend`
- **Adversary Behavior**: Eve intercepts a fraction $f_{\text{attack}}$ of transmitted qubits, measures them in a randomly chosen basis ($Z$ or $X$), and resends measured qubits to Bob.
- **Quantum Effect**:
  - When Eve measures in the wrong basis (50% chance), she collapses the quantum state.
  - Introduces $25\%$ error rate on the attacked fraction:
    $$\text{QBER}_{\text{MitM}} \approx e_0 + 0.25 \times f_{\text{attack}}$$
  - Collapses CHSH Bell entanglement score $S$ below the classical bound ($S < 2.0$).
- **Detection**: Flagged as `MITM` or `MULTIPLE_INDICATORS`.

### B. Classical Feed-Forward Forgery — `POST /api/v1/attacks/forgery`
- **Adversary Behavior**: Eve corrupts or tampers with the classical feed-forward bits $(M_{a1}, M_{a2})$ transmitted over the public classical network.
- **Effect**:
  - Causes Bob to apply wrong Pauli unitary correction gates ($\sigma$).
  - Results in high QBER ($> 30\%$).
  - CHSH quantum score $S$ remains intact ($S \approx 2.72$) because the physical quantum channel was untampered!
- **Detection**: Flagged as `CLASSICAL_TAMPERING` or `FORGERY`.

### C. Replay Attack — `POST /api/v1/attacks/replay`
- **Adversary Behavior**: Eve intercepts signature transmissions and replays a recorded key string from a previous session.
- **Effect**:
  - Replayed keys are uncorrelated with current session nonce.
  - QBER rises to $\approx 50\%$.
  - CHSH score $S$ drops to $\approx 1.70$.
- **Detection**: Flagged as `REPLAY_SUSPECTED`.

### D. Thermal Channel Noise — `POST /api/v1/attacks/noise`
- **Adversary Behavior**: Simulates environmental optical fiber thermal noise or attenuation.
- **Effect**:
  - Moderately elevates QBER ($0.03 \sim 0.05$).
  - CHSH score $S$ remains above threshold ($S \ge 2.0$).
- **Detection**: Classified as `CHANNEL_NOISE` (`ACCEPT`).

### E. Photon Number Splitting (PNS) — `POST /api/v1/attacks/pns`
- **Adversary Behavior**: Eve splits multi-photon pulses from faint laser pulses, storing one photon in quantum memory while sending the other to Bob.
- **Effect**:
  - QBER on signal states remains low ($\le T$).
  - Decoy state error rates show significant statistical discrepancy ($\Delta_{\text{decoy}} > 0.05$).
- **Detection**: Flagged as `PNS_SUSPECTED`.

---

## 3. Attack Logging & History API

Every injected attack record is saved to the session state in PostgreSQL:

```json
{
  "attack_id": "ATK-8f2a1b90",
  "attack_type": "INTERCEPT_RESEND",
  "attack_fraction": 0.80,
  "affected_bits": 800,
  "errors_introduced": 182,
  "timestamp": "2026-08-25T21:45:00+00:00"
}
```

- Endpoint `GET /api/v1/attacks/history/{session_id}` returns all injected attack records for SOC timeline auditing.

---

## 4. Red Team Attack Sandbox UI (Port 5173)

The Red Team Sandbox (`frontend/src/App.jsx`) is built with the **Kinetic Precision** design system:
- **Scenario Quick Launcher**: Radio selection between Clean Handshake, MitM (35% Intercept), Classical Forgery, Replay Attack, Thermal Noise, and PNS Attack.
- **4-Way Distributed Terminal Feeds**: Live concurrent feeds for `Arbitrator.sys`, `Alice Node`, `Bob Node`, and `Eve Intercept` (with `Intervention Active` indicator badge).
- **Real-Time Telemetry Gauges**: Live QBER vs Hoeffding threshold ceiling ($5.5\%$) and CHSH Bell test non-locality score ($S \ge 2.0$ vs $S < 2.0$ classical collapse).


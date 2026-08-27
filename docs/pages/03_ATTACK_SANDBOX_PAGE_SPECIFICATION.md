# Page Specification: `/attack-sandbox` — Red-Team Attack Sandbox & Terminal Inspector

> **File Location**: `q-email/src/pages/AttackSandbox/index.tsx`  
> **Route**: `/attack-sandbox`  
> **Purpose**: Red-team adversary simulation environment for executing physical and cryptographic attacks against quantum channels, featuring 4-way synchronized streaming terminal output and raw packet inspection.

---

## 1. Page Component Structure & Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       1. TOP HEADER & ATTACK STATUS BANNER                  │
│  [Selected Attack Vector]    [Batch Size: N=1024..8192]   [Execute Button]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                       2. ATTACK VECTOR SELECTOR GRID                        │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│ │ MitM Intercept  │ │ OTP Forgery    │ │ Nonce Replay   │ │ Decoy PNS      │ │
│ │ QBER: 14.2%    │ │ QBER: 18.5%    │ │ QBER: 8.4%     │ │ QBER: 6.2%     │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│                       3. 4-NODE SYNCHRONIZED STREAMING TERMINALS            │
│ ┌───────────────────────────────┐ ┌───────────────────────────────┐         │
│ │ ARBITRATOR TERMINAL           │ │ ALICE NODE TERMINAL           │         │
│ │ Protocol & Bell Test Audits   │ │ State Tx & Basis Sifting      │         │
│ └───────────────────────────────┘ └───────────────────────────────┘         │
│ ┌───────────────────────────────┐ ┌───────────────────────────────┐         │
│ │ BOB NODE TERMINAL             │ │ EVE ADVERSARY TERMINAL        │         │
│ │ Measurement & Pauli Recon     │ │ Probe Sniffing & Injection    │         │
│ └───────────────────────────────┘ └───────────────────────────────┘         │
├─────────────────────────────────────────────────────────────────────────────┤
│                       4. RAW PACKET DUMP INSPECTOR                          │
│ Hex payload stream, polarization angles (deg), and packet framing flags     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Interactive Attack Vector Matrix (6 Scenarios)

### 1. `mitm` — MitM Intercept-Resend Attack
- **Display Name**: `MitM Attack`
- **Subsystem**: `EVE PROBE` | **Category**: `Intercept-Resend Eavesdropping`
- **Metrics**: QBER $14.2\%$, CHSH $S = 1.94$, Key Rate $1.2\text{ KBPS}$, Sifting Efficiency $49.6\%$.
- **Security Status**: `COMPROMISED` (Intervention Active).
- **Outcome**: Bell test fails ($S < 2.0$), handshake rejected.

### 2. `forgery` — Classical Signature Forgery Attack
- **Display Name**: `Forgery Attack`
- **Subsystem**: `ARBITRATOR MAC` | **Category**: `Classical Signature Forgery`
- **Metrics**: QBER $18.5\%$, CHSH $S = 1.82$, Key Rate $0.8\text{ KBPS}$, Sifting Efficiency $42.1\%$.
- **Security Status**: `COMPROMISED` (Forgery Active).
- **Outcome**: Pre-image hash collision mismatch, OTP signature tag quarantined.

### 3. `replay` — Quantum Replay Attack
- **Display Name**: `Replay Attack`
- **Subsystem**: `NONCE AUDIT` | **Category**: `Quantum Replay Attack`
- **Metrics**: QBER $8.4\%$, CHSH $S = 1.98$, Key Rate $1.4\text{ KBPS}$, Sifting Efficiency $47.8\%$.
- **Security Status**: `COMPROMISED` (Replay Detected).
- **Outcome**: Nonce consumed in Session `QDS-8812`, timestamp skew $+4.82\text{s}$ flagged.

### 4. `pns` — Decoy-State Photon Number Splitting Attack
- **Display Name**: `PNS Attack`
- **Subsystem**: `DECOY ANALYSIS` | **Category**: `Photon Number Splitting (PNS)`
- **Metrics**: QBER $6.2\%$, CHSH $S = 2.05$, Decoy Yield $Y_{\text{decoy}} = 0.18$.
- **Security Status**: `COMPROMISED` (PNS Split Active).
- **Outcome**: Signal vs decoy pulse yield divergence detected, protocol aborted.

### 5. `noise` — Optical Thermal Noise
- **Display Name**: `Channel Noise`
- **Subsystem**: `FIBER TELEMETRY` | **Category**: `Optical Thermal Drift`
- **Metrics**: QBER $9.8\%$, CHSH $S = 2.12$ ($S > 2.00$ Passed!).
- **Security Status**: `DEGRADED` (Thermal Drift).
- **Outcome**: Non-locality preserved, Cascade parity correction reconciles bit flips.

### 6. `clean` — Nominal Baseline (Control)
- **Display Name**: `Baseline Control`
- **Subsystem**: `ARBITRATOR` | **Category**: `Nominal Channel`
- **Metrics**: QBER $1.9\%$, CHSH $S = 2.78$, Key Rate $2.4\text{ KBPS}$.
- **Security Status**: `SECURE` (Channel Nominal).
- **Outcome**: All tests pass, unforgeable key distilled.

---

## 3. 4-Node Synchronized Terminal Output

1. **Arbitrator Terminal**: Renders protocol step execution, Hoeffding bounds, CHSH non-locality evaluations, and final decision verdicts.
2. **Alice Node Terminal**: Renders sequence generation, state polarization angles ($0^\circ, 45^\circ, 90^\circ, 135^\circ$), photon transmission progress, and sifting reconciliation.
3. **Bob Node Terminal**: Renders port listener activity, photon capture progress, random basis selection, Pauli correction, and entropy distillation.
4. **Eve Adversary Terminal**: Renders probe state (standby vs active), optical fiber sniffing logs, polarization collapse indicators, and injection payloads.

- **Animation Engine**: Text streams line-by-line using high-performance intervals with line count tracking (`visibleLinesCount`).
- **Actions**: Includes `"Copy Terminal Logs"` buttons for each window.

---

## 4. Photon Batch Size Selector & Handshake Trigger

- **Photon Batch Size Selector**: Allows setting pulse sequence count $N \in \{1024, 2048, 4096, 8192\}$.
- **"Execute Live Scenario" Button**: Triggers full attack simulation and automatically dispatches classified security incident metadata to `sentinelService` and `/monitoring`.

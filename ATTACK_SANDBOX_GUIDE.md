# Red-Team Attack Sandbox & Threat Matrix Guide

> **System: Quantum Digital Signature Security Console (QDS)**  
> **Interactive Route**: `/attack-sandbox`

---

## 1. Threat Taxonomy & Attack Matrix

The QDS platform incorporates an interactive Red-Team Attack Sandbox designed to evaluate quantum cryptographic robustness against adversarial interference:

```
                                  RED-TEAM ATTACK MATRIX
                                             │
         ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
         ▼                   ▼                               ▼                   ▼
  [EAVESDROPPING]     [AUTHENTICATION]                [QUANTUM MEMORY]     [PHYSICAL/CHANNEL]
  - MitM Intercept    - Classical Forgery             - Replay Attack      - Optical Thermal Noise
  - Photon Sifting    - Arbitrator MAC Spoof          - PNS Attack         - Laser Jamming (DoS)
```

---

## 2. Detailed Attack Vector Specifications

### 2.1. Man-in-the-Middle (MitM) Intercept-Resend Attack
- **Scenario Key**: `mitm`
- **Adversary Mechanism**: Eve taps the dark fiber optical channel and intercepts Alice's single-photon transmissions. She randomly measures each photon in either the Rectilinear ($+$) or Diagonal ($\times$) basis and re-transmits a newly prepared photon to Bob.
- **Quantum Mechanics Effect**: When Eve chooses an incompatible measurement basis ($50\%$ probability), she collapses the photon's superposition state, causing a $25\%$ theoretical bit-flip rate in the sifted key.
- **Observed Metrics**: $\text{QBER} = 14.2\%$, $\text{CHSH } S = 1.94$
- **Arbitrator Defense**: $\text{QBER} > 5.5\%$ breaches Hoeffding's statistical cutoff; Bell correlation drops below $2.00$. The session is **ABORTED**.

### 2.2. Classical Signature Forgery Attack
- **Scenario Key**: `forgery`
- **Adversary Mechanism**: An attacker attempts to forge Alice's one-time pad (OTP) MAC signature tag on a modified document without possessing the shared quantum key.
- **Cryptographic Effect**: The forged tag causes a pre-image collision mismatch and a high bit-flip delta across verification bits.
- **Observed Metrics**: $\text{QBER} = 18.5\%$, $\text{CHSH } S = 1.82$
- **Arbitrator Defense**: Subsystem `ARBITRATOR MAC` flags OTP tag integrity failure. Signature status set to `REJECTED`.

### 2.3. Quantum Replay Attack
- **Scenario Key**: `replay`
- **Adversary Mechanism**: Eve records legitimate handshake frames from a prior session (`QDS-8812`) and retransmits the recorded optical payload.
- **Cryptographic Effect**: The recorded nonce was already consumed in the arbitrator's replay cache, and the arrival timestamp exceeds the allowable $0.10\text{s}$ tolerance window ($+4.82\text{s}$ skew).
- **Observed Metrics**: $\text{QBER} = 8.4\%$, $\text{CHSH } S = 1.98$
- **Arbitrator Defense**: Subsystem `NONCE AUDIT` discards the stale key buffer and flags a replay security incident.

### 2.4. Photon Number Splitting (PNS) Attack
- **Scenario Key**: `pns`
- **Adversary Mechanism**: On weak coherent laser sources that occasionally emit multi-photon pulses ($n \ge 2$), Eve uses a beam splitter to store one photon in quantum memory while forwarding the remaining photon to Bob undisturbed.
- **Quantum Defense**: Legitimate nodes use the **Decoy-State Protocol**, randomly interleaving signal pulses ($\mu = 0.5$) with decoy pulses ($\nu = 0.1$). Eve's selective multi-photon tapping alters the statistical ratio of single-photon yields $Y_{\text{signal}} / Y_{\text{decoy}}$.
- **Observed Metrics**: $\text{QBER} = 6.2\%$, $\text{CHSH } S = 2.05$, $Y_{\text{decoy}} = 0.18$ (Yield Divergence)
- **Arbitrator Defense**: Subsystem `DECOY ANALYSIS` aborts the protocol before key distillation occurs.

### 2.5. Optical Thermal Noise (Non-Adversarial Degradation)
- **Scenario Key**: `noise`
- **Mechanism**: Elevated dark fiber attenuation ($0.48\text{ dB/km}$) and detector thermal dark counts ($18\text{ cps}$) induce random bit flips without adversary state collapse.
- **Observed Metrics**: $\text{QBER} = 9.8\%$, $\text{CHSH } S = 2.12$ ($S > 2.00$ Entanglement Preserved!)
- **Arbitrator Defense**: Subsystem `FIBER TELEMETRY` activates Cascade parity error correction and classifies the link as `DEGRADED OPERATIONAL` while allowing communication to proceed securely.

### 2.6. Broadband Laser Jamming (Quantum DoS)
- **Scenario Key**: `dos`
- **Adversary Mechanism**: High-intensity continuous-wave laser light is injected into the dark fiber to saturate Bob's superconducting nanowire single-photon detectors (SNSPDs).
- **Observed Metrics**: $\text{QBER} = 42.0\%$, $\text{CHSH } S = 1.20$
- **Arbitrator Defense**: Subsystem `OPTICAL JAMMER` triggers SDN controller link isolation and node quarantine.

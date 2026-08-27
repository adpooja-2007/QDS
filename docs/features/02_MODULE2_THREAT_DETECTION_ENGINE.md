# Feature 02: Module 2 — Deterministic Threat Detection Engine

> **Location**: `backend/app/engine/`  
> **Tests**: `backend/tests/engine/` (36 Unit & Pipeline Tests)

---

## 1. Overview & Purpose

Module 2 is a **deterministic statistical threat detection engine**. It uses non-AI mathematical formulas to evaluate Quantum Bit Error Rates (QBER), statistical Hoeffding bounds, CHSH Bell inequality violations, and decoy-state yields to classify attacks and output un-forgeable security verdicts (`ACCEPT` / `REJECT`).

---

## 2. Component Architecture & Mathematical Formulas

```text
Sifted Key Data ──► XOR Evaluator ──► QBER Calculator ──► Hoeffding Bound
                                                                │
                                                                ▼
CHSH Bell Score ──────────────────────────────────────► Threat Classifier ──► Decision Gate (ACCEPT/REJECT)
```

### A. XOR Mismatch Evaluator (`xor_evaluator.py`)
Computes bitwise mismatch array between Alice's sifted key $A$ and Bob's sifted key $B$:
$$M_i = A_i \oplus B_i$$
Returns total match count, mismatch count, and total compared length.

### B. Quantum Bit Error Rate — QBER (`qber.py`)
Calculates raw physical error rate:
$$\text{QBER} = \frac{\sum M_i}{N}$$
Where $N$ is the number of sifted sample bits.

### C. Hoeffding Statistical Bound & Threshold (`hoeffding.py`)
Applies Hoeffding's Inequality to derive an upper bound threshold $T$ that accounts for finite sample sizes:

$$\Delta = \sqrt{\frac{\ln(1/\alpha)}{2N}}$$
$$T = \min(1.0, e_0 + \Delta)$$

- $e_0$: Expected baseline physical channel noise (e.g. $0.02$).
- $\alpha$: False-alarm statistical tolerance parameter (e.g. $10^{-6}$ or $10^{-9}$).
- $N$: Sifted sample count.

If $\text{QBER} \le T$, the error rate is consistent with natural noise. If $\text{QBER} > T$, an anomaly or attack is flagged.

### D. CHSH Bell Inequality Evaluator (`chsh.py`)
Evaluates CHSH entanglement score $S$:
$$S = \lvert E(A,B) - E(A,B') + E(A',B) + E(A',B') \rvert$$

- **Classical Bound**: $S \le 2.0$ (Local Realism).
- **Quantum Ideal**: $S = 2\sqrt{2} \approx 2.8284$.
- **Status Categories**:
  - $S \ge 2.4$: `STRONG_ENTANGLEMENT`
  - $2.0 \le S < 2.4$: `WEAK_ENTANGLEMENT`
  - $S < 2.0$: `BELL_TEST_FAILED`

### E. Decoy-State Yield Analysis (`decoy.py`)
Compares error rates between signal pulses ($\mu$) and decoy pulses ($\nu$):
- If $\lvert \text{QBER}_{\text{decoy}} - \text{QBER}_{\text{signal}} \rvert > \text{Threshold}$ (default $0.05$), flags **PNS (Photon Number Splitting)** attack.

### F. Threat Classifier & Decision Gate (`classifier.py`, `decision.py`)
Maps statistical anomalies into explicit threat categories:

| QBER Condition | CHSH Condition | Decoy Discrepancy | Threat Classification | Decision |
|---|---|---|---|---|
| $\le T$ | $S \ge 2.4$ | Normal | `NORMAL` | `ACCEPT` |
| $\le T$ | $2.0 \le S < 2.4$ | Normal | `CHANNEL_NOISE` | `ACCEPT` |
| $> T$ | $S < 2.0$ | Normal | `MULTIPLE_INDICATORS` / `MITM` | `REJECT` |
| $> T$ | $S \ge 2.4$ | Normal | `CLASSICAL_TAMPERING` / `FORGERY` | `REJECT` |
| $> T$ | $S < 2.0$ | High | `REPLAY_SUSPECTED` | `REJECT` |
| $\le T$ | $S \ge 2.4$ | High Anomaly | `PNS_SUSPECTED` | `ACCEPT` (with warning) |

---

## 3. Transaction Orchestrator (`orchestrator.py`)

The function `analyze_security_transaction(request: SecurityAnalysisRequest)` executes the full end-to-end pipeline:
1. Validates input schema & length compatibility (`validation.py`).
2. Sifts matching bases (`sifting.py`).
3. Computes XOR mismatches (`xor_evaluator.py`).
4. Calculates QBER (`qber.py`).
5. Computes Hoeffding threshold (`hoeffding.py`).
6. Evaluates CHSH entanglement score (`chsh.py`).
7. Evaluates decoy statistics (`decoy.py`).
8. Runs threat classifier & outputs `SecurityAuditResponse` report (`audit.py`).

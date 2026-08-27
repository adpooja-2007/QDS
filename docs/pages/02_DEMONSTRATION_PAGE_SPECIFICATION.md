# Master Specification: `/demonstration` — Quantum Signature Handshake Simulation

> **File Location**: `q-email/src/pages/Demonstration/index.tsx`  
> **Route**: `/demonstration`  
> **Purpose**: Exhaustive functional, technical, mathematical, and UI interaction specification for the 6-step Quantum Digital Signature (QDS) handshake simulator, animated optical canvas, Eve eavesdropping engine, and sifting matrix.

---

## 1. Page Component Structure & Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TOP BRAND NAVBAR                                                         │
│ [QDS SENTINEL Logo]     [Demonstration Active Tab]    [New Session] [Settings]│
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. SIMULATION PLAYER & CONTROL BANNER                                       │
│ [EXECUTE LIVE PROTOCOL]  [ButtonGroup: Play|Pause|Step|Reset]  [Eve Switch]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. ANIMATED DRAGGABLE OPTICAL CANVAS (canvasRef)                            │
│                                 ┌────────────┐                              │
│                                 │ EVE PROBE  │ (Y=20)                       │
│                                 └─────┬──────┘                              │
│                                       │ (Eavesdropping Tap)                 │
│ ┌────────────┐   Link 1 (Fiber)  ┌────┴───────┐   Link 2 (Fiber)  ┌──────────┐ │
│ │ ALICE NODE ├═══════════════════┤ ARBITRATOR ├═══════════════════┤ BOB NODE │ │
│ │ (X=120)    │  <-- Photon A --  │  (X=460)   │  -- Photon B -->  │ (X=800)  │ │
│ └────────────┘                   └────────────┘                   └──────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. 6-PHASE PROGRESSION BAR & MATHEMATICAL STEP CARDS                       │
│ [Phase 1: EPR] -> [Phase 2: Dist] -> [Phase 3: BSM] -> [Phase 4: Sift] ...  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. QUANTUM BITSTREAM & PAULI ALIGNMENT MATRIX                               │
│ 8-Pulse Sample Table comparing bases, bits, Bell outcomes, and sifting status│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Interactive Eve Eavesdropping Engine

- **Toggle Switch**: Located on the central dark-fiber link canvas.
- **When Eve is OFF (Nominal Channel)**:
  - Photons travel in emerald green ($\#34D399$).
  - CHSH score $S = 2.78 \ge 2.00$ (Quantum non-locality intact).
  - QBER = $1.9\%$ (Nominal noise floor).
  - Step 6 Verdict = **`SIGNATURE ACCEPT`**.
- **When Eve is ON (35% Eavesdropping Tap Active)**:
  - Photon wavepackets redirect through Eve's probe node (`{x: 480, y: 20}`), turning red ($\#EF4444$) with wavepacket distortion rings.
  - Interception induces quantum measurement collapse.
  - QBER spikes to **$14.2\%$** (Breaches $5.0\%$ Hoeffding cutoff).
  - CHSH score collapses to **$S = 1.76 < 2.00$** (Classical hidden variable limit).
  - Step 6 Verdict switches to **`PROTOCOL ABORTED`** and dispatches a live security incident to `/monitoring`.

---

## 3. The 6 Protocol Phases (Physics & Math Breakdown)

### Phase 1: EPR Pair Preparation (SPDC)
- **Subsystem**: `KEY EXCH MN`
- **Physics**: Laser pumps non-linear BBO crystal to create polarization-entangled photon pairs in the $|\Phi^+\rangle$ Bell state:
  $$|\Phi^+\rangle = \frac{1}{\sqrt{2}} (|00\rangle + |11\rangle)$$
- **Nominal Metrics**: QBER $1.95\%$, CHSH $S = 2.78$.

### Phase 2: Entangled State Fiber Distribution
- **Subsystem**: `ALICE BSM` / `BOB NODE`
- **Physics**: Photon $A$ travels over dark fiber Link 1 to Alice; Photon $B$ travels over Link 2 to Bob at telecom wavelength $\lambda = 1550\text{ nm}$.

### Phase 3: Joint Bell State Measurement (BSM) & Bob Measurement
- **Subsystem**: `ALICE BSM`
- **Physics**: Alice performs joint 4-outcome BSM on document qubit state $|\psi_{\text{doc}}\rangle$ and Photon $A$, generating 2 classical bits $(b_1, b_2)$. Bob measures Photon $B$ in random bases $\{+, \times\}$.

### Phase 4: Public Basis Reconciliation (Sifting)
- **Subsystem**: `HOEFFDING CHK`
- **Action**: Basis choices exchanged over TLS 1.3. Discards pulse positions where bases mismatch ($+ \text{ vs } \times$).

### Phase 5: Hoeffding Statistical Bound & CHSH Bell Test Audit
- **Subsystem**: `THREAT ENGINE`
- **Mathematical Evaluation**:
  - **Hoeffding Test**: $\text{QBER}_{\text{upper}} = \hat{e} + \sqrt{\frac{\ln(1/\alpha)}{2N}}$. (Eve OFF: $2.1\% \le 5.5\%$ PASS; Eve ON: $14.2\% > 5.5\%$ FAIL).
  - **CHSH Bell Test**: $S = |E(A_0, B_0) + E(A_0, B_1) + E(A_1, B_0) - E(A_1, B_1)|$. (Eve OFF: $S = 2.76 \ge 2.00$ PASS; Eve ON: $S = 1.76 < 2.00$ FAIL).

### Phase 6: Privacy Amplification & Signature Derivation
- **Subsystem**: `PRIVACY AMP`
- **Action**:
  - **Eve OFF**: Toeplitz matrix hashing distills 256-bit unforgeable signature (`SIGNATURE ACCEPT`).
  - **Eve ON**: **`PROTOCOL ABORTED`**. Key buffer discarded.

---

## 4. Quantum Bitstream & Pauli Alignment Matrix Table

8-row sample table comparing individual photon pulse parameters:

| PLS | Alice Basis | Alice Bit | Bob Basis | Bob Bit | Bell Outcome | Eve Intercept | Sift Status | Polarization Angle A | Polarization Angle B |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **01** | $\times$ | $0$ | $\times$ | $0$ (or $1$ if Eve) | $|\Phi^-\rangle$ | Yes/No | `Kept` / `QBER Error` | $45^\circ$ | $45^\circ$ |
| **02** | $+$ | $1$ | $+$ | $1$ (or $0$ if Eve) | $|\Phi^+\rangle$ | Yes/No | `Kept` / `QBER Error` | $0^\circ$ | $0^\circ$ |
| **03** | $+$ | $1$ | $+$ | $1$ | $|\Psi^+\rangle$ | No | `Kept` | $0^\circ$ | $0^\circ$ |
| **04** | $\times$ | $1$ | $+$ | $1$ | $|\Phi^+\rangle$ | Yes/No | `Discarded` | $45^\circ$ | $0^\circ$ |
| **05** | $\times$ | $0$ | $+$ | $0$ | $|\Phi^-\rangle$ | No | `Discarded` | $45^\circ$ | $0^\circ$ |
| **06** | $+$ | $0$ | $+$ | $0$ | $|\Psi^-\rangle$ | No | `Kept` | $0^\circ$ | $0^\circ$ |
| **07** | $\times$ | $1$ | $\times$ | $1$ (or $0$ if Eve) | $|\Phi^+\rangle$ | Yes/No | `Kept` / `QBER Error` | $45^\circ$ | $45^\circ$ |
| **08** | $+$ | $1$ | $\times$ | $1$ | $|\Psi^+\rangle$ | No | `Discarded` | $0^\circ$ | $45^\circ$ |

- **`Export Matrix CSV` Action**: Downloads `quantum_matrix_[timestamp].csv`.

---

## 5. COMPLETE UI INTERACTION & STATE MUTATION MATRIX

The following table details **every UI element, trigger event, React state mutation, visual change, and background action** that occurs on the Demonstration Page:

| UI Element | Trigger Event | React State Mutated | Visual & UI Effect | Background & API Action |
| :--- | :--- | :--- | :--- | :--- |
| **Logo (`QDS SENTINEL`)** | `onClick` | N/A | Smooth route transition back to `/home`. | Invokes `onNavigateHome()`. |
| **`NEW SESSION` Button** | `onClick` | `showCreateSessionModal = true` | Opens New Quantum Session Provisioning Modal overlay. | None. |
| **Modal: Submit Session Form** | `onSubmit` | `isCreatingSession = true`, `currentStep = 1`, `timeCounter = 0.000`, `isPlaying = true` | Modal closes, simulation resets to Step 1, toast notification displays: *"Quantum Session created & active"*. | Calls `onGenerateSignature` or `sentinelService.createSessionAsync`, syncs channel into `localStorage` (`qds_session_channels`), dispatches `qds_session_created` custom event to `/monitoring`. |
| **`Settings` Icon Button** | `onClick` | `showSettingsModal = true` | Opens Simulation Parameters Modal. | None. |
| **Settings: Speed Selector (`0.5x - 4x`)** | `onClick` | `simSpeed = val` | Updates active speed pill highlight. Photon wavepacket animation speeds up/slows down. | Adjusts step timer interval `Math.max(500, 2400 / simSpeed)` and photon velocity `0.008 * simSpeed`. |
| **Notifications Bell Icon** | `onClick` | `showNotifications = !prev` | Opens/closes Notifications drawer displaying active threat alerts. | None. |
| **Notifications: `Clear All`** | `onClick` | `clearedIds = [...allIds]` | Empties notification list and resets bell badge counter to 0. | Updates localStorage clear list. |
| **`EXECUTE LIVE PROTOCOL` Button** | `onClick` | `executingLive = true`, `currentStep = 6`, `activePulseIndex = 7`, `liveSuccessToast = true` | Button shows spinning loader, fast-forwards player to Phase 6 (`KEY GEN`), displays success toast *"Live signature verification completed on FastAPI core"*. | Sends HTTP POST to FastAPI backend endpoint `/api/v1/arbitrator/evaluate-handshake` and emits telemetry log item. |
| **Player `Play` Button** | `onClick` | `isPlaying = true` | `Play` button highlights blue. Step progression bar auto-advances every 2.4s. | Starts interval timer advancing `currentStep` ($1 \rightarrow 6$) and emitting live telemetry events. |
| **Player `Pause` Button** | `onClick` | `isPlaying = false` | `Pause` button highlights. Auto-advancement freezes. | Clears playback interval timer. |
| **Player `Step Forward` Button** | `onClick` | `currentStep = prev + 1` | Advances step indicator card by +1 (wraps $6 \rightarrow 1$). | Emits step event to `sentinelService`. |
| **Player `Reset` Button** | `onClick` | `currentStep = 1`, `timeCounter = 0.045`, `activePulseIndex = 2`, `isPlaying = false` | Simulation resets to Phase 1, timer resets to 0.045s. | Emits reset event. |
| **Eve Eavesdropping Switch** | `onCheckedChange` | `isEavesdropperActive = val` | **OFF $\rightarrow$ ON**: Photon trajectory turns red ($\#EF4444$) and bends through Eve node (`{x:480, y:20}`). Phase 5 changes to `QBER 14.2% (EVE DETECTED)`. Phase 6 changes to `ABORTED`. Matrix table Bob bits flip to errors. | Logs `Quantum Channel Intrusion` incident into `sentinelService` and dispatches alert to `/monitoring`. |
| **Alice Node Card** | `onMouseDown` / `onMouseMove` | `nodes.alice = {x, y}`, `userHasCustomLayoutRef = true` | Node card moves smoothly across canvas. Fiber optic link SVG line adjusts end coordinates dynamically. | Updates local canvas coordinates. |
| **Alice Node Card** | `onClick` | `activeNodeModal = aliceDetails` | Opens Alice Node Details Modal (IP Address, BSM state, fiber length, role). | None. |
| **Arbitrator Node Card** | `onClick` | `activeNodeModal = arbitratorDetails` | Opens Arbitrator Details Modal (SPDC laser pump status, BBO temperature, Hoeffding engine). | None. |
| **Bob Node Card** | `onClick` | `activeNodeModal = bobDetails` | Opens Bob Node Details Modal (SNSPD detector efficiency, Pauli operators, basis dial). | None. |
| **Eve Node Card** | `onClick` | `activeNodeModal = eveDetails` | Opens Eve Node Details Modal (Eavesdropping tap percentage, intercept vector, noise floor). | None. |
| **Phase Card (1..6)** | `onClick` | `currentStep = phase.id`, `activePhaseInfoModal = phase.id` | Highlights selected phase card and opens Phase Mathematical Formula Popover. | None. |
| **Matrix Table Row** | `onMouseEnter` | `hoveredPulse = row.pls` | Canvas highlights corresponding photon wavepacket pulse. | None. |
| **Matrix Table Row** | `onClick` | `selectedPulseModal = row` | Opens Deep Pulse Inspection Modal showing state density matrix and polarization angles. | None. |
| **`Export Matrix CSV` Button** | `onClick` | N/A | Browser triggers download of `quantum_matrix_[timestamp].csv`. | Compiles table rows into CSV blob. |

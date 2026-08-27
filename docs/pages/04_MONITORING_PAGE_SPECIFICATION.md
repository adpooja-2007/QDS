# Page Specification: `/monitoring` — SOC Security Monitoring & Analytics Center

> **File Location**: `q-email/src/pages/Monitoring/index.tsx`  
> **Route**: `/monitoring`  
> **Purpose**: Deep forensic telemetry, live incident management, statistical boundary tracking, and network topology visualizer.

---

## 1. Sub-Tabs & Navigation Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           /monitoring DASHBOARD                             │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────────┤
│  OVERVIEW   │   THREATS   │  INCIDENTS  │  SESSIONS   │       NETWORK       │
│ (Telemetry) │  (Bounds)   │ (Forensics) │  (Ledger)   │ (Optical Topology)  │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────────────┘
```

---

## 2. Exhaustive Section Breakdown

### 2.1. OVERVIEW Tab
- **Threat Alert Banner**: Rendered dynamically at the top whenever an attack scenario is active. Displays category, severity (`CRITICAL`, `HIGH`), and diagnostic root cause.
- **6-Card KPI Grid**:
  - *Active Sessions*: Live session count.
  - *Verified Signatures*: Confirmed unforgeable signatures.
  - *Security Score*: System confidence gauge ($0 - 100\%$).
  - *Total Optical Pulses*: Total EPR photon pairs emitted.
  - *Bit Error Rate (QBER)*: Observed QBER vs baseline ($2.0\%$).
  - *API Latency*: FastAPI gateway round-trip time.
- **Statistical Boundary Charts**:
  - *Hoeffding Bound Line Chart*: Observed QBER vs Hoeffding threshold ceiling.
  - *CHSH Bell Non-Locality Line Chart*: Observed S-score vs Classical bound ($S = 2.0$) and Tsirelson bound ($S = 2.828$).
  - *Time Range Selector (`ButtonGroup`)*: `1M` | `5M` | `15M` | `ALL`.
- **Live Telemetry Stream Table**: Live event stream with subsystem badges (`ARBITRATOR MAC`, `NONCE AUDIT`, `DECOY ANALYSIS`, `EVE PROBE`, `FIBER TELEMETRY`, `OPTICAL JAMMER`), latency, HTTP status code, and JSON copy button.

### 2.2. THREATS Tab
- **4 Metric Tiles**: Observed QBER, Hoeffding Ceiling, CHSH Score, Security Verdict.
- **Hoeffding Formula Audit**: Sample size $N$, false alarm parameter $\alpha = 0.001$, confidence margin $\Delta$, upper bound calculation.
- **Decision Matrix**: Bitwise XOR check, Hoeffding bound test, Bell test, Pauli alignment check.
- **Threat Anomaly Cards**: Categorized threat items with risk bar visualization and origin node attribution (`ARB-CORE-01`, `NONCE-CACHE-01`, `DECOY-SPLITTER-01`, `NODE-EVE-01`).

### 2.3. INCIDENTS Tab
- **Quarantined Incidents Ledger**: Search bar, severity filters (`CRITICAL`, `HIGH`, `MEDIUM`), and incident selection list.
- **Forensic Inspection Drawer**: Detailed evidence inspection (QBER, CHSH, affected qubits count, p-value), multi-step detection timeline, and status escalation buttons (`INVESTIGATING`, `ESCALATED`, `RESOLVED`).

### 2.4. SESSIONS Tab
- Database table of all sessions with live QBER, CHSH scores, status badges (`VERIFIED`, `REJECTED`), and raw JSON payload viewer.

### 2.5. NETWORK Tab
- Interactive SVG network topology diagram showing dark-fiber quantum optical links and classical channels connecting Alice (Node Alpha), Bob (Node Beta), Arbitrator (Core Cluster), and Eve.

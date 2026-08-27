# Master Specification: `/monitoring` — SOC Security Operations Center

> **File Location**: `q-email/src/pages/Monitoring/index.tsx`  
> **Route**: `/monitoring`  
> **Purpose**: Master functional, architectural, mathematical, and UI interaction specification for the SOC Operations Center, featuring 5 operational sub-tabs, real-time SVG boundary charts, Hoeffding/CHSH/Helstrom audits, incident forensics drawers, and interactive network topology.

---

## 1. Page Architecture & Sub-Tab Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TOP BRAND HEADER & SYSTEM STATUS                                         │
│ [QDS SENTINEL Logo]     [SOC Monitoring Center]     [System Status Pill]     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. 5-SUBTAB NAVIGATION BAR                                                  │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┬─────────────┐ │
│ │ A. OVERVIEW  │  B. THREATS  │ C. INCIDENTS │  D. SESSIONS │ E. NETWORK  │ │
│ └──────────────┴──────────────┴──────────────┴──────────────┴─────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. ACTIVE SUBTAB CONTENT VIEW (Dynamic Switching)                           │
│                                                                             │
│ [A. OVERVIEW]  : KPI Cards + Hoeffding/CHSH Line Charts + Live Telemetry     │
│ [B. THREATS]   : 5 Metric Tiles + Hoeffding Audit + Helstrom + Anomalies     │
│ [C. INCIDENTS] : Incident Ledger + Forensics Drawer + Escalation Controls    │
│ [D. SESSIONS]  : Session Table + Document Hashes + JSON Payload Explorer     │
│ [E. NETWORK]   : Interactive SVG Dark-Fiber Topology + Node Isolation       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Header & System Status Bar

- **Brand Title (`QDS SENTINEL`)**: SVG atom shield logo. Clickable navigation back to `/home`.
- **Active Section Indicator**: Highlighted text (`SOC Operations Center`) with flush blue underline (`border-b-2 border-[#0058BE]`).
- **Global Status Badge**: Color-coded system status indicator (`NOMINAL (99.9% SECURE)` in green vs `THREAT DETECTED` in crimson).
- **Global Search Bar**: Filters incidents, sessions, or telemetry across all tabs.

---

## 3. Detailed Sub-Tab Specifications

### 3.1. Sub-Tab 1: OVERVIEW (Real-Time Telemetry & Boundary Charts)

#### A. Active Threat Alert Banner
- Automatically renders at the top when an attack vector is injected from `/attack-sandbox` or detected live.
- Displays severity badge (`CRITICAL`, `HIGH`), threat title, origin node, and diagnostic root cause.

#### B. 6-Card KPI Grid
1. **Active Sessions**: Total live quantum handshake channels (e.g. `12`).
2. **Verified Signatures**: Count of confirmed unforgeable One-Time-Pad signatures (e.g. `1,482`).
3. **Security Confidence Index**: Real-time confidence percentage gauge ($99.9\%$).
4. **Total Optical Pulses**: Cumulative EPR photon pairs emitted ($1.24 \times 10^7$).
5. **Quantum Bit Error Rate (QBER)**: Live error rate ($1.9\%$) vs baseline floor ($2.0\%$).
6. **API Latency**: Gateway round-trip time ($1.2\text{ ms}$).

#### C. Real-Time SVG Boundary Line Charts
- **Dual Chart Layout**:
  1. **Hoeffding Statistical Bound Line Chart**: Plots observed QBER against the Hoeffding upper ceiling ($T = e_0 + \Delta$).
  2. **CHSH Bell Non-Locality Line Chart**: Plots correlation score $S$ against the Classical bound ($S = 2.0$) and Tsirelson bound ($S = 2.828$).
- **Time Range Selector (`ButtonGroup`)**: Time span filter pills `[1M | 5M | 15M | ALL]` updating SVG chart resolution and data window dynamically.

#### D. Live Telemetry Event Stream Table
- Live auto-scrolling event log table displaying IST Timestamp, Subsystem Badge (`ARBITRATOR MAC`, `NONCE AUDIT`, `DECOY ANALYSIS`, `EVE PROBE`, `FIBER TELEMETRY`, `OPTICAL JAMMER`), Latency (ms), HTTP Status Code (`200 OK`, `403 FORBIDDEN`), QBER%, CHSH, and `"Copy JSON"` action.

---

### 3.2. Sub-Tab 2: THREATS (Statistical Bounds & Helstrom Limits)

#### A. 5 Security Metric Tiles
1. **Observed QBER**: $1.9\%$ (Nominal) vs $14.2\%$ (Under Attack).
2. **Hoeffding Threshold Ceiling**: $T = 5.5\%$ ($\alpha = 0.001$).
3. **CHSH Bell Non-Locality Score**: $S = 2.78 \ge 2.00$.
4. **Helstrom Minimum Error Discrimination Bound**: $P_e^{\text{Helstrom}} = 14.65\%$ ($\gamma = 0.7071$).
5. **Security Decision Verdict**: `SIGNATURE ACCEPT` vs `PROTOCOL ABORTED`.

#### B. Helstrom Minimum Error Discrimination Audit
Calculates the absolute physical lower bound on eavesdropper state discrimination error:
$$P_e^{\text{Helstrom}} = \frac{1}{2} \left( 1 - \sqrt{1 - 4 \pi_0 \pi_1 \gamma^2} \right) = 14.645\%$$
If Eve attempts state discrimination, any probe error below $14.65\%$ is physically impossible by quantum mechanics.

#### C. Hoeffding Bound Mathematical Audit
Displays full step-by-step formula breakdown:
$$Q_{\text{upper}} = \hat{e} + \sqrt{\frac{\ln(1/\alpha)}{2N}}$$
Where sample size $N = 4096$, false alarm rate $\alpha = 0.001$, and confidence margin $\Delta = 3.5\%$.

#### D. Threat Anomaly Cards (Risk Bar Visualizer)
List of anomaly items featuring origin node attribution (`NODE-104`, `QKD-NODE-07`), baseline vs current QBER, and vertical risk bar histograms (5 color-coded bars indicating severity level).

---

### 3.3. Sub-Tab 3: INCIDENTS (Quarantine Ledger & Forensics Drawer)

#### A. Quarantined Incident Ledger Table
- Displays incident records with columns: Incident ID, Timestamp, Severity Badge (`CRITICAL`, `HIGH`, `LOW`), Title, Assigned Analyst, Status Badge (`INVESTIGATING`, `ESCALATED`, `RESOLVED`).
- **Search & Filter Controls**: Search input and status filter pills `[ALL | INVESTIGATING | ESCALATED | RESOLVED]`.

#### B. Incident Forensics Evidence Drawer
Selecting any incident record slides open the deep forensic drawer containing:
- **Incident Summary Card**: Impact severity, assigned analyst, initial detection timestamp.
- **Evidence Telemetry Grid**: Affected qubit count, observed QBER, CHSH correlation, statistical p-value.
- **Multi-Step Audit Timeline**: Sequential chronological log of detection, threshold breach, and analyst intervention.
- **Terminal Log Inspector**: Embedded dark terminal view showing raw CLI diagnostic commands and output.
- **Analyst Escalation Action Buttons**:
  - `Set Investigating`: Sets status to `INVESTIGATING` (Amber `#C2540A`).
  - `Set Escalated`: Escalates status to `ESCALATED` (Red `#BA1A1A`).
  - `Set Resolved`: Resolves incident to `RESOLVED` (Emerald `#16A34A`).

---

### 3.4. Sub-Tab 4: SESSIONS (Quantum Session Ledger)

- **Session Data Grid**: Table of all provisioned quantum sessions displaying Session ID, Document Name, Document Hash (SHA-256), File Size (KB), QBER%, CHSH Score, Status Badge (`VERIFIED`, `REJECTED`, `IN_PROGRESS`).
- **Row Selection & JSON Explorer**: Clicking any session highlights the row and opens the **Session Raw JSON Payload Viewer** displaying raw cryptographic telemetry.

---

### 3.5. Sub-Tab 5: NETWORK (Distributed Topology Diagram)

- **Interactive SVG Topology Visualizer**: Renders dark-fiber quantum optical links and classical channels connecting Alice (Node Alpha), Bob (Node Beta), Arbitrator (Core Cluster), and Eve.
- **Node Status Indicators**: Color-coded nodes (Green = Nominal, Amber = Degraded, Red = Compromised).
- **Node Isolation Control**: Clicking any node opens the **Node Quarantine Modal** allowing analysts to isolate or reconnect nodes from the quantum optical ring.

---

## 4. COMPLETE UI INTERACTION & STATE MUTATION MATRIX

The following table documents **every UI element, user action, React state change, visual outcome, and backend API trigger** on the SOC Dashboard:

| UI Element | Trigger Event | React State Mutated | Visual & UI Effect | Background & API Action |
| :--- | :--- | :--- | :--- | :--- |
| **Logo (`QDS SENTINEL`)** | `onClick` | N/A | Smooth route transition back to `/home`. | Invokes `onNavigateHome()`. |
| **Tab Switch: `Overview`** | `onClick` | `activeTab = 'overview'` | Renders Overview KPI Cards, Hoeffding/CHSH SVG charts, and live telemetry table. | Fetches live telemetry stream. |
| **Tab Switch: `Threats`** | `onClick` | `activeTab = 'threats'` | Renders 5 Metric Tiles, Helstrom Audit, Hoeffding Formula, and Anomaly Risk Bar cards. | Computes Helstrom & Hoeffding bounds. |
| **Tab Switch: `Incidents`** | `onClick` | `activeTab = 'incidents'` | Renders Quarantined Incidents Ledger and search filter controls. | Fetches incident list from `sentinelService`. |
| **Tab Switch: `Sessions`** | `onClick` | `activeTab = 'sessions'` | Renders Quantum Sessions Data Grid and document hashes. | Reads session channels from `localStorage` & API. |
| **Tab Switch: `Network`** | `onClick` | `activeTab = 'network'` | Renders Interactive SVG Network Topology Diagram. | Computes node connection vectors. |
| **Time Selector (`1M, 5M, 15M, ALL`)** | `onClick` | `timeRange = val` | Highlighted pill switches. SVG line charts re-scale x-axis and redraw point paths dynamically. | Filters historical time series points. |
| **Telemetry Search Bar** | `onInput` | `searchQuery = val` | Live filters telemetry events by subsystem, event type, or message string. | None. |
| **Telemetry Table Row: Copy JSON** | `onClick` | `copiedId = row.id` | Icon switches to checkmark `"Copied!"` for 2 seconds. | Copies row JSON payload to clipboard. |
| **Incidents Search Input** | `onInput` | `incidentSearch = val` | Filters incident table by title, ID, or description. | None. |
| **Incident Filter: `INVESTIGATING`** | `onClick` | `incidentStatusFilter = 'INVESTIGATING'` | Displays only amber investigating incident items. | None. |
| **Incident Filter: `ESCALATED`** | `onClick` | `incidentStatusFilter = 'ESCALATED'` | Displays only red escalated incident items. | None. |
| **Incident Filter: `RESOLVED`** | `onClick` | `incidentStatusFilter = 'RESOLVED'` | Displays only green resolved incident items. | None. |
| **Incident Table Row** | `onClick` | `selectedIncident = row` | Forensic Evidence Drawer slides open from the right displaying evidence grid, timeline, and terminal. | None. |
| **Drawer Close Icon (`X`)** | `onClick` | `selectedIncident = null` | Forensic Evidence Drawer slides closed. | None. |
| **Action: `Set Investigating`** | `onClick` | `incident.status = 'INVESTIGATING'`, `incident.status_color = '#C2540A'` | Incident status badge changes to Amber (`INVESTIGATING`). Drawer updates status color. | Updates record state in `sentinelService`. |
| **Action: `Set Escalated`** | `onClick` | `incident.status = 'ESCALATED'`, `incident.status_color = '#BA1A1A'` | Incident status badge changes to Red (`ESCALATED`). Drawer updates status color. | Updates record state in `sentinelService`. |
| **Action: `Set Resolved`** | `onClick` | `incident.status = 'RESOLVED'`, `incident.status_color = '#16A34A'` | Incident status badge changes to Green (`RESOLVED`). Drawer updates status color. | Updates record state in `sentinelService`. |
| **Session Table Row** | `onClick` | `selectedSessionModal = row` | Opens Session Detail Modal showing document hash, QBER, CHSH score, and raw JSON payload. | None. |
| **Session Modal: Copy Hash** | `onClick` | `copiedHash = true` | Shows checkmark toast `"Document Hash Copied"`. | Copies SHA-256 string to clipboard. |
| **Network Topology Node Click** | `onClick` | `selectedNodeModal = node` | Opens Node Quarantine & Isolation Modal displaying node IP, attenuation, optical power, and status. | None. |
| **Node Modal: Quarantine Switch** | `onCheckedChange` | `node.isQuarantined = val` | Node color changes to Red, warning pulse appears on topology map. | Isolates node from quantum ring. |
| **Global Export Telemetry Button** | `onClick` | N/A | Browser triggers download of `soc_telemetry_report_[timestamp].csv`. | Compiles telemetry logs into CSV blob. |

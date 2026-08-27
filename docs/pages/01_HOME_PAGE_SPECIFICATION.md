# Page Specification: `/home` — Command Center & System Hub

> **File Location**: `q-email/src/pages/Home/index.tsx`  
> **Route**: `/home`  
> **Purpose**: Central executive dashboard providing real-time system health metrics, Bento grid navigation shortcuts, live telemetry preview, and hardware diagnostics controls.

---

## 1. Page Component Structure & Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       1. TOP BRAND HEADER NAVBAR                            │
│  [Logo + Title]                 [Global Status Pill]   [Diagnostics Button] │
├─────────────────────────────────────────────────────────────────────────────┤
│                       2. HERO ANNOUNCEMENT BANNER                           │
│  Quantum-Inspired Cyber Threat Detection for Digital Signature Security    │
├─────────────────────────────────────────────────────────────────────────────┤
│                       3. BENTO GRID SYSTEM HUBS                             │
│ ┌───────────────────────────┐ ┌───────────────────────────┐ ┌─────────────┐ │
│ │  A. Quantum Handshake     │ │  B. Red-Team Sandbox      │ │ C. Health   │ │
│ │  Simulate 6-step protocol │ │  Inject 6 attack vectors  │ │    Gauge    │ │
│ └───────────────────────────┘ └───────────────────────────┘ └─────────────┘ │
│ ┌───────────────────────────┐ ┌───────────────────────────┐ ┌─────────────┐ │
│ │  D. SOC Monitoring Hub    │ │  E. Database Inspector    │ │ F. Node Map │ │
│ │  Telemetry & Incidents    │ │  PostgreSQL Schema Ledger │ │  Topology   │ │
│ └───────────────────────────┘ └───────────────────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Specifications & Functionality

### 2.1. Top Brand Header Navbar
- **Brand Logo & Title**:
  - Displays atom icon and project title `"QDS SECURITY CONSOLE"`.
  - Clicking title triggers client-side route reset to `/home`.
- **Global Status Pill**:
  - Live indicator badge displaying `SYSTEM NOMINAL (99.9% SECURE)` or `THREAT DETECTED`.
  - Color-coded: Emerald (`#065F46`) when clean, Crimson (`#BA1A1A`) when attacked.
- **Hardware Diagnostics Button**:
  - Styled with shadcn `Button` (`rounded-full`, variant `outline`).
  - Clicking opens the **Hardware Diagnostics Modal** displaying laser bias, detector temperature, and SPDC photon pump status.

### 2.2. Hero Announcement Banner
- Provides key context regarding Problem Statement 26141 (Smart India Hackathon SIH 2026).
- Displays primary action button `"Launch Quantum Demonstration"` with animated arrow transition.

### 2.3. Bento Grid System Hubs (6 Cards)

#### Card A: Quantum Handshake Simulation (`/demonstration`)
- **Title**: `Quantum Signature Handshake`
- **Description**: Interactive 6-step simulation covering SPDC photon generation, joint Bell State Measurement, Pauli frame feed-forward correction, and Hoeffding statistical audit.
- **Action Control**: Integrated shadcn `CardAction` button (`"Open Interactive Simulator"`).

#### Card B: Red-Team Attack Sandbox (`/attack-sandbox`)
- **Title**: `Red-Team Adversary Sandbox`
- **Description**: Offensive simulation environment for injecting 6 real-world attacks: MitM Intercept-Resend, Classical Signature Forgery, Stale Nonce Replay, Decoy PNS, Thermal Drift, and Jamming DoS.
- **Action Control**: `CardAction` button (`"Launch Attack Sandbox"`).

#### Card C: Real-Time Security Health Gauge
- **Title**: `Quantum Confidence Index`
- **Component**: Radial gauge rendering real-time confidence score ($99.9\%$).
- **Metrics Displayed**: QBER $1.9\%$ (Nominal), CHSH $S = 2.78$ (Passed), Hoeffding $\alpha = 0.001$.

#### Card D: SOC Monitoring & Analytics (`/monitoring`)
- **Title**: `SOC Operations Center`
- **Description**: Real-time SVG telemetry charts, Hoeffding statistical boundary limits, threat incident ledger, and forensic investigation drawer.
- **Action Control**: `CardAction` button (`"View Telemetry Charts"`).

#### Card E: PostgreSQL Database Inspector (`/database`)
- **Title**: `PostgreSQL Database Ledger`
- **Description**: Interactive inspector for `Quantum Sessions`, `Active Threats`, `Node Telemetry`, `Crypto Keys`, and `Auth Logs`.
- **Action Control**: `CardAction` button (`"Inspect DB Tables"`).

#### Card F: Distributed Node Network Topology
- **Title**: `Optical Network Topology`
- **Visual**: Mini SVG rendering dark-fiber links between Alice (Node Alpha), Bob (Node Beta), Arbitrator (Core Cluster), and Eve Probe.

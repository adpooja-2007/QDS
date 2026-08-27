# Feature Guide: Frontend Security Console (`q-email`)

> **Directory**: `q-email/`  
> **Tech Stack**: React 18, TypeScript 5.5, Vite 5.4, Tailwind CSS 3.4, Lucide Icons, shadcn UI

---

## 1. Application Layout & Pages

The frontend application provides a complete mission-control interface across five core sections:

1. **`/home` (Command Center)**:
   - Bento grid architecture highlighting node status, quick simulation access, telemetry health counters, and system topology.
2. **`/demonstration` (Quantum Handshake)**:
   - Interactive 6-step player covering SPDC photon generation, Bell State Measurement, Pauli frame feed-forward correction, and Hoeffding audit.
   - Interactive Eve eavesdropping switch to test state collapse.
3. **`/attack-sandbox` (Red-Team Attack Matrix)**:
   - Live attack execution engine with 4 synchronized terminal streams (Arbitrator, Alice, Bob, Eve).
   - Raw packet dump inspector and photon batch size selector.
4. **`/monitoring` (SOC Dashboard)**:
   - Live SVG real-time stream graphs (QBER and CHSH dual charts with `[1M | 5M | 15M | ALL]` time range selectors).
   - Threat Ledger with node origin attribution and detection timelines.
   - Incident manager with status escalation workflows.
5. **`/database` (Database Inspector)**:
   - Live table viewer for PostgreSQL tables (`Quantum Sessions`, `Active Threats`, `Node Telemetry`, `Crypto Keys`, `Auth Logs`).
   - Dynamic JSON payload viewer with syntax formatting and search query filtering.

---

## 2. Real-Time Telemetry & Cross-Tab Synchronization

- **`SentinelService`**: Central reactive store holding live streams, active sessions, and security incidents.
- **`BroadcastChannel`**: Broadcasts `NEW_TELEMETRY_ITEM` across all open browser tabs and windows.
- **Fail-Safe Fallback**: Generates realistic synthetic telemetry if the FastAPI backend is momentarily unreachable.

# Page Specification: `/database` — PostgreSQL Database Inspector & Ledger

> **File Location**: `q-email/src/pages/DatabaseInspector/index.tsx`  
> **Route**: `/database`  
> **Purpose**: Interactive PostgreSQL database table inspector, materialized view explorer, and raw JSON payload viewer.

---

## 1. Page Component Structure & Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. LEFT SIDEBAR          │ 2. MAIN TABLE VIEW HEADER                        │
│ [Table Search Input]     │ Table Title | Row Count | Search Bar | Filters    │
│ ┌──────────────────────┐ ├──────────────────────────────────────────────────┤
│ │ Quantum Sessions     │ │ 3. DATA GRID TABLE                               │
│ │ Active Threats (View)│ │ Auto-formatted columns, status badges, verdicts  │
│ │ Node Telemetry       │ ├──────────────────────────────────────────────────┤
│ │ Crypto Keys          │ │ 4. RIGHT PAYLOAD INSPECTION PANEL                │
│ │ Auth Logs            │ │ Selected record JSON schema viewer & copy action │
│ └──────────────────────┘ │                                                  │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

---

## 2. Table Specifications & Features

### 2.1. Left Sidebar Table Navigation
- **Search Input**: Filters table list in real-time.
- **Table List**:
  1. **`Quantum Sessions`**: Primary session ledger (`quantum_sessions` table).
  2. **`Active Threats`**: Materialized alert view (`vw_active_threats`).
  3. **`Node Telemetry`**: Quantum hardware node metrics (`node_telemetry` table).
  4. **`Crypto Keys`**: Distilled OTP key material (`crypto_keys` table).
  5. **`Auth Logs`**: Gateway authentication & request audit log (`auth_logs` table).

### 2.2. Main Header Controls
- **Table Title & Row Count**: Displays selected table name and active record count.
- **Search Query Filter**: Filters rows across ID, node name, verdict, or status.
- **Status Filter Pills (`ButtonGroup`)**: Filters table rows by status: `[ALL | ACTIVE | DEGRADED | COMPROMISED]`.

### 2.3. Data Grid Table
- Auto-formats columns: Record ID, Timestamp (IST), Status Badge, Verdict Tag, Threat Type, Reason, Nodes Involved, Size (KB).
- Interactive row selection: Clicking any row highlights it and loads its complete JSON payload into the right inspection panel.

### 2.4. Right Inspection Panel (JSON Explorer)
- Renders formatted JSON payload of the selected database record.
- Key-Value inspector displaying exact metrics (QBER, CHSH, Hoeffding confidence, affected qubits).
- `"Copy Raw JSON Payload"` action button.

# Changelog

All notable changes to the **QDS — Quantum Digital Signature Security API** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-08-26

### Added & Upgraded
- **Kinetic Precision Design System & Zegion Typography**:
  - **Zegion Font Family Integration (`zegion-font.zip`)**:
    - Extracted and integrated local `Zegion` font weights (`Zegion.otf` / `.ttf` Regular and `Zegion-Oblique.otf` / `.ttf` Oblique).
    - Enforced `@font-face` and universal typography rule across all HTML tags, components, buttons, inputs, tables, labels, headings, and data fields with zero fallback substitution.
    - Updated `tailwind.config.js` and `index.html` with direct preload directives.
  - **Alabaster Gallery Foundation & Tonal Depth**:
    - Foundation: Alabaster gallery canvas (`#FBF8FA` / `#F8FAFC`).
    - Containers: Crisp white matte card enclosures (`#FFFFFF`) with subtle $1\text{px}$ outlines (`#E2E8F0`).
    - Primary & Accents: Deep slate blue primary (`#1E293B` / `#091426`) with high-contrast text (`#1B1B1D` / `#45474C`).
  - **Minimalist Telemetry & Bell Non-Locality Charts (`/monitoring`)**:
    - Redesigned the dual charts in the SOC Overview into clean, minimalist displays.
    - Removed cluttered multi-layered text overlays, heavy 90-degree axis titles, and dense grids.
    - Replaced with 3 subtle horizontal guide rails, soft area gradients, clean live values in the header, and uncluttered X-axis timestamps.
  - **shadcn/ui Component Architecture & Radix Primitives Integration**:
    - Built and integrated full modular shadcn/ui component suite ([`Button`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/button.tsx), [`ButtonGroup`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/button-group.tsx), [`Card`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/card.tsx), [`Badge`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/badge.tsx), [`Dialog`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/dialog.tsx), [`Tabs`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/tabs.tsx), [`Tooltip`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/tooltip.tsx), [`Popover`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/popover.tsx), [`DropdownMenu`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/dropdown-menu.tsx), [`Table`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/table.tsx), [`Input`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/input.tsx), [`Switch`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/switch.tsx), [`Separator`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/separator.tsx), [`Progress`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/progress.tsx), [`Sheet`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/sheet.tsx)).
    - Configured `class-variance-authority` (CVA), `clsx`, and `tailwind-merge` with standard `cn()` utility.
    - Added smooth cubic-bezier easing entry/exit micro-animations and accessibility focus rings.
  - **Single-Theme Experience**:
    - Preserved dedicated, pristine Kinetic Precision light mode across all 5 dashboard modules (`/home`, `/demonstration`, `/monitoring`, `/attack-sandbox`, `/database`).
  - **Git Savepoint**: Maintained commit and annotated tag `savepoint-pre-kinetic-precision`.

---

## [2.0.1] - 2026-08-26

- **Protocol Visualizer Exact Pixel Overhaul & Full Interactivity (`/demonstration`)**:
  - **Visualizer Node Topology Redesign**: Overhauled node containers on [`/demonstration`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/pages/Demonstration/index.tsx) matching the exact reference geometry:
    - **Smooth Curved Node Containers**: Upgraded Alice, Bob, and Arbitrator cards to `w-24 h-24 rounded-2xl bg-white border border-[#CBD5E1] shadow-xs`.
    - **Integrated Circular Corner Identifiers**: Replaced square corner badges with crisp circular badges (`w-6 h-6 rounded-full bg-[#0058BE] text-white`) for Alice `A`, Bob `B`, and Arbitrator `EPR` with dynamic red alert fills during active attacks.
    - **Clean, Stable Typography**: Eliminated erratic, jumping status pills underneath nodes, maintaining fixed, clean alignment across all 3 nodes (`ALICE NODE` $\to$ `TX MOD 99` $\to$ `Basis: {+, x}`). Active operational feedback is cleanly routed through the high-visibility **Live Telemetry Strip** and subtle focus rings.
  - **Clean Monospaced Scientific Table Design**: Removed artificial colored pill boxes and visual clutter from the Quantum Bitstream Matrix, formatting all values (`01`, `x`, `0`, `+`, `1`, `Φ-`, `Yes`/`-`, `Kept`/`Discarded`/`QBER Error`) as clean, high-contrast, professional monospaced text.
  - **Full Aesthetic, Typography & Palette Harmonization with `/home`**: Completely harmonized the visualizer page design system tokens with the Central Gateway Hub:
  - **Protocol Phase Progress Line Precise Boundary Lock**: Anchored the horizontal track and active `#0058BE` fill line precisely between the geometric center of `Phase 1 (EPR PREP)` and `Phase 6 (KEY GEN)`, ensuring the progress indicator stops with 0px overflow upon reaching the final phase.
  - **Live Runner Telemetry Strip**: Added a real-time status banner above the canvas displaying active simulation status (`ACTIVE RUNNING` vs `PAUSED`), current phase operational action (e.g. `Pumping BBO Crystal`, `Alice Joint BSM & Bob SNSPD Basis Read`), in-flight pulse number (`#03 / 08`), and real-time measured QBER telemetry (`14.2% ALERT` vs `2.1% NOMINAL`).
  - **Dynamic Reactive Node Auras & Badges**: Nodes now visibly react to active protocol phases:
    - Phase 1: Arbitrator glows with `SPDC PUMPING` ring.
    - Phase 2: Fiber lines glow with a brighter blue pulse stream; Eve sensors flash when active.
    - Phase 3: Alice and Bob flash `BSM ACTIVE` and `SNSPD DETECT` with real-time basis reads.
    - Phase 4: Classical basis exchange channel renders dynamically between Alice and Bob.
    - Phase 6: Alice and Bob illuminate with green `SIGNATURE READY` / `KEY VERIFIED` flags.
  - **Live Matrix Row Highlight**: The quantum bitstream matrix dynamically highlights the active in-flight pulse row (`#01` through `#08`) with an active blue left border and background track as the simulator runs.
  - **Deterministic Organized Layout on Reload**: Added dynamic canvas viewport geometry calculation (`getOrganizedPositions`) ensuring Alice, Arbitrator, Bob, and Eve nodes mount in balanced, horizontal, and symmetrical positions across all screen sizes on every reload.
  - **Reset Layout Feature**: Added `⟲ Reset Layout` button in the topology bar to snap nodes back to their default alignment at any time.
  - **Draggable Node Canvas & Click Discrimination**: Alice, Arbitrator, Bob, and Eve nodes are freely draggable across the canvas without accidentally triggering modal popups; modals now only open on deliberate single-clicks.
  - **Arbitrator Node Card & Icon**: Upgraded Arbitrator into a matching white container card with laser/SPDC optical source vector icon, blue `EPR` badge, and clean text hierarchy with no underline.
  - **Minimalist Photon Transmission**: Replaced chaotic flashes with smooth, serene single-pulse linear photon glides along fiber channels.
  - **Top Navigation Bar**: Centered bold `PROTOCOL VISUALIZER` heading with flush bottom underline, simulator settings tuning popover, real-time threat notifications, and administrator profile credentials drawer.
  - **Simulator Controls & Phase Runner**: Interactive `▷ PLAY` / `⏸ PAUSE` runner with speed controls (1x, 2x, 5x), step forward `⏭`, reset `⟲`, click-to-reset `T+0.045s` timestamp chip, and live backend signature generation trigger `⚡ EXECUTE LIVE RUN`.
  - **Phase Explanations**: Clicking any of the 6 protocol phases (`EPR PREP`, `DISTRIBUTION`, `MEASUREMENT`, `SIFTING`, `ERROR EST.`, `KEY GEN`) opens a deep cryptographic explanation modal.
  - **Node Diagnostics Modals**: Interactive node inspect drawers on Alice (TX MOD 99), Arbitrator (SPDC EPR Source), Bob (RX DET 01), and Eve (35% MitM probe).
  - **Pulse Vector Forensics & CSV Export**: Clicking any row in the quantum bitstream matrix opens the pulse forensic drawer; download button exports the live matrix to CSV.
  - **Keyboard & Backdrop Dismissal**: Added global `Escape` key listener and backdrop click-to-dismiss functionality across all open modal sheets, drawers, and popovers.
  - **User Profile & Security Clearance Drawer**: Added interactive profile popover revealing cryptographic credentials, clearance level (`LEVEL 5`), assigned node, and one-click Public Key copy.
  - **Live Threat & Attack Notification System**: Wired notification bell directly to SOC engine with active attack counters, real-time alert breakdown, "Clear All" functionality, and direct navigation to SOC Monitoring.
  - **Interactive Quantum Concept Modals**: Added interactive modals on all concept pills (`EPR PAIRS`, `ALICE JOINT BSM`, `BOB PAULI ROTATIONS`, `CHSH BELL TEST`) with mathematical formulas and direct simulator launcher buttons.
  - **Gateway Diagnostics Modal**: Added live API telemetry and PostgreSQL connectivity inspection sheet accessible via `API: 3001 OK` status badge.
  - **Exact Kinetic Precision Palette Alignment**: Harmonized all modal sheets, equation boxes, dropdown menus, and button states to `#FFFFFF` / `#F6F3F5` / `#E2E8F0` / `#091426` / `#0058BE`.
  - **Clipboard Copy Utilities**: Integrated animated feedback toasts (`✓ Copied!`) for Session ID and Quantum Key hashes.

---

## [2.0.0] - 2026-08-26

### Added & Revamped
- **Complete Tri-Dashboard UI Revamp to "Kinetic Precision" Institutional Design System**:
  - Integrated the complete UI design overhaul extracted from `stitch_remix_of_quantum_security_console.zip` across all 3 dashboards (`q-email`, `frontend`, `db-dashboard`).
  - Converted all static HTML templates into pure, reactive React + TypeScript / JSX components.
  - Standardized color system (`#fbf8fa` surface, `#1e293b` container, `#0058be` secondary precision blue, `#B91C1C` critical data, `#065F46` success, `#0F172A` terminal background).
  - Applied institutional typography (`Inter` for UI prose and `IBM Plex Mono` for all data parameters, pips, and sensor values).

- **Dashboard 1: Cyber-SOC Sentinel (`q-email`, Port 3000)**:
  - **`/home` Hub Portal (`HomePage`)**: Converted from `qds_sentinel_hub_standardized_colors` to a clean central gateway with interactive launch cards to Protocol Visualizer and SOC Monitoring.
  - **`/demonstration` Protocol Visualizer (`DemonstrationPage`)**: Converted from `qds_protocol_visualizer_standardized_colors` to interactive Alice ↔ Bob visual simulator with Play/Pause runner, 6-phase step tracker, animated photon canvas, 35% Eve MitM toggle, and 8-pulse bitstream matrix.
  - **`/monitoring` SOC Analytics Center (`MonitoringPage`)**: Converted from `qds_soc_monitoring_*` with 5 subdirectories:
    - `overview`: 6 KPI cards, Hoeffding Area chart, CHSH Bell Line chart, and real-time live telemetry stream.
    - `threats`: Statistical boundary tiles and forensic evidence inspector.
    - `incidents`: Quarantined threat records with severity filters.
    - `sessions`: Session database with live QBER, CHSH, and verdicts.
    - `network`: 4-node quantum mesh topology.

- **Dashboard 2: Red Team Attack Sandbox (`frontend`, Port 5173)**:
  - Converted `qds_attack_sandbox_theme_aligned` into `frontend/src/App.jsx`.
  - 3-column layout: Left scenario radio launcher (Clean, MitM 35%, Forgery, Replay, Noise, PNS), Center 4-way distributed node terminal feeds (`Arbitrator.sys`, `Alice Node`, `Bob Node`, `Eve Intercept`), and Right real-time telemetry graphs (QBER vs Hoeffding threshold, CHSH Bell violation).

- **Dashboard 3: Database Live Inspector (`db-dashboard`, Port 4000)**:
  - Converted `qds_database_inspector_theme_aligned` into `db-dashboard/src/App.jsx`.
  - Left schema/table switcher with record counts (`quantum_sessions`, `node_telemetry`, `auth_logs`, `crypto_keys`, `vw_active_threats`).
  - Top SQL query execution bar and quick search filter.
  - High-density spreadsheet data grid with live auto-sync every 2.5s.
  - Slide-over JSONB bitstream inspector drawer for inspecting full raw cryptographic session objects.

- **Verification**:
  - All 3 dashboards build with 0 TypeScript/Vite errors (`q-email`: 18.32s, `frontend`: 729ms, `db-dashboard`: 857ms).

---

## [1.0.0] - 2026-08-25

### Added
- **Local PostgreSQL Integration**:
  - Configured PostgreSQL 18.3 engine integration running on local port `5432` connected to `qds_db`.
  - Added `.env` configuration file for database credentials (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_SERVER`, `POSTGRES_PORT`, `POSTGRES_DB`).
  - Updated `database.py` with explicit SQLAlchemy ORM model discovery (`SessionModel` & `TelemetryModel`) during `init_db()`.
  - Added `load_sessions_from_db()` method in `SessionService` to automatically hydrate in-memory cache from PostgreSQL on server startup.
  - Enhanced `TelemetryMiddleware` with automatic persistent write-through logging into PostgreSQL `telemetry_logs` table.

- **Module 3 — Distributed Node API Framework**:
  - **Arbitrator Router (`/api/v1/arbitrator`)**:
    - `POST /epr-distribute`: Simulates EPR entangled state pair generation between Alice and Bob.
    - `GET /session/{session_id}`: Retrieves full status and parameters of a quantum session.
    - `POST /session/{session_id}/reset`: Resets session states back to `EPR_READY`.
  - **Alice Signer Router (`/api/v1/alice`)**:
    - `POST /sign`: Accepts document hash, prepares state, performs Bell measurement, and extracts classical feed-forward bits ($M_{a1}, M_{a2}$).
    - `GET /signature/{session_id}`: Retrieves Alice's generated signature payload and Bell measurement outcomes.
  - **Bob Verifier Router (`/api/v1/bob`)**:
    - `POST /verify`: Receives classical bits, applies Pauli correction ($X^{M_{a2}} Z^{M_{a1}}$), and performs randomized measurement.
    - `POST /sift`: Performs basis reconciliation, sifts matching bases, and calculates raw Quantum Bit Error Rate (QBER).
  - **Security Threat Router (`/api/v1/security`)**:
    - `POST /analyze`: Computes deterministic security decision, QBER upper bound using Hoeffding's Inequality, CHSH inequality parameter ($S \le 2\sqrt{2}$), and decoy-state yield analysis.
    - `GET /audit/{session_id}`: Generates audit trail and threat intelligence log for SOC dashboard.
  - **Attacks Red-Team Sandbox Router (`/api/v1/attacks`)**:
    - `POST /inject`: Injects adversary attacks including Man-in-the-Middle (Intercept-Resend), Signature Forgery, Replay Attack, Thermal Noise, and Photon Number Splitting (PNS).
    - `GET /history/{session_id}`: Retrieves all attack records injected into a specific session.
  - **Sessions & Telemetry Router (`/api/v1/sessions`)**:
    - `GET /sessions`: Lists active quantum sessions.
    - `DELETE /sessions/{session_id}`: Terminates and closes a quantum session.
    - `GET /telemetry`: Returns recent API performance telemetry entries (execution time ms, status codes, endpoints).

- **Database Schemas & ORM Models**:
  - `SessionModel` (`quantum_sessions` table): Primary key `session_id`, `status`, `nonce`, `created_at`, `updated_at`, and structured JSON columns (`parameters`, `alice`, `bob`, `sifting`, `attacks`, `security`).
  - `TelemetryModel` (`telemetry_logs` table): Auto-increment `id`, `request_id`, `endpoint`, `method`, `timestamp`, `execution_time_ms`, `status_code`, `session_id`, and `error`.

- **Module 1 — Quantum Simulation Core Integration (`backend/app/quantum`)**:
  - Integrated Qiskit-backed Quantum Core modules for EPR entangled Bell state generation (`epr.py`), Alice signature state preparation (`state_preparation.py`), Joint Bell measurement (`bell_measurement.py`), Bob Pauli unitary correction (`correction.py`), randomized projective measurement (`measurement.py`), basis reconciliation (`sifting.py`), and quantum teleportation circuit (`teleportation.py`).
  - Added 20 unit tests in `backend/tests/quantum/` testing quantum circuit execution and state transformation.

- **Module 2 — Deterministic Threat Engine Integration (`backend/app/engine`)**:
  - Integrated deterministic threat detection algorithms for XOR bitwise mismatch evaluation (`xor_evaluator.py`), QBER statistics calculation (`qber.py`), Hoeffding statistical threshold derivation (`hoeffding.py`), CHSH Bell inequality test ($S \le 2\sqrt{2}$) (`chsh.py`), decoy-state yield evaluation (`decoy.py`), threat classifier (`classifier.py`), deterministic decision gate (`decision.py`), and transaction orchestrator (`orchestrator.py`).
  - Integrated synthetic telemetry mock dataset generator (`backend/app/mock`) for MITM, Forgery, Replay, Noise, and PNS attack scenarios.
  - Added 36 unit and pipeline tests in `backend/tests/engine/`.
  - Added Engine REST endpoints in `engine_routes.py` mounted at `/api/v1/security/` (`/xor`, `/qber`, `/threshold`, `/chsh`, `/decoy`, `/analyze`, `/audit`, `/mock`, `/health`, `/config`).

- **Comprehensive Unified Test Suite**:
  - 83 unit and integration tests across Module 1, Module 2, and Module 3 (`83 passed in 20.03s`).
  - 100% test pass rate using Qiskit, pytest-asyncio, FastAPI TestClient, and local PostgreSQL database persistence.

- **System Documentation**:
  - `POSTGRES_SETUP.md`: Step-by-step setup, startup, configuration, and SQL query verification guide.
  - `SYSTEM_ARCHITECTURE_ANALYSIS.md`: Architectural deep dive into QDS simulation engine, mathematical security bounds, threat engine, and API schemas.

### Changed
- Refactored `database.py` startup routine to fallback seamlessly to in-memory SQLite (`sqlite+aiosqlite:///:memory:`) if local PostgreSQL service is unreachable.
- Updated CORS configuration in `config.py` to allow cross-origin requests from React/Vite development servers on ports 3000, 5173, 5174, and 8000.

---

## [0.9.0] - 2026-08-15

### Added
- Initial prototype layout for SIH 2026 Problem Statement 26141.
- Core quantum simulation state definitions (`QuantumSession`, `SessionParameters`, `AliceData`, `BobData`, `SiftingData`, `SecurityResult`).
- Baseline FastAPI application setup with Swagger (`/docs`) and ReDoc (`/redoc`) documentation endpoints.

# Master Specification: `/transfer` — Real-Time Quantum Secure Transfer Console

> **File Location**: `q-email/src/pages/Transfer/index.tsx`  
> **Route**: `/transfer`  
> **Purpose**: Real-time quantum-signed text and file transfer application connecting Alice (Sender/Signer) to Bob (Receiver) with live FastAPI backend integration, state-by-state execution logs, and interactive Eve interception tapping.

---

## 1. Page Architecture & Split Terminal Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TOP BRAND NAVBAR                                                         │
│ [QDS SENTINEL Logo]    [Real-Time Transfer Tab]    [FastAPI Core Connected] │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. QUANTUM CHANNEL METRIC BAR                                               │
│ [EPR Rate: 1,024/s]  [QBER: 1.85%]  [CHSH: S=2.78]  [Eve Switch: OFF/ON]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. SPLIT VIEW ALICE & BOB REAL-TIME TERMINAL CONSOLE                        │
│ ┌───────────────────────────────┐ ┌───────────────────────────────┐         │
│ │ ALICE TERMINAL (You - Signer) │ │ BOB TERMINAL (Receiver)       │         │
│ │ - Mode Switch [Text | File]   │ │ - Live SNSPD Receptor Stream  │         │
│ │ - Payload Input / Drag Zone   │ │ - Pauli Reconstruction        │         │
│ │ - SHA-256 Digest Generator    │ │ - SHA-256 Verification        │         │
│ │ - [Send Quantum Payload]      │ │ - Decrypted Message History   │         │
│ └───────────────────────────────┘ └───────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Features & Capabilities

### 2.1. Dual Transfer Mode (`Text` vs `Document File`)
- **Text Mode**: Styled multi-line compose area to send real-time quantum signed text payloads, with 3 quick preset buttons (*"Defense Manifest 09"*, *"OTP Key Exchange"*, *"Satellite Command"*).
- **Document File Mode**: Drag-and-drop file upload zone supporting `.txt`, `.pdf`, `.sig`, `.json` files with live file size calculation.

### 2.2. Quantum One-Time-Pad SHA-256 Digest Generator
- Computes SHA-256 hash digest ($H = \text{SHA256}(M)$) in real-time as text or files are entered.
- Includes `"Copy Hash"` action button for clipboard inspection.

### 2.3. Interactive Eve Interception Switch
- **When Eve is OFF**: Photons travel cleanly. QBER = $1.85\%$, CHSH score $S = 2.78$. Bob receives payload instantly with **`✓ VERIFIED & MATCHED`** badge.
- **When Eve is ON**: Eve taps $35\%$ of optical fiber channel. Interception induces measurement collapse. QBER spikes to **$14.2\%$**, CHSH drops to **$S = 1.76$**. Bob displays **`✖ REJECTED (EVE TAP)`** with red warning banner.

### 2.4. Real-Time FastAPI Core Backend Integration
- Triggers asynchronous HTTP POST requests to `/api/v1/alice/prepare-state`, `/api/v1/arbitrator/evaluate-handshake`, and `/api/v1/bob/verify-signature`.
- Dispatches live telemetry events to `sentinelService` updating `/monitoring` automatically.

---

## 3. COMPLETE UI INTERACTION & STATE MUTATION MATRIX

| UI Element | Trigger Event | React State Mutated | Visual & UI Effect | Background & API Action |
| :--- | :--- | :--- | :--- | :--- |
| **Logo (`QDS SENTINEL`)** | `onClick` | N/A | Smooth route transition back to `/home`. | Invokes `onNavigateHome()`. |
| **Mode Switch: `Text Message`** | `onClick` | `transferMode = 'text'` | Displays text compose area and quick preset buttons. | None. |
| **Mode Switch: `Document File`** | `onClick` | `transferMode = 'file'` | Displays file drag & drop upload box. | None. |
| **Preset Pill (`Defense Manifest 09`)** | `onClick` | `textInput = presetText` | Fills compose area with preset text string. | Re-calculates SHA-256 hash digest. |
| **Text Compose Area** | `onInput` | `textInput = val` | Real-time text update. SHA-256 hash card updates dynamically. | None. |
| **File Drag & Drop Box** | `onDrop` / `onChange` | `selectedFile = {name, sizeKb, content}` | Displays selected file name, file size, and file type. | Reads file content and computes hash. |
| **SHA-256 Hash Card: Copy** | `onClick` | `copiedHash = true` | Shows checkmark icon `"COPIED"` for 2 seconds. | Copies 64-character hex hash to clipboard. |
| **Eve Interception Switch** | `onCheckedChange` | `isEveActive = val` | **OFF $\rightarrow$ ON**: Metric bar QBER switches to `14.2%` (Red), CHSH score switches to `S = 1.76`. Switch badge turns red (`35% TAP ACTIVE`). | Updates simulation channel parameters. |
| **`Send Quantum Signed Payload`** | `onClick` | `isTransmitting = true`, `transmitStep = 1..4` | Button shows spinning loader, right Bob terminal displays live streaming terminal logs (Steps 1..4), new payload card appears in Bob's history feed. | Sends HTTP POST to `/api/v1/arbitrator/evaluate-handshake` and dispatches live telemetry events. |
| **Payload Card: Copy Text** | `onClick` | `copiedContentId = msg.id` | Shows checkmark `"Copied"` for 2 seconds. | Copies received text to clipboard. |

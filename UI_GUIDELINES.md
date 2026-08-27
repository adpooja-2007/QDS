# UI & Design System Guidelines

> **System: Quantum Digital Signature Security Console (QDS)**  
> **UI Stack**: React 18 + TypeScript + Tailwind CSS + shadcn UI Component Suite  
> **Design Philosophy**: High-precision aerospace/quantum laboratory aesthetics with modern glassmorphic accents.

---

## 1. Typography — Zegion Custom Font

1. **Primary Typography**:
   - The entire web interface strictly uses the **Zegion** custom font (`font-family: 'Zegion', sans-serif`).
   - Declared in [`src/index.css`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/index.css) via `@font-face`:
   ```css
   @font-face {
     font-family: 'Zegion';
     src: url('/fonts/Zegion.otf') format('opentype'),
          url('/fonts/Zegion.ttf') format('truetype');
     font-weight: 100 900;
     font-display: swap;
   }
   ```
2. **Monospace Stacks**:
   - Telemetry logs, hex dumps, and qubit registers use high-legibility monospaced font stacks (`font-mono`):
   ```css
   font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
   ```

---

## 2. Button & Button Group Conventions (`rounded-full`)

1. **Pill-Shaped Action Controls**:
   - **Every button across every page must use `rounded-full` (pill shape).**
   - Applied via base CSS rule in `index.css`:
   ```css
   button:not(:disabled), [role="button"]:not(:disabled) {
     cursor: pointer;
     border-radius: 9999px;
   }
   ```
2. **Official shadcn `Button` ([`src/components/ui/button.tsx`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/button.tsx))**:
   - Supports all variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`.
   - Supports all sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`.
   - All variants have `rounded-full` built-in.
3. **Official shadcn `ButtonGroup` ([`src/components/ui/button-group.tsx`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/button-group.tsx))**:
   - Groups related buttons in a continuous `rounded-full` container.
   - Includes `ButtonGroupSeparator` and `ButtonGroupText`.
   - Used across:
     - `/monitoring`: Dual chart time range selectors `[1M | 5M | 15M | ALL]`
     - `/database`: Status filter pills `[ALL | ACTIVE | DEGRADED | COMPROMISED]`
     - `/demonstration`: Player controls `[Play | Pause | Step | Reset]`

---

## 3. Strict UI Naming Rule — **Zero Raw Underscores**

**Rule**: Never render raw programmer underscores (`_`) anywhere in displayed UI text, badges, headers, or terminal logs.

| ❌ Never Use in UI | ✅ Standard Replacement | Context |
| :--- | :--- | :--- |
| `ARBITRATOR_MAC` | **`ARBITRATOR MAC`** | Subsystem Badge / Telemetry |
| `NONCE_AUDIT` | **`NONCE AUDIT`** | Subsystem Badge / Telemetry |
| `DECOY_ANALYSIS` | **`DECOY ANALYSIS`** | Subsystem Badge / Telemetry |
| `FIBER_TELEMETRY` | **`FIBER TELEMETRY`** | Subsystem Badge / Telemetry |
| `OPTICAL_JAMMER` | **`OPTICAL JAMMER`** | Subsystem Badge / Telemetry |
| `EVE_PROBE` | **`EVE PROBE`** | Subsystem Badge / Telemetry |
| `QKD_NODE_07` | **`QKD-NODE-07`** | Network Node Identifier |
| `ARB_CORE_01` | **`ARB-CORE-01`** | Origin Node Badge |
| `quantum_sessions` | **`Quantum Sessions`** | Database Table Inspector |
| `vw_active_threats` | **`Active Threats`** | Database View Inspector |
| `node_telemetry` | **`Node Telemetry`** | Database Table Inspector |
| `crypto_keys` | **`Crypto Keys`** | Database Table Inspector |
| `auth_logs` | **`Auth Logs`** | Database Table Inspector |
| `DEGRADED_OPERATIONAL` | **`DEGRADED OPERATIONAL`** | Security Status Tag |
| `FORGERY_DETECTED` | **`FORGERY DETECTED`** | Arbitrator Verdict Tag |
| `initialize_protocol` | **`initialize protocol`** | Terminal Stream Logs |

---

## 4. Curated Color Palette & Tokens

```css
:root {
  /* Brand Navy & Dark Accents */
  --color-brand-dark: #091426;
  --color-brand-surface: #FFFFFF;
  --color-brand-canvas: #FBF8FA;
  
  /* Primary Action Sapphire */
  --color-primary: #0058BE;
  --color-primary-hover: #00469B;
  --color-primary-light: #EBF2FF;
  
  /* Emerald Success (Nominal Channel) */
  --color-success: #065F46;
  --color-success-bg: #ECFDF5;
  --color-success-border: #A7F3D0;
  
  /* Amber Warning (Degraded Channel) */
  --color-warning: #C2410C;
  --color-warning-bg: #FFFBEB;
  --color-warning-border: #FDE68A;
  
  /* Crimson Breach (Compromised Channel / Attack) */
  --color-danger: #BA1A1A;
  --color-danger-bg: #FEF2F2;
  --color-danger-border: #FECACA;
  
  /* Neutral Grays & Borders */
  --color-border: #E2E8F0;
  --color-border-dark: #334155;
  --color-text-primary: #091426;
  --color-text-secondary: #45474C;
  --color-text-muted: #75777D;
}
```

---

## 5. shadcn Component Directory Map

All reusable UI components are stored in [`q-email/src/components/ui/`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/):

- [`button.tsx`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/button.tsx): Full shadcn button with all sizes, variants, and `rounded-full`.
- [`button-group.tsx`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/button-group.tsx): Segmented button container with separators.
- [`card.tsx`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/card.tsx): Card container with `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction`.
- [`badge.tsx`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/badge.tsx): Compact status, role, and subsystem pill badges.
- [`input.tsx`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/input.tsx): Form inputs with focus rings and error states.
- [`dialog.tsx`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/dialog.tsx): Accessible modal overlays and dialog wrappers.
- [`tabs.tsx`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/tabs.tsx): Tab triggers and content panels.
- [`table.tsx`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/table.tsx): High-density data grid tables.
- [`tooltip.tsx`](file:///c:/Users/Viki/OneDrive/Desktop/DIGSIGN/q-email/src/components/ui/tooltip.tsx): Micro-interaction hover tooltips.

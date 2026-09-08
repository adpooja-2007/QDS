---
name: Kinetic Precision
colors:
  surface: '#fbf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fbf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45474c'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#041528'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a2a3e'
  on-tertiary-container: '#8191a9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#fbf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
  surface-stroke: '#E2E8F0'
  data-critical: '#B91C1C'
  data-success: '#065F46'
  data-warning: '#B45309'
  terminal-bg: '#0F172A'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  data-mono:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-mono:
    fontFamily: IBM Plex Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  space-xs: 4px
  space-sm: 8px
  space-md: 16px
  space-lg: 24px
  space-xl: 48px
  gutter: 16px
  sidebar-width: 260px
  drawer-width: 400px
---

## Brand & Style

The design system is modeled after **High-End Scientific Instrumentation**: clinical, mature, and undeniably professional. It is engineered for experts who require high cognitive throughput and zero distraction. The emotional response is one of "calm authority"—the interface feels like a reliable piece of hardware that recedes to prioritize data integrity and telemetry accuracy.

The design style is **Institutional Minimalism**. It rejects decorative "eye candy"—glassmorphism, vibrant glows, and soft shadows are strictly prohibited. Instead, the system relies on:
- **Structural Rigor:** A commitment to a strict grid and 1px architectural lines.
- **Functional Density:** Optimizing for information-rich environments without visual clutter.
- **Monochromatic Sophistication:** A restrained base palette that elevates functional blue accents for critical interaction points.

## Colors

The palette is intentionally limited to maintain a low-fatigue environment for long-duration technical work.

- **Primary (Deep Slate):** Used for structural borders, primary text, and heavy UI chrome. It provides the "ink" for the system.
- **Secondary (Precision Blue):** A technical blue used exclusively for focus states, active indicators, and primary actions. It should occupy less than 5% of the total screen area.
- **Neutral (Soft Chalk):** A soft, off-white with a hint of warmth to reduce the harshness of pure white backgrounds, mimicking matte hardware surfaces.

**Implementation Notes:**
- Avoid using color for decorative purposes. 
- **Status colors** must be desaturated and used only for functional markers, such as 2px strokes or 6px status pips.
- **Terminal areas** should use the `terminal-bg` (#0F172A) to provide a high-contrast environment for code and logs.

## Typography

The typography system distinguishes between **Interface Prose** (Inter) and **Technical Data/Telemetry** (IBM Plex Mono).

- **Inter:** Chosen for its legibility in interface controls. Use Medium (500) only for emphasis and headings; avoid Bold (700) to keep the aesthetic "light" and technical.
- **IBM Plex Mono:** Essential for numerical data, sensor readings, and logs. The monospaced nature ensures that values align vertically in tables, allowing for rapid scanning of decimal points and discrepancies.

**Guidelines:**
- Use `label-mono` for table headers, metadata tags, and small captions.
- Use `data-mono` for all variable outputs, timestamps, coordinates, and terminal inputs.
- Maintain strict vertical rhythm by adhering to the defined line heights.

## Layout & Spacing

This system uses a **fixed-fluid hybrid grid** based on a 4px baseline to ensure high-density layouts remain organized.

- **Main Canvas:** Content is housed in a 12-column fluid grid with 16px gutters.
- **Sidebars:** Navigation and configuration panels use a fixed width (260px) to ensure consistency in tool density across screen sizes.
- **Slide-over Drawers:** Used for deep-dive telemetry and inspection; these use a fixed 400px width.
- **Alignment:** All technical data should be top-aligned. Numeric data in tables must be right-aligned to maintain decimal alignment.
- **Breakpoints:** 
  - Mobile (< 768px): Hide sidebars behind a toggle; switch to a single-column fluid layout. 
  - Tablet (768px - 1280px): Fixed sidebar; fluid main content area.
  - Desktop (> 1280px): Fixed sidebar and optional fixed right-hand inspector panel.

## Elevation & Depth

This system utilizes **Flat Layering** and **Tonal Separation** rather than shadow-based elevation to maintain a crisp, engineered feel.

- **Tonal Tiers:** The primary canvas is `#FBF8FA`. Secondary panels, "wells," or inset areas use a subtle background shift (e.g., `#F1F5F9`) or a 1px solid stroke.
- **Borders:** Every functional area must be defined by a 1px solid border (`#E2E8F0`). This mimics the physical partitioning seen on laboratory hardware consoles.
- **High-Contrast Outlines:** For elements that must appear "above" the main surface (like dropdowns or drawers), use a high-contrast 1px border of the primary color (`#1E293B`) instead of a shadow.
- **Glassmorphism:** Strictly prohibited. Surfaces should be opaque to ensure maximum text contrast.

## Shapes

The shape language is sharp, geometric, and engineered.

- **Corner Radius:** A universal **4px radius** (`rounded-sm`) is applied to all components (buttons, cards, inputs, and drawers). This provides just enough softness to feel contemporary without losing the precision of sharp corners.
- **Icons:** Use 1.5px or 2px stroke-weight icons with square ends. Avoid rounded or bubbly icon sets; iconography should resemble technical schematics.
- **Interactive Indicators:** Use 2px thick "indicator bars" (vertical for list items, horizontal for tabs) in Precision Blue to show active selection.

## Components

### Buttons
- **Primary:** Solid `#1E293B` background with white text. 4px radius.
- **Secondary:** 1px border of `#1E293B` with no fill.
- **Active State:** On hover/focus, secondary buttons transition to a 1px `#3B82F6` border.

### Input Fields
- **Default:** 1px border of `#E2E8F0` with a 4px radius.
- **Focus:** 1px border of `#3B82F6`. Use `data-mono` for input text to ensure technical clarity.
- **Terminal Inputs:** No borders; use a leading `>` character and `data-mono` on a `#0F172A` background.

### High-Density Grids (Tables)
- **Rows:** 1px horizontal dividers only. No vertical dividers except in headers.
- **Header:** Use `label-mono` (uppercase) with a subtle background fill.
- **Selection:** Use a 2px vertical blue bar on the far left of the row.

### Slide-over Drawers
- **Structure:** Anchored to the right screen edge. 1px `#1E293B` left border.
- **Content:** Grouped into "sections" separated by 1px horizontal lines.

### Status Indicators
- **Pips:** 6px circular indicators using `data-critical`, `data-success`, or `data-warning`.
- **Logic:** Always pair color pips with a `label-mono` text descriptor for accessibility.

### Cards & Panels
- **Structure:** 1px solid `#E2E8F0` border. No fill.
- **Header:** A 24px height header area separated by a 1px horizontal rule, often containing a `label-mono` title.
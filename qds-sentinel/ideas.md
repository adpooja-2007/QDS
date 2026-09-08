# QDS Sentinel — Visual Direction

## Three stylistic approaches

### Theme Name: Observatory Noir
Very dark, instrument-panel interface with quiet cyan telemetry and amber warning accents. It feels precise, nocturnal, and built for operators who trust signals over decoration.
**Probability:** 0.03

### Theme Name: Signal Atelier
A warm editorial control room pairing parchment, ink, and oxidized copper with finely drawn quantum diagrams. It makes advanced cryptography feel legible, human, and considered.
**Probability:** 0.07

### Theme Name: Polar Circuit
A cold, high-contrast white and graphite operations console with glacier-blue highlights and thin technical rules. It feels like a premium aerospace instrument: calm, clear, and unforgiving about anomalies.
**Probability:** 0.05

## Selected approach: Signal Atelier

### Design Movement
Swiss International Typographic Style reinterpreted through a modern scientific field notebook: asymmetric composition, explicit hierarchy, and diagrammatic detail over decoration.

### Core Principles
1. **Evidence before ornament.** Every accent, rule, and motion cue should help an operator read a state, a threshold, or a transition.
2. **Warm precision.** Use a paper-white canvas and ink-black type so the interface feels authored rather than sterile, with a single oxidized-copper signal color for action and alert hierarchy.
3. **Asymmetric confidence.** Prefer offset columns, left-weighted navigation, and anchored rails over centered dashboard cards.
4. **Instrumented tactility.** Thin borders, hairline chart rules, monospaced labels, and soft paper grain create the feeling of a physical console.

### Color Philosophy
The base is a mineral paper `#F4F1EA`, chosen to make dense technical content feel breathable. Ink `#16181A` carries primary reading. Slate `#687078` is reserved for quiet metadata. The signature brand color is oxidized copper `#B94A2F`: it is uncommon in security UIs, readable against paper, and emotionally suggests heat, signal, and controlled intervention. Quantum blue `#2F6F85` is a secondary analytic color for healthy channel traces; it never competes with copper alerts.

### Layout Paradigm
A persistent left operator rail anchors the experience. The main canvas is a two-column field: a wide evidence area and a narrower instrument column. Section headers sit on a baseline with small index numbers, and long content uses offset bands rather than a generic centered max-width. The landing view introduces the system through two large asymmetric portals, then a compact status ledger.

### Signature Elements
- Copper hairline markers and oversized section indices such as `01 / 02 / 03`.
- A split-circle quantum mark that appears as the brand icon and as a subtle node motif in diagrams.
- Paper-grain surfaces with blueprint-like grid rules and handwritten-style micro annotations in uppercase mono.

### Interaction Philosophy
Interactions should feel like operating a calibrated instrument. Buttons use clear verbs and stateful labels. Hover states reveal context with a short underline sweep or copper edge, never a floating novelty. State changes are paired with a small status line so the operator understands what changed and why.

### Animation
Use restrained 160–220ms transitions with a crisp ease-out. On load, the rail and main canvas reveal from slightly offset positions, while charts draw via opacity and transform only. The protocol simulator uses a 1.8s photon pulse along a channel and a gentle copper flash on threat state changes. Respect reduced motion by disabling nonessential pulses and relying on state color plus labels.

### Typography System
Display: `DM Serif Display` for rare editorial hero statements and large numerals. UI/body: `IBM Plex Sans` for legibility and technical warmth. Metadata: `IBM Plex Mono` in uppercase with expanded tracking. H1 is 46–64px, sentence case; section titles are 22–28px; body is 14–16px; labels are 10–11px mono.

### Brand Essence
QDS Sentinel is the operator-grade console for proving that quantum signatures remain authentic under attack—built for cyber-SOC analysts and quantum engineers who need the signal, not the theater.
**Personality:** exacting, observant, composed.

### Brand Voice
Headlines are declarative and evidence-led. CTAs are short verbs with a clear operational consequence. Microcopy is calm, specific, and never theatrical.
- Example headline: “Trust is a measurable state.”
- Example CTA: “Open the live audit.”

### Wordmark & Logo
The wordmark is set in uppercase IBM Plex Mono with custom spacing and a copper split-circle glyph replacing the “O” in a future logotype lockup. The icon is a bold circular aperture split by a vertical signal cut, suggesting an entangled pair without using text.

### Signature Brand Color
Oxidized Copper `#B94A2F` — the unmistakable QDS Sentinel signal for intervention, action, and verified attention.

## Style Decisions
- Use a warm, paper-based light theme rather than a default dark cyberpunk console.
- Keep copper reserved for decisive interaction and alert hierarchy.
- Avoid excessive rounded cards; use clipped corners, hairlines, and offset panels.
- Let the quantum demonstration and monitoring views share the same operator rail and visual language.
- Keep the operator rail persistent and visible on every route, with the split-circle mark carried by the rail and the top-level identity.
- Reserve dark surfaces for optical channels, live streams, and simulation focus states.
- Repeat the split-circle / channel-line motif in route identity, diagrams, and status marks rather than treating it as a home-only graphic.

## File reminders
Every CSS/component/page file should preserve the Signal Atelier rules: warm paper base, ink typography, copper signal accents, asymmetry, evidence-first hierarchy, and restrained instrument-like motion.

## Build scope
This static frontend will present the primary Sentinel portal, a live-feeling monitoring console, and a protocol demonstration route with local interactive state. Backend API integrations remain represented as deterministic UI states so the experience is useful in preview without external services.

## References
The layout and labels are based on the user-provided QDS Sentinel UI and architecture specification in `pasted_content.txt`.

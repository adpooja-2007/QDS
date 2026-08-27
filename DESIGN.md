---
name: Kinetic Precision
colors:
  surface: '#fbf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fbf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f4'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e3'
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
  secondary: '#516072'
  on-secondary: '#ffffff'
  secondary-container: '#d2e1f7'
  on-secondary-container: '#556477'
  tertiary: '#1e1200'
  on-tertiary: '#ffffff'
  tertiary-container: '#35260c'
  on-tertiary-container: '#a38c6a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#d4e4fa'
  secondary-fixed-dim: '#b9c8de'
  on-secondary-fixed: '#0d1c2d'
  on-secondary-fixed-variant: '#39485a'
  tertiary-fixed: '#fadfb8'
  tertiary-fixed-dim: '#ddc39d'
  on-tertiary-fixed: '#271902'
  on-tertiary-fixed-variant: '#564427'
  background: '#fbf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e3'
typography:
  display-lg:
    fontFamily: Epilogue
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Epilogue
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is built on the philosophy of **Intellectual Minimalist Lux**. It targets a high-end professional audience that values clarity, precision, and a gallery-like focus on content. The aesthetic avoids unnecessary ornamentation, relying instead on rigorous typography and a matte, tactile quality that feels both established and contemporary.

The visual direction is a blend of **Minimalism** and **Modern Corporate**, utilizing heavy whitespace to create "breathing room" for complex information. Surfaces are treated with a matte finish, avoiding high-gloss gradients or aggressive blurs. The emotional response is one of calm authority, deliberate movement, and quiet confidence.

## Colors

The palette is anchored by a foundational Slate Blue (#1E293B). 

**Dark Mode (Kinetic Precision Dark)**: 
The primary surface is #1E293B. Depth is created through subtle shifts in value rather than opacity. Accents utilize desaturated, misty variations of the base blue to maintain a "matte" feel. Avoid pure blacks or high-contrast vibrations; the goal is a low-eye-strain, professional environment.

**Light Mode (Kinetic Precision Light)**: 
The foundation is a gallery-inspired alabaster (#F8FAFC). #1E293B transitions into the primary role for text and high-importance UI elements (buttons, active states). Secondary elements use softened, desaturated pastels to recede into the background, ensuring the primary content remains the focus.

## Typography

This design system uses a pairing of **Epilogue** for headings and **Hanken Grotesk** for body and UI labels. 

Headings should be set with tighter letter-spacing to emphasize the geometric nature of Epilogue, creating a structured, architectural feel. For body text, Hanken Grotesk provides a sharp, contemporary legibility. Labels and small metadata should often be set in uppercase with slight letter-spacing to reinforce the intellectual, organized aesthetic.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model for desktop to preserve the "gallery" feel, and a fluid model for mobile. 

The spacing rhythm is based on a 4px baseline. Use generous margins (64px+) on desktop to isolate content blocks and elevate the perception of luxury. Elements should be grouped using clear vertical stacks with consistent gaps. Gutters are kept wide at 24px to prevent information density from feeling overwhelming.

## Elevation & Depth

In keeping with the "Matte Lux" aesthetic, depth is communicated through **Tonal Layers** and **Low-Contrast Outlines** rather than traditional shadows.

1.  **Surfaces:** Use slightly lighter or darker fills to distinguish nested containers. In dark mode, a +2% value shift indicates elevation.
2.  **Outlines:** Use 1px solid borders in a desaturated pastel blue. These should be subtle—visible enough to define shape but not high enough contrast to distract from content.
3.  **Shadows:** Avoid diffuse shadows. If depth is absolutely required for overlays (modals), use a "hard" shadow with 0px blur and a 4px offset in the primary color at 10% opacity to mimic a physical paper stack.

## Shapes

The shape language is strictly minimal. A base roundedness of **4px** (Soft) is applied to all interactive elements to take the edge off the brutalism while maintaining a precise, engineered appearance. 

Containers like cards and modals should use the same 4px radius. Do not use pill-shaped buttons; maintain the rectangular profile to reinforce the architectural rigor of the design system.

## Components

**Buttons**
Primary buttons use the primary Slate Blue (#1E293B) in light mode with white text. In dark mode, they use a desaturated mid-tone blue with dark text. The shape is a precise rectangle with a 4px radius. No gradients.

**Input Fields**
Inputs should feature a 1px border. In "Intellectual Minimalist" fashion, focus states are indicated by a color shift of the border to a misty accent color, rather than a thick glow.

**Cards**
Cards are defined by their background tone and a subtle 1px border. Avoid heavy shadows; the card should feel like a matte-finish board resting on the surface.

**Chips/Labels**
Use small, all-caps Hanken Grotesk text. Backgrounds for chips should be very low contrast (e.g., Alabaster with a slightly darker stroke) to keep the UI clean and unobtrusive.

**Lists**
Separate list items with thin, 1px horizontal dividers in a misty pastel. Ensure generous vertical padding (16px+) to maintain the whitespace-heavy narrative.
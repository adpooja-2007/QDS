# Feature Guide: UI Design System & shadcn Suite

> **Directory**: `q-email/src/components/ui/`  
> **Typography**: Zegion Custom Font  
> **Styling**: Tailwind CSS + shadcn UI specifications

---

## 1. Design Principles

1. **Zegion Typography Everywhere**:
   - Custom font loaded in `index.css` applied globally via `font-sans`.
2. **Pill-Shaped Action Elements**:
   - All buttons, button groups, and action triggers are styled with `rounded-full`.
3. **No Underscores in UI**:
   - Subsystem labels, table names, and status badges are rendered with clean spaces or hyphens.
4. **shadcn Component Suite**:
   - High-performance, unstyled/accessible primitives in `src/components/ui/`:
     - `Button`, `ButtonGroup`, `Card`, `Badge`, `Input`, `Dialog`, `Tabs`, `Table`, `Tooltip`.

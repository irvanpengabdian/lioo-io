# Design System Strategy: Organic Light Editorial

## 1. Overview & Creative North Star
**The Creative North Star: "The Living Atelier"**

This design system moves away from the rigid, industrial layouts common in SaaS and replaces them with a "Living Atelier" aesthetic—a space that feels curated, breathing, and tactile. Instead of a standard grid of boxes, we employ a high-end editorial approach where whitespace is a functional element, not just a gap. 

By leveraging **intentional asymmetry**, we break the "template" look. This is achieved through varying column widths and overlapping "floating" components that suggest depth without the clutter of traditional UI shadows. The experience should feel like flipping through a premium physical lookbook: fast, responsive, yet undeniably bespoke.

---

## 2. Colors
Our palette is rooted in botanical tones, designed to reduce cognitive load and evoke a sense of professional calm.

### Core Palette (Material Design Mapping)
*   **Primary (#2C4F1B):** Deep Forest. Used for high-impact brand moments and active states.
*   **Primary Container (#436831):** Sage Green. The workhorse for CTA backgrounds and primary navigation highlights.
*   **Background (#F9FAF5):** Warm Alabaster. A deliberate shift from "digital white" to create a premium, paper-like surface.
*   **Surface Container Lowest (#FFFFFF):** Pure White. Reserved exclusively for cards and interactive inputs to provide the highest contrast against the background.

### The Rules of Engagement
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for structural sectioning. Use background tonal shifts (e.g., placing a `surface-container-low` component on a `background` page) to define boundaries. 
*   **The Glass & Gradient Rule:** To ensure the system feels "alive," use Glassmorphism for floating overlays (e.g., navigation bars or tooltips). Apply a `backdrop-blur` of 12px-20px with a 70% opacity `surface` fill. 
*   **Signature Textures:** Use subtle linear gradients for primary buttons, transitioning from `primary_container` (#436831) to `primary` (#2C4F1B) at a 145° angle. This adds "soul" and depth that flat hex codes cannot provide.

---

## 3. Typography
We utilize **Plus Jakarta Sans** for its geometric clarity and friendly, rounded terminals which mirror our corner radii.

*   **Display (Lg/Md):** 3.5rem / 2.75rem. Use for hero headers. Tighten letter spacing (-0.02em) to create an authoritative, editorial feel.
*   **Headline (Lg/Md):** 2rem / 1.75rem. Set in Bold. These are the anchors of your page.
*   **Title (Lg/Md):** 1.375rem / 1.125rem. Set in Medium. Used for card headers and section titles.
*   **Body (Lg/Md):** 1rem / 0.875rem. Use `on-surface-variant` (#43493E) for body text to maintain a softer, more organic contrast than pure black.
*   **Label (Md/Sm):** 0.75rem / 0.6875rem. Always uppercase with +0.05em tracking for secondary metadata.

---

## 4. Elevation & Depth
In this system, depth is a result of **Tonal Layering**, not heavy dropshadows.

*   **The Layering Principle:** Think of the UI as layers of fine paper. 
    *   **Layer 0 (Base):** `background` (#F9FAF5)
    *   **Layer 1 (Sections):** `surface-container-low` (#F3F4EF)
    *   **Layer 2 (Cards):** `surface-container-lowest` (#FFFFFF)
*   **Ambient Shadows:** If a component must "float" (e.g., a modal or a primary action button), use an extra-diffused shadow: `box-shadow: 0 12px 40px rgba(67, 73, 62, 0.06)`. Note the use of the `on-surface` color for the shadow tint—never use pure black.
*   **The Ghost Border:** For accessibility in input fields, use a 1px border of `outline-variant` (#C3C9BA) at **20% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons & Chips
*   **Primary Action:** Extra rounded (`radius-full`), using the signature Sage gradient. 
*   **Secondary Action:** `surface-container-highest` background with `on-surface` text. No border.
*   **Chips:** Use `secondary-container` (#BBEDA6) for selected states. The high roundedness (16px+) is mandatory to maintain the "friendly" brand pillar.

### Inputs & Fields
*   **Text Fields:** Use `surface-container-lowest` (#FFFFFF) with a `md` (1.5rem) corner radius. Labels should sit as `label-md` tokens exactly `0.7rem` (spacing 2) above the field.
*   **Checkboxes/Radios:** Use `primary` (#2C4F1B) for active states. Avoid sharp corners; even checkboxes should have a `sm` (0.5rem) radius.

### Cards & Lists
*   **The Divider Ban:** Never use line dividers between list items. Use vertical whitespace (Spacing 4 or 6) or subtle background-color staggering (alternating between `background` and `surface-container-low`).
*   **Card Composition:** Cards must use `radius-lg` (2rem). Content inside should have a minimum padding of `spacing-6` (2rem) to allow the "Living Atelier" to breathe.

---

## 6. Do’s and Don’ts

### Do
*   **DO** use asymmetric layouts. If a left column is 60% wide, let the right column be 30% with a 10% empty "breather" gap.
*   **DO** use high-quality, organic photography with soft lighting to complement the Sage palette.
*   **DO** prioritize "Speed of Interaction." Transitions should be fast (200ms) using a `cubic-bezier(0.2, 0, 0, 1)` easing curve for a snappy, high-end feel.

### Don't
*   **DON'T** use 100% opaque black (#000000). It breaks the organic harmony. Use `on-surface` (#1A1C19).
*   **DON'T** use standard 4px or 8px border radii. If it’s not `1rem` (16px) or higher, it doesn't belong in this system.
*   **DON'T** crowd the interface. If you feel a section needs a divider line, it actually needs more whitespace.
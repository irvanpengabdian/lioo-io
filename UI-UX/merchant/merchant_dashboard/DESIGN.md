# Design System Document: The Living Atelier

## 1. Overview & Creative North Star
### The Creative North Star: "The Biophilic Ledger"
Standard SaaS portals feel clinical, rigid, and cold. For this merchant portal, we are moving toward an aesthetic that balances high-efficiency financial management with the breathing room of a premium editorial magazine. We call this **"The Biophilic Ledger."**

This system rejects the "boxed-in" nature of traditional grids. We utilize intentional asymmetry, exaggerated rounded corners (16px+), and high-contrast typography scales to create an environment that feels more like a physical atelier and less like a database. Information is organized not by lines, but by light and depth.

---

## 2. Colors & Tonal Depth
Our palette is rooted in the organic durability of Sage and Forest greens. We use these not just as accents, but as the foundation of our environmental depth.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections, cards, or containers. This is the hallmark of "standard" UI. In this system, boundaries are created exclusively through background color shifts.
- A card should be defined by placing a `surface_container_lowest` (#FFFFFF) element on a `surface_container_low` (#F3F4EF) background.
- Structural separation is achieved through white space from our Spacing Scale, never through a divider line.

### Surface Hierarchy & Nesting
Treat the UI as a series of layered organic materials.
- **Base Layer:** `surface` (#F9FAF5).
- **Secondary Sectioning:** `surface_container` (#EDEEE9) for sidebars or secondary content areas.
- **Actionable Containers:** `surface_container_lowest` (#FFFFFF) for primary cards and data tables.
- **Active States:** Use `surface_bright` to draw the eye to interactive elements.

### The Glass & Gradient Rule
To achieve "The Living Atelier" vibe, use **Glassmorphism** for floating elements (like modals or navigation overlays). Use a 20-40px backdrop blur with a semi-transparent `surface_variant`. 

For Primary CTAs and Hero sections, use a **Signature Texture**: a subtle linear gradient from `primary_container` (#436831) to `primary` (#2C4F1B) at a 135-degree angle. This adds "soul" and professional polish that flat Sage Green cannot achieve alone.

---

## 3. Typography: Editorial Authority
We use **Plus Jakarta Sans** for its modern, geometric clarity. To move away from a "template" look, we use an aggressive scale.

*   **Display Scale:** Use `display-lg` (3.5rem) with `-0.02em` letter spacing for hero metrics. It should feel authoritative and monumental.
*   **Headline/Body Pairing:** Headlines should be bold and dark (`on_surface`). Body text should use `body-md` in `on_surface_variant` (#43493E) to create a sophisticated, lower-contrast reading experience that reduces eye strain.
*   **Labels:** `label-sm` (uppercase with +0.05em tracking) should be used for data categories to provide an architectural, organized feel.

---

## 4. Elevation & Depth
Hierarchy is achieved through **Tonal Layering** rather than shadows or strokes.

### The Layering Principle
Stacking tiers is our primary method of elevation. 
- Level 0: `surface`
- Level 1: `surface_container_low` (In-page sections)
- Level 2: `surface_container_lowest` (Cards)

### Ambient Shadows
When an element must float (e.g., a dropdown or a floating action button), use **Ambient Shadows**. 
- **Value:** `0px 24px 48px rgba(44, 79, 27, 0.06)`
- The shadow must be tinted with the Forest Green (`primary`) tone to mimic natural light passing through a leafy canopy, rather than a generic grey shadow.

### The "Ghost Border" Fallback
If accessibility requirements (WCAG) demand a border, use the **Ghost Border**: 
- `outline_variant` (#C3C9BA) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
- **Shape:** `xl` (3rem/48px) or `full` roundness.
- **Primary:** Gradient fill (Sage to Forest) with `on_primary` text. No border.
- **Secondary:** `surface_container_high` background with `primary` text.
- **Padding:** High horizontal padding (e.g., `spacing-8`) to maintain the "extra rounded" pill shape without looking stubby.

### Input Fields
- **Style:** Never use a bottom-line or 4-sided stroke. Use a filled `surface_container_highest` background with `lg` (2rem) corner radius.
- **States:** On focus, transition the background to `surface_container_lowest` and add a subtle `primary` ambient shadow.

### Cards & Lists
- **Forbid Dividers:** Use `spacing-6` of vertical white space to separate list items. 
- **Hover State:** A subtle shift from `surface_container_lowest` to a `primary_container` at 5% opacity.

### The "Growth Sparkline" (Portal Specific)
For financial data, use the `primary` Forest Green for lines. Use a `surface_tint` fill with a gradient fade to transparent to create a soft, "organic growth" visualization.

---

## 6. Do's and Don'ts

### Do:
- **Use Asymmetry:** Place a large headline on the left with a significantly smaller detail on the right to create an editorial layout.
- **Embrace White Space:** If a section feels crowded, double the spacing value (e.g., move from `spacing-8` to `spacing-16`).
- **Nesting:** Always place lighter containers on darker surfaces to create a sense of "lift."

### Don't:
- **Don't use 1px Lines:** Do not separate the sidebar from the main content with a line. Use a background color shift between `surface_container` and `surface`.
- **Don't use Pure Black:** Never use #000000. Use `on_surface` (#1A1C19) for all "black" text to maintain the organic, soft aesthetic.
- **Don't use Sharp Corners:** Even for small tags or tooltips, the minimum radius is `sm` (0.5rem/8px). High-end design is "soft" to the touch.
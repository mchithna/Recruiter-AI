# Implementation Plan: Modern Homepage UI (Liquid Glass Edition)

You are looking to build a high-quality, modern, and creative interface for the homepage that exceeds the minimal styling we had before, while still strictly adhering to the `StyleGuide.jsx` rules. This revision layers in a **liquid glass** treatment — but applied deliberately, only where it earns its place, rather than smeared across every surface.

## Design System: Liquid Glass Layering Model

Before touching individual sections, the page is organized into three layers. Every component in this plan is tagged with the layer it belongs to, and glass is applied **only** to Layer 1.

- **Layer 0 — Ambient/Background**: gradients, decorative blurred shapes, imagery. Purely visual, never carries text.
- **Layer 1 — Glass/Floating Control**: the sticky header, modals, dropdowns, tooltips — elements that float *above* content to provide navigation or transient actions. This is where liquid glass belongs.
- **Layer 2 — Solid Content**: headlines, cards, stats, footer — anything the user needs to read. These stay on opaque, high-contrast surfaces.

Governing rules for every section below:
- **Text never sits directly on glass.** Headlines, descriptions, and body copy always render on a solid (or near-solid) surface, even inside sections that have glass accents nearby. This keeps contrast predictable and avoids legibility issues on busy backgrounds.
- **No glass-on-glass.** At most one translucent layer should be visible at any scroll position — stacking multiple blurred panels reads as visual noise rather than depth.
- **Glass floats, it doesn't fill.** Reserve it for elements that are conceptually "above" the page (nav, overlays), not for primary content containers.
- **Accessibility fallbacks are automatic, not optional**: under `prefers-reduced-transparency`, glass elements drop to a near-solid frost (~95% opacity, no blur); under increased-contrast preferences, add a solid 1px border and boost text-color contrast. Both should be implemented as CSS media-query variants from the start, not bolted on later.

## Proposed Changes

We will recreate the Homepage (`src/pages/Home/index.jsx`) with a focus on "wow" factor, utilizing our existing UI components combined with modern CSS techniques like glassmorphism, micro-animations, and subtle gradients — governed by the layering model above.

### 1. Header & Navigation — *Layer 1 (Glass)*
- A sticky header using true liquid glass: `backdrop-blur-xl backdrop-saturate-150 bg-white/70`, with a hairline `border-b border-white/40` to simulate a specular edge.
- Progressive intensification on scroll: opacity steps up from roughly `bg-white/50` at the top of the page to `bg-white/80` once the user scrolls past the Hero, so the glass "thickens" as it needs to separate itself from busier content beneath it.
- Nav links, labels, and icons inside the header remain fully solid-colored (`text-secondary-900`) — only the background is translucent, never the text.
- Clear calls to action (Login, Find a Job, Hire Talent) using our standard `<Button>` variants.

### 2. The Hero Section — *Layer 0 (Ambient) + Layer 2 (Content)*
- A spacious, centered layout with a dynamic, glowing gradient background (Layer 0), built from `primary-500 → ai-500 → secondary-900` per the StyleGuide compliance rules.
- Floating animated elements are treated as soft glass orbs — blurred, low-opacity colored circles (`blur-xl`, `bg-primary-300/30`) drifting slowly — since they're purely decorative and carry no text, this is a safe, appropriate use of the glass aesthetic.
- The headline uses `text-display` and sits on Layer 2: if the gradient behind it is busy enough to threaten contrast, add a subtle solid scrim (`bg-secondary-900/10` or a soft radial fade) directly behind the text block only — the headline itself is never rendered on a translucent glass panel.

### 3. Interactive Split Pathways (Candidate vs. Company) — *Layer 2 (Content) with Layer 1 accents*
- The cards themselves (`<Card hoverable>`) stay solid (`bg-white` / `bg-secondary-50`) — these carry headline and description text, so per the layering rules they are not glass panels.
- The icon badge inside each card is the one element allowed a glass treatment: a small "chip" (`backdrop-blur-sm bg-primary-50/60 border border-white/50`) behind the `lucide-react` icon, giving a premium touch without ever putting text on glass.
- On hover, cards use `transition-all duration-300 hover:shadow-2xl hover:-translate-y-2` — elevation communicated through shadow and motion, not through increased transparency.

### 4. Featured Open Roles Strip — *Layer 2 (Content, no glass)*
- A clean CSS grid (`grid-cols-1 md:grid-cols-3`) displaying mock open jobs, fully solid — this is dense, scannable text content and intentionally has no glass treatment.
- We will use `<Card hoverable>`, `<Badge>` for employment types, and `<Button variant="outline">` for the Call-to-Action.

### 5. AI-Powered Capabilities Showcase — *Layer 2 (Content) with Layer 1 accents*
- A bento-style grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) presenting the chatbot, interview question generation, video interview analysis, sentiment analysis, and skill-gap analysis features.
- Same pattern as Section 3: cards stay solid with `<CardHeader>`/`<CardTitle>`/`<CardDescription>`, `<Badge variant="ai">AI-Powered</Badge>`, and `text-ai-500` icons; only the icon backdrop (`bg-ai-50/60 backdrop-blur-sm`) picks up the glass accent.
- The anchor card may span two columns for visual hierarchy, matching the previous plan.

### 6. Trust & Social Proof Strip — *Layer 1 (Glass) container, Layer 2 content inside*
- Unlike the cards above, this strip is a reasonable candidate for a full glass container: it holds short, bold, high-contrast numerals rather than dense paragraphs, so translucency doesn't threaten legibility.
- The strip itself: `backdrop-blur-lg bg-white/60 border border-white/40 rounded-2xl` floating slightly above the section background.
- Individual `<StatCard>` numbers and labels remain solid-colored text on top of that glass surface — the glass is the container, not the text.
- Optional testimonial row (`<Card>` + `<Avatar>`) stays fully solid, since it carries quoted paragraph text.

### 7. Final Call-to-Action Banner — *Layer 0 (Ambient) + Layer 2 (Content)*
- Mirrors Section 2's approach: gradient background with soft glass-orb accents, headline and supporting copy on a protected, contrast-safe solid (or scrim-backed) surface.
- Centered `text-h2` headline, `text-body-lg` subtext, and two `<Button>`s (`variant="primary"` / `variant="outline"`), echoing the dual Candidate/Company framing from Section 3.

### 8. Footer — *Layer 2 (Content, no glass)*
- A structured, multi-column footer (`grid-cols-2 md:grid-cols-4`) organized into Product, Company, Resources, and Legal groups.
- Fully opaque — the footer is the page's anchor, not a floating element, so no glass treatment applies here.
- Column headers use `text-overline uppercase tracking-wide`; links use `text-body-sm text-secondary-700` with `hover:text-primary-500` transitions; social icons from `lucide-react` at `size={18}`, colored `text-secondary-500`.

### 9. Modals, Dropdowns & Tooltips — *Layer 1 (Glass)*
- Any floating overlay triggered from the homepage (a `<Modal>` for a quick sign-up, a `<DropdownMenu>` on the nav, a `<Tooltip>` on an icon) should reuse the same glass treatment as the header for consistency: `backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl`.
- This keeps glass consistently meaning "this is a floating control, not part of the page's base content" everywhere it appears, rather than being a one-off header effect.

### 10. Motion & Micro-Interaction Guidelines
- Scroll-triggered entrance animations (fade + slight translate-y) for each major section, staggered across grid/card groups.
- Glass elements should "materialize" in — a soft fade combined with the blur easing up from 0, rather than snapping to full blur instantly.
- All hover/transition effects reuse the `transition-all duration-300` pattern from Section 3.
- Respect `prefers-reduced-motion`: simple opacity fades, no translation, bounce, or blur-easing.

### 11. Strict StyleGuide.jsx Compliance (Non-Negotiable)
- **Colors**: Only the functional tokens defined in `StyleGuide.jsx` — `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `ai` — at shades `50`, `100`, `300`, `500`, `700`, `900`. No default Tailwind palette colors and no arbitrary hex codes anywhere on the page.
  - The Chart Palette hex values are reserved exclusively for data-visualization contexts and must never be used decoratively.
  - Gradients (Sections 2 and 7) are composed only from these tokens — e.g. `primary-500 → ai-500 → secondary-900`.
- **Glass/translucency**: Opacity and blur are the *only* new utilities introduced, and always layered on top of an existing token — `bg-white/70`, `bg-secondary-900/40`, `border-white/40`, `backdrop-blur-sm/md/lg/xl`, `backdrop-saturate-150`. Never introduce a new color to achieve a glass look.
- **Typography**: Only `text-display`, `text-h1`–`text-h4`, `text-body-lg`, `text-body-sm`, `text-caption`, `text-overline`. No raw Tailwind text-size utilities.
- **Components**: Build exclusively from `../components/ui` — `Button`, `Badge`/`StatusBadge`, `Card` (and subcomponents), `StatCard`, `Avatar`, `ProgressBar`, `Spinner`, `Modal`, `Tooltip`, `DropdownMenu`, `Tabs`, `EmptyState`, `Skeleton`, and the form field set.
  - `Button` variants: `primary`, `secondary`, `outline`, `danger`, `ghost`, `ai`, at sizes `sm`, `md`, `lg`.
  - `Badge` variants: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `ai`.
- **Icons**: `lucide-react` only, passed as React nodes (e.g., `leftIcon={<Eye size={16} />}`), never raw SVGs, emoji, or icon fonts.
- If a desired glass or visual effect can't be achieved within these constraints, flag it as an Open Question rather than deviating from the design system.

### 12. Git Strategy
- After writing the code, I will execute the following commands on your current `dineth` branch:
  ```bash
  git add frontend/src/pages/Home/index.jsx
  git commit -m "feat: implement high-quality modern homepage UI with liquid glass layering"
  ```

## Open Questions

> [!IMPORTANT]
> - Are there any specific brand graphics or colors (aside from our primary/secondary tokens in the StyleGuide) you want to incorporate?
> - Are you comfortable with glass being reserved for the header, overlays, and the stats strip only (per the layering model above), or did you picture a more glass-heavy look across the cards as well?
> - If this plan looks good to you, please click **Proceed** and I will begin the build!

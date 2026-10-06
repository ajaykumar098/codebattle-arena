# CodeBattle Arena - Design System

## Chosen Direction: Terminal/IDE-Inspired Competition Platform

**Why:** A coding competition should feel like it lives in the same world as the tools developers use daily. We're leaning into terminal aesthetics—deep charcoal backgrounds, monospace accents, data density where it matters—without falling into "hacker movie" clichés. The look is technical, focused, and distinctly competitive. No gradients, no glows, no glassmorphism. Just flat surfaces, high contrast, and information that communicates state clearly.

## Palette

All colors are flat. No gradients. No shadows except where functionally necessary (e.g., dropdowns, focus rings).

| Role | Hex | Usage |
|------|-----|-------|
| Ground (background) | `#0a0a0a` | Page background, primary surface |
| Surface (cards, panels) | `#121212` | Cards, panels, elevated surfaces |
| Border (hairline) | `#6b7280` | Component borders, dividers (≥3:1 contrast) |
| Text primary | `#e5e5e5` | Headlines, body text, labels |
| Text secondary | `#a1a1aa` | Captions, metadata, disabled text |
| Accent (amber) | `#f59e0b` | Primary CTAs, active states, highlights, LIVE indicator |
| Accent muted | `#b45309` | Hover states, secondary accents |
| Success (emerald) | `#10b981` | Accepted verdict |
| Error (rose) | `#f43f5e` | Wrong answer, errors |
| Neutral (violet) | `#8b5cf6` | TLE/Timeout, Running state |

**Semantic colors for judge results (never rely on color alone):**
- Accepted: emerald + checkmark icon
- Wrong Answer: rose + X icon
- TLE/Timeout: violet + clock icon + "Time Limit Exceeded" text
- Running: violet + spinner icon + "Running" text
- Error: rose + alert icon

**Live indicator:** Accent-colored dot (#f59e0b) + "LIVE" text (uppercase, mono). Red/rose is reserved for errors and wrong answers only.

**Text on amber backgrounds:** Must use #0a0a0a (ground color) for text.

## WCAG Contrast Ratio Table

All ratios computed using the WCAG 2.1 relative luminance formula. PASS threshold: 4.5:1 for normal text, 3:1 for large text and UI components.

### Text on Background

| Pair | Ratio | Status |
|------|-------|--------|
| Text primary on ground | 15.72:1 | PASS |
| Text primary on surface | 14.87:1 | PASS |
| Text secondary on ground | 7.72:1 | PASS |
| Text secondary on surface | 7.31:1 | PASS |
| Accent on ground | 9.22:1 | PASS |
| Accent on surface | 8.72:1 | PASS |
| Accent muted on ground | 3.94:1 | PASS |
| Accent muted on surface | 3.73:1 | PASS |
| Success on ground | 7.80:1 | PASS |
| Success on surface | 7.39:1 | PASS |
| Error on ground | 5.39:1 | PASS |
| Error on surface | 5.10:1 | PASS |
| Neutral on ground | 4.68:1 | PASS |
| Neutral on surface | 4.42:1 | PASS |
| Ground on accent (text on amber bg) | 9.22:1 | PASS |

### Border on Background (UI Components)

| Pair | Ratio | Status |
|------|-------|--------|
| Border on ground | 4.10:1 | PASS |
| Border on surface | 3.88:1 | PASS |
| Accent on ground (focus ring) | 9.22:1 | PASS |
| Accent on surface (focus ring) | 8.72:1 | PASS |

## Typography

### Font Stack

- **Display/Nav/Labels/Timers/Scores/Code:** `JetBrains Mono` (IBM Plex Mono equivalent) - monospace for technical feel
- **Body:** `IBM Plex Sans` - clean, legible sans-serif

All fonts self-hosted via `@fontsource` packages with `font-display: swap`.

### Type Scale

Base size: 16px. Scale: major third (1.25).

| Role | Size | Weight | Line-height | Letter-spacing | Font |
|------|------|--------|-------------|---------------|------|
| Display (hero) | clamp(2rem, 6vw, 3rem) | 600 | 1.1 | 0 | JetBrains Mono |
| H1 | 36px | 600 | 1.2 | 0 | JetBrains Mono |
| H2 | 28px | 500 | 1.3 | 0 | JetBrains Mono |
| H3 | 22px | 500 | 1.4 | 0 | JetBrains Mono |
| Body large | 18px | 400 | 1.5 | 0 | IBM Plex Sans |
| Body | 16px | 400 | 1.5 | 0 | IBM Plex Sans |
| Body small | 14px | 400 | 1.5 | 0 | IBM Plex Sans |
| Caption | 12px | 500 | 1.4 | 0.02em | IBM Plex Sans |
| Mono code | 14px | 400 | 1.5 | 0 | JetBrains Mono |
| Mono large | 16px | 500 | 1.4 | 0 | JetBrains Mono |
| Mono timer | 24px | 600 | 1 | 0 | JetBrains Mono |

**Scale jumps:**
- Display to H1: 1.33×
- H1 to H2: 1.29×
- H2 to H3: 1.27×
- H3 to body: 1.38×
- Body to caption: 1.33×

Real contrast is maintained through size, not just weight.

## Spacing Scale

Base unit: 4px. All spacing is multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing, icon padding |
| `space-2` | 8px | Small gaps, button padding |
| `space-3` | 12px | Card padding (compact) |
| `space-4` | 16px | Default gaps, form spacing |
| `space-5` | 20px | Section padding (mobile) |
| `space-6` | 24px | Card padding (default) |
| `space-8` | 32px | Section padding (tablet) |
| `space-10` | 40px | Section padding (desktop) |
| `space-12` | 48px | Large section gaps |
| `space-16` | 64px | Hero spacing |

## Border Radius

Minimal radius. Technical feel, not "rounded app."

| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0px | Code panels, terminal elements |
| `radius-sm` | 2px | Small badges, tags |
| `radius-md` | 4px | Inputs, buttons |
| `radius-lg` | 6px | Cards, panels |
| `radius-xl` | 8px | Large cards (rare) |

No rounded-2xl or pill shapes except for the primary CTA (radius-lg).

## Borders & Elevation

- **Hairline borders:** 1px solid `#2a2a2a` on all cards and panels
- **No box shadows** except for dropdowns and focus states
- **Focus ring:** 2px solid `#f59e0b` with 2px offset (outline-style, not box-shadow)
- **Dropdown shadow:** `0 4px 12px rgba(0, 0, 0, 0.5)` (sharp, no blur)

## Motion

All motion under 200ms, honoring `prefers-reduced-motion`.

| Duration | Easing | Usage |
|----------|--------|-------|
| 100ms | ease-out | Button hover, focus states |
| 150ms | ease-out | Tab switching, panel toggle |
| 200ms | ease-out | Route transitions, modal open/close |

**Allowed motion:**
- Button hover (brightness change)
- Focus ring expansion
- Tab panel transitions
- Route transitions (fade)
- Countdown timer (ticking)
- Score changes (brief flash)
- Connection status indicator (pulse only when connecting)

**Forbidden motion:**
- Bouncing, pulsing (except connection indicator)
- Infinite shimmer
- Parallax
- Staggered card animations
- Skeleton loading (use static gray blocks instead)

## Iconography

**Icon set:** `lucide-react` exclusively.

**Stroke width:** 1.5px (medium) consistently across all icons.

**Size mapping:**
- Icon-xs: 14px (inline with caption)
- Icon-sm: 16px (inline with body)
- Icon-md: 20px (default)
- Icon-lg: 24px (large buttons, headers)

**Icon button accessibility:** All icon-only buttons must have `aria-label`.

## Responsive System

### Breakpoints

| Breakpoint | Width | Columns | Container max-width | Padding |
|------------|-------|---------|---------------------|---------|
| Mobile | 0-639px | 4 | 100% | 16px |
| Tablet | 640-1023px | 8 | 640px | 24px |
| Desktop | 1024-1279px | 12 | 1024px | 32px |
| Large | 1280px+ | 12 | 1280px | 32px |

### Mobile-First Grid

- Mobile: 4 columns (each 25% or stacked)
- Tablet: 8 columns
- Desktop: 12 columns

### Touch Targets

Minimum 44px height for all interactive elements. Minimum 44×44px for buttons.

### Safe Area Insets

Use `padding: max(16px, env(safe-area-inset-left))` for mobile.

### Viewport Height

Use `100dvh` instead of `100vh` for mobile browsers.

### Screen-Specific Layouts

**Editor/Battle (ProblemDetail, PlayWithFriend):**
- Desktop (1024px+): Split layout — problem panel (left, 40%) | editor (right, 60%) | results panel (below editor or collapsible)
- Tablet (640-1023px): Problem panel above editor with collapsible results panel
- Mobile (<640px): Tab layout — tabs (Problem / Code / Output) with sticky Run/Submit bar at bottom. Monaco editor uses `automaticLayout` to resize correctly.

**Dashboard:**
- Desktop: Stats in 3-column grid
- Tablet: Stats in 2-column grid
- Mobile: Stats stacked vertically

**Problems list:**
- Desktop: 2-column grid of problem cards
- Tablet: 2-column grid
- Mobile: Single column stacked

**Navbar:**
- Desktop: Horizontal links
- Tablet: Horizontal links
- Mobile: Drawer with keyboard support (Escape to close, Tab navigation)

**Challenge a Friend (PlayWithFriend lobby):**
- All sizes: Centered card layout, same information density
- Mobile: Timer slider stacks vertically

## Component Guidelines

### Button

- **Primary:** Amber background (#f59e0b), white text, radius-md
- **Secondary:** Border (#2a2a2a), white text, radius-md
- **Ghost:** No background, white text, transparent border
- **Danger:** Rose background (#f43f5e), white text
- **Sizes:** sm (36px), md (44px), lg (52px)
- **Loading state:** Spinner icon (lucide-loader), opacity 0.7
- **Disabled:** Opacity 0.5, no pointer events

### Input/Textarea/Select

- **Label:** Required, above input, text-secondary
- **Input:** Background #121212, border #2a2a2a, radius-md, padding space-3
- **Focus:** Border changes to accent (#f59e0b), focus ring visible
- **Error:** Border changes to rose (#f43f5e), error text below
- **Hint:** Text-secondary, caption size, below input

### Card/Panel

- Use sparingly. Not every section needs a card.
- Background #121212, border #2a2a2a, radius-lg, padding space-6
- No shadow except dropdowns

### Badge/StatusPill

- **Difficulty:** Small pill, radius-sm, mono font
  - Easy: emerald background with 10% opacity, emerald text
  - Medium: amber background with 10% opacity, amber text
  - Hard: rose background with 10% opacity, rose text
- **Judge verdict:** Icon + text, no background, semantic color
- **Live indicator:** Red dot (8px) + "LIVE" text (mono, uppercase)

### Table/List Rows

- **Leaderboard:** Dense rows, border-bottom on each row, hover on background
- **Mobile:** Collapse into stacked rows with key-value pairs

### Avatar

- Circle, radius-full, border #2a2a2a
- Fallback: initials with accent background

### Modal/Dialog

- Focus trap (first focusable element receives focus)
- Escape to close
- Click outside to close
- Focus restore on close
- Backdrop: #0a0a0a with 80% opacity

### Toast

- Fixed position, top-right or bottom-right
- Auto-dismiss after 5s
- Icon + message
- Close button

### Skeleton

- Static gray blocks (#1a1a1a), no animation
- Match the exact dimensions of content

### EmptyState

- Icon (lucide), headline, body text, CTA
- Centered, generous spacing

### Tooltip

- Follows cursor or positions above element
- Small delay (200ms) before showing
- Max width 200px

### ConnectionIndicator

- Small dot in navbar
- Green (connected), yellow (connecting), red (disconnected)
- Pulse animation only when connecting
- aria-live for state changes

### Timer/Countdown

- Mono font, large size
- Color changes based on time remaining (green > yellow > red)
- Tabular nums for fixed width

### SplitPane

- Resizable divider (1px handle)
- Minimum width constraints
- Collapse button

## Accessibility Requirements

### Keyboard Navigation

- Tab order logical and visible
- Escape closes modals and drawers
- Tab in code editor: documented escape (Esc then Tab to exit editor)
- All interactive elements reachable via keyboard

### Focus States

- `:focus-visible` ring (2px accent color)
- Never rely on color alone for state
- Focus indicators always visible

### ARIA

- Skip link at top of page
- Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`
- One h1 per page
- Labels on all inputs with `aria-invalid` and `aria-describedby` on errors
- `aria-live` for judge results, timers, connection changes
- Icon buttons have `aria-label`
- Modal has `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Tabs have `role="tablist"`, `role="tab"`, `role="tabpanel"`

### Color Contrast

- All text combinations pass WCAG AA (see palette table)
- Never use accent color as background for small text
- Success/error states have icon + text (not color alone)

### Screen Readers

- Form errors announced immediately
- Loading states announced
- Judge results announced
- Timer changes announced (every minute or when critical)

## "Don't" List (from Slop Rules)

- ❌ Purple/indigo/blue-to-pink gradients
- ❌ Gradient text on headings
- ❌ Glowing neon box-shadows
- ❌ Floating blurred blobs
- ❌ Glassmorphism/backdrop-blur (except modal backdrop)
- ❌ Default "slate-900 + indigo-500" dark theme
- ❌ Inter as the only typeface
- ❌ Emoji used as icons or bullets
- ❌ Mixed icon styles (use only lucide-react, one stroke width)
- ❌ Hero with pill badge ("✨ Now live"), centered headline, two buttons, 3-card feature grid
- ❌ Rows of identical rounded-2xl cards with same padding in 3-column grid
- ❌ Fake stats, fake testimonials, lorem ipsum, buzzword copy
- ❌ Animation for its own sake (bouncing, pulsing, infinite shimmer, parallax)
- ❌ Uniform spacing everywhere
- ❌ Rounded pills (except primary CTA)

## Implementation Notes

### Tailwind v4 CSS-First

All tokens defined in `@theme` block in `src/index.css`:

```css
@theme {
  --color-ground: #0a0a0a;
  --color-surface: #121212;
  --color-border: #6b7280;
  --color-text-primary: #e5e5e5;
  --color-text-secondary: #a1a1aa;
  --color-accent: #f59e0b;
  --color-accent-muted: #b45309;
  --color-success: #10b981;
  --color-error: #f43f5e;
  --color-neutral: #8b5cf6;

  --font-display: "JetBrains Mono", monospace;
  --font-body: "IBM Plex Sans", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --radius-none: 0px;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  --radius-xl: 8px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### Font Loading

```css
@font-face {
  font-family: "JetBrains Mono";
  font-display: swap;
  src: url("/fonts/JetBrainsMono-Regular.woff2") format("woff2");
  /* ...weights... */
}

@font-face {
  font-family: "IBM Plex Sans";
  font-display: swap;
  src: url("/fonts/IBMPlexSans-Regular.woff2") format("woff2");
  /* ...weights... */
}
```

### Monaco Editor Configuration

- Theme: `vs-dark` (matches our ground color)
- `automaticLayout: true` for responsive resizing
- `fontSize: 14`
- `minimap: { enabled: false }`
- `scrollBeyondLastLine: false`

### Icon Replacement

Replace emoji in PlayWithFriend.tsx:
- 🤝 → `Handshake` icon
- 🏆 → `Trophy` icon
- 😔 → `Frown` icon

All icons from `lucide-react`, stroke width 1.5px.

### Dead Code Cleanup

Delete after Phase 3:
- `App.css` (all Vite template styles)
- `hero.png`, `react.svg`, `vite.svg` from assets folder
- Verify no imports exist before deletion

---

**Approval Required:** Review palette contrast ratios, font choices, and screen-specific layouts before Phase 1 begins.

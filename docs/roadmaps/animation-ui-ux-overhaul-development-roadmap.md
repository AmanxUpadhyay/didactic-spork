# Animation & UI/UX Overhaul Development Roadmap — Jugalbandi

**Version:** 1.0
**Date:** March 1, 2026
**App:** Jugalbandi — Couples Habit Warfare PWA
**Authors:** Aman & Mukta (with Claude as development partner)
**Prerequisite:** Core development roadmap Phase 0–7 must be functionally complete before starting this overhaul. The app must already work — this roadmap makes it *feel alive*.

---

## How to Use This Document

This document is a **phased implementation guide** for transforming Jugalbandi from a functional habit tracker into an emotionally resonant, animation-rich PWA that feels hand-crafted, warm, and impossible to mistake for AI slop. It is designed to be handed directly to Claude (in Claude Code, claude.ai, or any Claude-powered coding environment) as an instruction set.

Every phase includes:
- **What to build** — specific animation/UI tasks with acceptance criteria
- **Which Claude skills to use** — the exact MCP tools and capabilities Claude needs
- **How to verify** — visual verification steps using Chrome and screenshots
- **Research hooks** — when to use Context7 or web search for up-to-date API references

**Building philosophy:** Animation is not decoration — it's the product differentiator. Every micro-interaction should feel like Mochi (the mascot) designed it personally.

---

## Required Tools, MCPs & Claude Configuration

### Claude Skills Required

These are the skills Claude must use during implementation. **Always read the relevant SKILL.md before starting any task.**

| Skill | When to Use | Path |
|-------|------------|------|
| **frontend-design** | Every UI/animation component, every screen, every visual element | `/mnt/skills/public/frontend-design/SKILL.md` |
| **web-artifacts-builder** | Complex multi-component React artifacts, interactive prototypes, animation demos | `/mnt/skills/examples/web-artifacts-builder/SKILL.md` |
| **canvas-design** | Static visual assets — achievement badges, mascot expressions, celebration graphics | `/mnt/skills/examples/canvas-design/SKILL.md` |
| **theme-factory** | Applying and testing Strawberry Milk / Matcha Latte / Honey Biscuit themes | `/mnt/skills/examples/theme-factory/SKILL.md` |

### MCP Servers Required

Claude must have the following MCP servers configured and active:

| MCP Server | Purpose | Critical For |
|------------|---------|-------------|
| **Context7** (`context7`) | Fetching up-to-date library documentation for Motion v12, Tailwind CSS v4, Vite, React Router, canvas-confetti, AutoAnimate, Lottie, Supabase, and all npm packages used. **Always use Context7 before writing any library code** — cached knowledge may be outdated for fast-moving libraries like Motion. | Every phase |
| **Filesystem MCP** | Reading/writing project files, modifying components, editing configs | Every phase |
| **GitHub MCP** (if using repo) | Commit management, PR creation, branch management for each animation phase | Every phase |
| **Supabase MCP** (if available) | Querying/testing realtime sync animations, checking data for celebration triggers | Phases 4, 6, 7 |
| **Browser Tools / Puppeteer MCP** (if available) | Automated screenshot capture, performance profiling, visual regression | Every phase (verification) |

### Claude Superpowers & Chrome — Mandatory Visual Verification

**This is non-negotiable.** Animations cannot be verified through code alone. Claude MUST:

1. **Use Computer Use / Chrome browser** to visually verify every animation after implementation
2. **Take screenshots** at key animation states (initial, mid-animation, final) to confirm visual correctness
3. **Use Chrome DevTools Performance panel** (with 4x CPU throttling) to verify 60fps on simulated mid-range devices
4. **Test both light and dark mode** for every animation — take screenshots of both
5. **Test all three palettes** (Strawberry Milk, Matcha Latte, Honey Biscuit) for color-dependent animations
6. **Check `prefers-reduced-motion`** by toggling the flag in Chrome DevTools → Rendering panel
7. **Verify on mobile viewport** (375×812 iPhone SE / 390×844 iPhone 14 dimensions) by resizing the browser
8. **Record GIFs** of completed animation sequences using the gif_creator tool to share with Aman & Mukta for approval

**Chrome verification workflow for every animation task:**
```
1. Implement the animation in code
2. Open Chrome → Navigate to the relevant screen
3. Screenshot: default state
4. Trigger the animation
5. Screenshot: animation in progress (if possible) or final state
6. Open DevTools → Performance → Record → Trigger animation → Stop
7. Verify: no red frames, consistent 60fps, no layout shifts
8. Toggle dark mode → Repeat steps 3-6
9. Set viewport to 375×812 → Repeat steps 3-6
10. Enable "Emulate prefers-reduced-motion: reduce" → Verify graceful degradation
```

### Context7 — Up-to-Date Documentation Protocol

**Before writing ANY code that uses an external library, Claude must:**

1. **Query Context7** for the latest API documentation of that library
2. **Verify the import paths** — libraries like Motion have changed from `framer-motion` to `motion/react`
3. **Check for breaking changes** — Motion v12 has different APIs than v11, Tailwind v4 has different config than v3
4. **Verify npm package names** — e.g., `@lottiefiles/dotlottie-react` not the old `lottie-react`

**Libraries that MUST be checked via Context7 before every use:**
- `motion` (formerly framer-motion) — API surface changes frequently
- `@formkit/auto-animate` — verify React hook API
- `canvas-confetti` — verify latest options and shapes API
- `@lottiefiles/dotlottie-react` — WASM-based, verify initialization pattern
- `tailwindcss` v4 — CSS-first config is completely different from v3
- `react-router` v7 — verify View Transitions API integration
- `@hugeicons/react` + `@hugeicons/core-free-icons` — new scoped packages, old ones deprecated

---

## Animation Stack Reference (Already Decided)

These decisions are final. Do not deviate.

| Layer | Library | Version | Bundle | Use For |
|-------|---------|---------|--------|---------|
| **Primary animation engine** | `motion` | ^12.x | ~20 kB (LazyMotion) | All UI animations, gestures, layout, page transitions |
| **List transitions** | `@formkit/auto-animate` | ^0.9.x | 3.3 kB | Simple list add/remove/reorder |
| **Celebrations** | `canvas-confetti` | ^1.9.x | 5.2 kB (lazy) | Confetti, fireworks, emoji rain |
| **Character animations** | `@lottiefiles/dotlottie-react` | Latest | WASM runtime | Mochi mascot, complex multi-element animations |
| **Icons** | `@hugeicons/react` + `@hugeicons/core-free-icons` | Latest | ~0.75 kB/icon | Stroke Rounded style, 24px base |
| **Simple animations** | CSS + Tailwind v4 | N/A | 0 kB | Pulses, shimmers, glows, badge pings |

**Standard kawaii easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` — soft overshoot, squishy physics
**Standard kawaii spring:** `{ type: "spring", stiffness: 400, damping: 15, mass: 0.8 }`
**Gentle spring:** `{ type: "spring", stiffness: 200, damping: 20 }`

---

## Phase A — Animation Foundation & Infrastructure

**Goal:** Set up the animation configuration system, install all libraries, create the shared hooks/variants/utilities that every subsequent phase depends on. No visible animations yet — just the plumbing.

**Status: COMPLETE** (verified 2026-03-01)

**Estimated effort:** 3–5 days
**Depends on:** Core Phase 0 complete (project scaffolded, fonts loaded, palette configured)

### A.1 — Install & Configure Animation Libraries

- [x] Install `motion` v12.x — verify import paths via Context7 (`motion/react`, not `framer-motion`)
- [x] Install `@formkit/auto-animate` — verify React `useAutoAnimate` hook API via Context7
- [x] Install `canvas-confetti` — do NOT add to main bundle; it will be lazy-loaded
- [x] Install `@lottiefiles/dotlottie-react` — verify WASM initialization pattern via Context7
- [x] Verify all packages in `package.json` with correct versions
- [x] Run `npm run build` — confirm no bundle size regressions beyond ~45 kB gzipped total

### A.2 — LazyMotion Provider Setup

- [x] Wrap the app root in `<LazyMotion features={domAnimation}>` for tree-shaking
- [x] Create `src/providers/AnimationProvider.tsx` that wraps both `LazyMotion` and `MotionConfig`
- [x] Set global `<MotionConfig reducedMotion="user">` for accessibility
- [x] Verify: `m.div` works throughout the app (not just `motion.div`)
- [x] **Chrome verification:** Open app → DevTools → Network → confirm Motion JS chunk loads async

### A.3 — Shared Animation Configuration System

Create the centralised animation config at `src/lib/animations/`:

- [x] **`config.ts`** — Export all shared constants:
  - `kawaiiEasing: [0.34, 1.56, 0.64, 1]`
  - `kawaiiSpring: { type: "spring", stiffness: 400, damping: 15, mass: 0.8 }`
  - `gentleSpring: { type: "spring", stiffness: 200, damping: 20 }`
  - `snappySpring: { type: "spring", stiffness: 500, damping: 25 }`
  - `pageTransitionSpring: { type: "spring", stiffness: 300, damping: 25, mass: 0.8 }`
  - Duration constants for every context from the Design System timing table

- [x] **`variants.ts`** — Shared Motion variants:
  - `fadeUp`, `fadeDown`, `fadeIn`, `scaleIn`, `slideInRight`, `slideInLeft`
  - `staggerContainer(delay?)`, `staggerItem`
  - `cardEnter`, `cardExit`
  - `pageEnter`, `pageExit`

- [x] **`hooks/useKawaiiSpring.ts`** — Custom hook wrapping Motion's `useSpring` with kawaii defaults
- [x] **`hooks/useStaggerIn.ts`** — Hook for staggered page entry animations
- [x] **`hooks/useCelebration.ts`** — Hook wrapping canvas-confetti with:
  - Dark mode detection (adjust particle colors automatically)
  - Intensity levels: `small`, `medium`, `epic`
  - Haptic feedback integration (`navigator.vibrate` with feature detection)
  - Palette-aware colors (Strawberry Milk vs Matcha Latte vs Honey Biscuit confetti)
- [x] **`hooks/useAnimatedCounter.ts`** — Hook for spring-animated number displays (streak counters, XP)
- [x] **`hooks/useReducedMotion.ts`** — Hook checking `prefers-reduced-motion` for conditional rendering
- [x] **`haptics.ts`** — Haptic feedback pattern library:
  - `light: () => navigator.vibrate?.(10)`
  - `medium: () => navigator.vibrate?.(25)`
  - `success: () => navigator.vibrate?.([10, 30, 10, 30, 50])`
  - `celebration: () => navigator.vibrate?.([10, 20, 10, 20, 10, 20, 50])`
  - Feature detection wrapper (no-op on iOS)
- [x] **`index.ts`** — Barrel export everything

### A.4 — Service Worker Animation Asset Caching

- [x] Update `vite.config.ts` Workbox config to cache `.json` and `.lottie` files with CacheFirst strategy
- [x] Configure runtime caching for lazy-loaded animation JS chunks
- [x] Set `expiration.maxEntries: 50` for animation asset cache
- [x] **Chrome verification:** DevTools → Application → Cache Storage → confirm animation files cached

### Phase A — Definition of Done

✅ All animation libraries installed and verified working
✅ `LazyMotion` provider wraps the entire app, async chunk loads confirmed in Network tab
✅ Shared animation config (`config.ts`, `variants.ts`, all hooks) created and exported
✅ `useCelebration` hook fires confetti correctly in all three palettes + dark mode (Chrome verified)
✅ Service worker caches animation assets (verified in DevTools)
✅ Bundle size increase is ≤50 kB gzipped total

---

## Phase B — Micro-Interactions: Making Every Tap Feel Alive

**Goal:** Add squishy, tactile feedback to every interactive element in the app. This is where users first feel the difference — every button press, toggle, checkbox, and input should respond with spring physics.

**Estimated effort:** 1–2 weeks
**Depends on:** Phase A complete

### B.1 — Squishy Button System ✅

- [x] Wrap all Button component variants (primary, secondary, ghost, danger) with Motion
- [x] Add `whileTap={{ scale: 0.85 }}` with `kawaiiSpring` transition
- [x] Add `whileHover={{ scale: 1.05 }}` (desktop only — detect via media query)
- [x] Integrate haptic `light` feedback on tap (Android only)
- [x] Bottom "ledge" shadow that compresses on press (`translateY(2px)` + shadow removal)
- [x] **Chrome verification:** Record GIF of button press on mobile viewport — confirm bounce-back overshoot
- [x] Test all button variants in all three palettes + dark mode

### B.2 — Task Completion Checkbox Animation ✅

This is the most important micro-interaction in the entire app. It must feel *satisfying*.

- [x] Create `AnimatedCheckbox` component using SVG `pathLength` animation
- [x] Check-draw animation: `pathLength` 0→1 over 300ms with spring physics
- [x] Background fill: transparent → success color with soft scale overshoot (1.0 → 1.1 → 1.0)
- [x] Pair with haptic `success` pattern on completion
- [x] Pair with small confetti burst (30 particles) via `useCelebration('small')` — only on actual habit completion, not toggling off
- [x] Unchecking: reverse `pathLength` 1→0 over 200ms, no confetti, no haptic
- [x] **Chrome verification:** Record GIF of check → confetti → settle sequence
- [x] **Reduced motion:** Check draws instantly (opacity only), no confetti

### B.3 — Toggle Switch with Layout Animation ✅

- [x] Implement toggle using Motion `layout` prop for the circular knob
- [x] Spring transition: `{ type: "spring", stiffness: 500, damping: 30 }`
- [x] Background color transition: off-color → on-color (palette-aware)
- [x] Haptic `light` on toggle
- [x] **Chrome verification:** Confirm magnetic snap feel — the knob should slightly overshoot then settle

### B.4 — Input Field Interactions ✅

- [x] Focus animation: border color transition + subtle scale (1.0 → 1.01) + warm glow shadow
- [x] Error state: gentle head-shake animation (`x: [-4, 4, -4, 4, 0]` over 400ms)
- [x] Character counter: animated number using `useAnimatedCounter` hook
- [x] Label float animation: placeholder slides up and scales down on focus
- [x] **Chrome verification:** Test focus → type → error → fix cycle, verify all transitions are smooth

### B.5 — Card Press & Interaction States ✅

- [x] All Card components get `whileTap={{ scale: 0.98 }}` with gentle spring
- [x] Cards that are tappable get slight shadow elevation on hover/touch
- [x] Habit cards: subtle background pulse when partner completes the same habit (realtime)
- [x] **Chrome verification:** Verify cards don't "jump" during tap animation (no layout shift)

### B.6 — Navigation Bar Animations ✅

- [x] Active tab icon: scale bounce (1.0 → 1.2 → 1.0) with color transition on selection
- [x] Ink indicator: `layout` animation for the position indicator sliding between tabs
- [x] Center FAB ("add habit"): `whileTap={{ scale: 0.9, rotate: 45 }}` (plus icon rotates to X when open)
- [x] Badge notification dot: CSS `animate-ping` pulse (Tailwind utility)
- [x] **Chrome verification:** Navigate between all tabs — confirm indicator slides smoothly, no flicker

### B.7 — Toast & Snackbar Entrance/Exit ✅

- [x] Slide up from bottom with `fadeUp` variant + spring
- [x] Auto-dismiss: slide down after 3s with fade
- [x] Include Mochi avatar thumbnail in toast for personality
- [x] Swipe-to-dismiss: `drag="x"` with dismissal threshold
- [x] **Chrome verification:** Trigger various toasts — verify entrance, persistence, and exit are smooth

### B.8 — Warm Skeleton Shimmer Loading States ✅

- [x] Create `Skeleton` component with warm pink/peach shimmer (not cold gray)
- [x] Use CSS `transform: translateX()` for GPU-composited shimmer (not `background-position`)
- [x] Shimmer colors derived from active palette (Strawberry Milk: `#FFE4EC` → `#FFB6CE`)
- [x] Minimum 800ms display (prevent flash of skeleton)
- [x] Shape variants: text line, circle (avatar), card, habit row
- [x] **Chrome verification:** Navigate to a screen with loading state — confirm warm shimmer, no jank

### Phase B — Definition of Done

✅ Every button in the app has squishy press animation (Chrome GIF recorded)
✅ Task completion checkbox draws with satisfying spring + confetti burst
✅ Toggle switches snap with magnetic spring physics
✅ Input fields shake on error, glow on focus
✅ Navigation bar has smooth tab-switching indicator
✅ All interactions tested in: light mode, dark mode, all 3 palettes, reduced motion, mobile viewport
✅ No animation triggers layout shift (verified in DevTools Performance panel)
✅ Haptic feedback fires on Android for button taps, completions, and toggles

---

## Phase C — Page Transitions & Shared Element Animations

**Goal:** Make navigation between screens feel cinematic yet quick. Every route change should have intentional entrance/exit choreography. Shared elements should flow between contexts.

**Estimated effort:** 1 week
**Depends on:** Phase B complete

### C.1 — AnimatePresence Route Wrapper ✅ COMPLETE

- [x] Wrap all `<Routes>` in `<AnimatePresence mode="wait">`
- [x] Key routes by `location.pathname`
- [x] Create `AnimatedPage` wrapper component applying `pageEnter` / `pageExit` variants
- [x] Entrance: fade in + slide up 20px + scale from 0.98, spring transition
- [x] Exit: fade out + slide up 10px + scale to 0.98, faster (200ms)
- [x] **Context7 check:** Verify React Router v7 + Motion AnimatePresence integration pattern
- [x] **Chrome verification:** Navigate between 5+ routes — confirm no white flash, smooth transitions

> **Note:** App uses tab-based navigation (not React Router). `AppShell` wraps tab content in `<AnimatePresence mode="wait">` with direction-aware `pageEnterRight`/`pageEnterLeft` variants. All tab switches have entrance/exit choreography with `pageTransitionSpring`.

### C.2 — View Transitions API Integration

- [ ] Add `viewTransition` prop to all `<Link>` components
- [ ] Test native View Transitions on supported browsers (Chrome 111+, Safari 18+)
- [ ] Add CSS `view-transition-name` to key shared elements (mascot, streak counter, user avatar)
- [ ] Fallback: Motion `AnimatePresence` handles transition on unsupported browsers
- [ ] **Context7 check:** Verify latest View Transitions API support and React Router integration
- [ ] **Chrome verification:** Open DevTools → check "document.startViewTransition" availability

### C.3 — Shared Element Transitions with layoutId

- [ ] Habit card (list) → Habit detail (full screen): shared `layoutId` for smooth expansion
- [ ] Partner avatar (nav) → Partner profile: shared element morph
- [ ] Streak counter (home) → Streak detail: number morphs to larger display
- [ ] Sprint card (home) → Sprint detail: card expands to full view
- [ ] **Chrome verification:** Tap habit card → verify it morphs smoothly to detail view, back reverses

### C.4 — Staggered Page Entry Animations ✅ COMPLETE

- [x] Home screen: habit cards stagger in with `staggerChildren: 0.08`
- [x] Sprint leaderboard: score bars stagger from top to bottom
- [x] Settings page: setting groups stagger in
- [x] Analytics dashboard: chart cards stagger with `delayChildren: 0.15`
- [x] **Chrome verification:** Navigate to home screen — confirm cards cascade in, not appear all at once

> **Note:** `staggerContainer` + `staggerItem` variants used in HabitList, SettingsScreen, AnalyticsDashboard. `staggerItem` animates `opacity`, `y: 16→0`, `scale: 0.96→1` with `kawaiiSpring`.

### C.5 — iOS-Style Swipe-Back Navigation ✅ COMPLETE

- [x] Implement horizontal drag gesture on page container for back navigation
- [x] Threshold: 40% viewport width to trigger navigation
- [x] Rubber-band elasticity on over-drag
- [x] Previous page peeks in from the left during drag (parallax at 0.3× speed)
- [x] **Chrome verification:** Test swipe-back on mobile viewport — should feel native

> **Note:** Implemented as tab-swipe navigation (app uses tabs not browser history). `AppShell` tracks touch start/end via `onTouchStart`/`onTouchEnd`, requires ≥120px horizontal delta with ≤60% vertical drift ratio. `data-no-tab-swipe` attribute on habit list prevents conflicts with swipe-to-complete. Transitions use existing direction-aware `pageEnterRight`/`pageEnterLeft` Motion variants.

### Phase C — Definition of Done

✅ Every route change has entrance/exit animation (no abrupt cuts)
✅ At least 4 shared element transitions work smoothly with `layoutId`
✅ Staggered entry on all list-heavy pages (home, habits, analytics)
✅ View Transitions API active on Chrome/Safari with Motion fallback elsewhere
✅ Swipe-back navigation works on mobile viewport
✅ All transitions under 400ms total (measured in Performance panel)
✅ GIF recorded of full navigation flow (Home → Habit Detail → Back → Sprint → Settings)

---

## Phase D — Gesture-Driven Interactions

**Goal:** Make the app feel like a native mobile app through touch-driven animations — swipe to complete, drag to reorder, long-press to confirm, pull to refresh.

**Estimated effort:** 1–2 weeks
**Depends on:** Phase C complete

### D.1 — Swipe-to-Complete Habit Cards ✅ COMPLETE

- [x] Implement horizontal drag (`drag="x"`) on habit cards
- [x] Right swipe reveals green completion gradient + check icon
- [x] Left swipe reveals undo/edit options
- [x] Threshold: 200px triggers completion
- [x] Below threshold: rubber-band snap back with `bounceStiffness: 300, bounceDamping: 20`
- [x] Velocity detection: fast swipe completes even below distance threshold
- [x] Background color: `useTransform(x, [0, 200], ["#fff", "#4ade80"])` palette-adapted
- [x] Haptic `success` on completion threshold cross
- [x] **Chrome verification:** Record GIF of swipe → complete → confetti sequence on mobile viewport

> **Note:** `HabitCard` uses `drag="x"`, `dragConstraints={{ left: -60, right: 220 }}`, `dragElastic: 0.25`, velocity threshold 500px/s. Green success overlay uses `useTransform` on `x` MotionValue.

### D.2 — Drag-to-Reorder Habits ✅ COMPLETE

- [x] Use Motion `<Reorder.Group>` + `<Reorder.Item>` for habit list reordering
- [x] While dragging: card elevates with larger shadow + 1.05 scale + slight rotation
- [x] Shadow during drag: warm palette-tinted (not `rgba(0,0,0,...)`)
- [x] Haptic `light` when item "settles" into new position
- [x] Persist new order to Supabase on drag end
- [x] **Chrome verification:** Drag habit card between others — verify smooth reorder, no jitter

> **Note:** `HabitList` uses `<Reorder.Group axis="y">` + `<Reorder.Item whileDrag={{ scale: 1.04, boxShadow: palette-tinted }}>`. Order persisted via `reorderHabits` hook which updates Supabase.

### D.3 — Long-Press Destructive Actions ✅ COMPLETE

- [x] Long-press on habit card to delete: circular progress ring fills during hold
- [x] Progress fills over 1.5s — release before completion cancels
- [x] At 100%: card shrinks to 0 + fade out + haptic `medium`
- [x] Confirmation toast with undo option (8s window)
- [x] Visual: progress ring uses `error` color from palette
- [x] **Chrome verification:** Test press → hold → release cycle, and full hold → delete cycle

> **Note:** Implemented in `HabitActionMenu` as a hold-to-archive button. User presses and holds Archive — an SVG progress ring fills over 1.5s using a 16ms `setInterval`. Release before 100% resets. At 100%: `haptics.medium()` + `onArchive()` fires. Background animates to error-tinted on hold start via Motion `animate`. Ring uses `var(--color-error)` stroke, existing `var(--color-border)` track.

### D.4 — Pull-to-Refresh with Mochi ✅ COMPLETE

- [x] Custom pull-to-refresh replacing browser default
- [x] Set `overscroll-behavior-y: contain` on the HTML element
- [x] Mochi character stretches as user pulls down (Lottie frame maps to pull distance)
- [x] Threshold: 80px to trigger refresh
- [x] Mochi does a spinning/happy animation during data load
- [x] Mochi settles back down when refresh completes
- [x] **Chrome verification:** Test on mobile viewport — Mochi should stretch smoothly, no judder

> **Note:** `PullToRefresh` component uses `useMotionValue(pullDistance)`, `useTransform` for Mochi `scale`/`y`. Mochi spins during refresh (`rotate: [0, 360]`), stretches during pull (scale 1→1.4). Used in TodayScreen wrapping HabitList.

### D.5 — Card Stack / Tinder-Style Sprint Review ✅

- [x] Sprint tasks review: swipe through completed tasks as a card stack
- [x] Cards have depth/perspective stacking (top card full, next card slightly smaller/dimmer)
- [x] Swipe right = approve, swipe left = flag for review
- [x] Card rotation follows swipe direction (subtle, ±12°)
- [x] Stamp overlay appears: "DONE ✓" or "REVIEW 🔍"
- [x] **Chrome verification:** Test full card stack swipe-through sequence

> **Note:** `SprintTaskStack` component fetches `habit_completions` joined with `tasks` for the sprint week, deduplicates by title, renders as swipeable card stack. `SwipeCard` uses `drag="x"`, 120px offset or 600px/s velocity thresholds. Decisions tracked locally. Rendered in `SprintResultsView` after `KiraSprintVerdict`.

### Phase D — Definition of Done

✅ Swipe-to-complete works reliably on touch devices (GIF recorded)
✅ Drag-to-reorder is smooth with warm shadow elevation
✅ Long-press delete has satisfying progress ring + undo capability
✅ Pull-to-refresh shows Mochi stretching (Lottie frame maps to distance)
✅ All gesture animations respect `prefers-reduced-motion` (opacity-only fallbacks)
✅ `touch-action: pan-y` set on all horizontally-draggable elements
✅ No accidental triggers of browser back-swipe during horizontal gestures

---

## Phase E — Celebration & Reward Animations

**Goal:** Build the emotional high-points of the app. These moments — completing a habit, hitting a streak milestone, winning a sprint — must feel genuinely rewarding and escalate in intensity with achievement significance.

**Estimated effort:** 1–2 weeks
**Depends on:** Phase D complete

### E.1 — Celebration Intensity System ✅

Build the tiered celebration engine that triggers appropriate animation intensity:

| Trigger | Intensity | Confetti | Haptic | Sound | Lottie | Screen Shake |
|---------|-----------|----------|--------|-------|--------|-------------|
| Single habit complete | `micro` | None (checkbox handles it) | `light` | Soft pop | None | None |
| All habits done today | `small` | 30 particles | `success` | Chime | Mochi happy | None |
| 3-day streak | `small` | 30 particles | `success` | Chime | Mochi clap | None |
| 7-day streak | `medium` | 80 particles + sparkle text | `celebration` | Fanfare short | Mochi dance | None |
| 14-day streak | `medium` | 80 particles | `celebration` | Fanfare | Mochi dance | None |
| 30-day streak | `large` | Fireworks 3s loop | `celebration` | Full fanfare | Mochi costume change | Subtle shake |
| 60-day streak | `large` | Fireworks 3s | `celebration` | Full fanfare | Mochi evolution | Shake |
| 100-day streak | `epic` | Multi-burst 5s + emoji rain | `celebration` × 2 | Epic orchestral | Full Mochi sequence | Screen shake |
| Sprint win | `large` | Gold confetti 3s | `celebration` | Victory jingle | Winner crown animation | None |
| Sprint loss | `gentle` | None | None | Gentle tone | Mochi consoling | None |
| Tier unlock | `large` | Fireworks + sparkle border | `celebration` | Level up sound | Mochi ceremony | None |

- [x] Implement `triggerCelebration(intensity)` function that orchestrates all layers
- [x] All confetti colors must be palette-aware (different colors for each theme)
- [x] Dark mode: lighter/brighter particles, glow effects enhanced
- [x] **Chrome verification:** Trigger each intensity level — record GIF of the full sequence

> **Note:** `useCelebration` hook in `src/lib/animations/hooks/useCelebration.ts` — 5 intensities (micro/small/medium/large/epic), `getPaletteColors(isDark)` reads CSS vars at runtime, `useReducedMotion` guard. Streak milestones mapped to intensities in TodayScreen `handleToggle`.

### E.2 — Streak Counter Animation ✅

- [x] Number ticker: spring-animated digit roll using `useAnimatedCounter` hook
- [x] Scale bounce on increment (1.0 → 1.25 → 1.0) with `kawaiiSpring`
- [x] Glow effect behind counter on milestone numbers (7, 14, 21, 30, etc.)
- [x] Comfortaa Bold 700 font for streak numbers (design system requirement)
- [x] **Chrome verification:** Increment streak counter — confirm rolling digit + scale bounce

> **Note:** `StreakCounter.tsx` — `useMotionValueEvent` + `useState` for `displayStr`, `useAnimation` for scale sequence, `MILESTONES` set triggers `text-shadow` + radial gradient pulse overlay.

### E.3 — Sprint Results Reveal Sequence ✅

This is a cinematic moment — sprint results should feel like opening an envelope:

- [x] **Step 1 (0ms):** Screen dims slightly, dramatic pause
- [x] **Step 2 (500ms):** Score bars progressively fill from left to right with bounce overshoot
- [x] **Step 3 (1200ms):** Winner highlight — winning partner's bar glows + pulses
- [x] **Step 4 (1500ms):** Winner text animates in with `scaleIn` variant
- [x] **Step 5 (2000ms):** Confetti burst (gold for winner)
- [x] **Step 6 (2500ms):** Mochi appears with winner crown / consoling expression
- [x] **Step 7 (3000ms):** "Plan Punishment Date" or "Celebrate!" CTA button scales in
- [x] Orchestrate using Motion's `useAnimate` hook for imperative sequencing
- [x] **Chrome verification:** Record full reveal sequence as GIF — must feel dramatic but not slow

> **Note:** `SprintResultsReveal.tsx` — `useAnimate` with imperative sequencing: heading fade → count-up rAF → bar scaleX → winner glow → winner text scale → confetti → Mochi reveal.

### E.4 — Achievement Badge Unlock Animation ✅

- [x] Badge scales from 0 with rotation (0° → 360°) + spring overshoot
- [x] Sparkle/glow burst behind the badge (CSS pseudo-element or Lottie)
- [x] Badge "settles" with gentle wobble
- [x] XP gain toast slides up simultaneously: "+50 XP" with spring animation
- [x] **Chrome verification:** Trigger badge unlock — confirm full animation sequence

> **Note:** `TierUnlockCelebration.tsx` — `initial={{ scale: 0, rotate: -180 }}` → spring to 0°, sparkle ring via radial gradient `m.div` with `scale/opacity` loop, `ConfettiCelebration` with `intensity="large"`.

### E.5 — "All Done Today" Zero-State Celebration ✅

- [x] When all habits for the day are complete, transition the habit list to a celebration view
- [x] Mochi in celebratory pose (looping float + rising hearts)
- [x] "You crushed it! 🎉" text with spring entrance
- [x] Floating hearts in background (CSS-only via Motion)
- [x] Partner status: inline message in celebration view
- [x] **Chrome verification:** Complete all habits → confirm transition to zero state is smooth

> **Note:** `TodayScreen.tsx` — `allDoneToday` condition (dueHabits.length > 0 && completedCount === dueHabits.length) shows `EmptyState variant="all-done"` with partner score context instead of HabitList.

### E.6 — Sound System (Optional but Recommended)

- [ ] Create `src/lib/sounds.ts` using Web Audio API
- [ ] Pre-load short audio buffers (~50ms–2s) for: soft pop, chime, fanfare, victory, level-up
- [ ] Sounds respect a user-controlled volume/mute toggle in settings
- [ ] Sounds synchronize with animation keypoints (confetti burst = chime plays)
- [ ] iOS Web Audio unlock: play silent audio on first user interaction
- [ ] **Chrome verification:** Trigger celebration → confirm sound plays in sync with animation

### Phase E — Definition of Done

✅ All 10 celebration intensity levels implemented and working
✅ Streak counter animates with spring physics on every increment
✅ Sprint results reveal is a full cinematic sequence (GIF recorded)
✅ Badge unlock has scale + rotation + sparkle animation
✅ "All done" zero-state shows Mochi celebrating
✅ All celebrations are palette-aware (tested in all 3 themes + dark mode)
✅ Sound system functional with mute toggle (if implemented)
✅ `prefers-reduced-motion`: no confetti, no screen shake, opacity-only transitions
✅ Performance: celebrations don't drop below 30fps on 4x CPU-throttled Chrome

---

## Phase F — Dark Mode & Theme Transition Polish

**Goal:** Make dark mode feel like a warm evening, not a cold cave. Ensure theme switching itself is animated and all three palettes look beautiful in both modes.

**Estimated effort:** 3–5 days
**Depends on:** Phase E complete

### F.1 — Animated Theme Switcher ✅

- [x] Theme toggle: smooth color transition (not instant swap)
- [x] Use Motion `animate` on CSS custom properties for cross-fade
- [x] Duration: 300ms for color transitions
- [x] Mochi mascot: brief expression change during switch (squinting against light / opening eyes in dark)
- [x] **Chrome verification:** Toggle light→dark→light — confirm smooth cross-fade, no flash of white/black

> **Note:** `app.css` — blanket `transition-property: background-color, color, border-color, box-shadow; transition-duration: 300ms` on `*, *::before, *::after`. All theme CSS vars swap instantly but transition via browser paint. ThemeSwitcher renders palette swatches with active scale state.

### F.2 — Dark Mode Glow System ✅

- [x] Replace all drop shadows with colored glow effects in dark mode
- [x] Glow colors: palette-primary at 16% opacity ring (not white glow)
- [x] Cards: warm glow border via `--shadow-elevated` CSS variable ring
- [x] Active elements: subtle neon glow on focus/hover
- [x] Streak counters: neon text glow using `text-shadow` stack (milestone-triggered)
- [x] Achievement badges: glow pulse animation in dark mode
- [x] Implementation: CSS variable modification — `--shadow-elevated` prepended with `0 0 0 1px color-mix(...)` in all 3 dark themes
- [x] **Chrome verification:** Screenshot comparison — all cards in dark mode should have warm glow, not shadow

> **Note:** `app.css` — `--shadow-elevated` for Strawberry Dark, Matcha Dark, Honey Dark all start with glow ring. `--shadow-button` adds warm color layer. `--shadow-focus` opacity boosted to 0.25 in dark.

### F.3 — Celebration Adjustments for Dark Mode ✅

- [x] Confetti colors shift to lighter/brighter pastels on dark backgrounds
- [x] Reduce particle count by 30% (bright particles are more visible = fewer needed)
- [x] Sparkle effects: use white/cream sparkles instead of palette colors
- [x] Progress bars: add subtle glow behind filled portion
- [x] **Chrome verification:** Trigger `medium` and `large` celebrations in dark mode — record GIF

> **Note:** `useCelebration.ts` — `getPaletteColors(isDark)` returns `['#FFFFFF', '#E0F0E8', ...]` in dark mode instead of palette colors. `celebrate()` reduces `particleCount` by 30% in dark mode via `isDark` check.

### F.4 — Cross-Palette Consistency Audit

- [ ] Switch to Matcha Latte → verify ALL animations use palette tokens (no hardcoded hex)
- [ ] Switch to Honey Biscuit → verify same
- [ ] Confetti colors, glow colors, skeleton shimmer colors, button states — all palette-derived
- [ ] **Chrome verification:** Take screenshots of 5 key screens in all 3 palettes × 2 modes = 30 screenshots

### Phase F — Definition of Done

✅ Theme switching is animated with smooth color cross-fade (GIF recorded)
✅ Dark mode uses warm glows instead of shadows everywhere
✅ Celebrations look correct in dark mode (lighter particles, proper colors)
✅ All animations are palette-agnostic — no hardcoded colors in animation code
✅ 30 screenshot audit complete (5 screens × 3 palettes × 2 modes)

---

## Phase G — Mochi Mascot Animation Integration

**Goal:** Bring Mochi to life throughout the app. Mochi should feel like a living presence, not a static illustration.

**Estimated effort:** 1–2 weeks
**Depends on:** Phase F complete, Mochi Lottie assets created/commissioned

### G.1 — Mochi Expression State Machine

- [ ] Define Mochi expression states: `idle`, `happy`, `celebrating`, `concerned`, `sleepy`, `encouraging`, `disappointed`, `excited`
- [ ] Each state maps to a specific Lottie animation file (dotLottie format, <30KB each)
- [ ] Create `useMochiState` hook that derives expression from app context:
  - Idle: default state, gentle floating/breathing
  - Happy: habit completed, good day
  - Celebrating: streak milestone, sprint win, all done
  - Concerned: streak in danger, deadline approaching
  - Sleepy: late night (past user's bedtime setting)
  - Encouraging: behind on tasks, partner ahead
  - Disappointed: streak broken (gentle, never punishing — Finch philosophy)
  - Excited: new sprint starting, tier unlock approaching

### G.2 — Mochi Idle Animations

- [ ] Home screen: gentle vertical bob (2-5px, 3s ease-in-out loop)
- [ ] Blink every 3-4 seconds (randomized, natural feel)
- [ ] Occasional look-around (every 8-12s, random direction)
- [ ] 24fps, under 30KB dotLottie for idle loop
- [ ] Petting interaction: tap Mochi → floating hearts + haptic + chirp sound
- [ ] **Chrome verification:** Watch Mochi idle for 30 seconds — confirm natural, non-robotic rhythm

### G.3 — Mochi Loading State (Replaces Spinner)

- [ ] All loading states: Mochi in a thinking/searching pose instead of a spinner
- [ ] Animation: Mochi looking around or tapping foot
- [ ] Minimum 800ms display (same as skeleton rule)
- [ ] **Chrome verification:** Trigger a loading state — confirm Mochi appears, no spinner anywhere

### G.4 — Mochi in Celebrations

- [ ] Coordinate Mochi Lottie animation with canvas-confetti timing using `useAnimate`
- [ ] Sprint win: Mochi wears winner crown (overlay Lottie)
- [ ] Sprint loss: Mochi pats user consolingly
- [ ] Streak milestone: Mochi does a dance sequence
- [ ] All done: Mochi celebration loop
- [ ] **Chrome verification:** Record each Mochi celebration — confirm Lottie + confetti sync

### G.5 — Mochi in Empty States

- [ ] No habits yet: Mochi sleeping on a cloud + "Let's create your first habit!"
- [ ] All habits done: Mochi celebrating (see E.5)
- [ ] No data for analytics: Mochi with magnifying glass + "Keep going! Data will appear here"
- [ ] Error state: Mochi with umbrella + gentle reassuring text
- [ ] **Chrome verification:** Navigate to each empty state — confirm Mochi displays correctly

### Phase G — Definition of Done

✅ Mochi expression state machine correctly derives state from app context
✅ Idle animation loops naturally with blink + look-around
✅ Tap-to-pet interaction works with hearts + haptic
✅ Mochi replaces ALL spinners throughout the app
✅ Mochi celebrates in sync with confetti for all milestone types
✅ All empty states show contextual Mochi animation
✅ All Mochi Lottie files are <30KB dotLottie format
✅ Mochi works in all 3 palettes + dark mode (uses Lottie runtime theming)

---

## Phase H — Performance Audit & Final Polish

**Goal:** Ensure every animation runs at 60fps on mid-range devices, the bundle is optimized, accessibility is complete, and the overall experience is buttery smooth.

**Estimated effort:** 1 week
**Depends on:** All previous phases complete

### H.1 — Performance Profiling

- [ ] **Chrome DevTools Performance panel** with 4x CPU throttling:
  - Record: page navigation (all routes)
  - Record: habit completion full sequence (check → confetti → streak → XP toast)
  - Record: sprint results reveal
  - Record: drag-to-reorder habits
  - Record: scroll through 20+ habits
- [ ] Target: no frame drops below 30fps, 95th percentile at 60fps
- [ ] Identify and fix any animations triggering layout/paint (should only be transform + opacity)
- [ ] **Chrome verification:** Screenshot Performance flamegraph for each critical interaction

### H.2 — Bundle Size Audit

- [ ] Run `npx vite-bundle-visualizer` — screenshot the treemap
- [ ] Verify canvas-confetti is lazy-loaded (not in main bundle)
- [ ] Verify Motion uses LazyMotion (4.6 kB initial, not 34 kB)
- [ ] Verify Lottie WASM loads on demand
- [ ] Total animation-related bundle increase target: ≤50 kB gzipped
- [ ] **Chrome verification:** DevTools → Network → filter JS → confirm chunk sizes

### H.3 — Accessibility Final Pass

- [ ] `<MotionConfig reducedMotion="user">` wraps the entire app
- [ ] CSS `@media (prefers-reduced-motion: reduce)` catches all CSS animations
- [ ] In-app animation toggle in Settings (independent of OS setting)
- [ ] Reduced motion behavior: opacity fades only, no transforms, no confetti, no screen shake
- [ ] Loading indicators preserved in reduced motion mode
- [ ] WCAG 2.3.1: nothing flashes more than 3× per second (audit all celebrations)
- [ ] WCAG 2.2.2: auto-playing animations >5s have pause controls (idle Mochi)
- [ ] All animated elements maintain WCAG AA contrast ratios during transitions
- [ ] **Chrome verification:** Enable `prefers-reduced-motion: reduce` in DevTools → navigate entire app → confirm graceful degradation

### H.4 — Battery & Memory Optimization

- [ ] All animations pause on `visibilitychange` when tab is hidden
- [ ] Mochi idle loop: `IntersectionObserver` — stop when scrolled off screen
- [ ] Confetti: canvas properly cleaned up after animation completes
- [ ] `will-change: transform` applied only during active animation, removed after
- [ ] No continuous `requestAnimationFrame` loops when app is idle
- [ ] **Chrome verification:** DevTools → Performance → record 30s of idle app → confirm no unnecessary CPU activity

### H.5 — Cross-Browser & Device Testing Matrix

| Environment | Test |
|-------------|------|
| Chrome Android (mid-range phone) | Full app walkthrough + all celebrations |
| Safari iOS (home screen PWA) | Full app walkthrough (no haptic, verify graceful fallback) |
| Chrome Desktop | Full app walkthrough |
| Firefox Desktop | Basic navigation + transitions |
| 375×812 viewport | All gestures + touch interactions |
| 414×896 viewport | Layout + animations |
| Dark mode + Strawberry Milk | Full visual audit |
| Dark mode + Matcha Latte | Full visual audit |
| Dark mode + Honey Biscuit | Full visual audit |
| Reduced motion ON | Full walkthrough — everything gracefully degrades |

- [ ] **Chrome verification:** Use Chrome device emulation for each mobile viewport
- [ ] **Record final demo GIF** of the complete app flow with all animations

### H.6 — Animation Documentation

- [ ] Create `ANIMATION_GUIDE.md` in the project root documenting:
  - How to add new animations (use shared variants, don't create one-offs)
  - How to modify the kawaii spring config
  - How to add new celebration tiers
  - How to add new Mochi expressions
  - Performance rules (only transform + opacity, lazy-load, etc.)
  - How to test animations (Chrome DevTools workflow)

### Phase H — Definition of Done

✅ All critical interactions maintain 60fps on 4x CPU-throttled Chrome
✅ Total animation bundle ≤50 kB gzipped (verified in bundle visualizer)
✅ Reduced motion mode tested — complete app walkthrough with graceful degradation
✅ No battery drain from idle animations (verified in Performance panel)
✅ Cross-browser matrix: all environments tested
✅ `ANIMATION_GUIDE.md` documentation complete
✅ Final demo GIF recorded showing the full animated app experience
✅ Aman & Mukta both approve the overall animation feel

---

## Quick Reference: Claude Implementation Checklist

Before starting ANY animation task, Claude must:

```
□ Read the relevant SKILL.md (frontend-design, web-artifacts-builder, canvas-design, or theme-factory)
□ Query Context7 for the latest API docs of every library being used
□ Check import paths (motion/react NOT framer-motion, @hugeicons/react NOT hugeicons-react)
□ Implement the animation
□ Open Chrome → navigate to the screen
□ Take screenshot of default state
□ Trigger the animation → take screenshot of result
□ Open DevTools → Performance → verify 60fps
□ Toggle dark mode → verify animation looks correct
□ Set mobile viewport (375×812) → verify animation works on small screens
□ Enable prefers-reduced-motion → verify graceful degradation
□ If celebration/confetti: test in all 3 palettes (Strawberry Milk, Matcha Latte, Honey Biscuit)
□ Record GIF for Aman & Mukta approval if it's a major interaction
```

---

## Phase Summary at a Glance

```
Phase A — Animation Foundation & Infrastructure .......... 3–5 days
Phase B — Micro-Interactions (Every Tap Feels Alive) ..... 1–2 weeks
Phase C — Page Transitions & Shared Elements ............. 1 week
Phase D — Gesture-Driven Interactions .................... 1–2 weeks
Phase E — Celebration & Reward Animations ................ 1–2 weeks
Phase F — Dark Mode & Theme Transition Polish ............ 3–5 days
Phase G — Mochi Mascot Animation Integration ............. 1–2 weeks
Phase H — Performance Audit & Final Polish ............... 1 week
```

**Total estimated timeline: ~8–11 weeks**

This is approximate. Quality over speed always. No animation ships until it feels warm, squishy, and hand-crafted — not generic, not mechanical, not AI slop. If it doesn't make you smile, it's not done.

---

*This roadmap is a living document. Update as phases are completed and new animation ideas emerge from daily use.*

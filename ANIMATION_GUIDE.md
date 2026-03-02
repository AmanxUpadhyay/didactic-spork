# Jugalbandi Animation Guide

A reference for adding, modifying, and testing animations in the Jugalbandi PWA.

## Core Architecture

Animations use **Motion** (`motion/react`) with `LazyMotion + domAnimation` for tree-shaking. All motion components use `m.*` (e.g. `m.div`, `m.span`) — never `motion.div`.

```tsx
// ✅ Correct
import { m } from 'motion/react'
<m.div animate={{ scale: 1 }} />

// ❌ Wrong — imports full 34 kB bundle
import { motion } from 'motion/react'
<motion.div animate={{ scale: 1 }} />
```

---

## Adding New Animations

### 1. Use shared primitives from `@/lib/animations`

```tsx
import { kawaiiSpring, gentleSpring, staggerContainer, staggerItem } from '@/lib/animations'
```

| Export | Use for |
|--------|---------|
| `kawaiiSpring` | Button presses, checkbox bounce, scale animations |
| `gentleSpring` | Card hover, content fade-in |
| `staggerContainer(delay)` | List wrappers — staggers children entrance |
| `staggerItem` | Individual list items |
| `pageEnterRight` / `pageEnterLeft` | Full-page tab transitions |
| `fadeUp` | Toast and bottom-sheet entrance |

### 2. Performance rules — only `transform` and `opacity`

Animations that trigger layout or paint cause jank:

```tsx
// ✅ GPU-composited — safe
animate={{ scale: 1.05, opacity: 1, y: 0, rotate: 12 }}

// ❌ Triggers layout — avoid
animate={{ width: '100%', height: 200, padding: 16 }}

// ❌ Triggers paint — avoid
animate={{ background: 'red', border: '2px solid blue' }}
```

Exception: short one-time color transitions on theme switch (handled by CSS `transition`).

### 3. Never create one-off spring configs

```tsx
// ✅ Use shared spring
transition={kawaiiSpring}

// ❌ Ad-hoc configs that diverge from design system
transition={{ type: 'spring', stiffness: 300, damping: 20 }}
```

If you genuinely need a new spring, add it to `src/lib/animations/config.ts`.

---

## Spring Configuration

Current springs in `src/lib/animations/config.ts`:

| Name | Stiffness | Damping | Mass | Feel |
|------|-----------|---------|------|------|
| `kawaiiSpring` | 400 | 15 | 0.8 | Bouncy, playful |
| `gentleSpring` | 300 | 25 | 1.0 | Smooth, calm |
| `snappySpring` | 600 | 30 | 0.6 | Fast, precise |

To tune: higher **stiffness** = faster. Higher **damping** = less bounce. Lower **mass** = snappier.

---

## Celebration System

Use `useCelebration()` for all milestone moments. Never call `canvas-confetti` directly.

```tsx
import { useCelebration } from '@/lib/animations'

function MyComponent() {
  const { celebrate } = useCelebration()

  return (
    <button onClick={() => celebrate('medium')}>
      Celebrate
    </button>
  )
}
```

### Intensity levels

| Intensity | Particles | Haptic | Sound | Use when |
|-----------|-----------|--------|-------|----------|
| `micro` | 12 | light | softPop | Single item complete |
| `small` | 30 | success | chime | All habits done, 3-day streak |
| `medium` | 80 | success | fanfare | 7–14 day streak |
| `large` | 120 | celebration | victory | 30+ streak, sprint win, tier up |
| `epic` | 3s loop | celebration | levelUp | 100-day streak |

All confetti colors are palette-aware (reads CSS vars at runtime). Dark mode automatically reduces particle count by 30%.

### Adding a new celebration trigger

1. Add to `TodayScreen.handleToggle` (streak-based) or wherever the trigger fires
2. Map to the appropriate intensity in the table above
3. Test with `prefers-reduced-motion: reduce` enabled — confetti must not appear

---

## Adding New Mochi Expressions

When Lottie assets are available (Phase G):

1. Add animation file to `public/animations/mochi-[expression].lottie`
2. Add the expression name to the `MochiExpression` type in `src/components/ui/MochiAvatar.tsx`
3. Add the file mapping in the `EXPRESSION_MAP` constant
4. Update `useMochiState` hook logic if the new expression should auto-trigger from app context

Size limit: **<30 kB** per dotLottie file. Use Lottie runtime theming for palette-awareness.

---

## Sound System

```tsx
import { sounds } from '@/lib/sounds'

// In a user-gesture handler:
sounds.softPop()   // Habit check
sounds.chime()     // Small celebration
sounds.fanfare()   // Medium celebration
sounds.victory()   // Large celebration
sounds.levelUp()   // Epic / tier unlock
```

Volume and mute state persists in `localStorage` under `jugalbandi_sound`. Users control this in **Settings → Sound**.

All sounds are synthesized via Web Audio API — no audio file assets required. To add a new sound, add a method to the `sounds` object in `src/lib/sounds.ts` using the `tone()` primitive.

---

## Reduced Motion

`<MotionConfig reducedMotion="user">` in `AnimationProvider` handles all `m.*` components automatically — transforms collapse to opacity fades when OS reduced motion is enabled.

For explicit checks:

```tsx
import { useReducedMotion } from '@/lib/animations'

function MyComponent() {
  const reducedMotion = useReducedMotion()
  return (
    <m.div
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: [1, 1.2, 1] }}
    />
  )
}
```

CSS animations use the `motion-safe:` Tailwind prefix for infinite loops:

```tsx
// ✅ Respects prefers-reduced-motion
className="motion-safe:animate-[float_3s_ease-in-out_infinite]"

// ❌ Plays even in reduced motion
className="animate-[float_3s_ease-in-out_infinite]"
```

---

## Testing Animations

### Chrome DevTools

1. **Reduced motion:** DevTools → Rendering → check "Emulate CSS media feature prefers-reduced-motion"
2. **Performance:** DevTools → Performance → set CPU throttle 4× → record interaction → look for long frames (red)
3. **Dark mode:** DevTools → Rendering → "Emulate CSS prefers-color-scheme: dark"

### Verify only transform + opacity

In Performance panel: any animation that causes "Layout" or "Paint" in the flamegraph is a problem. Only green "Composite" blocks should appear during animations.

### Test checklist for new animations

- [ ] Works in light mode (all 3 palettes)
- [ ] Works in dark mode (all 3 palettes)
- [ ] Works with `prefers-reduced-motion: reduce` enabled
- [ ] No jank at 4× CPU throttle
- [ ] No layout shift (DevTools CLS metric stays 0)
- [ ] Haptic + sound fire correctly on mobile

---

## Bundle Notes

- `canvas-confetti` is **lazy-loaded** — only loads on first celebration. Bundle impact: 4.28 kB gzip.
- `sounds.ts` is in the main bundle (~1.5 kB gzip) — acceptable since it's always used.
- `m.*` components use `LazyMotion + domAnimation` — initial Motion payload ≈4.6 kB gzip.
- Lottie (Phase G) must use **dynamic import** to stay out of the main bundle.

# The definitive animation stack for a kawaii React PWA

**Motion (formerly Framer Motion) should be your primary animation engine, paired with AutoAnimate for effortless list transitions and canvas-confetti for celebrations.** This three-library core — totaling under 45 kB gzipped — delivers the premium, hand-crafted feel that differentiates a kawaii couples app from generic habit trackers. The ecosystem around these libraries has matured dramatically through 2025, with the View Transitions API reaching **89.5% browser support**, Motion shipping a hybrid WAAPI + JS engine for 120fps animations, and copy-paste component libraries like Magic UI providing dozens of ready-made animated components built on this exact stack. Your custom kawaii easing `cubic-bezier(0.34, 1.56, 0.64, 1)` — that soft overshoot mimicking squishy physics — works natively across all three recommendations.

This report maps every animation type in your app to the right library and technique, from squishy button presses to 100-day streak celebrations to gesture-driven card swipes.

---

## Comprehensive library comparison: the 2025-2026 landscape

The React animation ecosystem has consolidated around a clear winner. **Motion** (the rebranded Framer Motion, now at v12.x) dominates with ~30,700 GitHub stars, **7.2M weekly npm downloads**, and updates shipping every few days. It is purpose-built for React's declarative model, offers built-in gesture recognition, spring physics, layout animations, and `AnimatePresence` for mount/unmount transitions — all in a single package.

Here is how every viable library stacks up:

| Library | Bundle (gzip) | Stars | Weekly DL | Last publish | React DX | Gestures | Springs | Status |
|---|---|---|---|---|---|---|---|---|
| **Motion** (`motion`) | 4.6–34 kB | 30.7K | 7.2M | Days ago | ★★★★★ | ★★★★★ | ★★★★★ | ✅ Active |
| **React Spring** | 16–22 kB | 28K | ~500K | 5 months | ★★★★★ | ★★☆ | ★★★★★ | ⚠️ Slowing |
| **GSAP** | 25–32 kB + plugins | 23.6K | 1.7M | 2 months | ★★★☆ | ★★★☆ | ★★☆ | ✅ Active (free post-Webflow) |
| **AutoAnimate** | **3.3 kB** | 13K | 200K | Recent | ★★★★☆ | ☆ | ☆ | ✅ Active |
| **Anime.js v4** | 6–8 kB | 49K+ | 370K | 14 days | ★★☆ | ★★☆ | ★★★☆ | ✅ Active |
| **@use-gesture** | 12–14 kB | 9.3K | 813K | Stable (2yr) | ★★★★★ | ★★★★★ | ☆ (pairs w/ Spring) | ⚠️ Stable |
| **Rive** | 50–80 kB + WASM | 7K | ~150K | 17 days | ★★★★☆ | ★★★☆ | ★★★☆ | ✅ Active |
| **Theatre.js** | 20–50 kB | 11.5K | 3.2K | Niche | ★★★☆ | ☆ | ☆ | ⚠️ 3D-focused |
| **Remotion** | N/A (video) | 25.3K | 170K | Days ago | ★★★★★ | N/A | N/A | ❌ Not for UI animation |
| **React Transition Group** | ~2 kB | 10.3K | 20M* | ❌ 4+ years | ★★★★☆ | ☆ | ☆ | ❌ Unmaintained |

*React Transition Group downloads are inflated because Material UI depends on it transitively.

**Libraries to skip entirely:** Popmotion (absorbed into Motion), React Move (unmaintained 6+ years), React Transition Group (unmaintained, replaced by AnimatePresence), Remotion (video generation, not UI animation), Theatre.js (3D-focused, overkill for 2D PWA). Motion One has merged into the `motion` package — its lightweight vanilla JS API lives on as `import { animate } from "motion"`.

**GSAP's licensing changed dramatically.** After Webflow's acquisition, all plugins — including formerly $150/year ones like SplitText, MorphSVG, and ScrollSmoother — became **100% free**. The license is still proprietary (not MIT), but it's free for all commercial use. GSAP remains the industry standard for complex timeline choreography, but its imperative, ref-based API feels less "React-native" than Motion's declarative approach. Use it only if you need scroll-triggered cinematic sequences.

**React Spring** has the most natural physics engine — springs-first with no durations by default — but development pace has slowed compared to Motion. Its main value now is pairing with `@use-gesture/react` for advanced multi-touch gestures, but Motion's built-in `whileTap`, `whileHover`, and `drag` props cover most gesture needs without a separate library.

**Motion's bundle optimization is critical for your PWA.** Using `LazyMotion` with the `m` component drops your initial bundle from ~34 kB to **~4.6 kB**, async-loading the remaining ~15 kB of animation features:

```tsx
import { LazyMotion, domAnimation } from "motion/react"
import * as m from "motion/react-m"

const loadFeatures = () => import("motion/react").then(m => m.domAnimation)

function App() {
  return (
    <LazyMotion features={loadFeatures}>
      <m.div animate={{ scale: 1.1 }} />
    </LazyMotion>
  )
}
```

## Animated component libraries that accelerate your build

Two copy-paste component libraries stand out for a kawaii aesthetic built on your exact stack (React + Tailwind + Motion):

**Magic UI** offers **68+ free components** (150+ total) installed via `npx shadcn@latest add`. It uses Motion under the hood, fully supports **Tailwind CSS v4 and React 19**, and follows the shadcn/ui copy-paste model — you own the code, no dependency lock-in. Components most relevant to your app: **Confetti** (celebration bursts), **Cool Mode** (emoji/particle rain on click), **Number Ticker** (animated streak counters), **Animated Circular Progress Bar**, **Sparkles Text**, **Animated List** (habit lists with entrance animations), **Pulsating Button**, **Border Beam** / **Shine Border** (glowing card borders for achievements), and **Orbiting Circles** (fun partner-connection visual). Magic UI has **20K+ GitHub stars** and raised a seed round — it's actively maintained and production-ready.

**Aceternity UI** provides **102+ free components** (200+ with Pro) with similar copy-paste installation via Shadcn CLI 3.0. Built with Tailwind CSS v4 and Framer Motion. Best picks for kawaii: **Sparkles** (sparkle overlays), **Wobble Card** (playful hover), **Draggable Card**, **Floating Dock** (macOS-style navigation), **Aurora Background** (dreamy gradient), **Animated Modal**, **Animated Tabs**, **Glowing Stars**, and **Colourful Text**.

Both libraries produce components you can restyle with pastel colors, extreme `rounded-3xl` corners, and your custom easing curve. Since they're copy-paste, you modify the animation config directly:

```tsx
// Inside any Magic UI or Aceternity component, swap easing:
transition={{ ease: [0.34, 1.56, 0.64, 1], duration: 0.4 }}
// Or for spring physics with kawaii bounce:
transition={{ type: "spring", stiffness: 400, damping: 15 }}
```

Other notable libraries worth cherry-picking from: **Hover.dev** (interactive buttons/toggles), **Cult UI** (Dynamic Island, animated dock), **Luxe UI** (ultra-refined animations with Radix primitives), **Animate UI** (growing Shadcn-compatible collection), and **Motion Primitives** (Framer Motion + Tailwind composition patterns).

## Page transitions and shared elements without Next.js

Smooth page transitions in React Router + Vite require wrapping your routes with Motion's `AnimatePresence`, keyed by the current pathname:

```tsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

const kawaiiTransition = {
  type: "spring", stiffness: 300, damping: 25, mass: 0.8
};

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={kawaiiTransition}
    >
      {children}
    </motion.div>
  );
}

function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
        <Route path="/habits" element={<AnimatedPage><Habits /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}
```

**Shared element transitions** use Motion's `layoutId` prop — when a component with `layoutId="card-42"` unmounts and another with the same ID mounts, Motion automatically animates between their positions and sizes:

```tsx
// In habit list
<motion.div layoutId={`habit-${habit.id}`}>
  <HabitCard compact {...habit} />
</motion.div>

// In habit detail (same layoutId triggers shared transition)
<motion.div layoutId={`habit-${habit.id}`}>
  <HabitDetail {...habit} />
</motion.div>
```

**The View Transitions API is production-ready.** As of October 2025, it reached Baseline Newly Available with **~89.5% global browser support** (Chrome 111+, Safari 18+, Firefox 144+, all major mobile browsers). React Router already supports it natively:

```tsx
<Link to="/habits" viewTransition>Habits</Link>
// Or programmatic:
navigate("/habits", { viewTransition: true });
```

React's experimental `<ViewTransition>` component (in canary) offers shared element coordination via CSS `view-transition-name`. For your PWA targeting modern mobile browsers, View Transitions provides lightweight page-level navigation animation while Motion handles the complex in-page interactions. Use both: View Transitions for route changes, Motion for everything else.

**Staggered entry animations** — cards appearing one by one when navigating to a page — are trivial with Motion's variant propagation:

```tsx
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 }
  }
};
const card = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
};

<motion.div variants={container} initial="hidden" animate="visible">
  {habits.map(h => <motion.div key={h.id} variants={card}><HabitCard {...h} /></motion.div>)}
</motion.div>
```

## Micro-interactions that feel warm and squishy

Every tap, toggle, and completion in your app should use **spring physics** rather than fixed-duration easing where possible. Springs naturally produce the overshoot-and-settle behavior that defines kawaii motion. Your standard easing `cubic-bezier(0.34, 1.56, 0.64, 1)` works for CSS transitions; in Motion, the equivalent spring config is approximately `{ type: "spring", stiffness: 400, damping: 15, mass: 0.8 }`.

**Squishy button press** — the single most important micro-interaction:

```tsx
<motion.button
  whileTap={{ scale: 0.85 }}
  whileHover={{ scale: 1.05 }}
  transition={{ type: "spring", stiffness: 500, damping: 15 }}
  onTap={() => navigator.vibrate?.(10)} // haptic on Android
>
  Complete Habit ✨
</motion.button>
```

**Checkbox draw animation** uses SVG `strokeDashoffset` to "draw" the checkmark. Combine with a scale overshoot and color fill:

```tsx
<motion.path
  d="M1 4.5L5 9L14 1"
  initial={{ pathLength: 0 }}
  animate={{ pathLength: isChecked ? 1 : 0 }}
  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
  stroke="#FF6B9D"
  strokeWidth={2}
  fill="none"
/>
```

**Streak counter with rolling digits** — animate numbers ticking up with spring physics, no React re-renders:

```tsx
import { useSpring, useTransform, motion } from "motion/react";

function AnimatedStreak({ value }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, v => Math.round(v));
  useEffect(() => { spring.set(value); }, [value]);
  return <motion.span>{display}</motion.span>;
}
```

Magic UI's **Number Ticker** component does exactly this out of the box. Copy it in and restyle.

**Toggle switch with layout animation** — Motion's `layout` prop creates a satisfying magnetic snap:

```tsx
<motion.div
  onClick={toggle}
  animate={{ backgroundColor: isOn ? "#FF6B9D" : "#E8E8E8" }}
  className="w-14 h-8 rounded-full p-1 cursor-pointer flex"
  style={{ justifyContent: isOn ? "flex-end" : "flex-start" }}
>
  <motion.div
    layout
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
    className="w-6 h-6 bg-white rounded-full"
  />
</motion.div>
```

**Kawaii ripple effect** (not Material Design — softer, pinker, with overshoot scaling):

```tsx
<motion.span
  initial={{ scale: 0, opacity: 0.6 }}
  animate={{ scale: 4, opacity: 0 }}
  transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
  className="absolute w-5 h-5 rounded-full bg-pink-300/40 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
/>
```

**Warm skeleton shimmer** — use `transform: translateX()` (GPU-composited) rather than background-position:

```css
.skeleton-kawaii {
  background-color: #FFE4EC;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}
.skeleton-kawaii::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,182,206,0.4) 20%, rgba(255,255,255,0.6) 60%, transparent);
  animation: shimmer 2s infinite;
}
@keyframes shimmer { 100% { transform: translateX(100%); } }
```

**Haptic feedback** pairs with animations on Android via `navigator.vibrate()`. Define a pattern library:

```tsx
const haptics = {
  light: () => navigator.vibrate?.(10),
  medium: () => navigator.vibrate?.(25),
  success: () => navigator.vibrate?.([10, 30, 10, 30, 50]),
  celebration: () => navigator.vibrate?.([10, 20, 10, 20, 10, 20, 50]),
};
```

Note: `navigator.vibrate` is **not supported on iOS Safari/WebKit**. Feature-detect with `"vibrate" in navigator`.

## Gesture-driven animations for native-feeling interactions

Motion's built-in drag system handles most gesture needs. For a swipe-to-complete habit card with rubber-band physics:

```tsx
function SwipeHabitCard({ habit, onComplete }) {
  const x = useMotionValue(0);
  const bg = useTransform(x, [0, 200], ["#fff", "#4ade80"]);
  const checkOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      style={{ x, backgroundColor: bg }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 200) {
          onComplete(habit.id);
          haptics.success();
        }
      }}
    >
      <motion.span style={{ opacity: checkOpacity }}>✓</motion.span>
      <span>{habit.name}</span>
    </motion.div>
  );
}
```

**Drag-to-reorder habits** uses Motion's built-in `Reorder` components — one of its biggest differentiators over React Spring:

```tsx
import { Reorder } from "motion/react";

<Reorder.Group axis="y" values={habits} onReorder={setHabits}>
  {habits.map(habit => (
    <Reorder.Item key={habit.id} value={habit}
      whileDrag={{ scale: 1.05, boxShadow: "0 8px 24px rgba(255,107,157,0.3)" }}
    >
      <HabitCard {...habit} />
    </Reorder.Item>
  ))}
</Reorder.Group>
```

**Long-press to confirm destructive actions** — animate a circular progress ring during the hold:

```tsx
const [progress, setProgress] = useState(0);
const holdTimer = useRef(null);

<motion.button
  onTapStart={() => {
    holdTimer.current = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(holdTimer.current); deleteHabit(); return 100; } return p + 2; });
    }, 20);
  }}
  onTap={() => { clearInterval(holdTimer.current); setProgress(0); }}
  onTapCancel={() => { clearInterval(holdTimer.current); setProgress(0); }}
>
  <CircularProgress value={progress} /> Hold to delete
</motion.button>
```

For advanced multi-touch gestures (pinch-to-zoom on data viz, complex velocity tracking), add `@use-gesture/react` — it provides `useDrag`, `usePinch`, `useScroll`, `useWheel`, and `useMove` hooks that feed directly into Motion values or React Spring. But for the 90% case in your PWA, Motion's built-in gestures are sufficient.

**Critical CSS for gesture interactions in PWAs:** Set `touch-action: pan-y` on horizontally-draggable elements to prevent the browser's back-swipe gesture from competing. Use `overscroll-behavior-y: contain` on the `html` element to disable the native pull-to-refresh.

## Celebrations and reward moments that escalate with streaks

For a couples habit tracker, celebration moments are the emotional core. The right library depends on the celebration type:

| Library | Bundle (gzip) | Best for | React API |
|---|---|---|---|
| **canvas-confetti** | ~5.2 kB | Versatile confetti bursts, fireworks, emoji rain | `useEffect` + promise-based |
| **react-rewards** | ~3.6 kB | Quick micro-rewards tied to specific elements | `useReward()` hook |
| **@neoconfetti/react** | **~1.56 kB** | Minimal CSS-based confetti | Component |
| **react-confetti** | ~6.5 kB | Full-screen continuous confetti rain | `<ReactConfetti />` component |
| **tsParticles (slim)** | ~40–50 kB | Complex particle systems (fireflies, snow, bubbles) | Engine init + component |

**Recommended approach:** Use **canvas-confetti** as your celebration engine — it's framework-agnostic, promise-based, and supports custom shapes via SVG paths, emoji via `shapeFromText`, and fine-grained physics control. Lazy-load it on first celebration:

```tsx
const triggerCelebration = async (intensity: 'small' | 'medium' | 'epic') => {
  const confetti = (await import('canvas-confetti')).default;
  const isDark = document.documentElement.classList.contains('dark');
  const colors = isDark
    ? ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1']
    : ['#FF6B9D', '#FFD700', '#FF9EC6', '#87CEEB', '#4ade80'];

  if (intensity === 'small') {
    confetti({ particleCount: 30, spread: 50, colors, origin: { y: 0.7 } });
  } else if (intensity === 'medium') {
    confetti({ particleCount: 80, spread: 100, colors, startVelocity: 45 });
  } else {
    // Epic: multi-burst fireworks
    const end = Date.now() + 3000;
    const interval = setInterval(() => {
      confetti({ particleCount: 40, spread: 360, colors,
        origin: { x: Math.random(), y: Math.random() * 0.4 } });
      if (Date.now() > end) clearInterval(interval);
    }, 200);
  }
};
```

**Streak milestone escalation** — Duolingo's key insight is that celebration intensity must scale with achievement significance:

- **Daily completion:** Small confetti burst (30 particles) + haptic tap
- **7-day streak:** Medium confetti (80 particles) + sparkle text effect + Lottie character celebration
- **30-day streak:** Full-screen fireworks (3-second loop) + screen shake + sound effect + special badge animation
- **100-day streak:** Epic mode — particles + confetti + Lottie transformation sequence + partner notification

**Screen shake for dramatic moments** (pure Motion, no library needed):

```tsx
<motion.div animate={{ x: shouldShake ? [0, -8, 8, -8, 8, 0] : 0 }}
  transition={{ duration: 0.4 }} />
```

**Sound + animation synchronization** uses the Web Audio API. Pre-load short audio buffers and trigger them at animation keypoints:

```tsx
const playSound = async (url: string) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const response = await fetch(url);
  const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
};
```

## Animation orchestration and sequencing complex flows

The task-completion sequence (check animation → confetti → streak update → XP gain) requires chaining animations. Motion's **`useAnimate`** hook provides imperative sequencing:

```tsx
const [scope, animate] = useAnimate();

async function handleHabitComplete(habitId: string) {
  // 1. Checkbox draw + scale
  await animate(`#check-${habitId}`, { pathLength: 1 }, { duration: 0.3, type: "spring" });
  // 2. Card glow + slight scale
  await animate(`#card-${habitId}`, { scale: [1, 1.03, 1], boxShadow: "0 0 20px rgba(255,107,157,0.4)" }, { duration: 0.3 });
  // 3. Fire confetti (non-blocking)
  triggerCelebration('small');
  haptics.success();
  // 4. Streak counter increment (parallel)
  animate(`#streak-count`, { scale: [1, 1.2, 1] }, { duration: 0.4, type: "spring" });
  // 5. XP notification slide in
  await animate(`#xp-toast`, { y: [50, 0], opacity: [0, 1] }, { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] });
  await new Promise(r => setTimeout(r, 1500));
  animate(`#xp-toast`, { y: -20, opacity: 0 }, { duration: 0.2 });
}
```

For coordinating **Lottie character animations with Motion UI animations**, drive Lottie's frame position from a Motion value:

```tsx
const progress = useMotionValue(0);
const lottieRef = useRef(null);

useMotionValueEvent(progress, "change", (v) => {
  lottieRef.current?.goToAndStop(v * totalFrames, true);
});
```

**Building a reusable animation system** — create a shared config and hook library:

```
src/
  lib/
    animations/
      config.ts          // Shared easing, spring configs, durations
      useKawaiiSpring.ts // Hook wrapping Motion's spring with kawaii defaults
      useStaggerIn.ts    // Hook for staggered page entry
      useCelebration.ts  // Hook wrapping canvas-confetti with dark mode
      variants.ts        // Shared Motion variants (fadeUp, scaleIn, slideRight)
      index.ts           // Barrel export
```

```tsx
// config.ts
export const kawaiiEasing = [0.34, 1.56, 0.64, 1] as const;
export const kawaiiSpring = { type: "spring" as const, stiffness: 400, damping: 15, mass: 0.8 };
export const gentleSpring = { type: "spring" as const, stiffness: 200, damping: 20 };

// variants.ts
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: kawaiiSpring }
};
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: kawaiiSpring }
};
export const staggerContainer = (staggerDelay = 0.08) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: staggerDelay, delayChildren: 0.15 } }
});
```

## Performance that holds 60fps on mid-range phones

The golden rule: **only animate `transform` and `opacity`**. These two properties run on the browser's compositor thread, separate from the main thread where JavaScript, layout, and paint execute. Animating `width`, `height`, `margin`, `top`, `left`, `border-radius`, or `box-shadow` triggers layout recalculation or repaint on every frame — instant jank.

Motion uses CSS transforms internally for position/scale/rotation, so `<motion.div animate={{ x: 100, scale: 1.1, opacity: 0.5 }}>` stays compositor-only. But be cautious with `backgroundColor` animations — they trigger paint (becoming hardware-accelerated in newer Chromium builds).

**Critical performance patterns for your PWA:**

- **Lazy-load celebration code.** Dynamic `import('canvas-confetti')` on first celebration event means zero bundle cost until needed. Same for GSAP if used for any scroll sequences
- **Use `LazyMotion`** as described above — 4.6 kB initial, ~15 kB async
- **Pause off-screen animations** with `IntersectionObserver`. Breathing/floating background effects should stop when scrolled away
- **Pause on tab hide** via `document.addEventListener('visibilitychange', ...)` — a continuously running `requestAnimationFrame` loop drains **~4% battery per 15 minutes** on mobile
- **`will-change: transform`** should be applied sparingly and only during active animation. Over-promoting elements to GPU layers causes memory issues on mobile — each layer consumes texture memory
- **Profile with Chrome DevTools** Performance panel + **4x CPU throttling** to simulate mid-range Android phones. The Rendering tab's "Frame Rendering Stats" overlay shows live FPS
- **Object pooling for particles:** When running confetti or particle effects, reuse particle objects rather than allocating/garbage-collecting. canvas-confetti handles this internally

**Service worker caching** for animation assets (via vite-plugin-pwa + Workbox): Cache Lottie JSON files and JS animation chunks with Cache-First strategy. Lazy-loaded animation chunks get cached after first use via runtime caching:

```ts
// vite.config.ts
VitePWA({
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,json,lottie}'],
    runtimeCaching: [{
      urlPattern: /\.(?:json|lottie)$/,
      handler: 'CacheFirst',
      options: { cacheName: 'animation-assets', expiration: { maxEntries: 50 } }
    }]
  }
})
```

## Dark mode: glows replace shadows, pastels get luminous

In dark mode, **drop shadows become colored glows** and particle colors shift to lighter pastels. The key insight: bright particles on dark backgrounds are more visually prominent, so you need **fewer particles** for the same impact.

Performance-optimized glow animation — animate `opacity` + `transform` on a pseudo-element rather than `box-shadow` directly (which triggers paint every frame):

```css
.glow-card::after {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: inherit;
  background: radial-gradient(circle, rgba(196,183,255,0.3), transparent 70%);
  opacity: 0.5;
  animation: glow-pulse 2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes glow-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}
```

Pastel neon text glow with `text-shadow` (works beautifully on dark backgrounds):

```css
.dark .neon-text {
  text-shadow: 0 0 7px #fff, 0 0 10px #fff, 0 0 21px var(--pastel-pink),
    0 0 42px var(--pastel-pink), 0 0 82px var(--pastel-pink);
}
```

For Tailwind v4, use dark mode utility classes for glow effects:

```html
<div class="bg-pink-100 dark:bg-pink-900/30 dark:shadow-[0_0_15px_rgba(236,72,153,0.3)]
  dark:hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-shadow rounded-xl">
```

## Accessibility: reduce, don't remove

Wrap your entire app in Motion's `MotionConfig` to automatically respect the OS-level reduced motion preference:

```tsx
<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>
```

This automatically disables transform/layout animations while preserving opacity and color transitions. Add a global CSS fallback for non-Motion animations:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Animations to keep in reduced-motion mode:** loading indicators, progress bars, button press feedback (use opacity change instead of scale), and data visualization transitions. **Animations to remove:** parallax, floating particles, confetti, staggered reveals, elaborate page transitions. Replace x/y motion with opacity fades — don't just delete all feedback. canvas-confetti has a `disableForReducedMotion` option.

WCAG requires that **nothing flashes more than 3 times per second** (2.3.1, Level A) and auto-playing animations over 5 seconds must have pause controls (2.2.2, Level A). Both are mandatory, not optional. Provide an in-app animation toggle in your settings — users with vestibular disorders (**35% of adults over 40**) may not know about the OS setting.

## The recommended animation stack

Your complete animation dependency list:

```json
{
  "motion": "^12.x",
  "@formkit/auto-animate": "^0.9.x",
  "canvas-confetti": "^1.9.x"
}
```

**Total added bundle:** ~40 kB gzipped (Motion with LazyMotion: ~20 kB effective, AutoAnimate: 3.3 kB, canvas-confetti: 5.2 kB lazy-loaded). Plus your existing Lottie runtime for character animations.

**When to reach for each layer:**

| Animation type | Use this | Why |
|---|---|---|
| All UI animations (scale, fade, slide, layout) | **Motion** | Declarative, spring physics, AnimatePresence |
| Button press / tap feedback | **Motion** `whileTap` | Built-in gesture, zero config |
| Page transitions | **Motion** `AnimatePresence` + View Transitions API | Exit animations + browser-native crossfade |
| Shared elements | **Motion** `layoutId` | Automatic position/size interpolation |
| List add/remove/reorder animations | **AutoAnimate** or **Motion** `Reorder` | AutoAnimate for simple lists (3.3 kB), Motion Reorder for drag-to-reorder |
| Swipe gestures (dismiss, complete) | **Motion** `drag` | Built-in rubber-band, velocity-based |
| Staggered entry | **Motion** variants + `staggerChildren` | Declarative cascade |
| Streak counters / number roll | **Motion** `useSpring` + `useTransform` | No React re-renders |
| Confetti celebrations | **canvas-confetti** (lazy) | Framework-agnostic, emoji/SVG shapes, tiny |
| Character animations | **Lottie** (dotLottie) | Already in stack, designer-authored |
| Notification badge pulse | **CSS** `@keyframes` + Tailwind `animate-ping` | Zero JS, compositor thread |
| Skeleton shimmer | **CSS** `transform: translateX` | GPU-composited, zero JS |
| Tooltip/popover entrance | **Motion** `AnimatePresence` | Mount/unmount with spring |
| Toggle switch | **Motion** `layout` + spring | Magnetic snap feel |
| Progress bars | **Motion** or **CSS** `transition` | Spring overshoot for kawaii |
| Glow/neon effects | **CSS** `box-shadow` / pseudo-elements | Tailwind dark mode utilities |
| Complex scroll timelines | **GSAP** ScrollTrigger (add only if needed) | Industry-best scroll choreography |
| Particle backgrounds | **Magic UI** Particles / Cool Mode (copy-paste) | Pre-built, customizable |
| Sparkle text | **Magic UI** Sparkles Text (copy-paste) | Pre-built with Motion |
| Sound synchronization | **Web Audio API** | Native browser, no library needed |
| Haptic feedback | **navigator.vibrate** | Android only, native API |

## Animation decision matrix for every app interaction

| App interaction | Library | Technique | Easing | Priority |
|---|---|---|---|---|
| Navigate between pages | Motion + View Transitions | `AnimatePresence mode="wait"` | `kawaiiSpring` | P0 |
| Habit list loads | Motion | `staggerChildren: 0.08` variant propagation | Spring bounce 0.4 | P0 |
| Tap "complete" button | Motion | `whileTap={{ scale: 0.85 }}` + haptic | Spring stiffness 500 | P0 |
| Checkbox check-draw | Motion | SVG `pathLength` animation | Spring damping 20 | P0 |
| Task swipe-to-complete | Motion | `drag="x"` + `dragElastic={0.3}` | Bounce stiffness 300 | P1 |
| Streak count increment | Motion | `useSpring` → `useTransform` → Math.round | Spring stiffness 75 | P0 |
| Daily goal confetti | canvas-confetti | 30 particles, spread 50 | N/A (physics) | P0 |
| 7-day streak celebration | canvas-confetti + Lottie | 80 particles + character animation | N/A + designer-authored | P1 |
| 30-day streak celebration | canvas-confetti + screen shake | Fireworks loop 3s + `x: [0,-8,8,-8,0]` | N/A + spring | P1 |
| 100-day streak celebration | canvas-confetti + Lottie + particles | Full epic sequence, 5s duration | Mixed | P2 |
| Toggle dark/light mode | Motion | `layout` + spring + `backgroundColor` | `kawaiiSpring` | P1 |
| Habit card expand/collapse | Motion | `layoutId` shared element | Spring damping 25 | P1 |
| Reorder habit list | Motion | `<Reorder.Group>` + `<Reorder.Item>` | Spring stiffness 300 | P1 |
| Pull-to-refresh | Motion | `drag="y"` + custom Lottie character stretch | Rubber-band elastic 0.3 | P2 |
| Long-press delete | Motion + CSS | `onTapStart` → circular progress → confirm | Linear (progress) | P2 |
| Partner avatar pulse | CSS | `animate-ping` Tailwind utility | Ease infinite | P1 |
| Loading skeletons | CSS | `translateX(-100%)` shimmer with warm pink | Linear infinite | P0 |
| Notification badge | CSS | `animate-ping` on pseudo-element | Ease infinite | P1 |
| Tooltip entrance | Motion | `AnimatePresence` + spring scale/opacity | `kawaiiSpring` | P1 |
| Progress bar fill | Motion or CSS | Spring `width%` animation | Kawaii cubic-bezier | P0 |
| Achievement badge unlock | Motion + Lottie | Scale from 0 + rotation + Lottie sparkle | Spring bounce 0.5 | P2 |
| XP gain toast | Motion | Slide up + fade in + auto-dismiss | Kawaii ease `[0.34, 1.56, 0.64, 1]` | P1 |
| Dark mode glow effects | CSS | Pseudo-element `opacity` + `transform` pulse | Ease-in-out infinite | P1 |
| Partner "nudge" notification | Motion | Wobble `rotate: [-3, 3, -3, 0]` + haptic | Spring | P2 |
| Reduced motion fallback | Motion | `<MotionConfig reducedMotion="user">` | Opacity only | P0 |

## Conclusion

The animation landscape for React has a clear leader. **Motion dominates** — it's the only library that combines declarative React integration, spring physics, gesture recognition, layout animations, shared element transitions, imperative sequencing, and built-in reduced-motion support in a single actively-maintained MIT-licensed package. Adding AutoAnimate for effortless list transitions and canvas-confetti for lazy-loaded celebrations covers every animation type in a couples habit tracker without bloating the bundle.

The most underappreciated finding: the **View Transitions API is production-ready** for your PWA target audience. At 89.5% global support with graceful degradation, it provides free page-level transitions with zero JavaScript. Use it for route navigation and save Motion for the rich in-page choreography.

The most important technical decision: build your animation config as a shared system from day one. Define your kawaii spring (`stiffness: 400, damping: 15`), your easing curve (`[0.34, 1.56, 0.64, 1]`), and your variant library centrally. Every component inherits from these defaults. When you want to tune the feel of the entire app — more bounce, less bounce, faster, slower — you change one file.

Skip React Spring (Motion has surpassed it), skip GSAP (unless you add scroll-triggered cinematics later), and skip tsParticles (canvas-confetti is 10x smaller). Cherry-pick individual components from Magic UI and Aceternity UI rather than installing them wholesale. And always, always animate only `transform` and `opacity` — the difference between 60fps and 15fps on a mid-range phone is exactly that discipline.
# Design system for a kawaii couple's habit tracker PWA

**This document is a complete, implementation-ready design system** for building a Sanrio-inspired, Finch-referenced Progressive Web App that two Gen Z engineers can hand to an AI coding assistant and get beautiful, non-generic results. Every hex code, font weight, animation timing, and component specification is chosen to explicitly reject the "AI slop" aesthetic — the purple-gradient, Inter-font, glassmorphic sameness that defines machine-generated UI in 2025–2026. The system draws from Japanese kawaii principles, Sanrio's character design philosophy, and Finch's emotional UX architecture to create something warm, personal, and impossible to mistake for a template.

The three pillars of this design system are **warmth** (every color has a yellow/orange undertone), **personality** (rounded, character-driven, hand-crafted feel), and **emotional intelligence** (the UI celebrates small wins, never punishes failure, and makes accountability feel like care rather than surveillance).

---

## 1. What "AI slop" actually looks like and how to kill it

The term "AI slop" describes the convergent aesthetic that emerges when LLMs generate frontends by reproducing the statistical median of their training data — thousands of Tailwind CSS tutorials, shadcn/ui examples, and SaaS landing pages. In August 2025, **Tailwind CSS creator Adam Wathan publicly apologized** for making `bg-indigo-500` (#6366F1) the default button color in Tailwind UI, inadvertently causing every AI-generated interface on earth to be indigo. The post received over 1 million views. Anthropic's own Claude Cookbook now explicitly warns developers: "You tend to converge toward generic, 'on distribution' outputs. In frontend design, this creates what users call the 'AI slop' aesthetic."

The problem is self-reinforcing. AI generates purple-gradient sites → those sites enter training data → newer models produce more purple-gradient sites. This is **model collapse** applied to aesthetics. The result is instantly recognizable: **Inter font, indigo buttons, centered hero section, three-box feature grid, glassmorphic cards, and timid gray palettes** that commit to nothing.

### The AI slop avoidance checklist

Every design decision in this app should be checked against these 18 anti-patterns. If you trigger three or more, redesign.

**Typography red flags (1–4):**
Inter as your only font (`font-family: 'Inter'` everywhere); the "Safe Five" stack (Inter, Roboto, Open Sans, Lato, Arial) for both headings and body; zero font contrast where headings and body use the same family at similar weights (400 vs 600); and moderate-everything sizing where font weight stays in the 400–600 range and size ratios are only 1.5×. Real design uses **extreme contrasts**: 200 vs 800 weights, 3×+ size jumps.

**Color red flags (5–10):**
`bg-indigo-500` (#6366F1) as primary action color; purple-to-blue gradient heroes (`#9333EA` → `#3B82F6`); timid, evenly-distributed palettes where five colors sit at identical saturation with no dominant hue; blue-to-teal "innovation" gradient (`#3B82F6` → `#06B6D4`); pure gray-on-white with the entire expression in the `#F8FAFC` to `#94A3B8` range; and orange accent on dark (`#F59E0B` on `#0F172A`), the "developer tool" color scheme.

**Layout and effects red flags (11–18):**
The SaaS Template™ (centered hero → three-box features → testimonials → pricing → footer); three equal-width cards with Lucide icons; everything centered with `text-center mx-auto max-w-2xl` on every section; default bento grid without content strategy; glassmorphism on everything (`backdrop-filter: blur(10px)` + `bg-white/10` on every surface); uniform `rounded-lg` on all elements; identical `shadow-sm` at 0.1 opacity everywhere; flat white or slate backgrounds with zero texture; and Corporate Memphis illustrations — the flat-vector, noodle-limbed, blue-skinned people invented by agency Buck for Facebook in 2017 and now universally mocked as "Humanist Blandcore."

**The golden rule:** AI avoids risk. It picks the median. To defeat AI slop, make **opinionated choices** — a dominant warm color, a distinctive display font, asymmetric layouts, hand-crafted illustrations, and animations with personality.

---

## 2. Kawaii design principles translated for a functional adult app

Kawaii design rests on five principles documented across Japanese design theory and Sanrio's 50-year portfolio: **roundness** (all forms simplified and curved — humans associate curves with safety), **pastel color** (30–60% saturation, high lightness), **character-driven elements** (even non-character objects get personality), **emotional resonance** (Oxford neuroscience shows cute stimuli "hijack our brain and make us more compassionate"), and **simplicity** (minimal detail, maximum communicative intent). The relevant sub-genre is **Pastel Kawaii** — the Rilakkuma/Sumikko Gurashi register that's "less about loud cuteness and more about a soft, comforting atmosphere."

Sanrio's design system reveals specific techniques worth adopting. Hello Kitty's missing mouth is intentional — she's an "emotional blank canvas" onto which users project their own feelings. Cinnamoroll's exaggerated floppy ears create an instantly recognizable silhouette. Gudetama, the depressed egg, proves kawaii characters don't need forced cheerfulness — authenticity about low-energy days resonated so deeply with Japan's burnt-out young workers that Gudetama became one of Sanrio's biggest earners. **This is directly relevant for an accountability app.** The mascot should acknowledge bad days honestly.

### Technical specifications for kawaii UI

Corner radii should be generous: **20–24px for cards/containers**, **16px for inputs**, **9999px (full pill) for buttons and small elements**. Line weights should be consistent at **2–3px** for character outlines. Body text should use rounded sans-serif fonts at slightly larger than standard sizing. Spacing should be 1.5–2× typical Material Design spacing — kawaii design breathes. Background pastel saturation should sit at **HSL 15–35% saturation, 85–95% lightness**. Character colors can push to 50–80% saturation. Never use pure black outlines; use dark versions of local colors (warm dark brown `#3D2C2E` instead of `#000000`).

### How Finch makes this work for adults

Finch is the primary reference because it has already solved the "cute but not childish" problem for a primarily adult audience of 80,000+ users. The design analysis reveals specific choices worth emulating.

**Finch's color system** uses a nature-inspired warm palette: primary green CTA buttons at approximately `#5DB075`, warm cream backgrounds at `#FFF8F0` (never pure white), warm dark brown text at `#3D3D3D` (never pure black), and orange accents at `#F5A623`. The cream-not-white decision alone eliminates 80% of the clinical coldness that makes self-care apps feel generic.

**Finch's emotional architecture** works because the bird character IS the UI. The birb occupies 30–40% of the home screen viewport. It has idle animations (preening, looking around), petting interactions (floating hearts, haptic feedback, chirping sounds), progressive personality development (discovering food preferences, activity likes), and visible growth through five life stages across 67 adventures. The character grows from baby to adult based on how well the user takes care of themselves.

**Finch's onboarding** is an 18-step emotional journey, not an account setup. Users select an egg color (six pastel options), watch it hatch, choose pronouns (she/her, he/him, they/them), name their bird, and select personality traits. The birb reacts to selections with animation. Questions about struggles feel like confiding in someone who cares. By the time users reach the soft paywall at step 11, emotional investment is already established. The naming ceremony alone creates the sense of ownership that drives retention.

**What Finch does right:** non-judgmental tone (no punishment for missed days, streak pause available), celebration of mundane achievements ("Get Out of Bed" gets the same confetti as complex tasks), progressive disclosure (day 1 is simple check-ins, month 3 is emotional regulation), and consistent warm visual identity. **What Finch could improve:** information overload on the Quests tab, inconsistent onboarding progress indicators, home screen competition between goals/status/adventure progress, and premium pricing tone that feels disconnected from the product's gentle personality.

---

## 3. Three complete color palettes with warm dark modes

Each palette below includes every semantic token needed for implementation. All palettes share a crucial anti-slop property: **every background and text color has a warm undertone**. No cool grays. No blue-tinted darks. No pure black or white.

### Palette 1 — "Strawberry Milk" 🍓

Inspired by My Melody's color world and Japanese strawberry milk packaging. Feels like sharing a warm drink at a cozy café — tender, sweet, genuinely romantic without being cloying. The pink is warm (salmon-leaning `#E8878F`), not the cold fuchsia that AI defaults to. Every color has a yellow/orange undertone.

| Role | Name | Light Mode | Dark Mode ("Midnight") |
|------|------|-----------|----------------------|
| Primary | Strawberry Cream | `#E8878F` | `#D4868E` |
| Secondary | Honey Peach | `#F2B8A2` | `#D9A892` |
| Accent | Terracotta Rose | `#C4706E` | `#C47878` |
| Background | Warm Cream | `#FFF8F3` | `#1E1618` |
| Surface/Card | Milk White | `#FFFFFF` | `#2C2224` |
| Text Primary | Cocoa Brown | `#3D2C2E` | `#F2E6E0` |
| Text Secondary | Dusty Mauve | `#7A5C5E` | `#A08888` |
| Error | Soft Strawberry | `#D4645A` | `#D06058` |
| Success | Sage Mint | `#7DB8A0` | `#7CC49A` |
| Warning | Honey Gold | `#E5A84B` | `#D9A040` |
| Border/Divider | Rose Mist | `#F0DDD8` | `#3D2E30` |
| Decorative 1 | Petal Pink | `#F7D1D1` | `#543838` |
| Decorative 2 | Biscuit Tan | `#F5DCC4` | `#4A3830` |
| Decorative 3 | Berry Jam | `#A85360` | `#8A3E48` |
| Chart (Partner A) | Blush | `#F0A0A0` | `#C48888` |
| Chart (Partner B) | Apricot | `#F2C4A0` | `#C4A080` |
| Chart (Shared) | Sage | `#A8CDB8` | `#80B098` |

### Palette 2 — "Matcha Latte" 🍵

Inspired by Cinnamoroll's cloud aesthetic reinterpreted through Japanese matcha café design. The mint is **warm-leaning** (yellow-green, not blue-green `#8BBF9F`) — a hue AI models almost never produce because they default to cold teal. Feels like a calm Sunday morning sharing matcha lattes.

| Role | Name | Light Mode | Dark Mode ("Evening") |
|------|------|-----------|---------------------|
| Primary | Matcha Green | `#8BBF9F` | `#82B096` |
| Secondary | Peach Coral | `#F2A896` | `#D09888` |
| Accent | Deep Jade | `#5A9E82` | `#5CA880` |
| Background | Rice Paper | `#FBF7F0` | `#181C18` |
| Surface/Card | Cloud White | `#FFFFFF` | `#242A24` |
| Text Primary | Forest Ink | `#2D3B30` | `#EDE8DF` |
| Text Secondary | Stone Gray | `#6B7C6E` | `#8A9888` |
| Error | Soft Coral | `#D4716A` | `#CC6860` |
| Success | Spring Green | `#6BAF82` | `#68B880` |
| Warning | Amber Honey | `#DFA24B` | `#CCA040` |
| Border/Divider | Mist Green | `#E2EDDF` | `#303830` |
| Decorative 1 | Mint Cream | `#C8E6D0` | `#2A4038` |
| Decorative 2 | Sakura Blush | `#F7D4CC` | `#4A3430` |
| Decorative 3 | Deep Matcha | `#4A7F62` | `#2A5040` |
| Chart (Partner A) | Soft Mint | `#A8D8B9` | `#88C4A0` |
| Chart (Partner B) | Salmon Pink | `#F2B0A0` | `#C49888` |
| Chart (Shared) | Latte Brown | `#C4A882` | `#A89068` |

### Palette 3 — "Honey Biscuit" 🍯

Inspired by Pompompurin's golden yellow and warm brown beret, adapted through a Japanese bakery aesthetic. The warmest palette — golden, toasty, deeply comforting. **Yellow/amber palettes are almost never AI-generated** (models default to blue/purple), making this the strongest anti-slop choice.

| Role | Name | Light Mode | Dark Mode ("Fireside") |
|------|------|-----------|----------------------|
| Primary | Honey Gold | `#E8B84B` | `#D0A040` |
| Secondary | Blush Rose | `#E8A8A0` | `#C49088` |
| Accent | Caramel | `#C4883A` | `#B8782E` |
| Background | Buttercream | `#FFF9EE` | `#1C1810` |
| Surface/Card | Cotton White | `#FFFFFE` | `#2A2418` |
| Text Primary | Espresso | `#3A2D20` | `#F0E8D8` |
| Text Secondary | Walnut | `#7A6B58` | `#9A8A70` |
| Error | Rosehip Red | `#C9605A` | `#C05850` |
| Success | Pistachio | `#7AAF6B` | `#78A868` |
| Warning | Tangerine Soft | `#D9923A` | `#C89030` |
| Border/Divider | Biscuit Cream | `#EEE4D0` | `#383020` |
| Decorative 1 | Lemon Chiffon | `#F5E6B8` | `#3A3018` |
| Decorative 2 | Peach Puff | `#F8D4C0` | `#483028` |
| Decorative 3 | Toffee | `#8F6830` | `#6A4820` |
| Chart (Partner A) | Sunshine | `#F0C870` | `#C8A858` |
| Chart (Partner B) | Dusty Rose | `#E8B0A8` | `#C09888` |
| Chart (Shared) | Sage Leaf | `#A0C490` | `#88A870` |

### Dark mode design philosophy

The critical principle for warm pastel dark mode: **use warm-tinted dark backgrounds, never neutral gray or blue-gray.** Strawberry Milk uses a dark cocoa (`#1E1618`), Matcha Latte uses deep moss (`#181C18`), and Honey Biscuit uses dark roast (`#1C1810`). Text should be warm off-white (`#F2E6E0`, `#EDE8DF`, `#F0E8D8`) rather than pure `#FFFFFF`. Surface colors should feel like dark chocolate, not slate. This approach maintains warmth and personality that cold dark modes destroy.

### Accessibility notes

All text-on-background combinations in every palette pass **WCAG AA (4.5:1)** for primary text and **3:1** for large text/secondary text. Pastel colors should never be used as text colors on light backgrounds — they inherently fail contrast. Use them for fills, decorations, and borders only. The Honey Biscuit palette requires extra care: yellow is the hardest color for accessibility, so always pair yellow elements with dark brown text and supplement yellow status indicators with icons. Provide a `prefers-contrast: more` media query that deepens all colors by 30% for high-contrast mode.

### CSS implementation pattern

```css
:root[data-theme="strawberry-milk"] {
  --color-primary: #E8878F;
  --color-secondary: #F2B8A2;
  --color-accent: #C4706E;
  --color-bg: #FFF8F3;
  --color-surface: #FFFFFF;
  --color-text-primary: #3D2C2E;
  --color-text-secondary: #7A5C5E;
  --color-error: #D4645A;
  --color-success: #7DB8A0;
  --color-warning: #E5A84B;
  --color-border: #F0DDD8;
}

:root[data-theme="strawberry-milk-dark"] {
  --color-primary: #D4868E;
  --color-bg: #1E1618;
  --color-surface: #2C2224;
  --color-text-primary: #F2E6E0;
  --color-text-secondary: #A08888;
  /* ... remaining tokens ... */
}
```

Each partner "owns" a chart color within the palette for differentiation in shared data views: Strawberry Milk assigns Blush (`#F0A0A0`) to Partner A and Apricot (`#F2C4A0`) to Partner B.

---

## 4. Three typography systems with Hindi/Devanagari support

### Fonts to permanently ban

**Inter** is the #1 AI default — 50%+ of AI-generated sites use it. **Roboto** is "the Toyota Camry of fonts." **DM Sans** became the 2023–2024 "AI startup" font. **Poppins**, despite having Devanagari support, is on every EdTech template. **Open Sans** says "I chose the first Google Font result." **Montserrat** was unique in 2016 and is now generic. Even Space Grotesk has been flagged as Claude's "second default convergence font." The Anthropic Cookbook explicitly bans Inter, Roboto, Open Sans, Lato, and all system fonts.

### System 1 — "Bubble Tea" (playful/bouncy) 🧋 — RECOMMENDED

**Heading: Baloo 2** (SemiBold 600 for H1, Medium 500 for H2–H3). Rounded, joyful, literally bouncy letterforms with thick friendly strokes. Created by Ek Type collective in Mumbai. **Native Devanagari** — designed simultaneously in 11 Indian scripts. Variable font (wght 400–800).

**Body: Nunito** (Regular 400, Medium 500 for emphasis). Excellent readability at 14–16px with rounded terminals that create warmth. Used by Duolingo. Variable font (wght 200–1000). Devanagari fallback: **Mukta** (Ek Type, 8 weights, similar visual weight).

**Accent: Comfortaa** (Bold 700 for streak numbers, Medium 500 for mascot speech). Geometric rounded with wide letterforms. Numbers look beautiful — perfect for streak counters. Variable font (wght 300–700).

This system is strongest for Devanagari because Baloo 2 provides native Hindi headings that match the Latin personality perfectly. All three fonts are variable, enabling delightful micro-animations. None appear on any "generic AI startup" font list.

```css
:root {
  --font-heading: 'Baloo 2', 'Mukta', cursive;
  --font-body: 'Nunito', 'Mukta', sans-serif;
  --font-accent: 'Comfortaa', 'Baloo 2', cursive;
}
```

### System 2 — "Matcha Latte" (refined/elegant but warm) 🍵

**Heading: Josefin Sans** (SemiBold 600). Geometric, 1920s-inspired with a distinctively **low x-height** (half of cap height) that makes it instantly recognizable as "not a default." Based on Rudolf Koch's Kabel. Variable font (wght 100–700). Devanagari fallback: **Hind** (Indian Type Foundry, 5 weights, designed for UI).

**Body: Quicksand** (Regular 400). Rounded terminals with geometric foundations. Good readability at 15–16px. Variable font (wght 300–700).

**Accent: Syne** (Bold 700 for celebrations, ExtraBold 800 for impact). Created for the Synesthésie art festival — each weight feels dramatically different. Variable font (wght 400–800).

### System 3 — "Love Letter" (handwritten/personal) 💌

**Heading: Shantell Sans** (Bold 700). The boldest choice in the system. A marker-style font with **five variable axes** including BNCE (bounce — letters literally bounce along the baseline) and INFM (informality — shifts from normalized to irregular handwriting). The BNCE axis is a once-in-a-generation feature for kawaii animation. Variable font with axes: wght, ital, BNCE, INFM, SPAC.

**Body: Lexend** (Regular 400). Designed from reading speed research with exceptional readability, including for people with dyslexia. Variable font (wght 100–900).

**Accent: Kalam** (Regular 400, Bold 700). True handwriting-style with **native Devanagari** — one of the only "true cursive" Devanagari designs available. Perfect for mascot speech bubbles, love notes between partners, and journal entries.

```css
/* Bouncing celebration text */
.celebration-heading {
  font-family: 'Shantell Sans', cursive;
  font-variation-settings: 'BNCE' 50, 'INFM' 50;
}
/* Calm daily headings */
.screen-heading {
  font-family: 'Shantell Sans', cursive;
  font-variation-settings: 'BNCE' 0, 'INFM' 0;
}
```

### Typographic scale (mobile-first, Major Third 1.250 ratio)

| Token | Size | Use |
|-------|------|-----|
| `--text-xs` | 0.75rem (12px) | Timestamps, fine print |
| `--text-sm` | 0.875rem (14px) | Captions, secondary info |
| `--text-base` | 1rem (16px) | Body text, buttons |
| `--text-md` | 1.125rem (18px) | Emphasized body |
| `--text-lg` | 1.25rem (20px) | H4, card subtitles |
| `--text-xl` | 1.563rem (25px) | H3, section headers |
| `--text-2xl` | 1.953rem (31px) | H2, screen subtitles |
| `--text-3xl` | 2.441rem (39px) | H1, screen titles |
| `--text-4xl` | 3.052rem (49px) | Streak numbers, hero display |

Line heights: **1.1** for display text, **1.25** for headings, **1.5** for body, **1.625** for captions. Letter spacing: **-0.025em** for display, **0** for body, **0.05em** for uppercase labels. Buttons must be minimum 16px to prevent iOS auto-zoom.

### Font loading for PWA performance

Self-host via `@fontsource-variable` packages (not Google Fonts CDN) for offline support. Preload only the two critical fonts (body + heading) in `<link rel="preload">`. Use `font-display: swap` with tuned fallbacks that match metrics (`size-adjust`, `ascent-override`, `descent-override`) to minimize Cumulative Layout Shift. Cache all font files in the service worker on install for instant offline access. Subset fonts with `pyftsubset` — Latin subset typically cuts file size by 60–70%. A single variable font file (40–80KB) replaces 5 static weights (150–250KB).

---

## 5. Animation system with Lottie and micro-interactions

### Lottie performance rules for PWAs

Keep JSON files **under 150KB** (ideally 50–100KB for above-the-fold). Always use **dotLottie format** (.lottie) which reduces files by **80–90%** via ZIP compression — a 291KB JSON becomes ~58KB. Export at **24–30fps** (never 60fps on mobile — it doubles file size with negligible perceptual benefit). Use the **canvas renderer** for performance-critical animations and SVG renderer for quality-critical ones. Lazy-load all non-visible animations with `IntersectionObserver`. Never bundle Lottie JSON into the JS bundle — load as external assets.

**When to use Lottie vs CSS:** If the animation involves 1–2 CSS properties (opacity, transform), use CSS with zero JS overhead. If it requires 3+ elements with coordinated motion, character animation, or confetti/particles, use Lottie. Page transitions should use CSS/Framer Motion. Character idle loops and celebrations should use Lottie.

The `@lottiefiles/dotlottie-react` package uses a **WebAssembly runtime** with lower CPU and memory usage than JS-based renderers. dotLottie also supports **runtime theming via Lottie Slots** — change colors to match the active palette without separate animation files.

### Specific animation timing for every app context

| Context | Duration | Easing | Pattern |
|---------|----------|--------|---------|
| Task completion | 600–800ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Check draws in 400ms, scales to 110%, settles to 100% over 200ms |
| Streak celebration (small) | 800ms | ease-out | Subtle sparkle burst |
| Streak celebration (milestone) | 1500–2000ms | physics-based | Burst at 0ms, particles spread to 800ms, fade to 2000ms |
| Mood check-in selection | 300–500ms | ease-out | Selected emoji bounces up 150ms, settles 200ms; idle breathing 2–3s loop at scale 1.0→1.03 |
| Sprint results reveal | 800–1200ms | ease-in-out | Progressive bar fill with bounce overshoot |
| Punishment/consequence reveal | 600–800ms | bouncy cubic-bezier | Playful wobble, NOT dramatic. Card slides in with gentle rotation, mascot makes a silly face |
| Page transitions | 200–400ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Outgoing fades 150ms, incoming starts at 100ms mark |
| Button press | 100–200ms | ease-out down, ease-in-out up | Scale to 0.95 over 100ms, return to 1.0 over 150ms |
| Character idle loop | 2000–4000ms | ease-in-out | Gentle 2–5px vertical bob, blink every 3–4s, 24fps, under 30KB dotLottie |
| Pull-to-refresh | 200–300ms trigger, 1000–1500ms loading | ease-in | Animation maps to pull distance (60–80px threshold) |
| Loading states | 1000–2000ms loop | linear or ease-in-out | Skeleton shimmer 1500–2000ms, minimum 800ms display |

### Making animations feel hand-crafted

Never use default LottieFiles "featured" animations verbatim. Customize speed (`animationSpeed: 0.7–0.8` — slightly slower than default feels more intentional), recolor via CSS class targeting or Lottie theming, and play segments rather than full animations. Apply a **consistent bouncy easing** across all animations: `cubic-bezier(0.34, 1.56, 0.64, 1)` is the kawaii standard — soft overshoot that mimics squishy physics. Keep a limited palette of 3–5 colors across all animations for cohesion. Commission a single artist for a consistent set rather than mixing styles from different creators.

### Free Lottie sources beyond overused defaults

**IconScout** has dedicated kawaii packs (436 kawaii face animations, 442 kawaii character animations). **Lordicon** offers 41,100+ animated icons with clean, friendly style and React integration. **Creattie** provides curated, high-quality free Lottie illustrations. **UseAnimations** (`react-useanimations`) gives lightweight animated micro-interaction icons. On LottieFiles, follow creators **cutelittlefox** (character animations) and **Blessing Studio07** (friendly UI animations). **Lottielab** is a browser-based creation tool for custom kawaii animations without After Effects.

### Hugeicons implementation

Hugeicons offers **46,000+ icons** across 59 categories on a 24×24px pixel-perfect grid. The free tier includes 4,600 icons in **Stroke Rounded** style only — which is the best fit for kawaii aesthetics with its soft, friendly curves and consistent 1.5px stroke. Pro unlocks Bulk Rounded (chunky, playful depth) and Twotone/Duotone Rounded (multicolor pastel support).

The old `hugeicons-react` package is **deprecated**. Use the new scoped packages:

```jsx
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon } from '@hugeicons/core-free-icons';

<HugeiconsIcon icon={Home01Icon} size={24} color="currentColor" strokeWidth={1.5} />
```

Each icon is ~0.75KB via named import with automatic tree-shaking. Sizing: **24px for navigation**, **20–22px in-content**, **32–48px for feature icons**. Always wrap in 44×44px minimum touch targets. Reduce `strokeWidth` to 1.0 for sizes above 32px; increase to 2.0 for sizes below 16px.

---

## 6. Component patterns with specific kawaii CSS values

### Buttons that feel squishy

The key technique is a bottom "ledge" shadow that disappears on press while `translateY` moves the button downward and `scale` compresses it. Combined with the bouncy `cubic-bezier(0.34, 1.56, 0.64, 1)` easing on release, this creates a tactile, "squishy" feel.

```css
.btn-primary {
  border-radius: 9999px;
  padding: 14px 28px;
  background: var(--color-primary);
  box-shadow: 0 4px 0 var(--color-accent), 0 6px 12px rgba(0,0,0,0.1);
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: translateY(0);
}
.btn-primary:active {
  transform: translateY(4px) scale(0.95);
  box-shadow: 0 1px 0 var(--color-accent), 0 2px 4px rgba(0,0,0,0.05);
  transition: all 100ms ease-out;
}
```

Secondary buttons use the same pill shape with a pastel fill and colored border. Ghost buttons use dashed borders that solidify on hover. All button text minimum 16px, weight 600–700.

### Cards with personality

Cards use **20px border-radius**, **2px colored borders** (cycling through palette decorative colors), and **warm-tinted shadows** (`rgba(primary, 0.08)` not `rgba(0,0,0,0.1)`). Kawaii touches include decorative `::before` pseudo-elements with small SVG blobs/stars/hearts at card corners, and for habit cards specifically, two CSS dots and a smile arc on the icon area to create a minimal kawaii face. Hover state lifts the card 4px with a bouncy transition. Padding is generous at 20px.

### Inputs with friendly focus states

```css
.kawaii-input {
  border-radius: 16px;
  padding: 14px 18px;
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
.kawaii-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.15);
}
.kawaii-input.error {
  animation: headShake 400ms ease; /* 4px lateral oscillation */
}
```

Floating labels transition from inside the input to above it at 12px font size on focus, with the primary color. Validation errors use a gentle head-shake animation (4px lateral oscillation over 400ms), never harsh red borders alone.

### Bottom sheets and modals

Bottom sheets use **24px top corner radius**, a warm-tinted overlay (`rgba(74, 55, 40, 0.3)` not `rgba(0,0,0,0.5)`), and iOS-like spring animation at `400ms cubic-bezier(0.32, 0.72, 0, 1)`. Center modals animate in with `400ms cubic-bezier(0.34, 1.56, 0.64, 1)` bounce-scale from 0.8→1.0. Include a small mascot illustration peeking over the modal top edge via absolute positioning at `top: -40px`.

### Navigation bar

The bottom tab bar uses a frosted background (`rgba(surface, 0.92)` + `backdrop-filter: blur(12px)`), 64px height plus safe area inset, and 24px Hugeicons in Stroke Rounded style. Active tabs get a subtle background pill (`rgba(primary, 0.1)`), icon scale bump to 1.1, and primary color. A center FAB (56px circle, primary gradient, -28px margin-top) handles the primary "add habit" action.

### Data visualization that doesn't feel corporate

Bar charts use **8px top border-radius** with gradient fills and `600ms cubic-bezier(0.34, 1.56, 0.64, 1)` height transitions. Minimum bar width 28px. Add sparkle emoji (`✨`) above completed bars. Line charts use **spline smoothing** (`tension: 0.4` in Chart.js/Recharts), 3px stroke with rounded caps, and a gradient area fill fading to transparent. Data points are 5px circles with white 3px borders. The weekly habit grid uses a contribution-graph style with 32×32px cells at 8px border-radius, where completed cells bloom in with the bouncy easing and show a small star.

### Empty states that create delight

When there are no habits yet: a **sleeping mascot** with gentle floating animation (`3s ease-in-out infinite`, 8px vertical bob) plus "Time to start your journey! 🌱" in the heading font. When all habits are done: a **celebrating mascot** with confetti Lottie plus "You're amazing! All done for today! 🎉" (inspired by Todoist's #TodoistZero pattern). Centered layout, 48px top padding, max-width 260px for text, with a primary CTA button below.

### Global design token reference

| Token | Value |
|-------|-------|
| Border radius (buttons) | `9999px` (pill) |
| Border radius (cards) | `20px` |
| Border radius (inputs) | `16px` |
| Border radius (modals) | `24px` |
| Border radius (small elements) | `8px–12px` |
| Shadow (elevated) | `0 8px 32px rgba(primary, 0.08)` |
| Shadow (pressed) | `0 1px 2px rgba(0,0,0,0.1)` |
| Transition (interactive) | `200ms cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Transition (layout) | `300ms cubic-bezier(0.32, 0.72, 0, 1)` |
| Animation (enter) | `400ms cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Animation (exit) | `300ms cubic-bezier(0.5, 0, 0.75, 0)` |
| Animation (idle/float) | `3s ease-in-out infinite` |
| Tab bar height | `64px + safe-area-inset-bottom` |
| Minimum touch target | `44×44px` |
| Content padding | `20px` |
| Card padding | `20px` |

---

## 7. Mascot and character design direction

### One shared creature, not two separate characters

Research strongly supports including a visual mascot — brands with mascots see **37% higher recall rate**, and mascot-driven onboarding reduces drop-off by **25%**. For a couple's app specifically, the recommendation is **one shared mascot that both partners care for together**. Two separate mascots risk creating competition rather than cooperation and uncomfortable comparisons ("your character looks healthier than mine"). A single shared creature reinforces the "we're in this together" narrative. Both partners' completed habits contribute to the creature's energy and growth. Joint achievements unlock shared cosmetic rewards.

### Character design specifications

The species should be unique — not a cat (too Hello Kitty), not a bird (too Finch), not an owl (too Duolingo). Consider a **small cloud creature, a mochi, or a custom fantasy animal** with one exaggerated distinctive trait (oversized floppy ears, a curl antenna, a tiny scarf). Head-to-body ratio: **2.5:1 to 3:1**. Eyes: simple dots placed in the lower 40% of the head. Mouth: minimal or absent (applying Hello Kitty's emotional blank canvas principle — users project their own feelings). Maximum **5–6 colors** per character with exact hex codes defined. Line weight: consistent 2.5–3px. The character should be recognizable from silhouette alone.

### Expression states (critical: never punish)

Following Finch's key design decision, **nothing bad happens when users miss tasks.** The mascot should never look genuinely sad or disappointed because of inactivity. Instead:

- **Idle/Neutral**: Gentle blink, slight sway, breathing. Content and peaceful.
- **Happy/Celebrating**: Confetti, sparkles, bouncing. When either partner completes a task.
- **Encouraging**: Bright eyes, leaning forward. "Whenever you're ready!" When tasks are pending.
- **Sleepy/Cozy**: Yawning, curled up with blanket. During low-activity periods — cute, not guilt-inducing.
- **Excited/Milestone**: Jumping, spinning, stars. For streak milestones and joint achievements.
- **Partner sync celebration**: Special animation when both partners complete tasks on the same day.

### Emotional attachment mechanics for couples

The onboarding should include a **joint hatching ceremony** where both partners are present for the mascot's first appearance. Both partners choose the name together (a fun first shared interaction). Growth is tied to combined effort — the mascot evolves through visible life stages based on the couple's collective habits, not individually. The mascot develops preferences based on the couple's patterns over weeks (becoming a "morning creature" if they consistently do morning habits). It stores **milestone memories** ("Remember that 30-day streak in January?") and celebrates the anniversary of how long the couple has been using the app together. Collectible outfits and accessories earned through joint consistency provide long-term engagement. The mascot occasionally prompts partners to encourage each other: "Hey, [partner name] had a tough day. Send them a boost?"

### UI integration points

The mascot appears at **48–80px** in navigation contexts and up to **200px** for celebrations and empty states. On the home screen, it sits in a designated area (not floating over content) reflecting the couple's combined status. It replaces the loading spinner. It accompanies push notifications as an avatar. It guides both partners through onboarding. In error states, it appears with a gentle, reassuring expression — never alarmed.

---

## Conclusion: building something that feels made by humans who care

This design system is optimized for a specific workflow: two engineers vibe-coding with AI assistants. Every specification — from `#FFF8F3` warm cream backgrounds to `cubic-bezier(0.34, 1.56, 0.64, 1)` bouncy easing to Baloo 2 variable font at weight 600 — is precise enough to paste directly into a prompt and get correct results. The three palettes (Strawberry Milk, Matcha Latte, Honey Biscuit) each tell a distinct emotional story while sharing the warm-undertone DNA that makes them impossible to confuse with AI-generated defaults.

**The strongest combination for a first implementation** is the Strawberry Milk palette with the Bubble Tea typography system (Baloo 2 + Nunito + Comfortaa). This pairing provides native Devanagari support through Baloo 2, the warmest emotional register through the pink-peach-sage color world, variable font animation potential for kawaii micro-interactions, and the closest alignment with Finch's proven approach of warm, nature-inspired pastels. The Matcha Latte and Honey Biscuit palettes can serve as couple-selectable themes for personalization.

Three design decisions will make or break the app's emotional quality. First, **cream backgrounds instead of white** — this single change eliminates the clinical coldness of every default template. Second, **a mascot that never punishes** — Finch proved that gentle encouragement outperforms guilt for sustained behavior change. Third, **hand-crafted animation timing** — the difference between a generic app and a beloved one often comes down to whether the confetti burst uses `ease-out` (mechanical) or `cubic-bezier(0.34, 1.56, 0.64, 1)` (alive). The details are the design.
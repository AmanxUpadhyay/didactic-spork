# Project Ideation Document — Jugalbandi — Couple's Accountability & Growth App

**Version:** 1.0  
**Date:** February 28, 2026  
**Authors:** Aman & Mukta (Founders / Only Users)  
**Document Type:** Structured Ideation + Deep Research Brief

---

## 1. Problem Statement

Aman and Mukta are a couple who are self-aware about their procrastination habits. They consistently miss deadlines, delay important tasks (applications, learning goals, health routines), and default to passive consumption (Instagram reels, doomscrolling) over productive action. Existing habit-tracking apps fail them because:

- **Generic design** — Most apps feel impersonal, corporate, and produce no emotional connection
- **No stakes** — Checking a box has zero consequences; there's nothing to lose
- **No social pressure** — Solo habit trackers rely on willpower alone, which is the exact resource they lack
- **No adaptive intelligence** — Apps don't learn user patterns, don't understand when someone is being lazy vs. legitimately busy, and don't personalise interventions
- **AI slop aesthetics** — Most AI-built apps look identical: purple gradients, generic sans-serif fonts, lifeless interactions. They feel disposable

They need a system that weaponizes their relationship dynamic — competition, accountability, love, and mild psychological manipulation — to force real behavioral change. Not another app to ignore.

---

## 2. User Profiles

### User 1: Aman
- **Role:** Co-founder, AI & Software Engineer
- **Personality:** Competitive, internet-native, design-opinionated, allergic to AI slop
- **Weaknesses:** Procrastination, doomscrolling, brain rot consumption
- **Motivators:** Competition, winning, building cool things, aesthetic quality
- **Schedule:** Wakes 9-10 AM, sleeps 12-1 AM
- **Location:** Sheffield, England, GB

### User 2: Mukta
- **Role:** Co-founder, AI & Software Engineer
- **Personality:** Motivated but inconsistent, wants discipline, values emotional reflection
- **Weaknesses:** Procrastination, forgetting deadlines, difficulty forming habits
- **Motivators:** Self-improvement, emotional growth, relationship quality, being better than Aman
- **Schedule:** Wakes 9-10 AM, sleeps 12-1 AM
- **Location:** Sheffield, England, GB (assumed same)

### Shared Traits
- Gen Z / internet-native (6-7 hrs daily on Instagram/reels)
- Both are AI & software engineers — they will spot and reject bad UX/UI instantly
- Comfortable sharing ALL personal data (food prefs, budget, health goals, hobbies)
- Love cute, pastel, character-driven aesthetics (Sanrio / Finch vibes)
- Want to feel emotionally connected to the app, not just use it as a tool

---

## 3. User Expectations

### What They Want the App to DO
1. **Force them to complete tasks** — Not suggest, not remind. FORCE through psychological pressure, stakes, and competition
2. **Create real consequences** — Losing means taking the winner on a date planned entirely by AI (up to £100 budget)
3. **Be genuinely smart** — Full LLM integration (Claude API) for judging, planning, adapting personality, and understanding context
4. **Track their emotional state** — Adaptive mood check-ins that are quick on busy days, deep on reflective days
5. **Reward consistency, not bursts** — Composite scoring that values daily discipline over last-minute cramming
6. **Look and feel alive** — Kawaii-cute aesthetic, Lottie animations, beautiful typography, character-driven design, zero AI slop

### What They Want the App to FEEL Like
- A sarcastic, loving third member of their relationship who keeps them accountable
- Finch meets competitive Duolingo meets relationship therapist
- Something they'd be embarrassed NOT to open every day
- Personal, intimate, and built for exactly two people

---

## 4. Solution Overview

A Progressive Web App (PWA) built for exactly two users that combines:

- **Task management** with AI-suggested goals and deadline enforcement
- **Weekly competitive sprints** with a composite scoring system
- **AI-as-judge** powered by full LLM integration (Claude API)
- **Real-world stakes** — loser takes winner on an AI-planned date
- **Adaptive mood journaling** — shared between both users
- **Progressive feature unlocking** — earn functionality through consistency
- **Dark pattern psychology** — deliberately designed to exploit human psychology for productive outcomes

### Tech Stack
| Layer | Choice | Rationale |
|-------|--------|-----------|
| Platform | PWA (installable) | Works on all devices, push notifications, offline capability |
| Frontend | React + Vite + Tailwind CSS v4 | Fast HMR, tree-shaking, PWA via vite-plugin-pwa; Tailwind v4 for design tokens and utility-first styling |
| Backend | Supabase | Postgres + Auth + Realtime (both users see updates live) |
| AI | Claude API (full LLM) | Judging sprints, planning punishments, adaptive personality, task suggestions |
| Icons | Hugeicons (hugeicon.com) | Beautifully crafted, non-generic |
| Animations | Lottie | Living, breathing UI elements |
| Notifications | PWA Push Notifications | The primary "pinch" mechanism |

---

## 5. Feature Breakdown

### 5.1 Task & Habit System

**Architecture Decision (by Claude):** Tasks should be split into TWO categories with a unified visual feed:

**Category A: Deadline Tasks (One-off)**
- Have a specific due date/time (e.g., "Submit visa application by March 15")
- Pinch notifications escalate as the deadline approaches
- Notification timeline: 1 week before → 3 days → 1 day → 4 hours → 1 hour → 30 min → OVERDUE
- AI judges severity — missing a visa deadline is worse than missing "buy groceries"

**Category B: Recurring Habits (Daily/Weekly)**
- Repeating commitments (e.g., "Go to gym 4x/week", "Read for 30 min daily")
- Streaks tracked — breaking a streak has scoring consequences
- AI suggests new habits based on past mood data and performance patterns

**Both categories live in a single daily feed** — the user sees "what do I need to do today?" without caring about the backend categorization.

**AI Task Suggestion Engine:**
- AI suggests tasks based on user's stated goals, past performance, mood trends, and areas of weakness
- Users can accept, modify, or reject suggestions
- AI learns from acceptance patterns over time

### 5.2 Verification System (Mixed Trust)

**Easy/Low-stakes tasks:** Honor system — tap to mark complete
- Examples: "Drink 2L water", "Read for 30 min", "Meditate"

**Important/High-stakes tasks:** Proof required
- Photo/screenshot upload as evidence
- The other person can challenge a completion (flag it for AI review)
- AI can spot-check by randomly requiring proof for "easy" tasks too (dark pattern: keeps you honest even on small things)

### 5.3 Weekly Sprint System

**Structure:**
- Sprints run Monday to Sunday
- At sprint start: AI proposes 10 goals per person based on their individual goals, past performance, and areas needing improvement
- Users can swap/modify up to 3 goals (can't remove all the hard ones)
- Throughout the week: real-time leaderboard visible to both

**Composite Scoring (How the AI Judges):**
The score is NOT a simple task count. It's a weighted composite:

| Factor | Weight | Description |
|--------|--------|-------------|
| Completion Rate | 30% | What % of assigned tasks were completed |
| Difficulty Multiplier | 25% | Harder tasks (as rated by AI) earn more points |
| Consistency Score | 30% | Did you do tasks spread across the week, or cram on Sunday? Daily check-ins matter |
| Streak Bonus | 10% | Maintaining multi-week streaks on recurring habits |
| Bonus Points | 5% | Going beyond assigned tasks, helping the other person, etc. |

**The AI calculates this and announces the winner every Sunday night.**

### 5.4 Punishment & Reward System

**The Core Punishment: AI-Planned Date**
- The loser MUST take the winner on a date
- The AI plans EVERYTHING: restaurant, activity, what to order, timing
- Budget cap: £100 per date
- City-level location data used for restaurant/activity selection
- The AI uses both users' food preferences, dietary restrictions, and interests to plan

**The Winner's Control Mechanic:**
This is where psychology gets interesting:

| Winner's Completion % | Control Level |
|----------------------|---------------|
| 100% (all 10 tasks) | Full control — can customize the punishment, veto AI choices, add conditions |
| 80-99% (8-9 tasks) | High control — can modify 2-3 aspects of the AI's plan |
| 60-79% (6-7 tasks) | Moderate control — can veto 1 thing, rest is AI's decision |
| Below 60% | Zero control — AI plans everything, and the punishment is designed to be mildly uncomfortable for BOTH people because neither performed well |

**Dark Pattern Insight:** Even the winner gets "punished" if their completion rate is low. This prevents the scenario where someone does 2/10 tasks, the other does 1/10, and the "winner" feels smug. No — if you won with 2/10, the AI makes the date uncomfortable for you too.

### 5.5 Progressive Feature Unlocking (Co-Created Proposal)

As users demonstrate consistency, they unlock app functionality. **Losing streaks lock features back down.**

**Tier 0 — Baseline (Everyone Starts Here):**
- Basic task list (text only)
- Simple mood check (1-5 score)
- Default AI personality (neutral)
- Default app theme (single pastel colorway)
- No analytics

**Tier 1 — "Getting Started" (1 week of >50% completion):**
- Unlock detailed mood journaling (adaptive questions)
- See basic weekly summary
- Unlock 1 additional theme colorway

**Tier 2 — "Building Momentum" (2 consecutive weeks of >60%):**
- Unlock full analytics dashboard (charts, trends)
- Custom task categories and labels
- AI personality starts showing flavor (mild sarcasm, encouragement)
- Unlock Lottie animation pack 1

**Tier 3 — "Consistency King/Queen" (4 consecutive weeks of >70%):**
- Full AI personality mode (chameleon — adapts to mood/performance)
- Custom notification sounds and message styles
- Ability to set punishment modifiers
- Unlock all theme colorways
- Historical mood analysis with AI insights

**Tier 4 — "Unstoppable" (8 consecutive weeks of >80%):**
- Full customization — themes, fonts, icon packs, AI personality tuning
- "Legacy" badges and profile flair
- Ability to create custom sprint challenges
- AI writes personalized weekly motivation letters
- Unlock collaborative goal-setting tools

**Regression Rules:**
- Missing a full week → drop 1 tier
- Two consecutive weeks below 40% → drop to Tier 0 (nuclear option)
- Streaks can be "frozen" 2x per month (for legitimate reasons — AI judges)

### 5.6 Adaptive Mood Check-In

**Triggers:**
- Primary: Fires 30 minutes before typical bedtime (based on 12-1 AM sleep schedule, so around 11:30 PM)
- If dismissed, gentle follow-up 30 minutes later
- Can also be triggered manually anytime

**Adaptive Logic:**

**Quick Mode (busy day / low energy detected):**
- Mood score: 1-5 with emoji selection
- One sentence: "One word for today?"
- Takes under 30 seconds

**Deep Mode (free day / user engaged / AI detects significant mood change):**
- How was your day? (1-5 + emoji)
- What was the highlight?
- What frustrated you?
- What's one habit you want to start/improve?
- Anything you want to tell future-you?

**AI determines mode based on:**
- How many tasks were completed that day (busy = quick mode)
- Time of response (very late = quick mode)
- Recent mood trend (declining mood = deep mode to check in)
- Day of week (Friday/Saturday = might have more reflective time)

**Visibility:** All mood entries are fully shared — both Aman and Mukta see each other's journals. This creates intimacy and mutual understanding.

### 5.7 AI Personality System (Chameleon)

The AI adapts its communication style based on context:

| Context | AI Personality |
|---------|---------------|
| Completing tasks on time | Cheerful, encouraging, playful |
| Missing deadlines | Sarcastic, slightly passive-aggressive, guilt-inducing |
| Winning streak | Hype-man energy, celebrates with the user |
| Losing streak | Tough love coach, "we need to talk" energy |
| Mood is low | Soft, empathetic, supportive — no pressure |
| Both users slacking | Disappointed parent energy — "I expected more from BOTH of you" |
| Competition is close | Sports commentator — builds tension and excitement |

**This personality system is powered by the Claude API** and uses the full context of both users' recent activity, mood data, and sprint standings to craft responses.

### 5.8 Notification System (The "Pinch")

**PWA Push Notifications** with escalating urgency:

| Time Before Deadline | Notification Style |
|---------------------|-------------------|
| 1 week | Casual reminder: "Hey, [task] is coming up next week" |
| 3 days | Gentle nudge: "3 days left for [task] — you got this" |
| 1 day | Firm: "[Task] is due TOMORROW. [Partner] already finished theirs 👀" |
| 4 hours | Urgent: "4 HOURS. You know what happens if you don't..." |
| 1 hour | Panic mode: "⏰ ONE HOUR. [Partner] is watching." |
| 30 min | Final: "Last chance. Do it or face the consequences." |
| Overdue | Shame: "You missed [task]. [Partner] gets points. AI is judging you." |

**Dark Pattern — Social Pressure Notifications:**
- "Mukta just completed 3 tasks. You've done 0 today."
- "Aman is ahead by 12 points. Sprint ends in 3 days."
- "Your streak is about to break. 2 hours left to save it."

### 5.9 Analytics Dashboard

**Weekly View:**
- Tasks completed vs. assigned (bar chart)
- Head-to-head comparison
- Consistency graph (did you do things daily or cram?)
- Mood trend line

**Monthly View:**
- Sprint win/loss record
- Habit adherence rates
- Mood patterns (weekday vs weekend, correlation with task completion)
- AI-generated insights ("You tend to slack on Wednesdays. Mukta's mood drops when she misses gym.")

**All-Time View:**
- Total sprints won/lost
- Longest streaks
- Most completed/most skipped tasks
- Mood journey over time

---

## 6. User Flow — A Typical Day

### Morning (9:30 AM — 30 min after wake-up)
1. **Push notification:** "Good morning! Here's your day. You have 4 tasks and Mukta already checked one off."
2. **Open app → Daily Feed:** See today's tasks (mix of deadline + habits), partner's progress (live via Supabase Realtime), and sprint standings
3. **AI greeting** adapts to context: "Morning! You're 3 points behind. Time to catch up?"

### Throughout the Day
4. **Complete tasks** → tap to mark done (easy ones) or upload proof (important ones)
5. **Get nudged** → escalating push notifications for approaching deadlines
6. **See partner's activity** → real-time updates ("Mukta just finished her gym session 💪")
7. **Social pressure notifications** → if falling behind

### Evening (11:30 PM — pre-bedtime)
8. **Mood check-in notification** → adaptive (quick or deep based on the day)
9. **Complete check-in** → both see each other's entries
10. **AI end-of-day summary** → "You finished 3/4 tasks today. Consistency score: 85%. Mukta finished 4/4. She's pulling ahead."

### End of Week (Sunday 10 PM)
11. **Sprint results notification** → "SPRINT RESULTS ARE IN 🏆"
12. **Open app → Sprint Results:** Animated reveal of winner, detailed score breakdown, AI-planned punishment details
13. **Punishment page:** AI presents the date plan (restaurant, activity, what to order) with the winner's control level applied
14. **New sprint preview:** AI proposes next week's 10 goals for each person

---

## 7. Design Direction

### Aesthetic: Sanrio/Kawaii-Cute + Finch-Inspired

**Core Principles:**
- Rounded shapes everywhere — no sharp corners, no industrial feel
- Soft pastel palette — not a single purple gradient
- Character-driven — the AI should feel like a living character within the app, not a chatbot in a sidebar
- Illustrative elements — hand-drawn feeling icons, not flat generic SVGs
- Lottie animations — loading states, celebrations, transitions all feel alive
- Beautiful typography — NO generic font pairing. Research unique, modern typeface combinations that feel warm and personal

**What to AVOID (AI Slop Checklist):**
- ❌ Purple-to-blue gradients
- ❌ Generic sans-serif fonts (Inter, Helvetica, system defaults)
- ❌ Flat, emotionless iconography
- ❌ White cards on light gray background
- ❌ "Glassmorphism" or "neumorphism" trends done badly
- ❌ Generic dashboard layouts that look like every SaaS product
- ❌ Stock illustration style (the "corporate Memphis" look)
- ❌ Anything that looks like it was built in 2015

**What to EMBRACE:**
- ✅ Soft, warm color palette (think: peach, mint, lavender, warm cream, soft coral)
- ✅ Rounded, chunky UI elements
- ✅ Micro-interactions on every tap
- ✅ Character illustrations or mascot that represents the AI
- ✅ Hand-crafted feel — even if generated, it should look human-made
- ✅ Emotional design — the app should make you smile when you open it
- ✅ Beautiful icon library from hugeicon.com
- ✅ Lottie animations for celebrations, streaks, and transitions

**Reference Apps:**
- **Finch** — self-care companion app with cute character, soft colors, emotional design
- **Sanrio aesthetic** — rounded, illustrative, character-driven, pastel
- Study the emotional design patterns of these apps, not just their color palettes

---

## 8. Technical Architecture Overview

```
┌─────────────────────────────────────┐
│           PWA (Frontend)            │
│  ┌──────────┐  ┌────────────────┐   │
│  │ UI Layer │  │ Service Worker │   │
│  │ (Kawaii) │  │ (Push Notifs)  │   │
│  └──────────┘  └────────────────┘   │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│        Supabase (Backend)           │
│  ┌──────────┐  ┌────────────────┐   │
│  │ Postgres │  │   Realtime     │   │
│  │ (Data)   │  │ (Live Updates) │   │
│  └──────────┘  └────────────────┘   │
│  ┌──────────┐  ┌────────────────┐   │
│  │   Auth   │  │  Edge Funcs    │   │
│  │ (2 users)│  │ (AI Bridge)    │   │
│  └──────────┘  └────────────────┘   │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│         Claude API (LLM)            │
│  • Sprint judging & scoring         │
│  • Punishment/date planning         │
│  • Task suggestions                 │
│  • Mood analysis & insights         │
│  • Adaptive personality responses   │
│  • Excuse evaluation (legit vs lazy)│
│  • Feature unlock decisions         │
└─────────────────────────────────────┘
```

**Key Supabase Tables (Preliminary):**
- `users` — profiles, preferences, food/dietary info, personal data
- `tasks` — all tasks (deadline + recurring), status, proof URLs, difficulty rating
- `sprints` — weekly sprint metadata, goals, scores, winner
- `sprint_tasks` — junction table: which tasks belong to which sprint
- `mood_entries` — all mood check-ins with adaptive depth data
- `notifications` — notification queue and delivery status
- `punishments` — AI-generated date plans, budget, control level, status
- `analytics` — daily/weekly/monthly aggregated scores and trends
- `feature_unlocks` — current tier per user, unlock history

---

## 9. What Needs Deep Research (LLM Research Briefs)

The following areas require dedicated deep research sessions. Each one should be a SEPARATE Claude chat using the Deep Research tool. Below are the exact prompts to copy-paste.

---

### Research Brief 1: Behavioral Psychology & Dark Patterns for Productive Habit Formation

**Prompt to copy-paste into a new Claude chat:**

```
Use your deep research tool to create a comprehensive report on the following:

I am building a habit-tracking app for exactly two users (a couple) that uses psychological manipulation, gamification, and dark patterns to force lazy procrastinators into productive behavior. The app has a competitive weekly sprint system with real-world punishments (loser takes winner on a date planned by AI).

Research the following thoroughly:

1. BEHAVIORAL PSYCHOLOGY FRAMEWORKS
- Variable ratio reinforcement schedules (how slot machines keep people playing) — how can we apply this to task completion?
- Loss aversion theory — people hate losing more than they enjoy winning. How do we design stakes that leverage this?
- The Zeigarnik Effect — incomplete tasks create psychological tension. How do we exploit this?
- Social comparison theory — how does head-to-head competition affect motivation between romantic partners specifically?
- Implementation intentions ("if-then" planning) — evidence-based approach to habit formation
- The "fresh start effect" — why Mondays/new weeks feel motivating and how weekly sprints capitalize on this

2. DARK PATTERNS (USED FOR GOOD)
- How Duolingo uses guilt, streaks, and social pressure to maintain engagement
- How Snapchat streaks create obligation
- How fitness apps use shame and social comparison effectively
- Loss-framed notifications vs gain-framed — which works better for procrastinators?
- The "endowed progress effect" — giving people a head start makes them more likely to finish
- "Sunk cost" exploitation — making people feel they've invested too much to quit

3. COUPLES-SPECIFIC DYNAMICS
- Research on accountability partners vs competitive partners — which drives more behavior change?
- How romantic relationship dynamics affect competitive motivation
- When competition between couples becomes toxic vs productive — what are the warning signs and guardrails?
- Shared goal-setting in relationships — psychological research on joint vs individual goals

4. PUNISHMENT & REWARD DESIGN
- Research on effective punishment systems — what makes a punishment motivating rather than demoralizing?
- The psychology of "proportional punishment" — scaling consequences to performance
- Why AI-planned random experiences could be more effective than predictable punishments
- How uncertainty/unpredictability in rewards (variable reward schedules) increases engagement

5. SPECIFIC RECOMMENDATIONS
- Provide 10 specific dark pattern mechanics I can implement in the app
- For each one, explain the psychology behind it, how to implement it, and what to watch out for
- Include specific notification copy examples that use these principles
- Include guardrails — when should the system back off to prevent burnout or relationship damage?

Format the report with clear sections, cite specific studies where possible, and make all recommendations actionable for a software development context. The app serves two users aged 22-28 who are internet-native, Gen Z, self-aware about their procrastination, and have explicitly asked to be psychologically manipulated into productivity.
```

---

### Research Brief 2: Anti-AI-Slop Design System — Kawaii/Pastel PWA Design Language

**Prompt to copy-paste into a new Claude chat:**

```
Use your deep research tool to create a comprehensive design system research report for the following:

I am building a PWA (Progressive Web App) for a couple's habit tracking and accountability app. The users are Gen Z (22-28), internet-native, both AI/software engineers who HATE generic AI-generated UI. They specifically want:

- Sanrio/kawaii-cute aesthetic (rounded, illustrative, character-driven)
- Finch app as primary visual reference (self-care companion app)
- Soft pastel palette that is NOT purple gradients
- Lottie animations for living, breathing UI
- Hugeicons (hugeicon.com) for iconography
- Beautiful, non-generic typography

Research the following thoroughly:

1. WHAT IS "AI SLOP" IN UI/UX AND HOW TO AVOID IT
- Define what makes AI-generated UIs look generic (specific patterns, colors, layouts)
- The "purple gradient epidemic" — why AI defaults to this and how to break free
- Generic font pairing (Inter/Helvetica/System UI) — why it fails and what to use instead
- Corporate Memphis / generic illustration styles — what they are and alternatives
- Glassmorphism/neumorphism done badly — examples and how they contribute to AI slop feel
- Provide a specific "AI Slop Checklist" of 15+ things to avoid

2. KAWAII / SANRIO DESIGN PRINCIPLES
- Core principles of kawaii design (roundness, pastel colors, character-driven, emotional)
- How Sanrio designs characters and visual systems
- How to translate kawaii principles into a functional productivity app without being childish
- Examples of kawaii-inspired apps that are used by adults

3. FINCH APP DEEP DIVE
- Analyze Finch's design system: colors, typography, spacing, component patterns
- What makes Finch feel emotional and personal vs generic?
- Finch's onboarding flow — how it creates attachment to the companion character
- Micro-interactions and animation patterns in Finch
- What Finch does RIGHT and what could be improved

4. COLOR PALETTE RECOMMENDATIONS
- Propose 3 distinct pastel color palettes that feel warm, personal, and non-generic
- Each palette should have: primary, secondary, accent, background, surface, text, error, success colors
- Explain the emotional psychology behind each palette choice
- Show how each palette would look in dark mode (pastel dark mode is rare — research how to do it well)

5. TYPOGRAPHY RECOMMENDATIONS
- Propose 3 font pairing options that are:
  - Beautiful and unique (not seen in every AI-generated app)
  - Available via Google Fonts or open source
  - Support both English and potential Hindi/Devanagari text
  - Work well at small sizes (mobile-first)
- For each pairing: heading font, body font, accent font, and why they work together
- Show examples of how each pairing would look in context (headings, body text, buttons, captions)

6. ANIMATION & MICRO-INTERACTION GUIDELINES
- Lottie animation best practices for PWAs (performance, file size, when to animate)
- Specific animation recommendations for: task completion, streak celebrations, sprint results, mood check-in, punishment reveal
- How to make animations feel hand-crafted vs generic
- Free Lottie animation sources that aren't overused

7. COMPONENT DESIGN PATTERNS
- How to design buttons, cards, inputs, modals, and navigation in kawaii style
- How to make data visualization (charts, graphs) feel cute and personal vs corporate
- Notification design patterns that feel friendly, not intrusive
- Empty state design — how to make "nothing to do" screens delightful

8. MASCOT/CHARACTER DESIGN DIRECTION
- Should the AI have a visual mascot? Research pros and cons
- Examples of successful app mascots (Duolingo Duo, Finch bird, etc.)
- Character design principles for a couple's accountability app
- How the character's expression/state could reflect app context (happy when tasks are done, sad when ignored)

Format as a design system document with visual references (describe screenshots/mockups in detail where you can't show images), specific hex codes, font names, and actionable implementation guidance. This is for developers who will be vibe-coding with AI — the guidance needs to be specific enough that an AI coding assistant can implement it correctly.
```

---

### Research Brief 3: Gamification Scoring System & Feature Unlock Mechanics

**Prompt to copy-paste into a new Claude chat:**

```
Use your deep research tool to create a comprehensive report on gamification systems for the following:

I am building a competitive habit-tracking app for a couple. The app has weekly sprints where both users compete on task completion. I need a research-backed scoring and progression system.

Current design:
- Composite score: Completion Rate (30%) + Difficulty Multiplier (25%) + Consistency (30%) + Streak Bonus (10%) + Bonus Points (5%)
- Weekly sprints (Monday-Sunday), AI suggests 10 goals per person
- Loser takes winner on AI-planned date (£100 budget cap)
- Winner's control over punishment scales with their own completion %
- Features unlock as users maintain consistency, and lock back down when they slack

Research the following:

1. SCORING SYSTEM DESIGN
- Is the proposed 30/25/30/10/5 weighting optimal? Research scoring systems in competitive apps (Duolingo, Fitbit challenges, Strava, etc.)
- How should "difficulty" be rated? Should AI rate it, users rate it, or both?
- What is the best way to measure "consistency"? (Even distribution across the week vs other methods)
- How to prevent gaming the system (doing only easy tasks for points)
- ELO-style rating systems — could an ELO rating work for a 2-person competition?
- How to handle ties — what happens when both users have identical scores?

2. PROGRESSIVE UNLOCK SYSTEMS
- Research progression systems in games (RPGs, mobile games, MMOs) and how they maintain engagement
- How Duolingo, Habitica, Forest, and other habit apps handle progression
- Optimal number of tiers (I proposed 5: Tier 0-4) — is this right?
- What should be locked vs unlocked at each tier?
- How fast should progression feel? Too slow = discouraging. Too fast = no motivation.
- Regression mechanics — how harsh should losing tiers be? Research "loss" mechanics in games
- The concept of "prestige" systems — should there be something beyond Tier 4?

3. STREAK MECHANICS
- How Duolingo streaks work psychologically and mechanistically
- Optimal streak design — daily vs weekly vs hybrid
- "Streak freezes" — how many per month, should they cost something?
- What happens to streaks during legitimate off-days (sick, traveling)?
- How to make breaking a streak feel consequential but not devastating
- Streak recovery mechanics — can you earn back a broken streak?

4. AI-PLANNED PUNISHMENT DATE SYSTEM
- How should the AI structure a date plan? (Restaurant + activity + specific orders)
- Should the AI be slightly evil (choose things the loser doesn't love) or neutral?
- How does the winner's control level actually work mechanically? (Veto system? Customization points?)
- Should there be "punishment intensity levels" based on how badly someone lost?
- What if both users did terribly (<30% completion)? How to handle mutual punishment?
- Should past punishment dates influence future ones? (Avoid repetition, escalation)

5. ANTI-MANIPULATION GUARDRAILS
- How to prevent the system from becoming toxic (constant losing = demoralization)
- Catch-up mechanics — if someone is on a 5-week losing streak, how to re-engage them
- When should the AI intervene and adjust difficulty?
- How to detect if competition is hurting the relationship vs helping it
- "Mercy rules" — should there be a point where the system softens?

6. SPECIFIC IMPLEMENTATION RECOMMENDATIONS
- Provide the exact scoring formula with mathematical breakdown
- Provide the exact tier thresholds and what unlocks at each tier
- Provide example sprint scenarios showing how scoring plays out
- Provide edge case handling (both users at 0%, one user sick for a week, etc.)

Format as a technical game design document with formulas, tables, flowcharts described in text, and implementation pseudocode where helpful.
```

---

### Research Brief 4: Adaptive AI Personality & LLM Integration Architecture

**Prompt to copy-paste into a new Claude chat:**

```
Use your deep research tool to create a comprehensive report on designing an adaptive AI personality system powered by Claude API for the following context:

I am building a couples' habit-tracking app where the AI acts as a judge, coach, and personality that adapts based on user mood, performance, and context. The AI is called via Claude API (full LLM integration).

The AI needs to:
- Judge weekly sprint winners using a composite scoring system
- Plan punishment dates (restaurant, activity, orders — within £100 budget, using city-level location data)
- Suggest daily/weekly tasks based on user goals and past performance
- Adapt its personality based on context (chameleon mode)
- Conduct adaptive mood check-ins
- Evaluate excuses for off-days (legit vs laziness)
- Write personalized notifications that use behavioral psychology

Research the following:

1. ADAPTIVE AI PERSONALITY DESIGN
- How to design a "chameleon" AI personality that shifts between: cheerful, sarcastic, tough-love, empathetic, hype-man, disappointed
- What context signals should trigger personality shifts? (Mood data, task completion rate, streak status, time of day, day of week)
- How to maintain personality consistency while adapting — the AI should feel like ONE character with moods, not multiple different AIs
- Research on AI companion apps (Replika, Character.ai, Pi) — what makes their personalities feel real?
- How to prevent the AI from being annoying or over-bearing
- Cultural context: the users are Indian-origin, internet-native, Gen Z, based in UK — the humor and tone should reflect this

2. SYSTEM PROMPT ARCHITECTURE
- How to structure the Claude API system prompt for this multi-function AI
- Should there be one monolithic system prompt or context-specific prompts for different functions (judging, planning, chatting)?
- How to inject real-time user data (scores, mood, tasks) into prompts efficiently
- Token optimization — how to keep prompts concise while providing enough context
- Research on "system prompt engineering" for personality-driven AI applications

3. SPECIFIC AI FUNCTIONS — PROMPT TEMPLATES
- Sprint Judging: What data to feed, how to structure the evaluation, output format
- Date Planning: How to prompt Claude to plan creative, personalized dates using location + preferences + budget constraints
- Task Suggestion: How to prompt for meaningful, personalized task suggestions that aren't generic
- Excuse Evaluation: How to prompt Claude to distinguish legit reasons from laziness fairly
- Mood Analysis: How to prompt Claude to find patterns in mood data and generate insights
- Notification Copy: How to prompt Claude to write notifications that use dark patterns effectively

4. TECHNICAL ARCHITECTURE FOR LLM INTEGRATION
- How to structure the API calls (Supabase Edge Functions → Claude API)
- Caching strategies — what responses can be cached vs need to be real-time?
- Cost estimation — estimate monthly Claude API costs for 2 users with daily interactions
- Error handling — what happens when the API is down?
- Rate limiting — how to prevent excessive API calls
- Should any AI functions run on a schedule (cron) vs on-demand?
- Streaming vs non-streaming responses — when to use each

5. DATA PIPELINE FOR AI CONTEXT
- What user data should be included in each AI call?
- How to summarize historical data efficiently (you can't send 6 months of mood entries in every prompt)
- Progressive context — how the AI's "knowledge" of the users should deepen over time
- Privacy considerations — even though users consented to everything, what's the responsible approach?

6. EVALUATION & TESTING
- How to test if the AI personality feels natural and not robotic
- How to test if judgments are fair and consistent
- A/B testing personality styles with 2 users — methodology
- How to gather feedback on AI quality within the app

Format as a technical architecture document with system prompt examples, API call patterns, data flow diagrams described in text, and cost estimates.
```

---

### Research Brief 5: PWA Push Notification Architecture & Escalation System

**Prompt to copy-paste into a new Claude chat:**

```
Use your deep research tool to create a comprehensive report on implementing push notifications in a Progressive Web App (PWA):

Context: I am building a PWA for two users (a couple) that tracks habits, runs weekly competitions, and needs to "pinch" users with escalating notifications to force task completion. The users wake at 9-10 AM and sleep at 12-1 AM.

Research the following:

1. PWA PUSH NOTIFICATION FUNDAMENTALS
- How do PWA push notifications work technically? (Service Workers, Push API, Notification API)
- Browser support status in 2025/2026 — which browsers support PWA push on iOS, Android, Desktop?
- iOS-specific limitations and workarounds for PWA push notifications
- What is the user opt-in flow? How to maximize opt-in rates?
- Can PWA push notifications wake a phone screen? (Critical for an app that needs to interrupt doomscrolling)

2. NOTIFICATION SCHEDULING & ESCALATION
- How to implement scheduled notifications (e.g., 4 hours before deadline, 1 hour before)
- Server-side vs client-side scheduling — pros and cons with Supabase
- Escalation patterns — how to increase urgency without being dismissed/muted
- Optimal notification frequency — research on when notifications become annoying vs effective
- Time-of-day considerations — no notifications during sleep hours (12 AM - 9 AM)
- Smart notification timing — should the app learn when users are most responsive?

3. NOTIFICATION CONTENT STRATEGY
- Research on notification copy that drives action (length, tone, urgency words)
- Personalization in notifications — using partner's name, score references, streak data
- Rich notifications — can PWA push include images, action buttons, progress bars?
- A/B testing notification styles with 2 users
- Dark pattern notifications — how Duolingo, Snapchat, and fitness apps craft their notifications

4. TECHNICAL IMPLEMENTATION WITH SUPABASE
- Using Supabase Edge Functions to trigger push notifications
- Web Push Protocol — VAPID keys, payload encryption, endpoint management
- Database design for notification scheduling and delivery tracking
- Cron jobs in Supabase for scheduled notifications
- Handling notification delivery failures and retries
- Supabase Realtime as a secondary notification channel (in-app)

5. SPECIFIC NOTIFICATION SCHEDULE FOR THIS APP
- Morning briefing notification (9:30 AM)
- Task deadline escalation (1 week → 3 days → 1 day → 4 hours → 1 hour → 30 min → overdue)
- Social pressure notifications (when partner completes tasks)
- Mood check-in notification (11:30 PM)
- Sprint results notification (Sunday 10 PM)
- Streak warning notifications
- Sprint start notification (Monday 9:30 AM)

6. ANTI-ANNOYANCE MEASURES
- Notification grouping and batching strategies
- "Do Not Disturb" detection and respect
- User controls for notification preferences
- When to throttle notifications (e.g., user already completed all daily tasks)

Format as a technical implementation guide with code examples (JavaScript/TypeScript), Supabase schema snippets, and a notification schedule matrix.
```

---

### Research Brief 6: Competitive Couples App Market Research & Differentiation

**Prompt to copy-paste into a new Claude chat:**

```
Use your deep research tool to create a comprehensive competitive analysis and market positioning report:

I am building a habit-tracking app specifically designed for couples, featuring AI-powered competition, real-world punishments, adaptive personality, kawaii aesthetic, and psychological manipulation for productivity. Before building, I need to understand what exists and how to differentiate.

Research the following:

1. DIRECT COMPETITORS — Couples' Accountability/Habit Apps
- Find and analyze all existing apps designed for couples to track habits together
- For each: features, pricing, design quality, user reviews, what works, what doesn't
- Include: Paired, Honeydue, Couple Game, Between, and any others
- Specifically look for apps that have competitive/gamified elements between partners

2. INDIRECT COMPETITORS — Individual Habit & Gamification Apps
- Analyze: Habitica, Finch, Forest, Streaks, Productive, Atoms, Done
- For each: what gamification mechanics they use, how they retain users, design quality
- What do users complain about most? (Read App Store/Play Store reviews)
- What keeps people coming back vs what makes them delete the app?

3. AI-POWERED PRODUCTIVITY APPS
- Analyze any apps that use LLM/AI for habit tracking, task management, or personal coaching
- How are they integrating AI? (Chatbot, suggestions, analysis, personality)
- What do users think of AI in productivity apps? (Positive and negative sentiment)
- Is there fatigue around "AI-powered" apps?

4. MARKET GAPS & OPPORTUNITIES
- What does NO existing app do that this app does?
- The specific combination of: couples + competition + real-world stakes + AI judge + kawaii aesthetic — does this exist anywhere?
- User pain points that existing apps don't address
- Monetization models that work in this space (if we ever expand beyond 2 users)

5. DESIGN BENCHMARKING
- Find 10 apps with the best UI/UX in the habit/wellness space
- Analyze their design systems: color, typography, animation, iconography
- Which ones feel personal and human vs corporate and generic?
- Screenshots/descriptions of the best onboarding flows in this category

6. FEATURE PRIORITIZATION INSIGHTS
- Based on competitive analysis, which features are table-stakes (must-have for v1)?
- Which features are differentiators (what makes this app special)?
- Which features can wait for v2?
- What do users of existing apps REQUEST that those apps don't have?

Format as a competitive analysis report with comparison tables, feature matrices, and strategic recommendations for differentiation.
```

---

## 10. Key Decisions Still Pending

| Decision | Status | Owner |
|----------|--------|-------|
| App name | ✅ Resolved: **Jugalbandi** | Aman & Mukta |
| Frontend framework | ✅ Resolved: **React + Vite + Tailwind CSS v4** | Claude |
| AI mascot/character design | ✅ Resolved: **Mochi** | Co-create |
| Feature unlock specifics | ✅ Approved as-is (5 tiers, Seedling→Unshakeable) | Aman & Mukta |
| Exact scoring formula | ✅ Resolved: **30/20/30/15/5** (see v2 §5.3) | Claude proposes → users approve |
| Notification copy/tone | ✅ Framework set (see v2 §5.8) | AI generates based on psychology research |
| Dark mode design | ✅ Resolved (see v2 §7) | Warm-tinted dark backgrounds per palette |
| Punishment intensity scaling | ✅ Resolved: Mild/Moderate/Spicy (see v2 §5.4) | Co-create based on research |

---

## 11. Immediate Next Steps

1. ~~**Run all 6 Deep Research briefs**~~ ✅ **DONE** — All 6 briefs completed
2. ~~**Review this ideation document**~~ ✅ **DONE** — Updated to v2 (canonical)
3. ~~**React to Feature Unlock proposal**~~ ✅ **DONE** — Approved as-is (5 tiers)
4. ~~**Make pending decisions**~~ ✅ **DONE** — Name: Jugalbandi, Framework: React + Vite + Tailwind CSS v4, Mascot: Mochi
5. **Next: Begin Phase 0 implementation** — See `docs/development-roadmap.md`

> **Note:** This is the v1 ideation document. The canonical spec is `docs/ideation-document-v2.md`.

---

## 12. Constraints & Guardrails

- **Budget:** £100 max per punishment date
- **Users:** 2 (Aman & Mukta), designed to potentially expand to friends later
- **Location data:** City-level only (Sheffield, UK) — no precise GPS
- **Personal data:** Full access (food prefs, budget, health goals, hobbies, mood data)
- **Building approach:** Vibe coding — AI does heavy lifting, Aman & Mukta guide
- **Timeline:** No hard deadline — quality over speed
- **Schedule:** Users active 9 AM - 1 AM, no notifications outside this window
- **Mood data:** Fully shared between both users
- **Ethics:** Dark patterns used FOR the users' benefit, with guardrails against relationship damage

---

*This document is a living reference. Update after each deep research session.*

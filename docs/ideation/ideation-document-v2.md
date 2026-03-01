# Project Ideation Document — Jugalbandi — Couple's Accountability & Growth App

**Version:** 2.0  
**Date:** February 28, 2026  
**Authors:** Aman & Mukta (Founders / Only Users)  
**Document Type:** Structured Ideation — Updated with All Six Research Briefs  
**Status:** Pre-Development Decisions Resolved → Ready for Phase 0
**Companion docs:** [Development Roadmap](../roadmaps/development-roadmap.md) (timeline) | [Architecture Decision Record](../architecture/architecture-decision-record.md) (decisions)

---

## Document Changelog (v1.0 → v2.0)

This version incorporates findings from all six deep research sessions. Every section has been reviewed against the research and updated where the research filled a gap, corrected an assumption, or provided implementation-ready specifics. Research references are marked with **[Brief N]** throughout.

| Section                          | Key Changes                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Scoring System (5.3)             | Reweighted from 30/25/30/10/5 → **30/20/30/15/5** per gamification research [Brief 3]                                            |
| Design Direction (7)             | Replaced vague "Sanrio vibes" with **three named palettes, specific typography systems, and component specifications** [Brief 2] |
| AI Personality (5.7)             | Named the AI **"Kira"**, added three-layer personality model, system prompt architecture, and cost estimates [Brief 4]           |
| Notifications (5.8)              | Added **iOS limitations, pre-permission flow, Supabase Edge Function architecture** [Brief 5]                                    |
| Psychology Framework (NEW §5.10) | Added six psychological engines, 10 dark pattern mechanics, and relationship guardrails [Brief 1]                                |
| Competitive Position (NEW §3.1)  | Added market gaps, feature prioritization, and monetization strategy [Brief 6]                                                   |
| Punishment System (5.4)          | Added **graduated sanctions, three intensity tiers, veto system, date memory algorithm** [Briefs 1, 3]                           |
| Streak Mechanics (5.3)           | Added **60% threshold, couple rescue, milestone floors, logarithmic cap** [Brief 3]                                              |
| Progressive Unlocking (5.5)      | Replaced vague tiers with **Tier Points system, specific unlock schedules, prestige layer** [Brief 3]                            |
| Anti-Toxicity (NEW §5.11)        | Added **RelationshipHealthMonitor, catch-up mechanics, 5:1 ratio enforcement, mercy rules** [Briefs 1, 3]                        |
| Mascot/Character (7.5)           | Added **one shared creature, joint hatching ceremony, never-punish expression states** [Brief 2]                                 |
| Tech Stack (8)                   | Added **model routing (Haiku 4.5 / Sonnet 4.5), prompt caching, VAPID architecture** [Briefs 4, 5]                               |

---

## 1. Problem Statement

Aman and Mukta are a couple who are self-aware about their procrastination habits. They consistently miss deadlines, delay important tasks (applications, learning goals, health routines), and default to passive consumption (Instagram reels, doomscrolling) over productive action. Existing habit-tracking apps fail them because:

- **Generic design** — Most apps feel impersonal, corporate, and produce no emotional connection
- **No stakes** — Checking a box has zero consequences; there's nothing to lose. StickK's data shows financial stakes make users **3x more likely to succeed**, yet apps with real consequences (StickK, Beeminder) have terrible UX scoring 3.3★ on iOS **[Brief 6]**
- **No social pressure** — Solo habit trackers rely on willpower alone, which is the exact resource they lack. Research shows the **Köhler motivation gain effect** causes the weaker partner in a pair to work **26–43% harder** than when working alone **[Brief 1]**
- **No adaptive intelligence** — Apps don't learn user patterns, don't understand when someone is being lazy vs. legitimately busy, and don't personalise interventions. Most AI productivity apps are "glorified chatbots bolted onto a to-do list" **[Brief 6]**
- **AI slop aesthetics** — Most AI-built apps look identical: indigo buttons (#6366F1), Inter font, glassmorphic cards, centered layouts. Tailwind CSS creator Adam Wathan publicly apologized for making `bg-indigo-500` the default, inadvertently creating the "AI slop" convergence **[Brief 2]**

They need a system that weaponizes their relationship dynamic — competition, accountability, love, and evidence-based psychological manipulation — to force real behavioral change. Not another app to ignore.

**Market validation [Brief 6]:** The habit-tracking market is projected to grow from **$1.7B in 2024 to $5.5B by 2033** (14.2% CAGR). No existing app combines couples-specific habit tracking, head-to-head competition, real-world stakes, an AI judge, and kawaii aesthetics. This is a genuine blue-ocean opportunity.

---

## 2. User Profiles

### User 1: Aman

- **Role:** Co-founder, AI & Software Engineer
- **Personality:** Competitive, internet-native, design-opinionated, allergic to AI slop
- **Weaknesses:** Procrastination, doomscrolling, brain rot consumption
- **Motivators:** Competition, winning, building cool things, aesthetic quality
- **Schedule:** Wakes 9–10 AM, sleeps 12–1 AM
- **Location:** Sheffield, England, GB

### User 2: Mukta

- **Role:** Co-founder, AI & Software Engineer
- **Personality:** Motivated but inconsistent, wants discipline, values emotional reflection
- **Weaknesses:** Procrastination, forgetting deadlines, difficulty forming habits
- **Motivators:** Self-improvement, emotional growth, relationship quality, being better than Aman
- **Schedule:** Wakes 9–10 AM, sleeps 12–1 AM
- **Location:** Sheffield, England, GB (assumed same)

### Shared Traits

- Gen Z / internet-native (6–7 hrs daily on Instagram/reels)
- Both are AI & software engineers — they will spot and reject bad UX/UI instantly
- Comfortable sharing ALL personal data (food prefs, budget, health goals, hobbies)
- Love cute, pastel, character-driven aesthetics (Sanrio / Finch vibes)
- Want to feel emotionally connected to the app, not just use it as a tool
- **Indian-origin, UK-based** — cultural voice should include Hinglish seasoning, desi humour, and British context awareness **[Brief 4]**
- **Meta-aware of psychological manipulation** — they understand loss aversion, streak psychology, and gamification, and want it deployed against them deliberately. This meta-awareness doesn't neutralize the effects; when users consent to and understand the system, autonomy is preserved (SDT) and ironic engagement becomes a bonding activity **[Briefs 1, 6]**

---

## 3. User Expectations

### What They Want the App to DO

1. **Force them to complete tasks** — Not suggest, not remind. FORCE through psychological pressure, stakes, and competition
2. **Create real consequences** — Losing means taking the winner on a date planned entirely by AI (up to £100 budget, scaled by margin of victory **[Brief 3]**)
3. **Be genuinely smart** — Full LLM integration (Claude API) for judging, planning, adapting personality, and understanding context. AI as "invisible plumber, not chatbot frontman" — pattern detection and data-backed rulings, not generic coaching monologues **[Brief 6]**
4. **Track their emotional state** — Adaptive mood check-ins that are quick on busy days, deep on reflective days
5. **Reward consistency, not bursts** — Composite scoring that values daily discipline over last-minute cramming, with consistency weighted at 30% **[Brief 3]**
6. **Look and feel alive** — Kawaii-cute aesthetic built on the Strawberry Milk palette, Bubble Tea typography, Lottie animations, and a shared mascot character — zero AI slop **[Brief 2]**

### What They Want the App to FEEL Like

- A sarcastic, loving third member of their relationship who keeps them accountable — named **Kira** **[Brief 4]**
- Finch meets competitive Duolingo meets relationship therapist meets CARROT Weather's committed persona **[Brief 6]**
- Something they'd be embarrassed NOT to open every day
- Personal, intimate, and built for exactly two people
- **"Kawaii aesthetic with teeth"** — an adorable Sanrio-adjacent surface hiding genuinely consequential systems underneath. The mascot delivers the bad news in the sweetest possible way **[Brief 6]**

### 3.1 Strategic Positioning [Brief 6 — NEW]

**One-line positioning:** A kawaii accountability weapon for couples who want to be psychologically manipulated into being better people — together, competitively, with receipts.

**Six market gaps this app fills:**

| Gap                                                                        | What's Missing                                                                                    | Our Answer                                                                                     |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Couples-native habit tracking                                              | HabitShare is the closest, and it's a generic social tracker couples happen to use                | Purpose-built for two-person systems with shared goals, joint streaks, asymmetric habits       |
| Dyad-optimized competition                                                 | Duolingo has stranger leaderboards, Habitica has party quests — nobody designs for romantic pairs | Competition system built on Garcia & Tor's N-effect research showing motivation peaks in dyads |
| Real-world consequences + polished UX                                      | StickK/Beeminder prove stakes work (3x–630% success increase) but have 3.3★ UX                    | Proven commitment-device psychology inside an app people enjoy opening                         |
| AI judge with personality, not coach with platitudes                       | Every AI productivity app is a supportive coach. Nobody has built an AI referee                   | Kira: data-literate referee who delivers rulings with personality and enforces consequences    |
| Kawaii aesthetic with teeth                                                | Finch is kawaii but non-punitive. Duolingo uses guilt but isn't kawaii                            | Sanrio meets courtroom judge — cute character, real consequences                               |
| App for technical users who see through dark patterns but want them anyway | No productivity app acknowledges meta-awareness or designs for informed consent                   | Transparent manipulation: "I'm using loss aversion against you right now, and it's working"    |

**Monetization recommendation [Brief 6]:** One-time purchase at **£4.99–6.99**. If AI costs require ongoing revenue, add a lightweight optional subscription (£1–2/month) positioned transparently as "keep the servers running." Target users are engineers who understand infrastructure costs — transparency beats dark-pattern monetization.

---

## 4. Solution Overview

A Progressive Web App (PWA) built for exactly two users that combines:

- **Task management** with AI-suggested goals and deadline enforcement
- **Weekly competitive sprints** with a research-backed composite scoring system (30/20/30/15/5 weighting) **[Brief 3]**
- **AI-as-judge** powered by Claude API — named **Kira**, with a three-layer personality model (Personality → Mood → Emotion) **[Brief 4]**
- **Real-world graduated stakes** — loser takes winner on an AI-planned date, intensity scaled to margin of victory (Mild / Moderate / Spicy) **[Briefs 1, 3]**
- **Adaptive mood journaling** — shared between both users
- **Tier Points progression system** — five tiers (Seedling → Unshakeable) with prestige layer, earning and decaying based on weekly performance **[Brief 3]**
- **Six psychological engines** — variable ratio reinforcement, loss aversion, Zeigarnik Effect, dyadic social comparison, implementation intentions, and fresh start effect — all research-validated and synergistically combined **[Brief 1]**
- **Anti-toxicity guardrails** — Gottman's 5:1 ratio enforcement, RelationshipHealthMonitor, catch-up mechanics, mandatory grace periods **[Briefs 1, 3]**

### Tech Stack

| Layer         | Choice                               | Rationale                                                                                                                                    |
| ------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform      | PWA (installable)                    | Works on all devices; push notifications supported on Android, desktop, and iOS 16.4+ (with home screen installation required) **[Brief 5]** |
| Frontend      | React + Vite + Tailwind CSS v4       | Fast HMR, tree-shaking, PWA via vite-plugin-pwa; Tailwind v4 for design tokens and utility-first styling                                     |
| Backend       | Supabase                             | Postgres + Auth + Realtime (both users see updates live) + Edge Functions for AI bridge + pg_cron for notification scheduling **[Brief 5]**  |
| AI — Routine  | Claude Haiku 4.5                     | Daily interactions, notifications, mood check-ins, task suggestions (~$0.40/MTok blended with prompt caching) **[Brief 4]**                  |
| AI — Complex  | Claude Sonnet 4.5                    | Sprint judging, date planning, excuse evaluation — tasks requiring nuanced reasoning **[Brief 4]**                                           |
| Icons         | Hugeicons (hugeicon.com)             | 46,000+ icons, Stroke Rounded style for kawaii aesthetic. Use `@hugeicons/react` + `@hugeicons/core-free-icons` packages **[Brief 2]**       |
| Animations    | Lottie (dotLottie format)            | 80–90% file size reduction via ZIP compression; canvas renderer for performance, SVG for quality **[Brief 2]**                               |
| Notifications | PWA Push (VAPID + Web Push Protocol) | Service Worker + Push API + Notification API; Supabase Edge Functions as trigger engine **[Brief 5]**                                        |
| Typography    | Baloo 2 + Nunito + Comfortaa         | Native Devanagari support via Baloo 2; all variable fonts; none on "generic AI" font lists **[Brief 2]**                                     |

**Estimated AI cost: ~£2–4/month** for two users with daily interactions, leveraging prompt caching for 90% cost reduction on the static system prompt portion **[Brief 4]**.

---

## 5. Feature Breakdown

### 5.1 Task & Habit System

**Architecture Decision:** Tasks split into TWO categories with a unified visual feed:

**Category A: Deadline Tasks (One-off)**

- Have a specific due date/time (e.g., "Submit visa application by March 15")
- Notification escalation as deadline approaches (see §5.8)
- AI judges severity — missing a visa deadline is worse than missing "buy groceries"
- Each task paired with an **implementation intention** at creation: "If [situation], then I will [task]" — research shows this doubles goal completion (d = 0.65 across 94 studies) **[Brief 1]**

**Category B: Recurring Habits (Daily/Weekly)**

- Repeating commitments (e.g., "Go to gym 4x/week", "Read for 30 min daily")
- Streaks tracked with **60% daily threshold** — completing 6/10 assigned tasks maintains the streak (not 100%, which triggers the "what the hell" abandonment effect) **[Brief 3]**
- AI suggests new habits based on past mood data and performance patterns
- Each habit should allow partners to track **different habits within the same point system** — each person has their own "domain of excellence" to prevent the Tesser Self-Evaluation Maintenance threat **[Brief 1]**

**Both categories live in a single daily feed** — the user sees "what do I need to do today?" without caring about the backend categorization.

**AI Task Suggestion Engine:**

- AI suggests tasks based on user's stated goals, past performance, mood trends, and areas of weakness
- Users can accept, modify, or reject suggestions
- AI learns from acceptance patterns over time
- **Constraint is a feature [Brief 6]:** The most loved habit apps limit habits (Atoms limits to 3, Bento limits to 3 tasks per session). Don't build a feature-bloated tracker.

### 5.2 Verification System (Mixed Trust)

**Easy/Low-stakes tasks:** Honor system — tap to mark complete

- Examples: "Drink 2L water", "Read for 30 min", "Meditate"

**Important/High-stakes tasks:** Proof required

- Photo/screenshot upload as evidence
- The other person can challenge a completion (flag it for AI review)
- AI can spot-check by randomly requiring proof for "easy" tasks too (keeps you honest even on small things — this is a **variable ratio reinforcement** mechanism where the uncertainty of being checked drives consistent honesty) **[Brief 1]**

### 5.3 Weekly Sprint System

**Structure:**

- Sprints run **Monday to Sunday** — capitalizing on the **Fresh Start Effect** (Dai, Milkman & Riis, 2014: gym attendance increases ~33.4% at the start of a new week). Each Monday delivers a clean slate, relegating last week's failures to a psychologically "previous self" **[Brief 1]**
- At sprint start: AI proposes 10 goals per person based on their individual goals, past performance, and areas needing improvement
- Users can swap/modify up to 3 goals (can't remove all the hard ones)
- Throughout the week: real-time leaderboard visible to both
- **Habit formation timeline:** Lally et al. (2010) found habit formation takes an average of **66 days** (~9–10 weekly sprints). The app should frame this: "Week 7 of 10 toward making this automatic" **[Brief 1]**
- **Endowed Monday head start [Brief 1]:** Each Monday, users start with bonus points based on last week's performance (strong week = 20–40 bonus points; weak week = 5–10). Progress bar starts pre-filled. Always tied to a real behaviour: "You earned 25 bonus points because you completed 6/7 days last week."

**Composite Scoring System (Revised per Research) [Brief 3]:**

The score is NOT a simple task count. It's a weighted composite, **reweighted from the original 30/25/30/10/5 to 30/20/30/15/5** based on gamification research. The original 25% difficulty weight was too exploitable; the 10% streak bonus undervalued the mechanic Duolingo's data shows is their most powerful engagement driver.

```
WEEKLY_SCORE = (0.30 × CompletionRate) + (0.20 × DifficultyScore) +
               (0.30 × ConsistencyScore) + (0.15 × StreakBonus) +
               (0.05 × BonusPoints)
```

Each component normalised to 0–100, producing a final score between 0 and 100.

| Component         | Weight | How It Works                                                                                                                                                                                                     | Anti-Gaming Measure                                                        |
| ----------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Completion Rate   | 30%    | `tasks_completed / tasks_assigned × 100`                                                                                                                                                                         | Transparent, ungameable                                                    |
| Difficulty Score  | 20%    | **Hybrid rating:** AI sets base difficulty (1–5), user adjusts ±1. Dynamic decay: if user completes "hard" tasks >90% of the time, effective difficulty reduces. Inspired by Habitica's task-value colour system | Decay mechanism is the key anti-gaming measure                             |
| Consistency Score | 30%    | Mean absolute deviation of daily completions across the week. Even distribution = 100; Sunday binge = 0                                                                                                          | Rewards discipline over cramming                                           |
| Streak Bonus      | 15%    | Logarithmic scaling with hard cap: `min(25 × log(streak_days) / log(30), 100)`. 7-day streak = 40.1, 30 days = 73.4, 60+ = 100 (capped)                                                                          | Cap at 60 days prevents runaway leader advantage                           |
| Bonus Points      | 5%     | Variable-ratio rewards: early bird (all tasks before noon), perfect day, new habit tried, partner helped, weekly wildcard challenge. Capped at 100                                                               | Random rewards are 15% more engaging than predictable ones (Duolingo data) |

**Difficulty Multiplier Table [Brief 3]:**

| Rating | Label   | Weight | Examples                                          |
| ------ | ------- | ------ | ------------------------------------------------- |
| 1      | Trivial | 0.5×   | Drink water, make bed                             |
| 2      | Easy    | 1.0×   | Read 15 mins, take vitamins                       |
| 3      | Medium  | 1.5×   | 30-min workout, cook dinner from scratch          |
| 4      | Hard    | 2.0×   | Run 5K, deep-clean the flat                       |
| 5      | Brutal  | 2.5×   | Cold-water swim, complete a coursework assignment |

**Handling Ties [Brief 3]:** Ties are treated as **mutual wins** (cooperative gamification reduces negative outcomes). If a tiebreaker is needed: (1) higher average difficulty attempted, (2) better consistency score, (3) longer current streak, (4) declare mutual win.

**Why Not ELO [Brief 3]:** ELO between exactly two players is fundamentally flawed — ratings oscillate, require 30+ games for accuracy, and the zero-sum structure creates permanent hierarchy breeding resentment. Instead, use a **Relative Performance Index**: calculate both scores each week, express each as percentage of combined total, keep a rolling 4-week average.

**Streak Mechanics (Detailed) [Brief 3]:**

- **Daily streak threshold:** ≥60% of daily tasks (not 100%, which drives the "what the hell" effect — 47% abandonment rate for all-or-nothing goals)
- **Streak freezes:** 1 free per sprint (auto-replenishing Monday) + 1 earnable by hitting 100% completion any single day. Freezes activate automatically on missed days. Do NOT stack across sprints.
- **Planned rest day:** Each user can pre-declare 1 day per sprint as rest (partner notified). Doesn't count against streak or completion. Duolingo's Weekend Amulet data showed permitting breaks made users 4% more likely to return.
- **When a streak breaks — never show zero:** Streaks < 7 days reset to 0; streaks 7–29 days drop to 50%; streaks 30+ days drop to previous milestone floor (7, 14, 21, 30 etc.). Best streak always displayed.
- **Couple rescue mechanic [Brief 3]:** When a streak breaks, the partner can complete a bonus task to restore it — transforming frustration into a cooperative, romantic interaction. Aligns with Gottman's "turning toward" bids for connection.
- **Mutual streak [Brief 1]:** A shared streak counter tracks consecutive days where BOTH partners completed ≥80% of habits. Visible milestones (🔥 at 7, 💯 at 30, 🏆 at 100). Hourglass warning at 9pm if either partner hasn't hit 80%. Making the streak shared transforms procrastination into partnership betrayal, leveraging social obligation alongside sunk cost.

**The AI calculates scores and announces the winner every Sunday night, but only AFTER both partners submit a weekly appreciation note about each other's effort (see §5.11) [Brief 3].**

### 5.4 Punishment & Reward System

**The Core Mechanism: AI-Planned Date [Briefs 1, 3]**

- The loser MUST take the winner on a date
- The AI plans EVERYTHING: restaurant, activity, what to order, timing
- Budget scales with margin of victory (graduated sanctions, per Ostrom's Nobel Prize-winning commons research) **[Brief 1]**
- City-level location data used for restaurant/activity selection (Sheffield-specific)
- The AI uses both users' food preferences, dietary restrictions, and interests to plan

**Graduated Punishment Intensity [Briefs 1, 3]:**

The AI's "evil level" is proportional to how badly someone lost, following a three-tier system inspired by Japanese batsu game design. Key insight: humour arises from the REACTION to the punishment, not the punishment itself.

| Tier                       | Margin     | Budget     | AI Personality | Date Character                                                                             |
| -------------------------- | ---------- | ---------- | -------------- | ------------------------------------------------------------------------------------------ |
| **Mild** ("Photo Finish")  | <10% gap   | £20–30     | Warm, playful  | Nice date with 1 playful twist (loser gives a toast, winner picks dessert)                 |
| **Moderate** ("Clear Win") | 10–25% gap | £40–70     | Smug, teasing  | 1–2 "uncomfortable" elements (activity the loser wouldn't choose, AI picks the restaurant) |
| **Spicy** ("Blowout")      | >25% gap   | Up to £100 | Gleefully evil | Full "punishment" — activity from loser's mild-discomfort list, winner controls theme      |

**Hard limits are sacrosanct.** During onboarding, both users set:

- **Hard nos** (phobias, dietary restrictions, accessibility needs) — AI never crosses these
- **Mild discomforts** (things they find awkward but can handle) — AI targets these at Moderate/Spicy only
- **Preferences** (things they love) — AI uses these to reward winners

**The Winner's Veto System [Brief 3]:**

The winner's completion percentage determines how many vetoes they get over the AI's plan (simpler and more transparent than the v1 "control level" concept):

| Winner's Completion % | Vetoes Granted | Control Level                                          |
| --------------------- | -------------- | ------------------------------------------------------ |
| 50–69%                | 1 veto         | Can reject one date element; AI regenerates            |
| 70–84%                | 2 vetoes       | Can reshape most of the date                           |
| 85–100%               | 3 vetoes       | Near-total creative control; AI assists with logistics |

**The "Both Win" Escape Valve [Brief 1]:**

If both partners exceed **85% habit completion** in a given week, neither "loses." Instead, they unlock a "both win" celebration: a smaller joint date (£30–40 budget) planned by AI, framed as a reward for mutual excellence. This shifts the dynamic from zero-sum to positive-sum.

The 85% threshold is calibrated to Locke & Latham's Goal Setting Theory showing goals with ~80–90% achievability maintain optimal motivation. The threshold should adjust dynamically based on the couple's rolling average.

**Mutual Failure (Both Below 30%) [Brief 3]:**

Competition becomes meaningless. The system shifts to collaborative accountability:

- AI personality: "disappointed but funny"
- Budget penalty date (£30 instead of £100) — forces creativity (Peak District picnic, free gallery + cheap pub)
- Or: collaborative redemption challenge (both must complete a joint task — volunteer, cook together)
- Frame as "household problem" not individual blame. "We" language exclusively.

**Date Memory & Variety Algorithm [Brief 3]:**

The AI maintains a Date History Graph:

- Venues don't repeat within 8 weeks
- Activity categories rotate (physical, creative, food-focused, cultural, outdoor)
- Cuisines tracked and diversified
- Intensity follows a wave pattern (Mild → Moderate → Spicy → Mild), NOT automatic escalation
- Post-date ratings (1–5 from both partners) feed back into AI planning quality
- If ratings dip below 3/5 twice consecutively, AI immediately pulls back

**Date Plan Architecture [Brief 3]:**

Each date has three components:

- **Primary activity** (£20–50): escape room, paint & sip, pottery class, Golf Fang
- **Food & drink** (£35–55): Mowgli, Domo Sardinian, Oisoi Gathering, Silversmiths
- **Extras** (£5–15): cocktails at Trippets, dessert, tram fare
- Plus a **"surprise element"** revealed only on the date, and a **"peak moment"** engineered per Kahneman's peak-end rule (r = 0.581) **[Brief 1]**

**Loser receives a teaser on Friday** ("Saturday's date involves something you've never tried") to generate anticipation rather than dread **[Brief 1]**.

### 5.5 Progressive Feature Unlocking — Tier Points System [Brief 3 — REVISED]

The v1 vague tier system is replaced with a **Tier Points (TP)** system that accumulates weekly and can decay. Five tiers is the right number per Miller's Law (7±2) and gamification research.

**How TP Works:**

- Weekly score ≥ 70 → earn 10–25 TP per good week
- Weekly score 40–69 → earn 0–6 TP (mediocre weeks)
- Weekly score < 40 → lose 15 TP (bad weeks cost TP)
- Inactivity (3+ days no logs) → additional TP decay

| Tier  | Name        | TP Required | Timeline     | What Unlocks                                                                                                                                                                      |
| ----- | ----------- | ----------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0** | Seedling    | 0           | Day 1        | Core habit tracking, basic AI judge, manual task entry, simple weekly score                                                                                                       |
| **1** | Sprout      | 30 TP       | ~3–5 days    | First cosmetics (themes, avatars), basic streak display, second AI personality mode ("Cheerful Coach"), notification customisation                                                |
| **2** | In Sync     | 120 TP      | ~2–3 weeks   | Analytics dashboard, joint challenges, AI-generated habit suggestions, third AI personality mode ("Sassy Motivator"), shareable couple stats cards                                |
| **3** | Thriving    | 300 TP      | ~5–8 weeks   | Full AI personality customisation, advanced couple features (shared calendar, joint goals), premium themes, punishment date veto upgrades, streak rescue ability                  |
| **4** | Unshakeable | 600 TP      | ~10–12 weeks | All features unlocked, exclusive prestige cosmetics, custom challenge creation, full AI capability (personality builder, detailed analytics narration), ability to enter Prestige |

**Why this pacing works:** Tier 1 unlocks within the first week — Duolingo's data proves the first meaningful reward must arrive fast (7-day streak holders are 3.6× more likely to persist). The Tier 3→4 jump requires sustained excellence across 10+ weeks, making it genuinely prestigious.

**Regression Rules [Brief 3 — REVISED]:**

- Score < 40 for one week → "AT RISK" status displayed (visual: garden starts wilting)
- AT RISK + another sub-40 week → lose 20 TP per week
- Score < 20 or no activity → lose 25 TP immediately (no grace period)
- **Maximum 1 tier drop per evaluation period** (even total abandonment)
- Recovery is faster than initial progression (~50% of original climb time)
- Both partners' tiers are independent — one slacking doesn't directly punish the other's tier

**Prestige Layer [Brief 3 — NEW]:**

Once both partners sustain Tier 4 for 4 consecutive weeks, they can opt into a **Prestige reset**:

- Drop to Tier 2 (not Tier 0 — respect the investment)
- Earn a permanent Prestige badge
- Unlock exclusive prestige-only cosmetics and one new AI personality mode
- Harder progression curve: each prestige requires 10% more TP per tier
- Maximum 5 Prestige levels (after Prestige 5 → "Legendary" permanently)

### 5.6 Adaptive Mood Check-In

**Triggers:**

- Primary: Fires 30 minutes before typical bedtime (~11:30 PM)
- If dismissed, gentle follow-up 30 minutes later
- Can also be triggered manually anytime

**Adaptive Logic:**

**Quick Mode (busy day / low energy detected):**

- Mood score: 1–5 with emoji selection
- One sentence: "One word for today?"
- Takes under 30 seconds

**Deep Mode (free day / user engaged / AI detects significant mood change):**

- How was your day? (1–5 + emoji)
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

**Mood data feeds the AI personality engine [Brief 4]:** Low mood scores shift Kira to empathetic mode; high energy shifts to hype-man. Declining trends over multiple days trigger gentle check-ins and softer competitive messaging.

### 5.7 AI Personality System — "Kira" [Brief 4 — MAJOR UPDATE]

The AI is named **Kira** — "a sharp, warm, occasionally savage AI companion." Kira is the third member of the couple's accountability system: part life coach, part hype-woman, part disappointed desi aunty when needed.

**Three-Layer Personality Model [Brief 4]:**

Rather than switching between separate personalities, Kira uses three distinct layers that combine for natural variation:

| Layer           | What It Is                                                                         | How It Changes                                          | Duration      |
| --------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------- |
| **Personality** | Core identity, values, speech patterns, quirks                                     | Never changes                                           | Permanent     |
| **Mood State**  | Current mode (cheerful, sarcastic, tough-love, empathetic, hype-man, disappointed) | Driven by context signals evaluated before each AI call | Session-level |
| **Emotion**     | Reactive per-message responses                                                     | Triggered by specific user inputs                       | Per-message   |

**Mood Selection Algorithm [Brief 4]:**

Runs deterministically in the Edge Function BEFORE calling Claude (not left to the LLM):

| Signal                               | Weight | Logic                                                                                           |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------------------------- |
| Task completion rate (7-day rolling) | 30%    | >85% → hype-man; 60–85% → cheerful; 40–60% → empathetic; <40% → tough-love                      |
| Streak status                        | 25%    | Active long → hype-man; at risk → empathetic; just broken → disappointed; rebuilding → cheerful |
| Mood check-in data                   | 20%    | Low mood → empathetic; high energy → hype-man; neutral → sarcastic (playful)                    |
| Time of day                          | 15%    | Morning → cheerful; afternoon → gentle; evening → reflective; late night → calm                 |
| Day of week                          | 10%    | Monday → fresh-start energy; Friday → celebratory; weekend → relaxed                            |

**Mood Modes with Calibrated Tone [Brief 4]:**

| Mode         | Core Energy           | Tone Ratio                                                 | Example                                                                 |
| ------------ | --------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| Cheerful     | Warm sunshine friend  | 80% warm, 15% playful, 5% challenge                        | "Good morning legend! Let's make today count 🌟"                        |
| Sarcastic    | Roasting best friend  | 70% playful sarcasm, 20% warmth, 10% challenge             | "Oh wow, 2 out of 5 tasks. Should I plan a celebration? 🎉"             |
| Tough love   | No-nonsense coach     | 60% direct challenge, 30% support, 10% humor               | "Three days of excuses. You're better than this and we both know it."   |
| Empathetic   | Understanding support | 80% compassion, 15% gentle encouragement, 5% humor         | "Rough day? That's okay. Tomorrow's a fresh page, yaar."                |
| Hype-man     | Maximum energy        | 85% celebration, 10% humor, 5% next challenge              | "14 DAYS STRAIGHT?! Bhai, you're actually unstoppable right now 🔥🔥🔥" |
| Disappointed | Disappointed parent   | 50% disappointment, 30% "I believe in you", 20% directness | "Not going to lie, I expected more. But I haven't given up on you."     |

**Cultural Voice [Brief 4]:** Hinglish as seasoning, not the main dish. Digital Hinglish among diaspora communities functions as identity signaling — "arre yaar, this weather is something else." Draws from universal desi experiences (family dynamics, chai references, Bollywood callbacks). Zomato/Swiggy notification voice as reference. Maximum 3 Hinglish phrases per interaction.

**System Prompt Architecture [Brief 4]:**

- **Hybrid approach:** Core system prompt (~1,500 tokens, cached) shared across all functions + function-specific instruction blocks appended per task
- Leverages Anthropic's prompt caching for **90% cost reduction** on the static portion
- Mood overlay injected dynamically per-call based on mood selector output
- Model routing: **Haiku 4.5** for routine tasks (notifications, check-ins, task suggestions); **Sonnet 4.5** for high-stakes functions (sprint judging, date planning, excuse evaluation)

**Key Lesson from Companion Apps [Brief 4]:**

- Strategic imperfection beats uncanny mimicry — Kira is transparent about being AI while maintaining consistent character
- Persistent memory creates perceived identity — consistency IS identity
- **Knowing when to shut up is the most important personality trait** — 40% productivity loss from notification-driven task-switching; 64% of users delete apps receiving 5+ notifications/week

### 5.8 Notification System (The "Pinch") [Brief 5 — MAJOR UPDATE]

**PWA Push Notifications** with escalating urgency, built on the Web Push Protocol:

**Technical Architecture [Brief 5]:**

- **Service Worker** listens for push events, displays notifications even when app is closed
- **Push API** creates subscriptions with browser push services (FCM for Chrome, APNs for Safari)
- **VAPID keys** (P-256 ECDSA) for server authentication
- **Supabase Edge Functions** as the trigger engine, with **pg_cron** for scheduled notifications
- Payload encryption using aes128gcm per RFC 8291

**iOS Critical Limitations [Brief 5]:**

- PWA must be **added to home screen via Safari** (Share → Add to Home Screen) — push subscription silently fails otherwise
- **No action buttons** on iOS notifications (only "open app")
- Permission prompt fires **once** — if denied, user must manually re-enable in Settings
- Sound requires **iOS 17+**
- Apple Intelligence (iOS 18.1+) may group/summarize/deprioritize notifications
- **Pre-permission pattern essential:** Show custom in-app dialog explaining value before triggering the native prompt

**Deadline Escalation Schedule:**

| Time Before Deadline | Notification Style                                                      | Psychology                       |
| -------------------- | ----------------------------------------------------------------------- | -------------------------------- |
| 1 week               | Casual: "Hey, [task] is coming up next week"                            | Awareness                        |
| 3 days               | Gentle nudge: "3 days left for [task] — you got this"                   | Implementation intention trigger |
| 1 day                | Firm: "[Task] is due TOMORROW. [Partner] already finished theirs 👀"    | Social comparison                |
| 4 hours              | Urgent: "4 HOURS. You know what happens if you don't..."                | Loss aversion                    |
| 1 hour               | Panic: "⏰ ONE HOUR. [Partner] is watching."                            | Maximum urgency                  |
| 30 min               | Final: "Last chance. Do it or face the consequences."                   | Last chance framing              |
| Overdue              | Shame: "You missed [task]. [Partner] gets points. Kira is judging you." | Loss confirmation                |

**Social Pressure Notifications [Brief 1]:**

- "Mukta just completed 3 tasks. You've done 0 today." (Social comparison)
- "Aman is ahead by 12 points. Sprint ends in 3 days." (Loss aversion + urgency)
- "Your couples streak expires in 3 hours. [Partner] already did their part." (Mutual accountability)
- Cap at **5 competitive notifications per day per person** [Brief 4]. After threshold, switch to passive in-app updates only.

**Anti-Annoyance Measures [Briefs 4, 5]:**

- Space notifications **at least 2 hours apart** (Android 15 Notification Cooldown reduces volume/vibration for rapid notifications)
- Maintain **Gottman's 5:1 ratio** — five positive/celebratory notifications for every competitive or loss-framed one **[Brief 1]**
- No notifications during sleep hours (12 AM – 9 AM)
- Each partner can independently set preferred notification intensity (gentle/standard/aggressive)
- Engagement-based throttling: if user isn't opening notifications, frequency automatically decreases
- If user completed all daily tasks, suppress further competitive nudges

### 5.9 Analytics Dashboard

**Weekly View:**

- Tasks completed vs. assigned (bar chart with **8px top border-radius, gradient fills, bouncy animation** [Brief 2])
- Head-to-head comparison
- Consistency graph (did you do things daily or cram?)
- Mood trend line
- **Relative Performance Index** (each partner's score as % of combined total, rolling 4-week average) **[Brief 3]**

**Monthly View:**

- Sprint win/loss record
- Habit adherence rates
- Mood patterns (weekday vs weekend, correlation with task completion)
- AI-generated insights ("You tend to slack on Wednesdays. Mukta's mood drops when she misses gym.")

**All-Time View:**

- **Relationship XP counter** (permanent, never-resetting — sunk cost architecture) **[Brief 1]**
- Shared growth timeline: "Together: 22 weeks of growth, 650 habits completed, 12 dates experienced"
- Longest streaks (individual + mutual)
- Most completed/most skipped tasks
- Mood journey over time
- **NO lifetime win-loss records** — displaying "Partner A: 14 wins, Partner B: 8 wins" is a contempt factory. Focus on total habits completed, not who won more weeks **[Brief 1]**

### 5.10 Six Psychological Engines [Brief 1 — NEW SECTION]

The app's behaviour change architecture is built on six research-validated psychological engines that are individually well-proven and synergistically powerful when combined:

| Engine                           | Core Principle                                                               | App Implementation                                                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Variable Ratio Reinforcement** | Peak dopamine at 50% reward probability (Fiorillo et al., 2003)              | ~20% chance of "mystery bonus" after any habit completion — 2x points, 3x points, streak freeze token, or spy peek at partner's date plan |
| **Loss Aversion**                | Losses felt 2–2.5× more intensely than gains (Kahneman & Tversky, 1979)      | Each Monday: start with 200 points that DRAIN for missed tasks. "You lost 40 points" > "You could have earned 40 points"                  |
| **Zeigarnik Effect**             | Incomplete tasks create psychological tension driving resumption             | Show "3 of 5 habits completed" with partial progress bars. Tomorrow teaser at 9pm creates overnight open loop                             |
| **Dyadic Social Comparison**     | Competitive motivation peaks in pairs (Garcia & Tor, 2009, N-effect)         | Real-time partner comparison with the most psychologically potent comparison target possible                                              |
| **Implementation Intentions**    | "If-then" plans produce medium-to-large effect on goal attainment (d = 0.65) | Every habit paired with specific situational trigger at creation; notifications fire at user's specified "if" moment                      |
| **Fresh Start Effect**           | New weeks boost goal-directed behavior by ~33.4% (Dai et al., 2014)          | Monday-to-Sunday sprints with clean slate framing; endowed head start points                                                              |

**Ten Dark Pattern Mechanics [Brief 1]:**

1. **Decaying Point Bank** — Start with 200 points Monday; missed habits deduct. Dashboard shows real-time drain.
2. **Mutual Streak Hostage** — Shared streak where BOTH must hit 80% daily. Breaking it feels like betrayal.
3. **Endowed Monday Head Start** — Pre-filled progress bar based on last week. Even weak weeks earn 5–10 points.
4. **Variable Reward Mystery Box** — ~20% chance of bonus after any completion. Probability weighted toward trailing partner (invisible rubber-banding).
5. **Competitive Push Notifications** — Real-time partner completion alerts. Mix of gain-framed (4:1 ratio) and loss-framed.
6. **Sunk Cost Relationship Timeline** — Permanent "Relationship XP" counter and visual timeline. Milestone badges at thresholds.
7. **Tomorrow Teaser** — 9pm preview of tomorrow's first habit + mystery challenge with partial details. If-then planning prompt for bonus points.
8. **Shame-Free Public Commitment** — Sunday evening declarations locked in and visible to partner. Can't be secretly changed mid-week.
9. **AI Date Uncertainty Engine** — Partial info revealed in advance ("Your date involves food and heights"). Peak-end rule engineering.
10. **"Both Win" Escape Valve** — 85% threshold transforms zero-sum into shared challenge with competitive fallback.

### 5.11 Anti-Toxicity & Relationship Health System [Briefs 1, 3 — NEW SECTION]

**This is the most important section.** Unmanaged competition between romantic partners can trigger Gottman's Four Horsemen (criticism, contempt, defensiveness, stonewalling) — predicting relationship failure with **94% accuracy**.

**Key safety insight [Brief 1]:** Romantic partners naturally attenuate competitive intensity (Jia et al., 2024 EEG study), providing a built-in safety buffer. The relationship acts as a natural governor. But the app must still engineer explicit guardrails.

**RelationshipHealthMonitor [Brief 3]:**

Automated signal detection with prescribed interventions:

| Signal                | Trigger                                             | Action                                        |
| --------------------- | --------------------------------------------------- | --------------------------------------------- |
| Sustained losing      | Same person lost 3+ consecutive weeks               | Activate catch-up mechanics (see below)       |
| Disengagement         | App opens < 3/week OR habit logs decreasing 3 weeks | Soften competition, send re-engagement        |
| Score disparity       | Completion gap > 30% for 2+ weeks                   | Enable handicap system                        |
| Low date satisfaction | Loser rates date < 3/5 twice consecutively          | Reduce punishment intensity, trigger check-in |
| One-sided activity    | Only one user active for 5+ days                    | Couples check-in prompt                       |
| Rage quit pattern     | User closes app within 10s of score reveal          | Delay future reveals, add buffer content      |

**Three-Tier Catch-Up Mechanics [Brief 3]:**

Following the Mario Kart rubber-banding philosophy — give the trailing player tools to close the gap, don't nerf the leader:

- **Tier 1 — Passive (always active):** Comeback multiplier (1.15×) if last week < 40% and this week > 60%. Week-over-week improvement > 15 percentage points earns 5 bonus points. Visible and transparent.
- **Tier 2 — Active (3-week losing streak):** Losing player can issue mid-week head-to-head challenges (10 bonus points). AI suggests "wildcard habit" worth double points. Both players informed.
- **Tier 3 — Structural (5-week losing streak):** "Fresh Start Week" (both scores reset to 0), "Swap Week" (trade habit lists for empathy), or "Collaborative Sprint" (joint goal where achievement earns trailing player a "win" credit).

**Mandatory Guardrails [Briefs 1, 3]:**

- **5:1 Notification Ratio** — Five positive/celebratory notifications for every competitive or loss-framed one. System tracks automatically; suppresses competitive notifications if positivity drops below threshold.
- **Score Gap Circuit Breaker** — When one partner leads by > 40% for two consecutive weeks, auto-switch to "team mode" for one week (shared goal, no competition). Köhler effect research shows motivation collapses when ability gap exceeds ~40%.
- **Mandatory Grace Periods** — One "free week" per month where competition pauses and both partners simply track habits without stakes. Prevents burnout, resets resentment.
- **Weekly Appreciation Prompt** — Before sprint scores are revealed, both partners write one thing they appreciate about the other's effort. Scores aren't visible until both submit. Directly applies Gottman's "nurturing fondness and admiration."
- **Opt-Out Without Shame** — Either partner can pause competitive features instantly, no explanation required. App responds with affirmation: "Taking a breather is smart — your Relationship XP and streaks are safe."
- **Weeks 1–2: Training Wheels** — No punishment dates during the first two weeks. Both explore the system in safety.
- **Contempt Detection** — If one partner's engagement drops > 50% week-over-week, trigger relationship temperature check: "How is this app making you feel about your relationship?" with options to pause competition, adjust difficulty, or switch to collaborative mode.

---

## 6. User Flow — A Typical Day

### Morning (9:30 AM — 30 min after wake-up)

1. **Push notification:** "Good morning! Here's your day. You have 4 tasks and Mukta already checked one off." (Fires via Supabase Edge Function cron job **[Brief 5]**)
2. **Open app → Daily Feed:** See today's tasks (mix of deadline + habits), partner's progress (live via Supabase Realtime), sprint standings, and **endowed Monday points if it's start of sprint [Brief 1]**
3. **Kira greeting** adapts to context and mood state: "Morning! You're 3 points behind. Time to catch up?" (cheerful mode) or "Bhai, your partner finished 2 tasks before breakfast. Just saying." (sarcastic mode) **[Brief 4]**

### Throughout the Day

4. **Complete tasks** → tap to mark done (easy ones) or upload proof (important ones) → **possible mystery bonus trigger (~20% chance)** **[Brief 1]**
5. **Get nudged** → escalating push notifications for approaching deadlines (respecting 2-hour spacing **[Brief 5]**)
6. **See partner's activity** → real-time updates ("Mukta just finished her gym session 💪")
7. **Social pressure notifications** → if falling behind (capped at 5/day **[Brief 4]**)
8. **Decaying point bank** visible on dashboard — points draining in real-time **[Brief 1]**

### Evening (9:00 PM)

9. **Tomorrow teaser notification** → "Tomorrow's mystery challenge just dropped. It's worth 25 bonus points and involves something you haven't done in a while." **[Brief 1]**

### Pre-Bedtime (11:30 PM)

10. **Mood check-in notification** → adaptive (quick or deep based on the day)
11. **Complete check-in** → both see each other's entries
12. **Kira end-of-day summary** → "You finished 3/4 tasks today. Consistency score: 85%. Mukta finished 4/4. She's pulling ahead." (powered by Haiku 4.5 **[Brief 4]**)

### End of Week (Sunday 10 PM)

13. **Weekly appreciation prompt** → both partners write one positive thing about each other before scores are revealed **[Brief 3]**
14. **Sprint results notification** → "SPRINT RESULTS ARE IN 🏆"
15. **Open app → Sprint Results:** Animated reveal of winner (bouncy 800–1200ms ease-in-out **[Brief 2]**), detailed score breakdown, Kira delivers verdict with personality **[Brief 4]**
16. **Punishment/reward page:** AI presents the graduated date plan with winner's veto level applied **[Brief 3]**
17. **New sprint preview:** AI proposes next week's 10 goals for each person
18. **Loser receives date teaser on Friday** — partial info to generate anticipation **[Brief 1]**

---

## 7. Design Direction [Brief 2 — MAJOR UPDATE]

### Core Design System: Anti-AI-Slop Specification

**Three Pillars:** Warmth (every color has a yellow/orange undertone), Personality (rounded, character-driven, hand-crafted feel), Emotional Intelligence (celebrates small wins, never punishes failure, makes accountability feel like care).

### 7.1 AI Slop Avoidance Checklist [Brief 2]

Every design decision checked against 18 anti-patterns. If 3+ triggered, redesign:

**Typography red flags:** Inter as only font; the "Safe Five" stack (Inter, Roboto, Open Sans, Lato, Arial); zero font contrast (headings and body same family); moderate-everything sizing (weights 400–600 only).

**Color red flags:** `bg-indigo-500` (#6366F1) as primary; purple-to-blue gradient heroes; timid evenly-distributed palettes; blue-to-teal "innovation" gradient; pure gray-on-white; orange accent on dark (the "developer tool" scheme).

**Layout red flags:** The SaaS Template™ (hero → three-box → testimonials → pricing → footer); three equal-width cards with Lucide icons; everything centered; default bento grid; glassmorphism on everything; uniform `rounded-lg`; identical `shadow-sm`; flat white backgrounds; Corporate Memphis illustrations.

**Golden rule:** AI avoids risk. It picks the median. To defeat AI slop, make **opinionated choices**.

### 7.2 Color Palettes [Brief 2]

**Recommended default: Strawberry Milk 🍓** — warmest emotional register, closest to Finch's proven pastels, native Devanagari font alignment.

All three palettes available as couple-selectable themes for personalisation:

**Palette 1 — "Strawberry Milk" 🍓 (DEFAULT)**

| Role                         | Light Mode | Dark Mode ("Midnight") |
| ---------------------------- | ---------- | ---------------------- |
| Primary (Strawberry Cream)   | `#E8878F`  | `#D4868E`              |
| Secondary (Honey Peach)      | `#F2B8A2`  | `#D9A892`              |
| Accent (Terracotta Rose)     | `#C4706E`  | `#C47878`              |
| Background (Warm Cream)      | `#FFF8F3`  | `#1E1618`              |
| Surface/Card (Milk White)    | `#FFFFFF`  | `#2C2224`              |
| Text Primary (Cocoa Brown)   | `#3D2C2E`  | `#F2E6E0`              |
| Text Secondary (Dusty Mauve) | `#7A5C5E`  | `#A08888`              |
| Error (Soft Strawberry)      | `#D4645A`  | `#D06058`              |
| Success (Sage Mint)          | `#7DB8A0`  | `#7CC49A`              |

**Palette 2 — "Matcha Latte" 🍵** — Warm-leaning mint (yellow-green, not blue-green). AI models almost never produce this hue.

**Palette 3 — "Honey Biscuit" 🍯** — Golden amber palette. Yellow/amber palettes are almost never AI-generated, making this the strongest anti-slop choice.

**Dark Mode Philosophy:** Warm-tinted dark backgrounds (dark cocoa `#1E1618`, deep moss `#181C18`, dark roast `#1C1810`). Never neutral gray or blue-gray. Text: warm off-white, never pure `#FFFFFF`.

### 7.3 Typography: "Bubble Tea" System 🧋 [Brief 2]

| Role    | Font          | Weight                                                | Notes                                                                                             |
| ------- | ------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Heading | **Baloo 2**   | SemiBold 600 (H1), Medium 500 (H2–H3)                 | Rounded, bouncy. Created by Ek Type (Mumbai). **Native Devanagari** in 11 scripts. Variable font. |
| Body    | **Nunito**    | Regular 400, Medium 500                               | Excellent readability 14–16px. Rounded terminals. Used by Duolingo.                               |
| Accent  | **Comfortaa** | Bold 700 (streak numbers), Medium 500 (mascot speech) | Geometric rounded. Beautiful numbers for streak counters.                                         |

**Permanently banned fonts:** Inter, Roboto, DM Sans, Poppins, Open Sans, Montserrat, Space Grotesk.

**Font loading for PWA:** Self-host via `@fontsource-variable` (not Google Fonts CDN) for offline support. Cache in service worker. Subset with pyftsubset (60–70% size reduction).

### 7.4 Animation & Micro-Interactions [Brief 2]

**Standard kawaii easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` — soft overshoot mimicking squishy physics.

| Context                        | Duration    | Pattern                                          |
| ------------------------------ | ----------- | ------------------------------------------------ |
| Task completion                | 600–800ms   | Check draws 400ms, scales to 110%, settles 200ms |
| Streak celebration (milestone) | 1500–2000ms | Burst → particles spread → fade                  |
| Sprint results reveal          | 800–1200ms  | Progressive bar fill with bounce overshoot       |
| Button press                   | 100–200ms   | Scale to 0.95, return to 1.0 with bounce         |
| Character idle loop            | 2000–4000ms | Gentle vertical bob, blink every 3–4s, 24fps     |
| Page transitions               | 200–400ms   | Outgoing fades 150ms, incoming starts at 100ms   |

**Lottie rules:** dotLottie format (80–90% smaller). Under 150KB JSON. 24–30fps (never 60fps on mobile). Canvas renderer for performance. Lazy-load with IntersectionObserver.

**Component design tokens [Brief 2]:**

| Token                   | Value                                                                   |
| ----------------------- | ----------------------------------------------------------------------- |
| Border radius (buttons) | `9999px` (pill)                                                         |
| Border radius (cards)   | `20px`                                                                  |
| Border radius (inputs)  | `16px`                                                                  |
| Minimum touch target    | `44×44px`                                                               |
| Shadow (elevated)       | `0 8px 32px rgba(primary, 0.08)` — warm-tinted, never `rgba(0,0,0,...)` |
| Content padding         | `20px`                                                                  |
| Tab bar height          | `64px + safe-area-inset-bottom`                                         |

**Buttons feel squishy:** Bottom "ledge" shadow disappears on press while `translateY` moves button down and `scale` compresses. Bouncy easing on release.

### 7.5 Mascot & Character Design [Brief 2 — NEW]

**One shared creature, not two separate characters.** Research: brands with mascots see 37% higher recall; mascot-driven onboarding reduces drop-off by 25%. A single shared mascot reinforces "we're in this together." Two mascots risk uncomfortable comparisons.

**Design Specifications:**

- Species: unique — NOT cat (Hello Kitty), NOT bird (Finch), NOT owl (Duolingo). Consider: small cloud creature, mochi, or custom fantasy animal with one exaggerated trait (oversized ears, curl antenna, tiny scarf)
- Head-to-body ratio: 2.5:1 to 3:1
- Eyes: simple dots in lower 40% of head
- Mouth: minimal or absent (Hello Kitty's emotional blank canvas principle)
- Maximum 5–6 colors per character
- Line weight: consistent 2.5–3px
- Recognizable from silhouette alone

**Expression States (NEVER punish):**

- Idle/Neutral: gentle blink, slight sway, breathing
- Happy/Celebrating: confetti, sparkles, bouncing (when either partner completes a task)
- Encouraging: bright eyes, leaning forward ("Whenever you're ready!")
- Sleepy/Cozy: yawning, curled up (during low-activity — cute, not guilt-inducing)
- Excited/Milestone: jumping, spinning, stars
- Partner sync celebration: special animation when both complete tasks same day

**Emotional Attachment Mechanics:**

- Joint hatching ceremony during onboarding (both partners present)
- Both choose the name together
- Growth tied to combined effort — evolves through life stages based on couple's collective habits
- Develops preferences based on couple's patterns over weeks
- Stores milestone memories ("Remember that 30-day streak in January?")
- Celebrates the anniversary of app usage
- Collectible outfits and accessories earned through joint consistency

---

## 8. Technical Architecture Overview

```
┌─────────────────────────────────────────────┐
│              PWA (Frontend)                  │
│  ┌──────────┐  ┌──────────────────────────┐  │
│  │ UI Layer │  │    Service Worker         │  │
│  │ (Kawaii) │  │ (Push + Offline Cache)    │  │
│  │ Baloo 2  │  │ VAPID subscription [B5]  │  │
│  │ Lottie   │  │ Font caching             │  │
│  └──────────┘  └──────────────────────────┘  │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           Supabase (Backend)                │
│  ┌──────────┐  ┌──────────────────────────┐  │
│  │ Postgres │  │     Realtime             │  │
│  │ (Data)   │  │ (Live partner updates)   │  │
│  └──────────┘  └──────────────────────────┘  │
│  ┌──────────┐  ┌──────────────────────────┐  │
│  │   Auth   │  │    Edge Functions         │  │
│  │ (2 users)│  │ (AI Bridge + Push Send)  │  │
│  └──────────┘  └──────────────────────────┘  │
│  ┌──────────┐  ┌──────────────────────────┐  │
│  │ pg_cron  │  │   push_subscriptions     │  │
│  │ (Sched.) │  │ (VAPID endpoints) [B5]   │  │
│  └──────────┘  └──────────────────────────┘  │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│          Claude API (LLM) [Brief 4]         │
│                                             │
│  ┌─ HAIKU 4.5 (routine, ~$0.40/MTok) ────┐  │
│  │ • Daily greetings & encouragement      │  │
│  │ • Notification copy generation         │  │
│  │ • Mood check-in responses              │  │
│  │ • Task suggestion generation           │  │
│  └────────────────────────────────────────┘  │
│                                             │
│  ┌─ SONNET 4.5 (complex reasoning) ──────┐  │
│  │ • Sprint judging & scoring             │  │
│  │ • Punishment date planning             │  │
│  │ • Excuse evaluation (legit vs lazy)    │  │
│  │ • Mood pattern analysis & insights     │  │
│  │ • Adaptive personality responses       │  │
│  └────────────────────────────────────────┘  │
│                                             │
│  System prompt: cached prefix (~1500 tok)   │
│  + dynamic mood overlay + function block    │
│  Estimated cost: ~£2-4/month for 2 users    │
└─────────────────────────────────────────────┘
```

**Key Supabase Tables (Updated):**

| Table                 | Purpose                                                          | Key Fields                                                |
| --------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| `users`               | Profiles, preferences, food/dietary info                         | hard_nos, mild_discomforts, preferences [Brief 3]         |
| `tasks`               | All tasks (deadline + recurring), with implementation intentions | if_trigger, then_action [Brief 1]                         |
| `sprints`             | Weekly sprint metadata, scores, winner                           | tier_points_earned, relative_performance_index [Brief 3]  |
| `sprint_tasks`        | Junction: tasks → sprints                                        | difficulty_rating (hybrid AI+user) [Brief 3]              |
| `mood_entries`        | Mood check-ins with adaptive depth                               | feeds_into AI mood selection [Brief 4]                    |
| `push_subscriptions`  | VAPID endpoints per device                                       | endpoint, p256dh, auth, user_agent [Brief 5]              |
| `notification_queue`  | Scheduled notifications with escalation state                    | urgency, category, escalation_level [Brief 5]             |
| `punishments`         | AI-generated date plans                                          | intensity_tier, vetoes_granted, date_history_id [Brief 3] |
| `date_history`        | Venue/cuisine/activity tracking for variety                      | 8-week non-repeat window [Brief 3]                        |
| `streaks`             | Individual + mutual streak tracking                              | couple_rescue_available, milestone_floor [Brief 3]        |
| `tier_progress`       | Tier Points per user                                             | current_tp, current_tier, prestige_level [Brief 3]        |
| `relationship_health` | Automated signal logs                                            | signal_type, intervention_taken [Brief 3]                 |
| `appreciation_notes`  | Weekly pre-score appreciation entries                            | required before score reveal [Brief 3]                    |
| `relationship_xp`     | Permanent, never-resetting growth counter                        | total_xp, timeline_entries [Brief 1]                      |

---

## 9. Research Briefs — Completed ✅

All six deep research sessions are complete. The briefs are stored as project files and referenced throughout this document via **[Brief N]** notation.

| Brief | Title                                         | Status      | Key Contribution to This Document                                                               |
| ----- | --------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| 1     | Psychological Warfare Against Procrastination | ✅ Complete | Six psychological engines, 10 dark pattern mechanics, guardrails, graduated sanctions           |
| 2     | Anti-AI-Slop Design System                    | ✅ Complete | Three palettes, Bubble Tea typography, animation specs, mascot design, component patterns       |
| 3     | Gamification Engine                           | ✅ Complete | Reweighted scoring, Tier Points system, streak mechanics, catch-up, anti-toxicity, date engine  |
| 4     | Adaptive AI Personality                       | ✅ Complete | Kira personality, three-layer model, system prompt architecture, cost estimates, cultural voice |
| 5     | PWA Push Notifications                        | ✅ Complete | VAPID architecture, iOS limitations, Supabase Edge Functions, escalation scheduling             |
| 6     | Competitive Analysis                          | ✅ Complete | Blue-ocean validation, feature prioritization, monetization strategy, design benchmarking       |

---

## 10. Key Decisions — Updated Status

| Decision                     | Status                                                                              | Resolution                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| App name                     | **✅ Resolved: "Jugalbandi"**                                                       | Aman & Mukta                                                                   |
| Frontend framework           | **✅ Resolved: React + Vite + Tailwind CSS v4**                                     | Fast HMR, tree-shaking, PWA via vite-plugin-pwa; Tailwind v4 for design tokens |
| AI character name            | **✅ Resolved: "Kira"**                                                             | Per Brief 4 — sharp, warm, occasionally savage                                 |
| AI mascot/character design   | **✅ Resolved: Mochi** — visual design in progress (2/5+ expression states)         | Idle + Happy Bounce done; more states coming [Brief 2]                         |
| Scoring formula              | **✅ Resolved: 30/20/30/15/5** with hybrid difficulty and logarithmic streaks       | Per Brief 3                                                                    |
| Color palette                | **✅ Resolved: Strawberry Milk (default)** + Matcha Latte + Honey Biscuit as themes | Per Brief 2                                                                    |
| Typography                   | **✅ Resolved: Bubble Tea system** (Baloo 2 + Nunito + Comfortaa)                   | Per Brief 2                                                                    |
| Notification architecture    | **✅ Resolved: VAPID + Supabase Edge Functions + pg_cron**                          | Per Brief 5                                                                    |
| Notification copy/tone       | **✅ Framework set:** Kira personality + mood selector → copy generation            | Per Briefs 1, 4                                                                |
| Dark mode design             | **✅ Resolved: warm-tinted dark backgrounds** per palette                           | Per Brief 2                                                                    |
| Punishment intensity scaling | **✅ Resolved: Mild / Moderate / Spicy** based on margin of victory                 | Per Briefs 1, 3                                                                |
| Monetization                 | **Direction set: one-time purchase £4.99–6.99**                                     | Per Brief 6                                                                    |
| Feature prioritization       | **✅ Resolved:** table-stakes vs differentiators vs v2                              | Per Brief 6                                                                    |

---

## 11. Immediate Next Steps

1. ~~**Run all 6 Deep Research briefs**~~ ✅ **DONE**
2. ~~**Review this updated ideation document**~~ ✅ **DONE**
3. ~~**Make pending decisions:**~~ ✅ **DONE** — App name: Jugalbandi, Framework: React + Vite + Tailwind CSS v4, Mascot: Mochi
4. **Begin Phase 0 implementation:**
   - Initialize React + Vite project with Tailwind CSS v4
   - Set up Supabase project (database schema from §8)
   - Generate VAPID keys and set up push notification infrastructure
   - Continue Mochi expression states (3+ more needed)
5. **Design implementation:**
   - Implement Strawberry Milk palette as Tailwind theme tokens
   - Set up Baloo 2 + Nunito + Comfortaa font loading with service worker caching
   - Create component library with kawaii design tokens from Brief 2

---

## 12. Constraints & Guardrails

- **Budget:** Graduated: £20–30 (mild loss) to £100 max (blowout loss) per punishment date **[Brief 3]**
- **AI cost:** ~£2–4/month for two users with prompt caching **[Brief 4]**
- **Users:** 2 (Aman & Mukta), designed to potentially expand to friends later
- **Location data:** City-level only (Sheffield, UK) — no precise GPS
- **Personal data:** Full access (food prefs, budget, health goals, hobbies, mood data)
- **Building approach:** Vibe coding — AI does heavy lifting, Aman & Mukta guide
- **Timeline:** No hard deadline — quality over speed
- **Schedule:** Users active 9 AM – 1 AM, no notifications outside this window
- **Mood data:** Fully shared between both users
- **Ethics:** Dark patterns used FOR the users' benefit, with explicit consent and comprehensive anti-toxicity guardrails **[Briefs 1, 3]**
- **Relationship safety:** Gottman's 5:1 ratio enforced; RelationshipHealthMonitor active; mandatory grace periods; opt-out without shame always available **[Briefs 1, 3]**
- **iOS requirement:** Users must add PWA to home screen for push notifications to work **[Brief 5]**
- **Retention design:** Interpersonal stakes are the antidote to the 2-month gamification decay curve — partner accountability outlasts any notification system **[Brief 6]**

---

_This document is a living reference. All six research briefs are complete and incorporated. Next phase: development planning._

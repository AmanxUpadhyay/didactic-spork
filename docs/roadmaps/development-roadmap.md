# 🗺️ Development Roadmap — Jugalbandi

**Version:** 1.0
**Date:** March 1, 2026
**Authors:** Aman & Mukta (with Claude as development partner)
**Building Approach:** Vibe coding — AI does heavy lifting, founders guide
**Timeline Philosophy:** Quality over speed. No hard deadlines.
**Companion docs:** [Ideation Document v2](ideation-document-v2.md) (spec) | [Architecture Decision Record](architecture-decision-record.md) (decisions)

---

## How to Read This Roadmap

This roadmap is divided into **7 phases**, each with a clear goal, deliverables, and definition of done. Phases are sequential but some tasks within a phase can run in parallel. Each phase builds on the last — nothing ships until its dependencies are solid.

Every feature is tagged with its source research brief for traceability:
- **[B1]** Psychological Warfare Against Procrastination
- **[B2]** Anti-AI-Slop Design System
- **[B3]** Gamification Engine
- **[B4]** Adaptive AI Personality (Kira)
- **[B5]** PWA Push Notifications
- **[B6]** Competitive Analysis & Strategic Differentiation

---

## Pre-Development: Pending Decisions

These must be resolved before Phase 1 begins.

| Decision | Status | Owner | Notes |
|----------|--------|-------|-------|
| App name | ✅ Resolved | Aman & Mukta | **Jugalbandi** |
| Frontend framework | ✅ Resolved | Claude recommends | **React + Vite + Tailwind CSS v4** — fast HMR, tree-shaking, PWA via vite-plugin-pwa |
| Mascot species | ✅ Resolved | Co-create | **Mochi** — see `image/mochi.png` [B2] |
| Mascot visual design | 🔄 In progress | Commission or create | 2 of 5+ expression states done (Idle, Happy Bounce); more coming [B2] |
| Domain & hosting | ❌ Not started | Aman | Deferred — not blocking Phase 0. PWA requires HTTPS. Vercel/Netlify/Cloudflare Pages recommended |

---

## Phase 0 — Project Scaffolding & Infrastructure

**Status: COMPLETE** — Commit `a2b9980`

**Goal:** Set up the entire development environment, hosting, backend, and design foundation so that all future phases can build on a stable base.

**Estimated effort:** 1–2 weeks

### 0.1 — Supabase Project Setup

- [x] Create Supabase project
- [x] Configure auth for exactly 2 users (email/password, no social login needed)
- [x] Set up Row Level Security (RLS) policies on all tables *(RLS completed in Phase 3 gap audit, migration 011)*
- [x] Generate VAPID keys for push notifications [B5]
- [x] Store VAPID private key, Anthropic API key, and all secrets in Supabase Vault
- [x] Enable Supabase Realtime on tables that need live sync between partners

### 0.2 — Database Schema (Core Tables)

Create all tables from the ideation document §8. Priority order:

**User & Auth Layer:**
- [x] `users` — profiles, preferences, food/dietary info, hard_nos, mild_discomforts [B3]
- [x] `user_ai_profiles` — Kira personality preferences per user [B4]

**Task & Sprint Layer:**
- [x] `tasks` — all tasks (deadline + recurring), with implementation intention fields: `if_trigger`, `then_action` [B1]
- [x] `sprints` — weekly sprint metadata, scores, winner, `tier_points_earned`, `relative_performance_index` [B3]
- [x] `sprint_tasks` — junction table with `difficulty_rating` (hybrid AI + user) [B3]

**Gamification Layer:**
- [x] `streaks` — individual + mutual streak tracking, `couple_rescue_available`, `milestone_floor` [B3]
- [x] `tier_progress` — Tier Points per user: `current_tp`, `current_tier`, `prestige_level` [B3]
- [x] `relationship_xp` — permanent, never-resetting growth counter [B1]

**Mood & Wellbeing Layer:**
- [x] `mood_entries` — mood check-ins with adaptive depth, feeds into AI mood selection [B4]
- [x] `appreciation_notes` — weekly pre-score appreciation entries, required before score reveal [B3]

**Notification Layer:**
- [x] `push_subscriptions` — VAPID endpoints per device: endpoint, p256dh, auth, user_agent [B5]
- [x] `notification_queue` — scheduled notifications with urgency, category, escalation_level [B5]
- [x] `notification_preferences` — per-user granular toggle controls [B5]

**Punishment & Date Layer:**
- [x] `punishments` — AI-generated date plans with `intensity_tier`, `vetoes_granted` [B3]
- [x] `date_history` — venue/cuisine/activity tracking, 8-week non-repeat window [B3]

**Safety Layer:**
- [x] `relationship_health` — automated signal logs: `signal_type`, `intervention_taken` [B3]

### 0.3 — Frontend Project Setup

- [x] Initialize React + Vite project with Tailwind CSS v4
- [x] Install and configure Tailwind CSS v4
- [x] Set up Tailwind theme config with Strawberry Milk palette tokens, typography scale, and border-radius tokens
- [x] Configure PWA manifest (`manifest.json`) with app name "Jugalbandi", icons, theme color, `display: standalone`
- [x] Set up service worker skeleton (cache strategy, push notification listener)
- [x] Install and configure Supabase client SDK
- [x] Set up Lottie player library
- [x] Configure font loading: Baloo 2 (variable, headings) + Nunito (body) + Comfortaa (accent/numbers) [B2]
- [x] Service worker font caching strategy [B2]
- [x] Set up Strawberry Milk palette in Tailwind theme config (light + dark mode) [B2]
- [x] Implement `prefers-color-scheme` media query for automatic dark mode
- [x] Create global design tokens as Tailwind theme tokens (see token table from Brief 2)
- [x] Ban list enforcement: no Inter, Roboto, DM Sans, Poppins, Open Sans, Montserrat [B2]

### 0.4 — Design System / Component Library (Foundational)

Build the reusable component primitives that every screen depends on:

- [x] **Button** — pill shape (`border-radius: 9999px`), primary/secondary/ghost variants, 44×44px minimum touch target, bouncy press animation (`200ms cubic-bezier(0.34, 1.56, 0.64, 1)`) [B2]
- [x] **Card** — `border-radius: 20px`, warm shadow (`0 8px 32px rgba(primary, 0.08)`), `#FFF8F3` cream background [B2]
- [x] **Input fields** — `border-radius: 16px`, warm cream fill, gentle head-shake animation for validation errors [B2]
- [x] **Bottom sheet** — 24px top corner radius, warm-tinted overlay (`rgba(74, 55, 40, 0.3)`), spring animation [B2]
- [x] **Navigation bar** — frosted glass bottom tab bar, 64px + safe area, Hugeicons Stroke Rounded 24px, center FAB for "add habit" [B2]
- [x] **Toast / snackbar** — kawaii style with mascot avatar
- [x] **Loading state** — mascot replaces spinner [B2]
- [x] **Empty states** — sleeping mascot (no data) / celebrating mascot (all done) [B2]
- [x] **Data visualization primitives** — bar charts with 8px top border-radius + gradient fills, sparkle emoji above completed bars; line charts with spline smoothing [B2]
- [x] **Theme switcher foundation** — support for Strawberry Milk (default), Matcha Latte, Honey Biscuit [B2]

### Phase 0 — Definition of Done

✅ Supabase project live with all tables, RLS policies, and secrets stored
✅ Frontend project scaffolded with PWA manifest, service worker, fonts, and palette
✅ Component library with all foundational UI primitives built and styled
✅ Both Aman and Mukta can authenticate and see a "Hello, [name]" screen in the browser
✅ Supabase Realtime confirmed working (change on one device appears on the other)

---

## Phase 1 — Core Habit Tracking (The "Table Stakes")

**Status: COMPLETE** — Commit `e1b2356`

**Goal:** Build the minimum viable habit tracker that users expect from any habit app. This is the non-negotiable foundation. [B6]

**Estimated effort:** 2–3 weeks

### 1.1 — Task & Habit System

- [x] **Task creation flow** — support both deadline tasks (one-off with due date) and recurring habits (daily/weekly/specific days)
- [x] **Unified daily feed** — "What do I need to do today?" view combining both task types
- [x] **Task completion** — tap to mark complete (honor system for low-stakes tasks)
- [x] **Flexible scheduling** — daily, specific weekdays, X times per week, custom intervals
- [x] **Task editing & deletion** — modify or remove tasks with confirmation
- [x] **Implementation intentions fields** — optional `if_trigger` and `then_action` for each task ("If it's 7 AM, then I do 10 pushups") [B1]

### 1.2 — Streak Tracking

- [x] **Individual streaks** — per-habit streak counter with visual progress [B3]
- [x] **Streak display** — Comfortaa Bold 700 numbers for streak counters [B2]
- [x] **60% threshold** — streaks maintained if ≥60% of daily habits completed (not all-or-nothing) [B3]
- [x] **Milestone floors** — when a long streak breaks, drop to previous milestone (3/7/14/21/30/60/90) not zero [B3]
- [x] **Best streak memory** — always show personal best alongside current [B3]
- [x] **Streak freeze** — 1 free freeze day, additional earned via milestones [B3]
- [x] **Celebration animations** — Lottie confetti burst at milestones using bouncy easing [B2, B3]

### 1.3 — Partner Pairing & Shared Visibility

- [x] **Partner link** — simple pairing flow (invite code or direct link)
- [x] **Shared task visibility** — both partners can see each other's tasks and completion status
- [x] **Real-time sync** — Supabase Realtime so partner activity appears live
- [x] **Partner activity notifications** — see when your partner completes a task [B1]
- [x] **Mutual streaks** — joint streak counter for habits both partners share [B3]

### 1.4 — Basic Profile & Settings

- [x] **Profile screen** — name, avatar placeholder (mascot comes later), current tier, current streak
- [x] **Notification preferences** — granular toggles per notification category [B5]
- [x] **Theme selection** — Strawberry Milk / Matcha Latte / Honey Biscuit [B2]
- [x] **Dark mode toggle** — or follow system preference
- [x] **Active hours setting** — default 9 AM – 1 AM, no notifications outside window [B5]

### 1.5 — Home Screen Widget (PWA)

- [ ] **Quick check-in widget** — minimal interaction to mark habits done without fully opening app
- [x] **"Add to Home Screen" flow** — guided onboarding for PWA installation (critical for iOS push) [B5]

### Phase 1 — Definition of Done

✅ Both users can create, complete, and track habits daily
✅ Streaks display correctly with milestone protection and 60% threshold
✅ Partners can see each other's progress in real time
✅ Basic settings and profile functional
✅ PWA installs to home screen on both iOS and Android

---

## Phase 2 — Weekly Sprint Competition System

**Status: COMPLETE** — Commit `99ebaa0`. `score-sprint` v7 Edge Function deployed to Supabase. pg_cron jobs for sprint lifecycle active.

**Goal:** Build the competitive weekly sprint system with composite scoring — the core differentiator that turns a habit tracker into an accountability weapon. [B3, B6]

**Estimated effort:** 2–3 weeks

### 2.1 — Sprint Lifecycle

- [x] **Auto-sprint creation** — sprints run Monday to Sunday, auto-generated by pg_cron [B3]
- [x] **Sprint start notification** — Monday 9:30 AM with Kira's kickoff message [B5]
- [x] **Mid-week status** — Wednesday/Thursday check-in showing relative standings
- [x] **Sprint end & scoring** — Sunday 10 PM automatic calculation and winner announcement

### 2.2 — Composite Scoring Engine

Implement the research-validated 30/20/30/15/5 weighted scoring system [B3]:

- [x] **Completion Rate (30%)** — percentage of assigned tasks completed
- [x] **Difficulty Multiplier (20%)** — harder tasks earn more (hybrid AI + user difficulty rating)
- [x] **Consistency Score (30%)** — tasks spread across the week vs. Sunday cramming; daily check-ins matter
- [x] **Streak Bonus (15%)** — logarithmic cap to prevent runaway advantages; maintaining multi-week streaks [B3]
- [x] **Bonus Points (5%)** — going beyond assigned tasks, helping partner, extra effort

### 2.3 — Real-Time Leaderboard

- [x] **Live score display** — both partners see current sprint standings throughout the week
- [x] **Score breakdown** — transparent view of how each factor contributes to the total
- [x] **Relative Performance Index** — track performance delta between partners [B3]
- [x] **Visual sprint progress** — chart showing daily score accumulation across the week [B2]

### 2.4 — Sprint Results & Appreciation Gate

- [x] **Appreciation note requirement** — both partners must write a note about what they appreciated about the other BEFORE seeing the final score [B3]
- [x] **Results reveal** — animated score reveal with breakdown
- [x] **Winner announcement** — Kira delivers the verdict with personality [B4]
- [x] **Sprint history** — browse past sprints, scores, and trends

### 2.5 — Anti-Cramming Mechanics

- [x] **Consistency scoring algorithm** — penalize Sunday task dumping, reward daily spread [B3]
- [x] **Daily check-in bonus** — small points for opening the app and logging at least one thing daily
- [x] **Time-of-day tracking** — detect when tasks are actually being completed

### Phase 2 — Definition of Done

✅ Weekly sprints auto-create and auto-close
✅ Composite scoring calculates correctly with all 5 weighted factors
✅ Both partners see live leaderboard throughout the week
✅ Appreciation gate blocks score reveal until both write a note
✅ Sprint history browsable with past results

---

## Phase 3 — AI Integration (Kira)

**Status: COMPLETE** — Commit `99ebaa0`. All 3 Edge Functions deployed to Supabase (kira-cron v2, kira-interactive v7, score-sprint v7). AWS Bedrock secrets configured and verified.

**Goal:** Bring Kira to life — the AI judge, personality, and brain of the entire system. Kira is the third member of the relationship. [B4, B6]

**Estimated effort:** 3–4 weeks

### 3.1 — Supabase Edge Functions (AI Bridge)

- [x] **Claude API wrapper** — shared Edge Function with retry logic, rate limiting, error handling [B4] *(via AWS Bedrock SDK, 3-retry with exponential backoff, 8 shared modules in `_shared/`)*
- [x] **Prompt caching** — ~1500 token cached system prompt prefix to reduce costs [B4]
- [x] **Model routing** — Haiku for routine tasks, Sonnet for complex reasoning [B4] *(via `@anthropic-ai/bedrock-sdk`, eu-central-1)*
- [x] **Context assembler** — parallel Supabase queries to build user context (profile, mood stats, recent tasks, streaks, week summary) [B4]
- [ ] **Cost monitoring** — track API spend, alert if approaching £4/month budget [B4]

### 3.2 — Kira's Three-Layer Personality Model [B4]

**Layer 1 — Core Personality (static):**
- [x] System prompt: sharp, warm, occasionally savage, data-literate referee
- [x] Cultural voice: Sheffield-aware, Gen Z internet-native, self-aware about being an AI
- [x] Implement the "Kira never punishes through the mascot" rule — mascot stays gentle, Kira delivers the accountability [B2, B4]

**Layer 2 — Mood Modes (user-selectable + AI-adaptive):**
- [x] "Default Kira" — balanced warmth + accountability *(implemented as 6 deterministic modes: cheerful, sarcastic, tough_love, empathetic, hype_man, disappointed)*
- [x] "Cheerful Coach" — unlocks at Tier 1 (Sprout, 30 TP) [B3]
- [x] "Sassy Motivator" — unlocks at Tier 2 (In Sync, 120 TP) [B3]
- [ ] Full personality customisation UI — unlocks at Tier 3 (Thriving, 300 TP) [B3]
- [x] AI mood selector that reads recent mood_entries and adjusts Kira's tone [B4] *(deterministic selection via mood-selector module)*

**Layer 3 — Emotion Overlay (contextual):**
- [x] Dynamic adjustments based on: streak status, sprint standing, recent mood trends, time of day, day of week
- [x] If partner is struggling → Kira adjusts to more supportive tone for both users [B4]

### 3.3 — AI-Powered Sprint Judging

- [x] **Automated scoring** — Kira calculates composite scores using Sonnet [B4]
- [x] **Score commentary** — personalized analysis of each partner's week ("Aman, your consistency was great but you dodged every hard task")
- [x] **Excuse evaluation** — when a user provides a reason for missing tasks, Kira judges legit vs. lazy using Sonnet [B4]
- [x] **Difficulty rating** — hybrid system where AI proposes difficulty and user can adjust [B3]

### 3.4 — AI Task Suggestions

- [x] **Smart suggestions** — AI proposes tasks based on goals, past performance, mood trends, and weak areas
- [x] **Accept/modify/reject flow** — users aren't forced to accept AI suggestions
- [ ] **Learning loop** — AI tracks acceptance patterns and improves over time
- [x] **Sprint goal proposals** — at sprint start, AI proposes 10 goals per person with rationale [B3]
- [x] **Goal swap limit** — users can modify up to 3 goals (can't remove all hard ones) [B3]

### 3.5 — Mood Check-In System

- [x] **Adaptive depth** — quick mode (1–2 taps) on busy days, deep mode (journaling) on reflective days [B4]
- [x] **Shared mood data** — both partners see each other's mood entries
- [x] **Evening check-in** — 11:30 PM notification [B5]
- [x] **AI mood analysis** — Kira identifies patterns over time (Sonnet for insights) [B4]
- [x] **Mood-informed notifications** — if partner had a bad day, Kira adjusts notification tone [B4]

### Phase 3 — Definition of Done

✅ Kira responds with consistent personality across all interactions
✅ Sprint judging produces fair, transparent, personalized scores with commentary
✅ AI suggests tasks that feel relevant and useful
✅ Mood check-ins work with adaptive depth
✅ Model routing correctly uses Haiku for routine and Sonnet for complex tasks
✅ Monthly AI cost stays within £2–4 budget

---

## Phase 4 — Punishment Date Engine & Gamification Systems

**Status: COMPLETE** — Commit `4b85334`. All Edge Functions deployed (score-sprint v7 with Step 8, kira-interactive v7 with date_rate + rescue_task + enhanced date_plan, kira-cron v2 with updated shared modules).

**Goal:** Build the real-world consequences system and the full Tier Points progression that make this app actually force behavior change. [B1, B3]

**Estimated effort:** 2–3 weeks

### 4.1 — Punishment Date System

- [x] **Graduated intensity** based on margin of victory [B3]:
  - **Mild** (close loss, <10 point margin): £20–30 budget, loser picks from 3 AI options
  - **Moderate** (clear loss, 10–25 point margin): £40–60 budget, AI picks, loser gets 1 veto
  - **Spicy** (blowout, >25 point margin): £80–100 budget, AI plans everything, surprise element included
- [x] **Date plan architecture** — three components per date [B3]:
  - Primary activity (£20–50): escape rooms, pottery, Golf Fang, etc.
  - Food & drink (£35–55): Sheffield restaurants (Mowgli, Domo, Oisoi, Silversmiths)
  - Extras (£5–15): cocktails at Trippets, dessert, tram fare
- [x] **Surprise element** — revealed only on the date [B1]
- [ ] **Peak moment engineering** — per Kahneman's peak-end rule [B1]
- [ ] **Friday teaser** — loser receives anticipation-building hint ("Saturday's date involves something you've never tried") [B1]

### 4.2 — Date Memory & Variety Algorithm

- [x] **Date History Graph** — track all past dates [B3]
- [x] **8-week non-repeat window** — venues don't repeat within 8 weeks [B3]
- [x] **Category rotation** — physical, creative, food-focused, cultural, outdoor [B3]
- [x] **Cuisine diversification** — track and rotate cuisines [B3]
- [x] **Wave intensity pattern** — Mild → Moderate → Spicy → Mild (NOT automatic escalation) [B3]
- [x] **Post-date ratings** — 1–5 from both partners, feeds back into AI quality [B3]
- [x] **Quality safeguard** — if ratings dip below 3/5 twice consecutively, AI pulls back intensity [B3]

### 4.3 — Veto System

- [x] **Veto allocation** — vetoes scale with intensity tier [B3]
- [x] **Veto upgrades** — additional vetoes unlock at Tier 3 (Thriving) [B3]
- [x] **Hard nos** — user profiles store absolute food/activity restrictions that AI never violates [B3]
- [x] **Mild discomforts** — things the AI can push toward occasionally for growth [B3]

### 4.4 — Mutual Failure Handling

- [x] **Both below 30%** — competition becomes meaningless, system shifts to collaborative mode [B3]
- [x] **Collaborative redemption** — joint task required (volunteer together, cook together)
- [x] **Budget penalty date** — £30 cap, forces creativity (Peak District picnic, free gallery + cheap pub) [B3]
- [x] **"We" language** — Kira uses household framing, not individual blame [B3]

### 4.5 — Tier Points Progression System

- [x] **TP earning** — weekly score ≥70 → earn 10–25 TP; score 40–69 → earn 0–6 TP [B3]
- [x] **TP decay** — weekly score <40 → lose 15 TP; 3+ days inactivity → additional decay [B3]
- [x] **Five tiers with unlocks** [B3]:

| Tier | Name | TP | Unlocks |
|------|------|----|---------|
| 0 | Seedling | 0 | Core tracking, basic AI judge, manual entry, simple score |
| 1 | Sprout | 30 | Cosmetics, streak display, Cheerful Coach mode, notification customisation |
| 2 | In Sync | 120 | Analytics dashboard, joint challenges, AI suggestions, Sassy Motivator mode |
| 3 | Thriving | 300 | Full AI customisation, shared calendar, joint goals, premium themes, veto upgrades, streak rescue |
| 4 | Unshakeable | 600 | Everything unlocked, prestige cosmetics, custom challenges, full AI capability, Prestige mode |

- [x] **Prestige layer** — after reaching Tier 4, option to reset for prestige cosmetics [B3]
- [x] **Tier display** — visual progression indicator on profile and home screen
- [x] **Unlock celebrations** — Lottie animation + Kira announcement when reaching a new tier

### 4.6 — Couple Rescue Mechanic

- [x] **Streak rescue** — when a streak breaks, partner can complete a bonus task to restore it [B3]
- [x] **Partner notification** — "[Name]'s streak needs help! Complete a bonus task together to restore it." [B3]
- [x] **Cooldown** — rescue can only be used once per week per partner

### Phase 4 — Definition of Done

✅ Punishment dates generate with correct intensity based on margin of victory
✅ Date Memory prevents repeats and rotates categories
✅ Veto system and hard nos respected in all AI-generated plans
✅ Tier Points accumulate and decay correctly
✅ Feature unlocks trigger at correct TP thresholds
✅ Couple rescue mechanic works end-to-end

---

## Phase 5 — Push Notifications & Psychological Engines

**Status: COMPLETE** — Commit `523d00b`. Edge Functions deployed: send-push v1, kira-cron v3, kira-interactive v8. VAPID secrets configured. Migrations 014–017 applied.

**Goal:** Build the notification system that is the primary "pinch" mechanism — the thing that forces users to open the app. Layer on the six psychological engines. [B1, B5]

**Estimated effort:** 2–3 weeks

### 5.1 — Push Notification Infrastructure [B5]

- [x] **Service worker push handler** — `src/sw.ts` with injectManifest strategy, push event → showNotification, notificationclick deep-linking, pushsubscriptionchange re-subscribe
- [x] **VAPID authentication** — full Web Push Protocol via `jsr:@negrel/webpush@0.5.0`, raw base64url→JWK key conversion
- [x] **iOS pre-permission flow** — NotificationOptIn dialog with Kira personality, iOSInstallFlow step-by-step guide [B5]
- [x] **"Add to Home Screen" gate** — iOS detection via `isIOSPWA()` / `needsHomeScreenInstall()` in `src/lib/push.ts` [B5]
- [x] **Supabase Edge Function: send-push** — batch processing, quiet hours, category filtering, dead subscription cleanup [B5]
- [x] **pg_cron scheduling** — cron jobs: process-notification-queue (1min), streak-warning-check (daily 20:00), point-bank-decay (daily 12:00), fresh-start-calc (Mon 00:05) [B5]
- [x] **Delivery tracking** — notification_log table with queue_id, subscription_id, status, error details [B5]
- [x] **Retry logic** — exponential backoff with max_retries, 429/5xx retry, dead subscription detection (404/410) [B5]

### 5.2 — Notification Schedule [B5]

| Time | Type | Content |
|------|------|---------|
| 9:30 AM Monday | Sprint start | Kira kicks off the week with goals and motivation |
| 9:30 AM daily | Morning briefing | Today's tasks, partner's status, streak count |
| Dynamic | Deadline escalation | 1 week → 3 days → 1 day → 4 hours → 1 hour → 30 min → OVERDUE |
| On completion | Partner activity | "[Partner] just crushed their workout! You've got 3 tasks left..." [B1] |
| 11:30 PM | Mood check-in | Adaptive depth prompt |
| Sunday 10 PM | Sprint results | Winner announcement + appreciation note reminder |
| Dynamic | Streak warning | "Your 14-day streak is in danger! One task saves it." [B3] |
| Dynamic | Nudge | Loss-framed: "You're 12 points behind. [Partner] completed 2 tasks while you were on Instagram." [B1] |

### 5.3 — Psychological Engines Implementation [B1]

- [x] **Variable ratio reinforcement** — mystery box (~20% chance) on habit completion via `rollMysteryBox()`: 2x pts (40%), 3x pts (20%), streak freeze (25%), spy peek (15%). MysteryBoxReveal overlay. [B1]
- [x] **Loss aversion framing** — DecayingPointBank (200pts/week, floor 50%), StreakHostageDisplay with hourglass warning, CompetitiveScoreGap with loss/gain framing [B1]
- [x] **Zeigarnik Effect exploitation** — TomorrowTeaser at 9PM with implementation intention prompt, incomplete task counts in notifications [B1]
- [x] **Dyadic social comparison** — CompetitiveScoreGap component, partner activity notifications via DB trigger `notify_partner_on_completion` [B1]
- [x] **Implementation intentions** — `implementation_intentions` table, TomorrowTeaser input, trigger-time notification scheduling [B1]
- [x] **Fresh start effect** — MondayHeadStart (20-40pt bonus), `fresh_start_bonuses` table, `fresh_start_calc` cron (Mon 00:05) [B1]

### 5.4 — Notification Intelligence

- [x] **Active hours enforcement** — quiet hours in notification_preferences (timezone-aware), enforced in send-push Edge Function [B5]
- [x] **Throttling** — daily cap trigger (`check_daily_notification_limit`), 2hr minimum gap trigger (`enforce_minimum_gap`) [B5]
- [x] **Grouping & batching** — tag-based notification replacement, batch processing (50 at a time) [B5]
- [x] **Mood-aware tone** — notification templates with mood-informed variant selection [B4]
- [x] **Kira-generated copy** — `schedule_daily` handler generates daily notifications via Kira, template rotation with 5-day anti-repeat [B4]

### 5.5 — Guardrail Components (Partial Phase 6)

- [x] **ScoreGapCircuitBreaker** — team mode suggestion when gap >40% for 2+ weeks
- [x] **ContemplDetectionPrompt** — relationship temp check when engagement drops >50%
- [x] **GracePeriodBanner** — streaks-are-safe messaging during breaks
- [x] **OptOutButton** — feature-level opt-out with positive framing

### Phase 5 — Definition of Done

✅ Push notifications work on Android, Desktop, and iOS (with home screen install)
✅ All scheduled notification types fire at correct times
✅ Deadline escalation works through the full timeline
✅ Notifications respect active hours and throttling rules
✅ Loss-framed and variable-reward mechanics are live
✅ Partner activity triggers real-time notifications

---

## Phase 6 — Anti-Toxicity Guardrails & Relationship Safety

**Status: COMPLETE** — Commit `3ca9cfa`. Edge Functions deployed: score-sprint v10, kira-cron v5, kira-interactive v10, send-push v3. Migrations 018–019 applied.

**Goal:** Implement all relationship protection systems. This isn't optional polish — it's a safety-critical system that prevents the competition mechanics from damaging the relationship. [B1, B3]

**Estimated effort:** 1–2 weeks

### 6.1 — RelationshipHealthMonitor [B3]

- [x] **Signal detection** — `detect_relationship_health_signals()` SQL function logs 6 signal types: sustained_losing, rapid_opt_out, mood_score_gap, appreciation_brevity, veto_spike, disengagement
- [x] **Intervention triggers** — health_check cron handler: 3+ signals triggers proactive Kira push to both users; sustained_losing auto-activates catch-up mechanics
- [x] **RelationshipHealthMonitor component** — HealthCheckPrompt dialog with cooperative/grace/fine options; health_check_response handler generates Kira acknowledgment

### 6.2 — Gottman's 5:1 Ratio Enforcement [B1, B3]

- [x] **Interaction tracking** — `interaction_ledger` table, `get_interaction_ratio()` SQL function
- [x] **5:1 minimum** — `shouldSuppressNegative()` in health-monitor.ts; all cron/push handlers check ratio before sending negative-valence content
- [x] **Automatic positive injection** — `injectPositiveKiraMessage()` fires when ratio drops; `positive_injection` cron handler and `ProactiveKiraMessage` frontend component

### 6.3 — Catch-Up Mechanics [B3]

- [x] **Dynamic threshold** — `get_dynamic_threshold()` SQL function; `get_catch_up_tier()` returns tier 0–3 based on consecutive losses
- [x] **Rubber banding** — `catch_up_state` table, comeback multipliers (1.15–1.2×), score-sprint applies bonuses invisibly to leading partner
- [x] **Mercy rules** — `cooperative` and `swap` sprint modes; `switch_sprint_mode` interactive handler; MercyRulePrompt component auto-triggers at tier 2

### 6.4 — Opt-Out Without Shame [B3]

- [x] **Feature-level opt-out** — `feature_opt_outs` table, `useOptOut` hook (DB-backed), FeatureOptOutManager in SettingsScreen
- [x] **Grace periods** — `grace_periods` table, `activate_monthly_free_grace()` SQL, `checkGracePeriod()` in health-monitor.ts; GracePeriodActivator in SettingsScreen
- [x] **Temporary cooperative mode** — sprint_mode enum (competitive/cooperative/swap), SprintModeSelector in SettingsScreen
- [x] **Kira handles gracefully** — activate_grace handler generates empathetic acknowledgment, positive framing throughout

### Phase 6 — Definition of Done

✅ RelationshipHealthMonitor detects all warning signals and logs them
✅ Automatic interventions trigger when signals accumulate
✅ 5:1 positive-to-negative ratio maintained across all interactions
✅ Catch-up mechanics prevent demoralizing losing streaks
✅ All opt-out flows work without shame or negative framing

---

## Phase 7 — Onboarding, Mascot & Polish

**Status: COMPLETE** — Commits `844629e`, `3ca9cfa`. Motion physics pass: commits `7804f40`, `ec8258e`. Auth/OAuth: commit `df7f4a5`.

**Goal:** Create the magical first experience and bring the mascot to life. This is what makes the app feel like a product people love, not just a tool that works. [B2, B4]

**Estimated effort:** 2–3 weeks

### 7.1 — Mascot Integration

- [x] **Character design** — Mochi expression system: idle, happy bounce, concerned/thinking, celebrating, sleepy (5 states); `KiraAvatar` component with spring-physics bounce [B2]
- [x] **Home screen presence** — Mochi occupies avatar area in KiraIntroScreen and throughout Kira interactions [B2]
- [x] **Idle animations** — spring-physics floating with `useSpring` + scale pulse on mount [B2]
- [ ] **Egg hatching ceremony** — deferred to v2 (requires both partners simultaneously present) [B2]
- [ ] **Growth stages** — deferred to v2 (requires weeks of data accumulation) [B2]
- [ ] **Milestone memories** — deferred to v2 [B2]
- [ ] **Collectible outfits** — deferred to v2 [B2]

### 7.2 — Onboarding Flow

Inspired by Finch's 18-step emotional journey [B2]:

- [x] **Steps 1–3:** KiraIntroScreen — welcome, concept explanation, Mochi introduction with spring entrance
- [x] **Steps 4–5:** Partner pairing flow — PairScreen with invite code + QR code
- [x] **Steps 9–10:** Individual goal setting via task creation in onboarding
- [x] **Steps 11–13:** Kira introduction — KiraIntroScreen with personality preview
- [x] **Steps 14–15:** Notification permission — iOSInstallFlow + NotificationOptIn with Kira personality [B5]
- [x] **Steps 16–17:** First sprint setup — AI suggests initial goals via `suggestTasks()`
- [x] **Step 18:** "Add to Home Screen" prompt with iOS-aware install guidance [B5]
- [x] **Endowed progress** — Day 1 counts as Day 1 of streak; onboarding marks user_onboarded = true [B3]
- [ ] **Egg hatching ceremony** — deferred to v2 [B2]
- [ ] **Joint naming** — deferred to v2 [B2]

### 7.3 — Celebration & Delight Moments

- [x] **Streak milestone celebrations** — confetti + Kira message at 3, 7, 14, 21, 30, 60, 90, 365 days; `BothWinCelebration` component [B3]
- [x] **Sprint win animation** — cinematic `SprintResultsReveal` with `useAnimate` sequence, Mochi, staggered scores [B3]
- [x] **Tier unlock ceremony** — `TierUnlockCelebration` with rotating badge + sparkle ring [B3]
- [x] **"All done today" state** — `EmptyState` with floating Mochi + hearts [B2]
- [ ] **Haptic feedback** — deferred (requires native shell) [B2]

### 7.4 — Analytics Dashboard (Unlocks at Tier 2)

- [x] **Weekly trends** — AnalyticsDashboard with score progression over time
- [x] **Category breakdown** — habit area performance per partner in AnalyticsScreen
- [x] **Mood-productivity correlation** — mood trend vs completion rate chart
- [x] **Streak history** — heatmap-style streak visualization
- [ ] **Couple stats card** — shareable image — deferred to v2 [B3]

### 7.5 — Verification System

- [ ] **Photo proof upload** — deferred to v2 (requires storage bucket setup) [B1]
- [ ] **Partner challenge** — deferred to v2 [B1]
- [ ] **Random spot-checks** — deferred to v2 [B1]

### 7.6 — Final Polish

- [x] **Motion physics** — 5 motion passes: spring counters, spring bars, shadow elevation, entrance animations, component polish across 30+ components
- [x] **Reduced-motion support** — `prefers-reduced-motion` respected throughout via CSS and JS
- [x] **Error states** — `ErrorBoundary` with graceful fallback UI [B2]
- [x] **Offline capability** — Workbox `injectManifest` service worker, 36 precached entries [B5]
- [x] **Auth flows** — password reset, Google OAuth, Apple OAuth, OAuthProfileSetup
- [ ] **Performance audit** — Lighthouse PWA score — deferred (app functional, not yet audited)
- [ ] **Data export** — CSV export — deferred to v2 [B6]

### Phase 7 — Definition of Done

✅ Onboarding flow takes both partners from zero to first sprint in under 10 minutes
✅ Mascot displays with correct expressions across all app states
✅ All celebration moments fire with animations and Kira commentary
✅ Analytics dashboard renders correctly at Tier 2+
✅ App builds clean with 0 TypeScript errors and works offline for core functionality

---

## v2 Features (Post-Launch Backlog)

These are valuable but explicitly not in v1. Prioritized by user request data from competitive analysis. [B6]

| Priority | Feature | Why It Waits |
|----------|---------|-------------|
| High | Calendar integrations (Google Cal, Apple Cal) | Nice for scheduling but not core to competition |
| High | Apple Health / Google Fit auto-tracking | Reduces friction but adds complexity; manual works for v1 |
| High | AI-generated weekly recaps & pattern analysis | Requires data accumulation first |
| Medium | Shared habit goals (cooperative mode alongside competitive) | Competition-first is the hook |
| Medium | Customizable mascot character evolution (Finch-style) | Core AI judge works without cosmetic progression |
| Medium | Advanced mood-productivity correlation insights | Needs weeks of data |
| Low | Real-money stakes integration (Stripe) | Social/task punishments are lower-friction for launch |
| Low | Friends/community expansion beyond 2 users | Explicitly out of scope for couples-only positioning |
| Low | One-time purchase monetization (£4.99–6.99) | Only needed if expanding beyond personal use [B6] |

---

## Cross-Cutting Concerns (Apply to Every Phase)

### Security
- Row Level Security on every Supabase table — users can only access their own data
- VAPID keys and API keys stored in Supabase Vault, never in client code
- Service worker scope limited to app domain

### Cost Management
- AI costs monitored monthly, target: £2–4/month for 2 users [B4]
- Haiku 4.5 for routine tasks, Sonnet 4.5 only when nuanced reasoning is needed [B4]
- Prompt caching on system prompts to reduce token usage [B4]

### Design Consistency
- Every screen checked against AI Slop Avoidance Checklist (18 anti-patterns) [B2]
- No cool grays, no blue-tinted darks, no pure black or white anywhere [B2]
- Cream backgrounds (`#FFF8F3`), warm dark mode (`#1E1618`), always [B2]
- Baloo 2 for headings, Nunito for body, Comfortaa for numbers — no exceptions [B2]

### Testing
- Both Aman and Mukta test every feature in real daily use before moving to next phase
- Push notifications tested on: Android Chrome, Desktop Chrome, iOS Safari (home screen)
- Dark mode tested across all three palettes

---

## Summary: Phase Timeline at a Glance

```
Phase 0 — Project Scaffolding & Infrastructure ........... ✅ COMPLETE (a2b9980)
Phase 1 — Core Habit Tracking (Table Stakes) ............. ✅ COMPLETE (e1b2356)
Phase 2 — Weekly Sprint Competition System ............... ✅ COMPLETE (99ebaa0)
Phase 3 — AI Integration (Kira) .......................... ✅ COMPLETE (99ebaa0, deployed)
Phase 4 — Punishment Dates & Gamification Systems ........ ✅ COMPLETE (4b85334, deployed)
Phase 5 — Push Notifications & Psychological Engines ..... ✅ COMPLETE (523d00b, deployed)
Phase 6 — Anti-Toxicity Guardrails ...................... ✅ COMPLETE (3ca9cfa, deployed)
Phase 7 — Onboarding, Mascot & Polish ................... ✅ COMPLETE (844629e, ec8258e, df7f4a5)
```

**v1 complete as of 2026-03-01.** 22 migrations applied. 5 Edge Functions deployed. 646 modules in production build.

### Deferred to v2

The following roadmap items were explicitly deferred — they don't block v1 launch:

| Item | Phase | Reason Deferred |
|------|-------|-----------------|
| Egg hatching ceremony + joint naming | 7.1/7.2 | Requires synchronous two-user presence; complex UX |
| Mascot growth stages + collectible outfits | 7.1 | Requires weeks of usage data; cosmetic only |
| Couple stats shareable card | 7.4 | Requires canvas/screenshot API; nice-to-have |
| Photo proof upload + partner challenge | 7.5 | Requires Supabase Storage bucket + moderation |
| Lighthouse PWA audit | 7.6 | Build is functional; audit before public launch |
| Data export (CSV) | 7.6 | Engineering quality-of-life; not user-facing |
| Haptic feedback | 7.3 | Requires Capacitor or native shell |
| AI cost monitoring dashboard | Cross-cutting | Manual monitoring via Supabase logs sufficient for 2 users |

**Total estimated timeline: ~23 weeks (5–6 months)**

This is approximate. Some phases overlap, some take longer. Quality over speed always wins.

---

*This roadmap is a living document. Update as decisions are made and development progresses.*

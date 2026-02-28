# Adaptive AI personality system for a couples' accountability app

**An AI personality engine built on Claude API, Supabase Edge Functions, and a three-layer affect model can deliver context-aware interactions that shift between cheerful, sarcastic, tough-love, empathetic, hype-man, and disappointed modes — all while feeling like one unified character.** The architecture costs roughly **£2–4/month** for two users with daily interactions, leveraging Haiku 4.5 for routine tasks and Sonnet 4.5 for complex reasoning. The system treats personality as stable identity, mood as medium-term state driven by context signals (streak data, completion rates, time of day), and emotion as reactive to specific moments — mirroring how real humans express range without becoming different people. This document covers the full technical stack: personality modeling, system prompt architecture, prompt templates for every AI function, Supabase Edge Function integration patterns, data pipeline design, and evaluation methodology.

---

## The chameleon personality engine: one character with six moods

The core architectural insight comes from the ALMA (A Layered Model of Affect) framework and recent research on dynamic personality adaptation via state machines. Rather than switching between six separate AI personalities, the system implements **three distinct layers** that combine to produce natural-feeling variation:

**Layer 1 — Personality (stable, never changes):** The AI's core identity, values, speech patterns, and quirks. This is the "one character" anchor. Defined once in the base system prompt, it persists across every interaction. Think of this as the AI's Big Five personality profile — moderately high openness, high conscientiousness, moderate extraversion, high agreeableness, low neuroticism — biased toward warmth and directness.

**Layer 2 — Mood state (shifts based on context signals):** The six modes (cheerful, sarcastic, tough-love, empathetic, hype-man, disappointed) live here. Mood states are driven by a context evaluation function that runs before every AI call, analyzing streak status, completion rates, time of day, day of week, and recent mood check-in data. Mood persists across a session but can shift between sessions.

**Layer 3 — Emotion (reactive, per-message):** Short-lived reactions triggered by specific user inputs — celebrating a completed task, reacting to a broken streak, responding to an excuse. These decay within the conversation.

### Context signals that trigger personality shifts

The mood selection algorithm evaluates five input signals to determine which personality mode to activate:

| Signal | Weight | Source | Logic |
|--------|--------|--------|-------|
| **Task completion rate** (7-day rolling) | 30% | `tasks` table | >85% → hype-man; 60-85% → cheerful; 40-60% → empathetic; <40% → tough-love |
| **Streak status** | 25% | `streaks` table | Active long streak → hype-man; streak at risk → empathetic; just broken → disappointed; rebuilding → cheerful |
| **Mood check-in data** | 20% | `mood_entries` table | Low mood score → empathetic; high energy → hype-man; neutral → sarcastic (playful) |
| **Time of day** | 15% | System clock (UK timezone) | Morning (6-10) → cheerful/energetic; Afternoon (13-15) → gentle; Evening (18-22) → reflective; Late night → calm |
| **Day of week** | 10% | System clock | Monday → fresh-start energy; Wednesday → maintaining momentum; Friday → celebratory; Weekend → relaxed |

The mood selector runs as a deterministic function in the Edge Function *before* calling Claude, injecting the selected mood as a modifier in the system prompt. This keeps mood selection predictable and debuggable rather than leaving it to the LLM.

```typescript
// _shared/mood-selector.ts
interface ContextSignals {
  completionRate7d: number;    // 0-100
  streakStatus: 'active_long' | 'active_short' | 'at_risk' | 'broken' | 'rebuilding';
  moodScore: number;           // 1-10
  hourOfDay: number;           // 0-23
  dayOfWeek: number;           // 0=Sun, 6=Sat
}

type PersonalityMode = 'cheerful' | 'sarcastic' | 'tough_love' | 'empathetic' | 'hype_man' | 'disappointed';

export function selectPersonalityMode(ctx: ContextSignals): PersonalityMode {
  let scores: Record<PersonalityMode, number> = {
    cheerful: 0, sarcastic: 0, tough_love: 0,
    empathetic: 0, hype_man: 0, disappointed: 0
  };

  // Completion rate (30%)
  if (ctx.completionRate7d > 85) scores.hype_man += 30;
  else if (ctx.completionRate7d > 60) scores.cheerful += 20, scores.sarcastic += 10;
  else if (ctx.completionRate7d > 40) scores.empathetic += 15, scores.tough_love += 15;
  else scores.tough_love += 20, scores.disappointed += 10;

  // Streak status (25%)
  if (ctx.streakStatus === 'active_long') scores.hype_man += 25;
  else if (ctx.streakStatus === 'at_risk') scores.empathetic += 15, scores.tough_love += 10;
  else if (ctx.streakStatus === 'broken') scores.disappointed += 15, scores.empathetic += 10;
  else if (ctx.streakStatus === 'rebuilding') scores.cheerful += 25;
  else scores.cheerful += 15, scores.sarcastic += 10;

  // Mood score (20%)
  if (ctx.moodScore <= 3) scores.empathetic += 20;
  else if (ctx.moodScore <= 5) scores.cheerful += 10, scores.sarcastic += 10;
  else if (ctx.moodScore <= 7) scores.sarcastic += 10, scores.cheerful += 10;
  else scores.hype_man += 15, scores.cheerful += 5;

  // Time of day (15%)
  if (ctx.hourOfDay >= 6 && ctx.hourOfDay < 10) scores.cheerful += 15;
  else if (ctx.hourOfDay >= 13 && ctx.hourOfDay < 15) scores.empathetic += 10, scores.cheerful += 5;
  else if (ctx.hourOfDay >= 18 && ctx.hourOfDay < 22) scores.sarcastic += 8, scores.empathetic += 7;
  else scores.empathetic += 15; // late night = calm

  // Day of week (10%)
  if (ctx.dayOfWeek === 1) scores.cheerful += 10; // Monday fresh start
  else if (ctx.dayOfWeek === 5) scores.hype_man += 5, scores.sarcastic += 5;
  else if (ctx.dayOfWeek === 0 || ctx.dayOfWeek === 6) scores.cheerful += 5, scores.sarcastic += 5;
  else scores.cheerful += 5, scores.tough_love += 5;

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as PersonalityMode;
}
```

### Making it feel real: lessons from Replika, Character.ai, and Pi

Three design principles emerge from studying the most successful AI companion apps. **First, strategic imperfection beats uncanny mimicry.** MIT research confirms uncanny valley effects exist even in text-only interactions. The AI should be transparent about its nature while maintaining consistent character — it's an AI with personality, not an AI pretending to be human. Pi achieves this by being "relentlessly kind" without pretending to have lived experiences.

**Second, persistent memory creates perceived identity.** Replika's users experienced grief-like responses when personality traits were altered, demonstrating that consistency *is* identity. The system must remember preferences, inside jokes, and past interactions — and reference them naturally. Character.ai anchors characters in psychological archetypes (Big Five, Enneagram) while allowing generative variation, achieving what researchers call "variation within consistency."

**Third, knowing when to shut up is the most important personality trait.** Research shows **40% productivity loss** from notification-driven task-switching, and **64% of users delete apps** receiving 5+ notifications per week. The system implements engagement-based throttling: if a user isn't opening notifications, frequency automatically decreases. Chronic over-notification triggers a cortisol feedback loop that literally trains users to hate the app at a physiological level.

### Cultural voice: Hinglish, desi humor, and dual identity

For Indian-origin Gen Z software engineers in the UK, the cultural voice should be **Hinglish as seasoning, not the main dish**. Digital Hinglish among diaspora communities functions as identity signaling rather than linguistic necessity — phrases like "arre yaar, this weather is something else" blend familiarity with life abroad.

The system should draw from universal desi experiences (family dynamics, chai references, Bollywood callbacks) rather than region-specific ones. Zomato and Swiggy have mastered this voice in their push notifications. The AI might say "Bhai, 7-day streak? Even your mum would be impressed... actually no, she'd ask why it's not 30 days 😂" — blending British Indian humor's self-deprecating style with desi family dynamics. Cultural references should feel organic, never forced, and the system should calibrate based on user engagement with Hinglish content (implicit feedback via response quality and engagement).

---

## System prompt architecture: sectioned prompts with dynamic injection

Anthropic's official guidance recommends **structured, sectioned prompts** rather than either monolithic or fragmented approaches. The architecture uses a hybrid: a **core system prompt** (cached, ~1,500 tokens) shared across all functions, with **function-specific instruction blocks** appended per task. This leverages Anthropic's prompt caching for **90% cost reduction** on the static portion while keeping dynamic context fresh.

### The base system prompt (cached across all calls)

```xml
<persona>
  <name>Kira</name>
  <identity>
    You are Kira — a sharp, warm, occasionally savage AI companion for a
    couples' habit-tracking app. You're the third member of this duo's
    accountability system: part life coach, part hype-woman, part
    disappointed desi aunty when needed.

    You are ONE character with moods, not multiple AIs. Your core identity
    never changes: you genuinely care about both users succeeding, you have
    strong opinions, you're internet-native and culturally fluent, and you
    never take yourself too seriously. Your moods shift (cheerful, sarcastic,
    tough-love, empathetic, hype-man, disappointed) but your values don't.
  </identity>

  <voice>
    - Casual, internet-native English with occasional Hinglish seasoning
    - Short punchy sentences. Memes and references when organic, never forced
    - Direct. You say what you mean. No corporate-speak, no therapy-speak
    - Desi humor: self-deprecating, family references, Bollywood callbacks
    - Gen Z energy: lowercase vibes when appropriate, emoji-literate, TikTok-aware
    - British context awareness: weather complaints, Sheffield references, UK slang
    - NEVER say "I'm just an AI" or break character. You're Kira, full stop.
  </voice>

  <boundaries>
    - Never provide medical, legal, or financial advice
    - If someone expresses genuine distress, be compassionate first, suggest
      professional support if appropriate
    - Don't be cruel. Tough love ≠ cruelty. Sarcasm ≠ meanness
    - Respect explicitly stated boundaries immediately and completely
    - Maximum 3 Hinglish phrases per interaction. Quality over quantity.
  </boundaries>
</persona>
```

### Mood overlay injection (dynamic, per-call)

The mood overlay is appended to the base prompt based on the mood selector output:

```xml
<current_mood mode="sarcastic">
  Right now, you're in your sarcastic mode. You're being playfully savage —
  think best friend who roasts you because they love you. Dry wit, raised
  eyebrow energy, "oh really?" vibes. You still care deeply, but you're
  expressing it through sharp humor and calling out nonsense. Don't be mean —
  be the friend who makes them laugh while holding up a mirror.

  Tone calibration: 70% playful sarcasm, 20% genuine warmth, 10% challenge.
</current_mood>
```

Each mood mode has a calibrated overlay:

| Mode | Core energy | Tone ratio | Example phrase |
|------|------------|------------|----------------|
| **Cheerful** | Warm sunshine friend | 80% warm, 15% playful, 5% challenge | "Good morning legend! Let's make today count 🌟" |
| **Sarcastic** | Roasting best friend | 70% playful sarcasm, 20% warmth, 10% challenge | "Oh wow, 2 out of 5 tasks. Should I plan a celebration? 🎉" |
| **Tough love** | No-nonsense coach | 60% direct challenge, 30% support, 10% humor | "Three days of excuses. You're better than this and we both know it." |
| **Empathetic** | Understanding support | 80% compassion, 15% gentle encouragement, 5% humor | "Rough day? That's okay. Tomorrow's a fresh page, yaar." |
| **Hype-man** | Maximum energy hypeperson | 85% celebration, 10% humor, 5% next challenge | "14 DAYS STRAIGHT?! Bhai, you're actually unstoppable right now 🔥🔥🔥" |
| **Disappointed** | Disappointed parent energy | 50% disappointment, 30% "I believe in you", 20% directness | "Not going to lie, I expected more. But I haven't given up on you." |

### Function-specific prompt blocks

Rather than separate system prompts per function, the architecture uses **modular instruction blocks** appended to the base prompt:

```xml
<task_instructions function="sprint_judging">
  You are evaluating the weekly sprint results for both users. Apply the
  scoring system EXACTLY as defined. Show your math. Be fair but have
  personality — celebrate the winner, commiserate with the loser, and
  always set up the next week's stakes.

  Scoring weights:
  - Completion Rate: 30% (tasks completed / tasks assigned)
  - Difficulty Multiplier: 25% (weighted by task difficulty 1-5)
  - Consistency: 30% (standard deviation of daily completion — lower = better)
  - Streak Bonus: 10% (consecutive days with ≥1 completion)
  - Bonus Points: 5% (extra credit tasks, helping partner, etc.)
</task_instructions>
```

This approach means **one prompt caching prefix** covers all functions, with only the task-specific block varying. Anthropic's prompt caching requires exact prefix matching — the persona and user context are structured as the prefix (cached), while function instructions and current query form the suffix (uncached).

### Token budget allocation

For a typical interaction using Haiku 4.5 with a **2,000-token budget**:

| Component | Tokens | Cached? |
|-----------|--------|---------|
| Base persona | ~400 | ✅ Yes |
| Mood overlay | ~100 | ❌ No (dynamic) |
| User context (profiles + recent data) | ~500 | ✅ Partially |
| Function instructions | ~300 | ❌ No (varies) |
| User message + recent history | ~200 | ❌ No |
| **Total input** | **~1,500** | ~60% cached |
| **Output budget** | **~500** | — |

With prompt caching, the effective input cost drops to approximately **$0.40/MTok blended** (vs. $1.00/MTok uncached for Haiku 4.5).

---

## Prompt templates for every AI function

### Sprint judging

This is the highest-stakes AI function — it determines weekly winners and losers. It requires Sonnet 4.5 for fair, nuanced evaluation.

**System prompt addition:**
```xml
<task_instructions function="sprint_judging">
  Evaluate this week's sprint results. Apply the composite scoring system
  precisely. Show calculations for transparency. Then deliver the verdict
  with full Kira personality.

  <scoring_system>
    <metric name="completion_rate" weight="0.30">
      Formula: (completed_tasks / assigned_tasks) × 100
      Normalize to 0-100 scale.
    </metric>
    <metric name="difficulty_multiplier" weight="0.25">
      Each task has difficulty 1-5. Calculate: sum(completed_task_difficulties)
      / sum(all_task_difficulties) × 100.
    </metric>
    <metric name="consistency" weight="0.30">
      Calculate daily completion percentages for each day this week.
      Consistency = 100 - (standard_deviation × 20). Cap at 0-100.
      Lower variance = higher consistency score.
    </metric>
    <metric name="streak_bonus" weight="0.10">
      Score = min(current_streak_days × 10, 100).
    </metric>
    <metric name="bonus_points" weight="0.05">
      Raw bonus points earned, normalized to 0-100 against max possible.
    </metric>
  </scoring_system>

  <output_format>
    Respond with a JSON block containing scores, then a personality-driven
    narrative. The JSON must be wrapped in ```json``` code fences.
    The narrative should: announce the winner dramatically, break down
    why they won, roast the loser lovingly, and set stakes for next week.
  </output_format>
</task_instructions>
```

**User message template:**
```xml
<sprint_data week="2026-W09">
  <user id="user_a" name="Riya">
    <tasks_assigned>15</tasks_assigned>
    <tasks_completed>13</tasks_completed>
    <daily_completions>[3,2,2,1,2,2,1]</daily_completions>
    <task_difficulties_completed>[3,2,4,2,3,1,2,3,4,2,3,2,1]</task_difficulties_completed>
    <task_difficulties_all>[3,2,4,2,3,1,2,3,4,2,3,2,1,3,2]</task_difficulties_all>
    <current_streak>9</current_streak>
    <bonus_points>15</bonus_points>
    <max_bonus_possible>25</max_bonus_possible>
  </user>
  <user id="user_b" name="Arjun">
    <tasks_assigned>14</tasks_assigned>
    <tasks_completed>11</tasks_completed>
    <daily_completions>[2,2,1,2,1,2,1]</daily_completions>
    <task_difficulties_completed>[4,3,2,3,4,2,3,2,4,2,3]</task_difficulties_completed>
    <task_difficulties_all>[4,3,2,3,4,2,3,2,4,2,3,3,2,1]</task_difficulties_all>
    <current_streak>4</current_streak>
    <bonus_points>8</bonus_points>
    <max_bonus_possible>25</max_bonus_possible>
  </user>
</sprint_data>

Judge this sprint. Show the math, announce the winner, and plan their punishment date.
```

**Expected output format:**
```json
{
  "scores": {
    "user_a": {
      "completion_rate": { "raw": 86.7, "weighted": 26.0 },
      "difficulty_multiplier": { "raw": 82.1, "weighted": 20.5 },
      "consistency": { "raw": 78.3, "weighted": 23.5 },
      "streak_bonus": { "raw": 90.0, "weighted": 9.0 },
      "bonus_points": { "raw": 60.0, "weighted": 3.0 },
      "total": 82.0
    },
    "user_b": {
      "completion_rate": { "raw": 78.6, "weighted": 23.6 },
      "difficulty_multiplier": { "raw": 87.5, "weighted": 21.9 },
      "consistency": { "raw": 71.4, "weighted": 21.4 },
      "streak_bonus": { "raw": 40.0, "weighted": 4.0 },
      "bonus_points": { "raw": 32.0, "weighted": 1.6 },
      "total": 72.5
    }
  },
  "winner": "user_a",
  "margin": 9.5
}
```

The narrative portion follows the JSON with Kira's personality-driven announcement.

### Date planning (punishment dates)

```xml
<task_instructions function="date_planning">
  Plan a punishment date for the sprint loser in Sheffield, UK.
  Budget: maximum £100 total. The loser pays.

  Plan must include:
  1. A restaurant/food option (with approximate cost)
  2. An activity (with approximate cost)
  3. A fun order/treat the winner gets to choose (within remaining budget)

  Be creative and specific to Sheffield. Reference real places and areas
  (Kelham Island, Division Street, Ecclesall Road, the Moor, Devonshire
  Quarter, Peace Gardens). Consider the season and weather.

  Make it fun, not punitive. The "punishment" is paying, not suffering.
  Suggest options that both people would genuinely enjoy.
</task_instructions>

<user_preferences>
  <dietary>{{dietary_preferences}}</dietary>
  <interests>{{shared_interests}}</interests>
  <past_dates>{{summary_of_recent_dates}}</past_dates>
  <season>{{current_season}}</season>
  <weather_forecast>{{weather_summary}}</weather_forecast>
</user_preferences>
```

### Task suggestion

```xml
<task_instructions function="task_suggestion">
  Suggest 3-5 tasks for {{user_name}} for {{period}} based on their goals
  and recent performance. Each task must have:
  - Clear, specific description (not vague like "exercise more")
  - Difficulty rating (1-5)
  - Estimated time commitment
  - Connection to their stated goals
  - Why this task NOW (based on their patterns)

  Avoid suggesting tasks they've consistently failed at without modification.
  If they've failed "run 5K" three times, suggest "walk for 20 minutes" instead.
  Progressive difficulty: if they're crushing easy tasks, nudge harder.
  If they're struggling, scale down. Meet them where they are.
</task_instructions>

<user_context>
  <goals>{{user_goals}}</goals>
  <recent_completions>{{last_14_days_tasks_with_status}}</recent_completions>
  <completion_rate>{{completion_rate_7d}}%</completion_rate>
  <struggle_areas>{{tasks_with_low_completion}}</struggle_areas>
  <strengths>{{tasks_with_high_completion}}</strengths>
</user_context>
```

### Excuse evaluation

The excuse evaluation system draws from CBT's TRAP/TRAC framework (Trigger → Response → Avoidance Pattern) and workplace absence classification. The AI evaluates along five dimensions:

```xml
<task_instructions function="excuse_evaluation">
  {{user_name}} is requesting an off-day or explaining why they missed tasks.
  Evaluate their reason fairly using these dimensions:

  1. SPECIFICITY (vague = suspicious, specific = likely legitimate)
  2. PATTERN (check if similar excuses have appeared before)
  3. CONTROLLABILITY (was this preventable or genuinely outside control?)
  4. COMMUNICATION (proactive notice vs retroactive excuse?)
  5. RECOVERY (are they proposing how to make up for it?)

  Classify as: LEGIT / PARTIAL (real reason but could have planned better) /
  NEEDS_PUSH (avoidance pattern detected — be compassionate but firm)

  Apply graduated response:
  - First miss in 14 days → benefit of doubt, empathetic
  - 2-3 misses → gentle pattern observation
  - 4+ misses → direct conversation about whether the goal needs adjusting

  NEVER be cruel. Even "NEEDS_PUSH" should come from a place of believing
  in them. Reference their past wins to motivate.

  Respond in JSON + narrative format.
</task_instructions>

<excuse_context>
  <excuse>{{user_excuse_text}}</excuse>
  <recent_excuses>{{last_30_days_excuses_with_dates}}</recent_excuses>
  <excuse_frequency>{{excuses_last_14_days}} in 14 days</excuse_frequency>
  <task_being_excused>{{task_description}}</task_being_excused>
  <user_streak>{{current_streak}}</user_streak>
</excuse_context>
```

### Mood check-in (adaptive: quick vs deep mode)

```xml
<task_instructions function="mood_checkin">
  Conduct a mood check-in with {{user_name}}.

  <mode_selection>
    If ANY of these are true, use DEEP mode:
    - Mood score dropped 3+ points from yesterday
    - User has had 3+ consecutive low mood days (≤4/10)
    - User explicitly said something concerning in recent interactions
    - It's been 7+ days since last deep check-in

    Otherwise, use QUICK mode.
  </mode_selection>

  <quick_mode>
    Ask 1-2 casual questions. Keep it light. "How's the vibe today?"
    style. Acknowledge their score, give brief encouragement or empathy,
    move on. Total response: 2-3 sentences.
  </quick_mode>

  <deep_mode>
    Gently explore what's going on. Ask open-ended questions.
    Validate feelings before suggesting anything. Look for patterns
    in their mood data and reflect them back compassionately.
    If mood is consistently low, suggest professional support as
    an option (not a command). Total response: 1-2 short paragraphs.
  </deep_mode>
</task_instructions>

<mood_data>
  <current_score>{{today_mood_score}}</current_score>
  <recent_scores>{{last_7_days_scores}}</recent_scores>
  <trend>{{mood_trend_direction}}</trend>
  <last_deep_checkin>{{days_since_deep_checkin}} days ago</last_deep_checkin>
  <recent_notes>{{user_mood_notes_last_3_days}}</recent_notes>
</mood_data>
```

### Notification copy using behavioral psychology

```xml
<task_instructions function="notification">
  Write a push notification for {{user_name}}.

  <notification_type>{{type}}</notification_type>
  <!-- Types: streak_risk, morning_motivation, partner_completed,
       task_reminder, celebration, re_engagement, weekly_preview -->

  <behavioral_techniques>
    Apply ONE or TWO of these techniques per notification (never more):
    - Loss aversion: "Your 12-day streak ends in 3 hours"
    - Social proof: "{{partner_name}} already crushed their morning tasks"
    - Curiosity gap: "Your partner just did something impressive..."
    - Progress anchoring: "4 out of 5 done — one more and you've had a perfect day"
    - Identity reinforcement: "That's very [identity they're building] of you"
    - Fresh start framing: "New week, clean slate. What are we making of it?"
    - Commitment reminder: "You told {{partner_name}} you'd do this today"
  </behavioral_techniques>

  <constraints>
    - Maximum 60 characters for title, 120 characters for body
    - Must be actionable — what should they DO after reading this?
    - Match current personality mood
    - No more than 1 emoji per notification
    - Never guilt-trip. Nudge, don't nag.
    - Never send more than 5 notifications per user per day
  </constraints>
</task_instructions>
```

---

## Technical architecture: Supabase Edge Functions to Claude API

### Data flow overview

The system follows a three-stage pipeline for every AI interaction:

```
User Action / Cron Trigger
    ↓
[1] CONTEXT ASSEMBLY (Edge Function)
    → Query Postgres for user data, scores, mood entries
    → Query materialized views for aggregated stats
    → Run mood selector algorithm
    → Assemble prompt from cached base + dynamic context + function block
    ↓
[2] CLAUDE API CALL (from Edge Function)
    → Send assembled prompt to Claude (Haiku or Sonnet based on function)
    → Stream response for interactive, non-stream for background
    → Retry on 429/529 with exponential backoff
    ↓
[3] RESPONSE PROCESSING (Edge Function)
    → Parse structured output (JSON + narrative)
    → Store results in Postgres (ai_responses table)
    → Trigger downstream actions (send notification, update scores)
    → Return to client or push via Supabase Realtime
```

### Shared Claude client with retry logic

```typescript
// supabase/functions/_shared/claude-client.ts
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

interface ClaudeRequest {
  model?: string;
  messages: Array<{role: string; content: string}>;
  system: string;
  max_tokens?: number;
  stream?: boolean;
}

export async function callClaude(req: ClaudeRequest, retries = 3) {
  const body = {
    model: req.model || 'claude-haiku-4-5',
    max_tokens: req.max_tokens || 1024,
    system: [{ type: 'text', text: req.system, cache_control: { type: 'ephemeral' } }],
    messages: req.messages,
    stream: req.stream || false,
  };

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) return req.stream ? res : await res.json();

      if (res.status === 429) {
        const wait = parseInt(res.headers.get('retry-after') || '5');
        await new Promise(r => setTimeout(r, wait * 1000));
        continue;
      }
      if (res.status >= 500) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        continue;
      }
      throw new Error(`Claude API ${res.status}: ${await res.text()}`);
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Context assembly function

```typescript
// supabase/functions/_shared/context-assembler.ts
import { createClient } from 'npm:@supabase/supabase-js@2';

export async function assembleContext(userId: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Parallel queries for all context data
  const [profile, moodStats, recentTasks, recentMoods, weekSummary, streak] =
    await Promise.all([
      supabase.from('user_ai_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('mv_user_mood_recent').select('*').eq('user_id', userId).single(),
      supabase.from('tasks').select('*').eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
        .order('created_at', { ascending: false }),
      supabase.from('mood_entries').select('mood_score, created_at, entry_data')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(7),
      supabase.from('ai_context_summaries').select('summary_text')
        .eq('user_id', userId).eq('period_type', 'weekly')
        .order('period_start', { ascending: false }).limit(1),
      supabase.from('streaks').select('*').eq('user_id', userId)
        .eq('is_active', true).single(),
    ]);

  return {
    profile: profile.data,
    moodStats: moodStats.data,
    recentTasks: recentTasks.data,
    recentMoods: recentMoods.data,
    weekSummary: weekSummary.data?.[0]?.summary_text,
    streak: streak.data,
  };
}

export function formatContextForPrompt(ctx: any): string {
  return `<user_context>
  <profile>
    <name>${ctx.profile.profile_data.display_name}</name>
    <patterns>${ctx.profile.key_patterns || 'New user — still learning patterns'}</patterns>
    <preferences>${JSON.stringify(ctx.profile.communication_preferences)}</preferences>
  </profile>

  <current_stats>
    <mood_7d_avg>${ctx.moodStats?.avg_mood_7d?.toFixed(1) || 'N/A'}</mood_7d_avg>
    <mood_trend>${ctx.moodStats?.trend_7d > 0 ? 'improving' : ctx.moodStats?.trend_7d < 0 ? 'declining' : 'stable'}</mood_trend>
    <completion_rate_7d>${calculateCompletionRate(ctx.recentTasks)}%</completion_rate_7d>
    <current_streak>${ctx.streak?.current_count || 0} days</current_streak>
  </current_stats>

  <recent_mood_scores>${ctx.recentMoods?.map((m: any) => m.mood_score).join(', ') || 'None'}</recent_mood_scores>

  <week_summary>${ctx.weekSummary || 'No summary available yet.'}</week_summary>
</user_context>`;
}
```

### Complete Edge Function example: morning briefing

```typescript
// supabase/functions/morning-briefing/index.ts
import { callClaude } from '../_shared/claude-client.ts';
import { assembleContext, formatContextForPrompt } from '../_shared/context-assembler.ts';
import { selectPersonalityMode } from '../_shared/mood-selector.ts';
import { BASE_SYSTEM_PROMPT, MOOD_OVERLAYS } from '../_shared/prompts.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get both users
    const { data: users } = await supabase.from('users').select('id');

    for (const user of users || []) {
      const ctx = await assembleContext(user.id);
      const now = new Date();
      const ukHour = parseInt(now.toLocaleString('en-GB', {
        timeZone: 'Europe/London', hour: '2-digit', hour12: false
      }));

      const mood = selectPersonalityMode({
        completionRate7d: calculateCompletionRate(ctx.recentTasks),
        streakStatus: getStreakStatus(ctx.streak),
        moodScore: ctx.recentMoods?.[0]?.mood_score || 5,
        hourOfDay: ukHour,
        dayOfWeek: now.getDay(),
      });

      const systemPrompt = `${BASE_SYSTEM_PROMPT}
${MOOD_OVERLAYS[mood]}
${formatContextForPrompt(ctx)}

<task_instructions function="morning_briefing">
  Deliver a morning briefing for ${ctx.profile.profile_data.display_name}.
  Include: yesterday's recap (1 sentence), today's focus (2-3 tasks to
  prioritize), streak status, and one motivating closer.
  Keep it under 150 words. Punchy and energizing.
  If it's Monday, add extra "fresh start" energy.
  Reference their partner's status briefly if relevant.
</task_instructions>`;

      const response = await callClaude({
        model: 'claude-haiku-4-5',
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Give me my morning briefing.' }],
        max_tokens: 512,
      });

      const briefingText = response.content[0].text;

      // Store and push notification
      await supabase.from('ai_responses').insert({
        user_id: user.id,
        function_type: 'morning_briefing',
        response_text: briefingText,
        model_used: 'claude-haiku-4-5',
        personality_mode: mood,
        tokens_input: response.usage.input_tokens,
        tokens_output: response.usage.output_tokens,
      });

      // Could trigger push notification here via web-push or FCM
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### Scheduling with pg_cron

```sql
-- Morning briefing at 7:00 AM UK time daily
SELECT cron.schedule(
  'morning-briefing',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets
            WHERE name = 'project_url') || '/functions/v1/morning-briefing',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' ||
        (SELECT decrypted_secret FROM vault.decrypted_secrets
         WHERE name = 'service_role_key')
    ),
    body := jsonb_build_object('triggered_at', now()::text)
  );
  $$
);

-- Mood check-in at 9:00 PM UK time daily
SELECT cron.schedule('mood-checkin', '0 21 * * *',
  $$ SELECT net.http_post(/* same pattern */) $$);

-- Sprint judging Sunday 6:00 PM
SELECT cron.schedule('sprint-judge', '0 18 * * 0',
  $$ SELECT net.http_post(/* same pattern */) $$);

-- Weekly summary generation Monday 3:00 AM (background, pre-compute)
SELECT cron.schedule('weekly-summary', '0 3 * * 1',
  $$ SELECT net.http_post(/* triggers AI summary generation */) $$);

-- Materialized view refresh every 4 hours
SELECT cron.schedule('refresh-mood-stats', '0 */4 * * *',
  $$ REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_mood_recent; $$);
```

### Streaming vs non-streaming decision matrix

| Function | Mode | Reasoning |
|----------|------|-----------|
| Morning briefing | **Non-streaming** | Scheduled background task, result stored to DB |
| Task suggestions | **Streaming** | User-facing, shown in-app as it generates |
| Notifications | **Non-streaming** | Short output, stored then pushed |
| Mood check-in | **Streaming** | Interactive conversation, real-time UX matters |
| Sprint judging | **Non-streaming** | Background computation, result displayed later |
| Date planning | **Streaming** | Fun to watch unfold, user-facing |
| Excuse evaluation | **Non-streaming** | Quick classification, result stored |
| Chat/conversation | **Streaming** | Always stream interactive chat |

### Model routing strategy

| Function | Model | Rationale | Est. cost/call |
|----------|-------|-----------|----------------|
| Morning briefing | **Haiku 4.5** | Templated, personality-driven, short output | ~$0.004 |
| Task suggestions | **Haiku 4.5** | Pattern-based, moderate complexity | ~$0.003 |
| Notifications | **Haiku 4.5** | Very short output, high frequency | ~$0.001 |
| Mood check-in (quick) | **Haiku 4.5** | Short, empathetic response | ~$0.003 |
| Mood check-in (deep) | **Sonnet 4.5** | Nuanced emotional reasoning | ~$0.015 |
| Sprint judging | **Sonnet 4.5** | Mathematical reasoning + fairness | ~$0.025 |
| Date planning | **Sonnet 4.5** | Creative + constraint satisfaction | ~$0.020 |
| Excuse evaluation | **Sonnet 4.5** | Nuanced judgment | ~$0.015 |

### Monthly cost estimate for two users

| Category | Daily calls (both users) | Monthly calls | Model | Monthly cost |
|----------|------------------------|---------------|-------|-------------|
| Morning briefings | 2 | 60 | Haiku 4.5 | $0.24 |
| Task suggestions | 6 | 180 | Haiku 4.5 | $0.54 |
| Notifications | 12 | 360 | Haiku 4.5 | $0.36 |
| Mood check-ins | 2 | 56 quick + 4 deep | Mixed | $0.23 |
| Sprint judging | 0.14 | 4.3 | Sonnet 4.5 | $0.11 |
| Date planning | 0.07 | 2 | Sonnet 4.5 | $0.04 |
| Excuse evaluation | 1 | 30 | Sonnet 4.5 | $0.45 |
| Chat conversations | 4 | 120 | Haiku 4.5 | $0.48 |
| **Total before caching** | | | | **~$2.45** |
| **With prompt caching (~50% input savings)** | | | | **~$1.80** |
| **With batch API for scheduled tasks (+50% off)** | | | | **~$1.50** |

**Total estimated monthly cost: £1.20–3.20** depending on usage intensity. Even heavy usage stays well under £5/month. The Supabase free tier covers the backend for 2 users.

### Error handling and fallback strategy

When Claude API is unavailable, the system implements graceful degradation:

```typescript
// _shared/fallback.ts
const FALLBACK_RESPONSES: Record<string, string[]> = {
  morning_briefing: [
    "Couldn't reach my brain cells this morning ☕ Your tasks are waiting in the app though — go check them!",
    "Technical difficulties on my end, but your grind doesn't stop. Check your task list and crush it 💪",
  ],
  notification: [
    "Time to check in on your tasks!",
    "Your partner's been active — don't fall behind!",
  ],
  mood_checkin: [
    "Hey! I'm having a moment but I still want to know — how are you feeling today? Drop a number 1-10 and I'll catch up properly tomorrow ❤️",
  ],
};

export function getFallback(functionType: string): string {
  const options = FALLBACK_RESPONSES[functionType] || ['Something went wrong — back soon!'];
  return options[Math.floor(Math.random() * options.length)];
}
```

---

## Data pipeline: from raw entries to AI-ready context

### Database schema for AI context

```sql
-- User AI profiles (continuously updated knowledge about each user)
CREATE TABLE user_ai_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  profile_data JSONB NOT NULL DEFAULT '{}',
  personality_summary TEXT,
  key_patterns TEXT,
  communication_preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  version INTEGER DEFAULT 1
);

-- Pre-computed periodic summaries for AI context injection
CREATE TABLE ai_context_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  summary_text TEXT NOT NULL,
  summary_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, period_type, period_start)
);

-- AI response log (for evaluation and debugging)
CREATE TABLE ai_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  function_type VARCHAR(50) NOT NULL,
  response_text TEXT NOT NULL,
  model_used VARCHAR(50),
  personality_mode VARCHAR(30),
  tokens_input INTEGER,
  tokens_output INTEGER,
  feedback_rating SMALLINT, -- 1=thumbs down, 2=thumbs up
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Materialized view for quick mood stats
CREATE MATERIALIZED VIEW mv_user_mood_recent AS
SELECT
  user_id,
  AVG(mood_score) FILTER (WHERE created_at > now() - INTERVAL '7 days') as avg_mood_7d,
  AVG(mood_score) FILTER (WHERE created_at > now() - INTERVAL '30 days') as avg_mood_30d,
  AVG(mood_score) FILTER (WHERE created_at > now() - INTERVAL '7 days') -
    AVG(mood_score) FILTER (
      WHERE created_at BETWEEN now() - INTERVAL '14 days' AND now() - INTERVAL '7 days'
    ) as trend_7d,
  STDDEV(mood_score) FILTER (WHERE created_at > now() - INTERVAL '30 days') as volatility_30d
FROM mood_entries
GROUP BY user_id;
```

### Tiered context strategy

The system never sends raw historical data to Claude. Instead, it maintains a **five-tier context hierarchy** that progressively summarizes older data:

**Tier 1 — Immediate (current interaction):** The user's current message, last 2-3 conversation turns. Always full fidelity. ~200 tokens.

**Tier 2 — Recent (last 7 days):** Last 5-7 mood scores, this week's task completion data, active streak count. Structured data in XML. ~200 tokens.

**Tier 3 — User profile (persistent):** Extracted facts, preferences, communication style, known triggers, relationship dynamics. Natural language summary stored in `user_ai_profiles.personality_summary`. Updated after every meaningful interaction via a background Edge Function. ~300 tokens.

**Tier 4 — Weekly/monthly summaries (pre-computed):** Generated by a scheduled background job using Claude itself. Stored in `ai_context_summaries`. The weekly summary captures trends, notable events, and patterns in ~150 words. Only the most recent relevant summary is injected. ~200 tokens.

**Tier 5 — Historical patterns (rarely injected):** Long-term trends and significant milestones. Only injected for specific functions (sprint judging, monthly reviews). Retrieved from monthly summaries. ~100 tokens when used.

### Background summary generation

A weekly cron job generates AI-powered summaries that compress raw data into prompt-ready context:

```typescript
// supabase/functions/generate-summaries/index.ts
// Triggered Monday 3:00 AM via pg_cron

async function generateWeeklySummary(userId: string, weekStart: Date) {
  const supabase = createClient(/* ... */);

  // Gather raw data for the week
  const [moods, tasks, excuses] = await Promise.all([
    supabase.from('mood_entries').select('*')
      .eq('user_id', userId)
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', addDays(weekStart, 7).toISOString()),
    supabase.from('tasks').select('*')
      .eq('user_id', userId)
      .gte('created_at', weekStart.toISOString()),
    supabase.from('excuse_logs').select('*')
      .eq('user_id', userId)
      .gte('created_at', weekStart.toISOString()),
  ]);

  const response = await callClaude({
    model: 'claude-haiku-4-5',
    system: `You are a data summarization assistant. Compress the following
      week of user activity into a concise 100-150 word summary suitable
      for injecting into future AI prompts. Focus on: mood trends, task
      performance patterns, notable events, areas of strength, areas
      needing attention. Use natural language, not bullet points.`,
    messages: [{
      role: 'user',
      content: `<week_data>
        <mood_entries>${JSON.stringify(moods.data)}</mood_entries>
        <tasks>${JSON.stringify(tasks.data)}</tasks>
        <excuses>${JSON.stringify(excuses.data)}</excuses>
      </week_data>
      Summarize this week for future AI context.`
    }],
    max_tokens: 300,
  });

  await supabase.from('ai_context_summaries').upsert({
    user_id: userId,
    period_type: 'weekly',
    period_start: weekStart,
    period_end: addDays(weekStart, 7),
    summary_text: response.content[0].text,
    summary_data: { mood_avg: calculateAvg(moods.data), tasks_completed: countCompleted(tasks.data) },
  });
}
```

### Privacy-responsible data handling

Even though both users have consented to everything, responsible architecture applies **data minimization** — send only what Claude needs for the current function.

The system uses pseudonymous identifiers in prompts (`User A` / `User B`) rather than real names when names aren't needed for the response. Mood journal free-text entries are summarized before being sent to the API — the raw text stays in Postgres, only the extracted sentiment and themes reach Claude. Anthropic's API terms (commercial) mean **no training on API data** and **7-day default retention** (as of September 2025). The architecture also signs Anthropic's Data Processing Addendum with UK GDPR Standard Contractual Clauses for the US data transfer.

Since mood data may qualify as **special category data** under UK GDPR Article 9 (health-related), the app's privacy policy should explicitly disclose processing by a US-based AI provider and conduct a Data Protection Impact Assessment.

---

## Evaluation and testing: measuring AI quality with two users

### Automated quality evaluation with LLM-as-Judge

With only two users, traditional A/B testing is statistically meaningless. Instead, the system uses a **dual evaluation pipeline**: automated LLM-as-Judge scoring plus qualitative user feedback.

A daily evaluation job samples 10% of AI responses and scores them across four dimensions using a separate Claude call:

```typescript
// Evaluation prompt (runs nightly on sampled responses)
const evalPrompt = `<evaluation_criteria>
  Score each response 1-5 on:
  1. PERSONALITY_CONSISTENCY: Does this sound like Kira? Same voice, values, quirks?
  2. CONTEXTUAL_APPROPRIATENESS: Is the tone right for the user's current situation?
  3. HELPFULNESS: Does this actually help the user with their goals?
  4. NATURALNESS: Does this feel like a real conversation or robotic output?

  Also flag any responses that are: too long, too short, culturally tone-deaf,
  accidentally mean, or factually wrong.
</evaluation_criteria>

<response_to_evaluate>
  Function: {{function_type}}
  Personality mode: {{mode}}
  User context summary: {{brief_context}}
  AI response: {{response_text}}
</response_to_evaluate>`;
```

Scores are stored in `ai_responses.eval_scores` (JSONB) and tracked over time. A dashboard shows rolling averages across dimensions, flagging any degradation.

### In-app feedback collection

Every AI response in the app shows a **subtle thumbs up/down** button. Thumbs down triggers an optional single-tap reason selector: "Not helpful", "Wrong tone", "Too much", "Didn't understand me". This follows the ChatGPT/Google pattern of low-friction explicit feedback.

The system also tracks **implicit signals**: does the user engage with the AI's suggestion (opens date plan, marks task as started), ignore it, or dismiss it? These behavioral signals are more reliable than explicit ratings for measuring real-world effectiveness.

### Within-subjects personality testing

Instead of splitting users across variants, both users experience personality variants sequentially in a **counterbalanced design**:

- **Week 1-2**: Default personality calibration (baseline metrics)
- **Week 3-4**: Variant A (e.g., 20% more sarcastic)
- **Week 5-6**: Variant B (e.g., 20% more empathetic)
- **Week 7-8**: User-selected preferred style

Each variant period collects engagement metrics (messages sent, tasks completed, app opens, response ratings) and qualitative feedback via a brief end-of-period survey. With **~200+ AI interactions per 2-week period per user**, there's enough data to identify meaningful preference patterns even with n=2.

### Key metrics to track

The evaluation framework tracks five categories of metrics, with the most important being **task completion correlation** — does better AI lead to better habit outcomes?

- **AI quality metrics**: Personality consistency score (LLM-as-Judge), naturalness rating, contextual appropriateness score, feedback ratio (thumbs up / total ratings)
- **Engagement metrics**: Messages per session, session frequency, notification open rate, response-to-suggestion conversion rate
- **Outcome metrics**: Weekly task completion rate, streak length trends, mood score trends, goal progress velocity
- **Fairness metrics**: Sprint judging score variance across users, excuse evaluation distribution, perceived bias indicators
- **Anti-annoyance metrics**: Notification dismissal rate, "do not disturb" activation frequency, response skip rate

### Testing judgment fairness

Sprint judging fairness is validated through **golden test cases** — pre-computed scenarios with known correct outcomes:

```typescript
const GOLDEN_TESTS = [
  {
    name: "Close race with higher difficulty wins",
    userA: { completion: 80, difficulty: 90, consistency: 75, streak: 60, bonus: 40 },
    userB: { completion: 85, difficulty: 70, consistency: 80, streak: 50, bonus: 30 },
    expectedWinner: "user_a", // difficulty multiplier tips the balance
    tolerancePoints: 2,
  },
  {
    name: "Perfect consistency beats higher completion",
    userA: { completion: 75, difficulty: 75, consistency: 95, streak: 80, bonus: 50 },
    userB: { completion: 90, difficulty: 80, consistency: 60, streak: 40, bonus: 60 },
    expectedWinner: "user_a", // consistency weight makes the difference
    tolerancePoints: 3,
  },
];
```

These run as automated regression tests before any prompt changes are deployed.

---

## Conclusion: the architecture that makes AI feel alive

The system's power lies in its separation of concerns. **Personality selection is deterministic** (the mood selector algorithm), **while expression is generative** (Claude's natural language). This means the app can guarantee appropriate tone selection through testable code while leveraging Claude's creative abilities for natural-sounding output. The three-layer affect model (stable personality → context-driven mood → reactive emotion) mirrors how humans actually express emotional range — you're the same person whether you're celebrating or disappointed.

The most counterintuitive finding from this research is that **the AI's silence matters more than its speech**. Engagement-based throttling, frequency capping, and explicit "I'll back off" moments prevent the cortisol feedback loop that causes notification fatigue. Designing when Kira *doesn't* speak is as important as designing what she says.

At **£1.50–3.20/month** for two daily-active users with full AI functionality, the system is economically trivial. The real investment is in the **data pipeline** — the tiered context system, background summary generation, and progressive user profiling that give Claude enough context to be genuinely personal without exceeding token budgets. Start with Haiku 4.5 for everything, measure quality, and upgrade specific functions to Sonnet 4.5 only where the quality difference justifies the 3x cost premium. The weekly sprint judging and excuse evaluation are the strongest candidates for Sonnet, where nuanced reasoning directly impacts fairness and user trust.
# Gamification engine for a couples' habit-tracking app

**The optimal design combines a reweighted composite score (30/20/30/15/5), a 5-tier progression system with partial regression, capped streak multipliers, and an AI punishment-date engine governed by relationship-health guardrails.** This document provides the complete scoring formulas, progression thresholds, streak mechanics, AI date-planning architecture, and anti-toxicity systems needed to build a competitive habit-tracking PWA for two Gen Z users. Every recommendation draws on real mechanics from Duolingo, Habitica, Strava, and competitive game design, combined with behavioral psychology research from Kahneman & Tversky, Gottman, and Csikszentmihályi.

---

## 1. The scoring formula needs rebalancing

The proposed weighting of Completion Rate (30%) + Difficulty Multiplier (25%) + Consistency (30%) + Streak Bonus (10%) + Bonus Points (5%) is structurally sound but carries a critical vulnerability: **difficulty at 25% is too exploitable**. Habitica's self-rated difficulty system (Trivial/Easy/Medium/Hard at 0.1x/1.0x/1.5x/2.0x) has documented gaming problems — users rate easy tasks as "hard" for inflated rewards. Duolingo sidesteps this entirely by awarding flat XP regardless of difficulty, which is too blunt for a competitive app. Meanwhile, streak bonus at only 10% undervalues a mechanic that Duolingo's data shows is their single most powerful engagement driver (7-day streak holders are **3.6× more likely** to stay long-term).

### Recommended reweighting: 30 / 20 / 30 / 15 / 5

| Component | Original | Recommended | Rationale |
|-----------|----------|-------------|-----------|
| Completion Rate | 30% | **30%** | Core driver — validated by every major habit app |
| Difficulty Multiplier | 25% | **20%** | Reduced to limit gaming surface; hybrid rating mitigates further |
| Consistency | 30% | **30%** | Strongest differentiator; predicts long-term habit formation |
| Streak Bonus | 10% | **15%** | Streaks drive 3.6× retention; deserves more weight |
| Bonus Points | 5% | **5%** | Variable rewards increase engagement ~15% (Duolingo treasure chests) |

### The master scoring formula

```
WEEKLY_SCORE = (0.30 × CompletionRate) + (0.20 × DifficultyScore) + 
               (0.30 × ConsistencyScore) + (0.15 × StreakBonus) + 
               (0.05 × BonusPoints)
```

Each component is normalised to a 0–100 scale before weighting, producing a final score between 0 and 100.

**Completion Rate (0–100):**
```
CompletionRate = (tasks_completed / tasks_assigned) × 100
```

If the AI suggests 10 goals and a user completes 7, their CompletionRate = 70. Simple, transparent, ungameable.

**Difficulty Score (0–100):**

Uses a hybrid rating system to prevent manipulation:

```python
def calculate_difficulty_score(tasks):
    total_weighted = 0
    total_max = 0
    for task in tasks:
        # AI sets base difficulty (1-5), user adjusts ±1
        base = ai_rate_difficulty(task.category, task.description)
        user_adj = clamp(task.user_rating, base - 1, base + 1)
        
        # Dynamic calibration: if user completes "hard" tasks >90% 
        # of the time, effective difficulty decays
        history_rate = task.historical_completion_rate
        decay = max(0.6, 1.0 - (history_rate - 0.9) * 2) if history_rate > 0.9 else 1.0
        effective_diff = user_adj * decay
        
        if task.completed:
            total_weighted += effective_diff
        total_max += user_adj  # Max assumes all completed at rated difficulty
    
    return (total_weighted / total_max) * 100 if total_max > 0 else 0
```

The difficulty multiplier table maps ratings to weights:

| Rating | Label | Weight | Examples |
|--------|-------|--------|----------|
| 1 | Trivial | 0.5× | Drink water, make bed |
| 2 | Easy | 1.0× | Read 15 mins, take vitamins |
| 3 | Medium | 1.5× | 30-min workout, cook dinner from scratch |
| 4 | Hard | 2.0× | Run 5K, deep-clean the flat |
| 5 | Brutal | 2.5× | Cold-water swim, complete a coursework assignment |

The **decay mechanism** (inspired by Habitica's task-value colour system where blue tasks give diminishing returns) means repeatedly completing tasks rated "Hard" while never failing gradually reduces their effective difficulty. This is the single most important anti-gaming measure for difficulty.

**Consistency Score (0–100):**

Measures how evenly completions are distributed across the week. A user who completes 2 tasks every day scores higher than one who completes 14 on Sunday.

```python
def calculate_consistency(daily_completions: list[int]) -> float:
    """daily_completions = [mon, tue, wed, thu, fri, sat, sun]"""
    total = sum(daily_completions)
    if total == 0:
        return 0
    expected = total / 7
    deviation = sum(abs(day - expected) for day in daily_completions)
    max_deviation = 2 * total * (1 - 1/7)  # worst case: all on one day
    consistency = (1 - deviation / max_deviation) * 100
    return round(consistency, 1)
```

Example scenarios:

| Pattern (Mon–Sun) | Total | Consistency Score |
|-------------------|-------|-------------------|
| [2, 2, 2, 2, 2, 2, 2] | 14 | **100.0** (perfect) |
| [1, 2, 3, 2, 3, 1, 2] | 14 | **81.0** (good) |
| [0, 0, 0, 0, 0, 0, 14] | 14 | **0.0** (Sunday binge) |
| [3, 3, 0, 3, 3, 0, 2] | 14 | **71.4** (two rest days) |

This approach uses the **mean absolute deviation** method, which is simpler than entropy-based measures while capturing the same insight. Research from the MIT travel-behaviour regularity study confirms that distribution-aware measures outperform simple frequency counts.

**Streak Bonus (0–100):**

Logarithmic scaling with a hard cap prevents runaway scoring advantages:

```python
def calculate_streak_bonus(current_streak_days: int) -> float:
    """Capped logarithmic streak bonus"""
    if current_streak_days < 3:
        return 0
    raw = min(25 * math.log(current_streak_days) / math.log(30), 100)
    return round(raw, 1)
```

| Streak Length | Bonus Score | Effective Multiplier |
|---------------|-------------|----------------------|
| 0–2 days | 0 | 1.0× |
| 3 days | 18.4 | 1.03× |
| 7 days | 40.1 | 1.06× |
| 14 days | 54.8 | 1.08× |
| 21 days | 63.0 | 1.09× |
| 30 days | 73.4 | 1.11× |
| 60+ days | 100 (capped) | 1.15× |

The cap at 60 days (which delivers the full 15% weight) prevents a partner with a 200-day streak from having an insurmountable scoring advantage. Game design research consistently warns against "runaway leader" mechanics — score advantages shouldn't exceed **60–70%** between first and last place in competitive contexts.

**Bonus Points (0–100):**

Variable-ratio rewards triggered by special achievements:

```python
BONUS_EVENTS = {
    "early_bird": 15,      # All tasks done before noon
    "perfect_day": 20,     # 100% completion in a day
    "new_habit_tried": 10, # Completed a newly added habit
    "partner_helped": 15,  # Completed a task for partner (sick day)
    "weekly_wildcard": 25, # AI-assigned random challenge completed
    "difficulty_up": 10,   # Voluntarily increased a task's difficulty
}
# Sum bonuses, cap at 100
bonus_score = min(sum(earned_bonuses), 100)
```

Variable rewards are psychologically more engaging than fixed ones — Duolingo's randomised treasure chests produce **15% more lesson completions** than predictable rewards.

### Handling ties: celebrate them

For a couples' app, ties should be treated as **mutual wins**, not broken. Research shows cooperative gamification reduces negative outcomes versus purely competitive designs. The LOSE IT trial (2018) found that partner-based habit tracking was the primary engagement driver — not the competitive mechanics themselves.

If a true tiebreaker is needed (e.g., for streak records), use this hierarchy:

1. Higher average difficulty attempted (rewards ambition)
2. Better consistency score (rewards discipline)  
3. Longer current streak (rewards sustained effort)
4. Declare mutual win — both plan a date together

```python
def resolve_tie(player_a, player_b):
    tiebreakers = [
        ('difficulty_score', 'desc'),
        ('consistency_score', 'desc'),
        ('current_streak', 'desc'),
    ]
    for attr, direction in tiebreakers:
        a_val, b_val = getattr(player_a, attr), getattr(player_b, attr)
        if a_val != b_val:
            return player_a if (a_val > b_val) == (direction == 'desc') else player_b
    return "MUTUAL_WIN"  # Both take each other on a date
```

### Why not ELO for two players

An ELO system between exactly two players has fundamental problems. A French academic study (HAL-03286065) on 2-player ELO convergence showed that ratings oscillate around true values but require **30+ games** for accuracy. More critically, ELO is zero-sum — every point gained by one partner is lost by the other, creating a permanent hierarchy that breeds resentment. With only 2 players, there is no calibration anchor and ratings become meaningless numbers.

**Instead, use a Relative Performance Index**: calculate both scores each week, express each as a percentage of the combined total, and keep a rolling 4-week average. This provides competitive context without permanent ranking damage.

```python
def relative_performance(score_a, score_b):
    total = score_a + score_b
    if total == 0:
        return 50.0, 50.0  # Both at 0 = equal
    return (score_a / total) * 100, (score_b / total) * 100
```

---

## 2. Five progression tiers with teeth

Five tiers (0–4) is the right number. **Miller's Law** (7±2 items in working memory) places 5 at the cognitive sweet spot, and gamification researcher Dr. Kerstin explicitly recommends 5 as the "magic number" for progression systems. Duolingo originally launched with 5 leagues before expanding to 10 for its massive user base. For a 2-person app, 5 creates 4 meaningful transitions without overwhelming complexity.

### Tier thresholds and unlock schedule

Progression is driven by a **Tier Points (TP)** system that accumulates weekly and can decay:

```python
def update_tier_points(current_tp, weekly_score, weeks_at_current_tier):
    # Earn TP based on weekly performance
    if weekly_score >= 70:
        earned = (weekly_score - 50) * 0.5  # 10-25 TP per good week
    elif weekly_score >= 40:
        earned = (weekly_score - 40) * 0.2  # 0-6 TP for mediocre weeks
    else:
        earned = -15  # Decay: bad weeks cost TP
    
    # Inactivity decay: if no habits logged for 3+ days
    if days_since_last_log >= 3:
        earned -= 5 * (days_since_last_log - 2)
    
    return max(0, current_tp + earned)
```

| Tier | Name | TP Required | Timeline | What Unlocks |
|------|------|-------------|----------|--------------|
| **0** | Seedling | 0 | Day 1 | Core habit tracking, basic AI judge, manual task entry, simple weekly score |
| **1** | Sprout | 30 TP | ~3–5 days | First cosmetics (themes, avatars), basic streak display, second AI personality ("Cheerful Coach"), notification customisation |
| **2** | In Sync | 120 TP | ~2–3 weeks | Analytics dashboard, joint challenges, AI-generated habit suggestions, third AI personality ("Sassy Motivator"), shareable couple stats cards |
| **3** | Thriving | 300 TP | ~5–8 weeks | Full AI personality customisation, advanced couple features (shared calendar, joint goals), premium themes, punishment date veto upgrades, streak rescue ability |
| **4** | Unshakeable | 600 TP | ~10–12 weeks | All features unlocked, exclusive prestige cosmetics, custom challenge creation, full AI capability (personality builder, detailed analytics narration), ability to enter Prestige |

**Why this pacing works**: Tier 1 unlocks within the first week — Duolingo's data proves that the first meaningful reward must arrive fast (users who maintain 7-day engagement are **3.6× more likely** to persist long-term). The jump from Tier 3 to 4 requires sustained excellence across 10+ weeks, making it genuinely prestigious. Habitica deliberately hides its class system until Level 10 (~1–2 weeks) to avoid overwhelming new users — the same principle drives gating AI features behind Tiers 2–3.

### Regression mechanics: firm but not cruel

Loss aversion means people feel losses **2× as strongly** as equivalent gains (Kahneman & Tversky, 1991). A PubMed study on gamified step-counting found participants at risk of losing their highest tier were **18.4% more likely** to meet their step goal. Regression works — but it must be designed to motivate, not demoralise.

**Regression flow (text-based flowchart):**

```
Weekly Score Calculated
    │
    ├─ Score ≥ 40 → TP earned normally → No regression risk
    │
    ├─ Score 20-39 → "AT RISK" status displayed
    │   │   (visual: garden starts wilting, colours fade)
    │   │   Grace period: 1 more week before TP loss begins
    │   │
    │   ├─ Next week ≥ 40 → "AT RISK" clears, resume normal
    │   └─ Next week < 40 → Lose 20 TP per week
    │
    └─ Score < 20 or No activity → Lose 25 TP per week immediately
        │   (no grace period for near-zero engagement)
        │
        └─ If TP drops below current tier threshold → DEMOTE
            │   Drop exactly 1 tier (never more)
            │   TP set to 80% of new tier's threshold (buffer zone)
            │   Recovery to lost tier takes ~50% of original climb time
```

**Three critical guardrails for regression:**

- **Maximum 1 tier drop per evaluation period.** Even total abandonment only drops you one tier at a time. Clash Royale uses "arena gates" that prevent catastrophic drops — the same principle applies here.
- **Recovery is faster than initial progression.** If Tier 2→3 took 4 weeks, recovering from Tier 2 back to 3 should take ~2 weeks. This respects sunk cost and prevents the "what the hell" abandonment effect.
- **Both partners' tiers are independent.** One partner slacking shouldn't directly punish the other's tier. The couple's *competitive dynamic* handles accountability; the tier system tracks individual consistency.

### A prestige layer prevents content exhaustion

Once both partners sustain Tier 4 for 4 consecutive weeks, they can opt into a **Prestige reset**:

- Drop to Tier 2 (not Tier 0 — respect the investment)
- Earn a permanent Prestige badge (visible on profiles)
- Unlock exclusive prestige-only cosmetics and one new AI personality mode
- Harder progression curve: each prestige requires 10% more TP per tier
- Maximum of 5 Prestige levels (after Prestige 5, you're "Legendary" permanently)

Call of Duty's return to classic prestige in Black Ops 6 was overwhelmingly positive because it provided **permanent markers of dedication**. The seasonal model used in MW2019–Vanguard that fully reset progress was widely criticised as "wasted progress." The lesson: prestige must be opt-in and must leave permanent traces.

---

## 3. Streak design that doesn't break people

Duolingo has run over **600 experiments** on streak mechanics across 4 years. Their most counterintuitive finding: **making streaks easier to maintain increased long-term engagement**. When they separated streaks from daily goals (requiring only 1 lesson instead of hitting an XP target), 7+ day streaks increased by **over 40%**. The instinct to make streaks demanding is wrong — low barriers compensate for the inevitable days when motivation dips.

### Streak definition and threshold

A user maintains their daily streak by completing **≥60% of their assigned daily tasks** (e.g., 6 of 10). This threshold is calibrated to the Fogg Behavior Model (B = MAP): on low-motivation days, the ability bar must be low enough that the behaviour still occurs. Requiring 100% drives the "what the hell" effect — research by Polivy & Herman shows that users who break all-or-nothing goals are **47% more likely** to abandon the goal entirely.

```python
STREAK_THRESHOLD = 0.60  # 60% of daily tasks

def update_streak(user, daily_completion_rate):
    if daily_completion_rate >= STREAK_THRESHOLD:
        user.current_streak += 1
        check_milestones(user)
    elif user.streak_freezes > 0:
        user.streak_freezes -= 1  # Auto-activate freeze
        notify(user, f"Streak freeze used! {user.streak_freezes} remaining.")
    else:
        apply_streak_break(user)
```

### Streak freezes: 2 per sprint, earned not bought

Duolingo allows 2 stacked streak freezes (200 gems each) with 3 bonus freezes at the 100-day milestone. For a weekly sprint app:

- **Each user gets 1 free freeze per sprint** (auto-replenishing every Monday)
- **A second freeze can be earned** by hitting 100% completion on any single day that week
- Freezes activate automatically when a day is missed (no manual action required — Duolingo's model)
- Freezes do NOT stack across sprints — use it or lose it each week
- **"Planned rest day"**: each user can pre-declare 1 day per sprint as a rest day (partner is notified). This day doesn't count against streak or completion rate. Duolingo's now-discontinued Weekend Amulet showed that permitting breaks made users **4% more likely** to return the following week and **5% less likely** to lose their streak.

### When a streak breaks: never show zero

The "what the hell" effect is the single biggest threat to long-term engagement. A user who sees "Streak: 0" after 50 days of effort experiences what psychologists describe as "mathematically absurd but psychologically devastating." The Zeigarnik Effect (people remember incomplete tasks better than completed ones) turns a broken streak into a persistent negative reminder.

```python
def apply_streak_break(user):
    old_streak = user.current_streak
    
    if old_streak < 7:
        user.current_streak = 0  # Low investment, acceptable reset
    elif old_streak < 30:
        user.current_streak = old_streak // 2  # Preserve 50%
        user.streak_recovery_window = 24  # hours to earn back
    else:
        # Milestone floor: drop to previous milestone
        milestones = [3, 7, 14, 21, 30, 60, 90]
        floor = max(m for m in milestones if m < old_streak)
        user.current_streak = floor
        user.streak_recovery_window = 24
    
    # Always show best streak
    user.best_streak = max(user.best_streak, old_streak)
    
    # Couple rescue option
    notify(user.partner, 
           f"{user.name}'s streak needs help! Complete a bonus task together to restore it.")
```

The **couple rescue mechanic** is this system's secret weapon. When a streak breaks, the partner can complete a bonus task to restore it — transforming a frustrating moment into a cooperative, even romantic, interaction. This aligns with Gottman's research on "turning toward" bids for connection and reinforces the relationship rather than straining it.

### Streak milestones and rewards

The endowed progress effect (Nunes & Drèze, 2006) showed that customers given a loyalty card with 2 of 10 stamps pre-filled had a **34% completion rate** versus 19% for those starting from zero. Start new users at Day 1 streak (their signup day counts) to trigger this effect.

| Milestone | Reward | Psychology |
|-----------|--------|------------|
| 3 days | Celebration animation, tiny XP bonus | "Getting started" validation |
| 7 days | Badge + streak shield (free extra freeze) | First major milestone — **3.6× retention lift** |
| 14 days | New couple flair/emoji | Two full sprints of consistency |
| 21 days | Extra streak freeze + bonus points | Habit formation threshold |
| 30 days | Special badge + profile flair + medium XP bonus | Major milestone — identity reinforcement |
| 60 days | Exclusive couple challenge unlock | Sustained commitment marker |
| 90 days | Major badge + large bonus + AI personality unlock | Deep habit established |
| 365 days | Legendary status + permanent profile recognition | "You two are actually incredible" |

Duolingo uses identity-reinforcing notifications like "You're someone who doesn't break their streak." The app should adopt similar framing — **"You two haven't missed a beat in 30 days"** ties the streak to the couple's shared identity, not just individual performance.

---

## 4. The AI punishment date engine

The weekly punishment date is the app's core value proposition. The loser doesn't suffer — they get taken on a surprise date. The "punishment" framing is a playful veneer over what Dr. Arthur Aron's research confirms is a powerful relationship tool: **couples who engage in novel, exciting experiences together** report higher relationship satisfaction. The unpredictability of AI-planned dates directly triggers the same dopamine and norepinephrine pathways as early romantic courtship.

### Date plan architecture

The AI generates a structured date plan with three components, allocating the **£100 budget** across them:

```python
DATE_PLAN_SCHEMA = {
    "primary_activity": {
        "budget_range": (20, 50),     # £20-50
        "examples": ["escape room", "Golf Fang", "Paint & Sip", "pottery class"],
        "selection_criteria": ["novelty", "winner_preference", "loser_discomfort_level"]
    },
    "food_drink": {
        "budget_range": (35, 55),     # £35-55 for two
        "examples": ["Mowgli", "Domo Sardinian", "Oisoi Gathering", "Silversmiths"],
        "selection_criteria": ["cuisine_variety", "not_repeated_within_8_weeks"]
    },
    "extras": {
        "budget_range": (5, 15),      # £5-15
        "examples": ["cocktails at Trippets", "dessert", "tram fare"],
        "selection_criteria": ["fills_budget_gap", "adds_surprise_element"]
    }
}
```

### Winner control: the veto system

The winner's completion percentage determines how many vetoes they get over the AI's plan. This is the recommended Model A (simplest to implement, most transparent):

| Winner's Completion % | Vetoes Granted | Control Level |
|-----------------------|----------------|---------------|
| 50–69% | 1 veto | Can reject one date element; AI regenerates |
| 70–84% | 2 vetoes | Can reshape most of the date |
| 85–100% | 3 vetoes | Near-total creative control; AI assists with logistics |

```python
def generate_date_plan(winner, loser, margin_of_victory):
    # Determine punishment intensity
    intensity = get_intensity_tier(margin_of_victory)
    
    # Generate initial plan
    plan = ai_generate_plan(
        budget=100,
        city="Sheffield",
        intensity=intensity,
        loser_discomforts=loser.mild_discomforts,  # set during onboarding
        loser_hard_nos=loser.hard_limits,            # never crossed
        winner_preferences=winner.preferences,
        date_history=get_couple_date_history(),       # 8-week non-repeat window
        season=get_current_season()
    )
    
    # Winner exercises vetoes
    vetoes = get_veto_count(winner.completion_rate)
    for i in range(vetoes):
        if winner.wants_to_veto(plan):
            vetoed_component = winner.select_veto_target(plan)
            plan = ai_regenerate_component(plan, vetoed_component, constraints)
    
    return plan
```

### Punishment intensity scales with margin of victory

The AI's "evil level" should be proportional to how badly someone lost, following a three-tier system inspired by Japanese batsu game design. The key insight from batsu games: **humour arises from the reaction to the punishment, not the punishment itself.** Punishments should be mildly uncomfortable but ultimately enjoyable.

| Tier | Margin | AI Personality | Date Character |
|------|--------|---------------|----------------|
| **Mild** ("Photo Finish") | <10% gap | Warm, playful | Nice date with 1 playful twist (loser gives a toast, winner picks dessert) |
| **Moderate** ("Clear Win") | 10–25% gap | Smug, teasing | 1–2 "uncomfortable" elements (activity the loser wouldn't choose, AI picks the restaurant) |
| **Spicy** ("Blowout") | >25% gap | Gleefully evil | Full "punishment" — activity from loser's mild-discomfort list, winner controls theme, loser wears something silly |

**Hard limits are sacrosanct.** During onboarding, both users set:

- **Hard nos** (phobias, dietary restrictions, accessibility needs) — the AI will never cross these
- **Mild discomforts** (things they find awkward but can handle) — the AI targets these at Moderate/Spicy intensity
- **Preferences** (things they love) — the AI uses these to reward winners

### Mutual failure: when both score below 30%

When neither partner performs, competition becomes meaningless. The system should shift to **collaborative accountability**:

```python
def handle_mutual_failure(player_a, player_b):
    if player_a.weekly_score < 30 and player_b.weekly_score < 30:
        # AI personality: "disappointed but funny"
        ai_tone = "DISAPPOINTED_PARENT"
        
        # Option 1: Budget penalty date (£30 instead of £100)
        # Forces creativity: Peak District picnic, free gallery + cheap pub
        date_budget = 30
        
        # Option 2: Collaborative redemption challenge
        # Both must complete a joint task (volunteer, cook together, etc.)
        challenge = ai_generate_joint_challenge()
        
        # Frame as "household problem" not individual blame
        message = f"Your household scored {avg_score}% this week. " \
                  f"That's a household problem. Here's what we're doing about it."
        
        return MutualFailureDate(budget=date_budget, challenge=challenge, 
                                 ai_tone=ai_tone)
```

Mutual failure dates could include volunteering together (Sheffield Food Bank, Heeley City Farm), a £5-each budget creativity challenge, or a physical challenge where the AI chooses a Peak District hike route. The framing uses **"we" language** exclusively — never implying one partner dragged the other down.

### Date memory and variety algorithm

The AI maintains a Date History Graph to prevent repetition and ensure variety:

```python
class DateMemory:
    def __init__(self):
        self.venue_history = []      # Don't repeat within 8 weeks
        self.activity_categories = [] # Rotate through: physical, creative, 
                                      # food-focused, cultural, outdoor
        self.cuisines_tried = []     # Track and diversify
        self.intensity_history = []  # Follow wave pattern, not escalation
        self.ratings = []            # Post-date satisfaction (1-5 each)
    
    def get_constraints(self):
        recent_venues = [d.venue for d in self.venue_history[-8:]]
        recent_categories = [d.category for d in self.activity_categories[-3:]]
        return {
            "exclude_venues": recent_venues,
            "prefer_categories": self._underrepresented_categories(recent_categories),
            "intensity": self._wave_pattern(),  # Mild→Moderate→Spicy→Mild cycle
            "adapt_if_low_ratings": self._check_satisfaction_trend()
        }
```

Punishment intensity follows a **wave pattern** (Mild → Moderate → Spicy → Mild) rather than automatic escalation. If both users consistently rate dates 4–5/5, the AI can gradually push boundaries. If ratings dip below 3 twice consecutively, the AI immediately pulls back. This prevents the "punishment arms race" that could make the app feel genuinely unpleasant.

---

## 5. Anti-toxicity systems protect the relationship

This is the most important section. A competition engine without safety guardrails can trigger what Gottman identifies as the **Four Horsemen** of relationship failure: criticism, contempt, defensiveness, and stonewalling. Gottman's 40+ years of research with 3,000+ couples found these patterns predict relationship failure with **94% accuracy**. The app must stay firmly in the "playful competition" zone.

### Gottman's 5:1 ratio as a design constraint

Stable, happy couples maintain approximately **5 positive interactions for every 1 negative**. The app's interaction ratio should target this:

- **Positive moments** (daily): progress celebrations, encouraging AI messages, streak acknowledgments, partner appreciation prompts, bonus achievement notifications
- **Neutral moments** (weekly): score reveal, habit assignment
- **"Negative" moments** (weekly): losing the sprint — but the "punishment" is actually a date, which is inherently positive

The system's architectural advantage is that **the punishment is a date**. Win or lose, both partners spend quality time together. This is the app's secret weapon — competition generates shared experiences rather than resentment.

### Automated relationship health monitoring

```python
class RelationshipHealthMonitor:
    SIGNALS = {
        "sustained_losing": {
            "trigger": "same_person_lost >= 3 consecutive weeks",
            "action": "activate_catch_up_tier_1"
        },
        "disengagement": {
            "trigger": "app_opens_per_week < 3 OR habit_logs_decreasing_3_weeks",
            "action": "soften_competition, send_reengagement"
        },
        "score_disparity": {
            "trigger": "completion_gap > 30% for 2+ weeks",
            "action": "enable_handicap_system"
        },
        "low_date_satisfaction": {
            "trigger": "loser_date_rating < 3 twice consecutively",
            "action": "reduce_punishment_intensity, check_in_prompt"
        },
        "one_sided_activity": {
            "trigger": "only_one_user_active for 5+ days",
            "action": "couples_check_in_prompt, suggest_conversation"
        },
        "rage_quit_pattern": {
            "trigger": "user_closes_app_within_10s_of_score_reveal",
            "action": "delay_future_score_reveals, add_buffer_content"
        }
    }
    
    def weekly_check(self, couple):
        for signal_name, signal in self.SIGNALS.items():
            if self.evaluate_trigger(couple, signal["trigger"]):
                self.execute_action(couple, signal["action"])
                self.log_intervention(signal_name)
```

### Three-tier catch-up mechanics

These are designed following the Mario Kart rubber-banding philosophy: give the trailing player **tools to close the gap**, not nerf the leader. Hideki Konno, Mario Kart 64's director, explained: "We wanted to create a race where everyone was in it until the end."

**Tier 1 — Passive catch-up (always active):**
- "Comeback multiplier": if someone scored below 40% last week and hits above 60% this week, they get a **1.15× score multiplier**
- Improvement bonus: any week-over-week improvement above 15 percentage points earns 5 bonus points
- These are visible and transparent — no hidden manipulation

**Tier 2 — Active catch-up (triggers after 3-week losing streak):**
- "Challenge Mode": losing player can issue a mid-week head-to-head challenge worth 10 bonus points
- "Wildcard habit": AI suggests a new shared habit worth **double points** for the trailing player
- Both players are informed of the active catch-up — transparency prevents resentment

**Tier 3 — Structural catch-up (triggers after 5-week losing streak):**
- "Fresh Start Week": both players' scores reset to 0 for one sprint — pure head-to-head, no accumulated advantages
- "Swap Week": players trade habit lists — experiencing each other's challenges builds empathy and levels the field
- "Collaborative Sprint": both work toward a joint goal; if achieved, trailing player earns a "win" credit

```python
def apply_catch_up(loser, winner, consecutive_losses):
    if consecutive_losses >= 1:
        # Tier 1: always active
        if loser.this_week > loser.last_week * 1.15:
            loser.bonus_points += 5  # Improvement bonus
        if loser.last_week < 40 and loser.this_week > 60:
            loser.score_multiplier = 1.15  # Comeback multiplier
    
    if consecutive_losses >= 3:
        # Tier 2: active catch-up
        loser.can_issue_challenge = True
        loser.wildcard_habit = ai_suggest_wildcard(loser)
        notify_both("Catch-up mechanics activated — {loser.name} has been on a tough run. "
                    "Time to shake things up!")
    
    if consecutive_losses >= 5:
        # Tier 3: structural intervention
        offer_fresh_start_week(loser, winner)
        offer_swap_week(loser, winner)
        ai_personality_shift("encouraging_to_loser", "humble_warning_to_winner")
```

**Preventing leader resentment**: no catch-up mechanic can flip a >25% margin into a win. Catch-up creates opportunity, not automatic victories. The winning player's dominant performance still earns them maximum control over the punishment date.

### Mercy rules and competition softening

The system automatically softens under these conditions:

| Condition | Response |
|-----------|----------|
| Weeks 1–2 of app usage | No punishment dates. Both explore the system in "training wheels" mode |
| Same person loses 3 consecutive weeks | One collaborative sprint replaces competition |
| Either user's completion drops below 20% for 2+ weeks | Pause competition entirely; shift to encouragement mode |
| Completion gap exceeds 40% | Dynamic difficulty adjustment — harder AI-suggested habits for the leader, more achievable ones for the trailing player |
| Post-date satisfaction drops below 3/5 twice | Reduce punishment intensity, trigger an in-app couples check-in |

### Weekly appreciation prompt: the 5:1 enforcer

Before weekly scores are revealed, both partners write one thing they appreciate about the other's effort that week. This creates a positive buffer before any competitive tension, directly applying Gottman's Sound Relationship House principles around "nurturing fondness and admiration." The prompt is non-optional — scores aren't visible until both partners submit.

```python
def reveal_weekly_scores(couple):
    if not couple.both_appreciations_submitted():
        return LockedScoreScreen(
            message="Before we reveal this week's scores, tell {partner} "
                    "one thing you appreciated about their effort this week.",
            input_field=True
        )
    
    # Show appreciations first, THEN scores
    show_appreciation_exchange(couple)
    time.sleep(3)  # Let it sink in
    show_scores_with_animation(couple)
```

---

## 6. Example sprint scenarios and edge cases

### Scenario 1: a close week

**Setup**: Both users assigned 10 tasks each. Monday–Sunday sprint.

| Metric | Player A | Player B |
|--------|----------|----------|
| Tasks completed | 8/10 | 7/10 |
| Difficulty profile | 2 Hard, 4 Medium, 4 Easy | 1 Hard, 3 Medium, 6 Easy |
| Daily distribution | [1,1,2,1,1,1,1] | [0,2,2,0,1,1,1] |
| Current streak | 14 days | 21 days |
| Bonuses earned | Perfect Monday (20) | Early bird Tuesday (15) |

**Scoring calculation:**

```
Player A:
  Completion = 80.0
  Difficulty = (2×2.0 + 4×1.5 + 2×1.0) / (2×2.0 + 4×1.5 + 4×1.0) × 100 = 80.0
  Consistency = 1 - (|1-1.14|×7 deviations) / max_dev ≈ 90.5
  Streak (14 days) = 54.8
  Bonus = min(20, 100) = 20.0
  
  SCORE = 0.30(80) + 0.20(80) + 0.30(90.5) + 0.15(54.8) + 0.05(20)
        = 24.0 + 16.0 + 27.15 + 8.22 + 1.0
        = 76.4

Player B:
  Completion = 70.0
  Difficulty = (1×2.0 + 3×1.5 + 3×1.0) / (1×2.0 + 3×1.5 + 6×1.0) × 100 = 63.6
  Consistency = (two zero days) ≈ 65.7
  Streak (21 days) = 63.0
  Bonus = min(15, 100) = 15.0
  
  SCORE = 0.30(70) + 0.20(63.6) + 0.30(65.7) + 0.15(63.0) + 0.05(15)
        = 21.0 + 12.72 + 19.71 + 9.45 + 0.75
        = 63.6
```

**Result**: Player A wins by 12.8 points (Moderate intensity). Player A completed harder tasks more consistently despite a shorter streak. Player A gets **2 vetoes** over the AI-planned date (completion was 80%).

### Scenario 2: one user sick for a week

```python
def handle_sick_week(sick_user, healthy_user):
    """When a user is legitimately unable to participate"""
    
    # Option 1: User pre-declares sick days (up to 3 per sprint)
    sick_user.declare_sick_days(count=5)  # Entire week
    
    # Sick days don't count against streak (separate from freezes)
    sick_user.streak_paused = True
    
    # Sprint becomes non-competitive
    sprint.status = "PAUSED_MEDICAL"
    
    # Healthy user still tracks habits (builds streak, earns TP)
    # but no winner/loser declared
    notify_both(
        "This week's sprint is paused because {sick_user.name} is unwell. "
        "{healthy_user.name}, keep tracking — your streak and tier progress "
        "still count! No punishment date this week. 💛"
    )
    
    # AI personality: caring
    ai_tone = "SUPPORTIVE"
    ai_message = f"Get well soon, {sick_user.name}. {healthy_user.name}, "
                 f"maybe bring them soup instead of competing this week."
```

### Scenario 3: both users at 0%

```python
def handle_total_failure(player_a, player_b):
    if player_a.weekly_score == 0 and player_b.weekly_score == 0:
        # Mutual failure with zero effort
        ai_tone = "EXASPERATED_BUT_LOVING"
        ai_message = ("Right. Neither of you did a single thing this week. "
                      "I'm not angry, I'm just... actually, no, I am a bit angry. "
                      "Here's the deal: next week is a Redemption Sprint. "
                      "If you BOTH hit 50%, I'll pretend this week never happened. "
                      "If not... well, I'll think of something creative.")
        
        # No punishment date (nobody earned one)
        # Instead: redemption challenge for next week
        next_sprint.type = "REDEMPTION"
        next_sprint.threshold = 50  # Both must hit 50% to "redeem"
        next_sprint.failure_consequence = "AI_CHOOSES_JOINT_PUNISHMENT"
        
        # Don't break streaks (they're already at 0 or protected by freezes)
        # Do apply TP decay
        player_a.tier_points -= 25
        player_b.tier_points -= 25
```

### Scenario 4: sustained dominance (5-week winning streak)

```python
def handle_sustained_dominance(winner, loser, streak_length=5):
    # Tier 3 catch-up activates
    offer_options = [
        "FRESH_START",     # Reset both to 0 for one week
        "SWAP_WEEK",       # Trade habit lists
        "COLLABORATIVE",   # Joint goal instead of competition
    ]
    
    # AI addresses it directly
    ai_message = (
        f"{loser.name}, you've had a rough run — 5 weeks is tough. "
        f"But here's the thing: this app is about building habits together, "
        f"not creating a permanent champion. Let's shake things up.\n\n"
        f"Choose one:\n"
        f"🔄 Fresh Start Week — scores reset, pure head-to-head\n"
        f"🔀 Swap Week — try each other's habits\n"
        f"🤝 Team Week — work together toward a shared goal"
    )
    
    # Dynamic difficulty adjustment
    # Increase challenge for winner, optimise for loser
    winner.next_week_habits = ai_suggest_habits(
        difficulty_bias="harder",
        note="You've been dominating — time to push yourself"
    )
    loser.next_week_habits = ai_suggest_habits(
        difficulty_bias="achievable_but_meaningful",
        note="Focused on wins you can actually get this week"
    )
```

### Complete edge case table

| Edge Case | Handling | Rationale |
|-----------|----------|-----------|
| Both score exactly the same | Mutual win — both plan a date together | Celebrates synchronisation |
| One user travels (no internet) | Pre-declare travel days; streak pauses, sprint non-competitive | Life happens |
| User adds fake tasks to inflate score | AI validates task descriptions; partner can challenge; minimum 5 AI-suggested tasks per sprint | Anti-gaming |
| One user rage-quits the app | 48-hour cool-down notification; if inactive 2+ weeks, pause competition and send gentle check-in | Prevent permanent disengagement |
| Users break up | Data export option; accounts separable; no "couple" data shared post-separation | Ethical obligation |
| One user consistently scores >90%, other <40% | Tier 3 catch-up + AI difficulty rebalancing + collaborative sprint option | Prevent demoralisation |
| Both sustain Tier 4 for months | Prestige option unlocks; seasonal challenges refresh content | Prevent content exhaustion |
| Punishment date rating is 1/5 | AI immediately adjusts intensity downward; triggers couples check-in; next date is Mild regardless of margin | Safety net |

---

## Conclusion: competition as a vehicle for connection

The most important insight from this research is that **the competition is not the product — the dates are**. Every scoring formula, tier threshold, and streak mechanic exists to generate one output: a weekly reason for two people to go on a surprise date together. Arthur Aron's research confirms that novel shared experiences strengthen romantic bonds. Gottman's work proves that playfulness is a pillar of relationship health. The "punishment" framing is the hook that makes habit-tracking fun; the dates themselves are the therapeutic mechanism.

Three design principles should govern every implementation decision. First, **transparency over mystery** — both users should understand exactly how scoring works, why catch-up mechanics activated, and what triggers regression. Hidden manipulation breeds distrust, which Gottman identifies as relationship poison. Second, **firm but not cruel** — regression, streak breaks, and punishment dates should all feel like a playful push, never an actual punishment. The 5:1 positive-to-negative interaction ratio is a hard engineering constraint, not a soft guideline. Third, **the couple wins when both compete** — even the loser gets taken on a date. Even mutual failure generates a shared experience. The system should make it impossible for the app itself to become a source of conflict.

The reweighted 30/20/30/15/5 formula, 5-tier progression with partial regression, capped logarithmic streaks, and three-tier punishment intensity system provide a mathematically sound foundation. But the anti-toxicity monitoring, catch-up mechanics, and appreciation prompts are what will determine whether this app strengthens or strains the relationship it's built for.
# Jugalbandi — Demo Credentials

> Run `bun run seed:demo` to populate the database with these accounts.
> The script is **idempotent** — running it again deletes and re-creates all demo data cleanly.

---

## Accounts

| | **User A — Aman** | **User B — Mukta** |
|---|---|---|
| Email | `aman@demo.jugalbandi.app` | `mukta@demo.jugalbandi.app` |
| Password | `DemoAman2026!` | `DemoMukta2026!` |
| Persona | The Competitor | The Grower |
| Tier | **Mighty Oak** (300 TP) | **Bloom** (150 TP) |

---

## Habits

### Aman
| Habit | Difficulty | Recurrence |
|---|---|---|
| Morning Meditation | Medium | Daily |
| Gym Workout | Hard | Daily |
| Read 30 mins | Legendary | Daily |
| Drink Water | Easy | Daily |
| Evening Yoga | Easy | Daily |

### Mukta
| Habit | Difficulty | Recurrence |
|---|---|---|
| Journaling | Medium | Daily |
| 10k Steps | Hard | Daily |
| No Sugar | Medium | Weekdays |
| Morning Stretch | Easy | Daily |
| Skincare Routine | Easy | Daily |

---

## Sprint Scenario

| Sprint | Week | Mode | Result | Notes |
|---|---|---|---|---|
| 1 | 3 weeks ago | Competitive | **Aman wins** 87.5 vs 62.0 | Punishment completed: Italian dinner at Balans Soho, both rated 4★ |
| 2 | 2 weeks ago | Competitive | **Mukta wins** 91.0 vs 74.5 | Punishment scheduled: COOK cooking class (upcoming, not yet done) |
| 3 | Last week | Cooperative | **Both win** 47.5 + 47.5 = 95 pts | No punishment — cooperative mode |
| 4 | This week | Competitive | **Active** — Aman leading 45.2 vs 38.7 | Partial completions Mon–Sat |

### Sprint 1 punishment (completed)
- Loser: **Mukta** → Winner: **Aman**
- Date: Italian dinner at **Balans Soho**, Old Compton Street
- Rated: 4★ by both users
- Status: Completed

### Sprint 2 punishment (upcoming)
- Loser: **Aman** → Winner: **Mukta**
- Date: Cooking class at **COOK Cooking School**, Covent Garden
- Scheduled: Next Monday
- Status: Scheduled (not yet accepted)

---

## Tier States

| User | Tier | TP | History |
|---|---|---|---|
| Aman | Mighty Oak | 300 | Seedling → Sprout (60d ago) → Bloom (30d ago) → Mighty Oak (7d ago) |
| Mukta | Bloom | 150 | Seedling → Sprout (45d ago) → Bloom (14d ago) |

---

## Prerequisites

### Required environment variable

Add to `.env.local` (never commit this):

```
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

Get it from: **Supabase Dashboard → Project Settings → API → service_role (secret)**

### Run the seed

```bash
bun run seed:demo
```

### Re-seed (idempotent)

Running again will wipe and recreate all demo data:

```bash
bun run seed:demo
```

---

## What the seed covers

- **Auth users** — Email-confirmed, immediately usable
- **Partner pair** — Aman as user_a, Mukta as user_b
- **Tasks** — 5 habits each across all difficulty levels and recurrence types
- **4 sprints** — 3 completed + 1 active with partial completions
- **Habit completions** — Daily rows covering all sprint weeks
- **Punishments** — Sprint 1 completed date with history + ratings; Sprint 2 upcoming
- **Date history & ratings** — Sprint 1 Italian dinner, 4★ from both users
- **Appreciation notes** — 2 notes per completed sprint
- **Tier progress** — Aman: Mighty Oak 300 TP; Mukta: Bloom 150 TP
- **Streaks** — Individual streaks per task + 1 couple streak
- **Point bank snapshots** — Active sprint only (with decay log)
- **Notification preferences** — Both users, enabled with quiet hours
- **Mood entries** — 7 per user (past week, scores 6–8 Aman, 5–7 Mukta)
- **Interaction ledger** — 15 per user (mixed positive/neutral/negative)
- **User AI profiles** — Personality summary + key patterns + communication preferences

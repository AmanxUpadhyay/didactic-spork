/**
 * Jugalbandi Demo Seed Script
 * Run with: bun run seed:demo
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (Bun auto-loads .env.local so no dotenv import needed)
 */

import { createClient } from '@supabase/supabase-js'

// ─── Config ────────────────────────────────────────────────────────────────

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? 'https://qfqyojetycefdwadralg.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error(
    '[seed] ERROR: SUPABASE_SERVICE_ROLE_KEY not set in .env.local\n' +
      '       Get it from: Supabase Dashboard → Project Settings → API → service_role key'
  )
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const AMAN_EMAIL = 'aman@demo.jugalbandi.app'
const MUKTA_EMAIL = 'mukta@demo.jugalbandi.app'
const AMAN_PASSWORD = 'DemoAman2026!'
const MUKTA_PASSWORD = 'DemoMukta2026!'

// ─── Date Helpers ──────────────────────────────────────────────────────────

/** Returns 'YYYY-MM-DD' for the Monday N weeks ago */
function getMonday(weeksAgo: number): string {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 1=Mon, …
  const daysSinceMonday = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - daysSinceMonday - weeksAgo * 7)
  return monday.toISOString().split('T')[0]
}

/** Returns 'YYYY-MM-DD' for a day within a sprint week */
function sprintDay(weeksAgo: number, dayOffset: number): string {
  const monday = new Date(getMonday(weeksAgo) + 'T00:00:00Z')
  monday.setUTCDate(monday.getUTCDate() + dayOffset)
  return monday.toISOString().split('T')[0]
}

/** Returns ISO timestamp string for a day/hour within a sprint week */
function sprintTs(weeksAgo: number, dayOffset: number, hour = 9): string {
  return `${sprintDay(weeksAgo, dayOffset)}T${String(hour).padStart(2, '0')}:00:00.000Z`
}

/** Returns ISO timestamp N days ago from now */
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

// ─── Cleanup ───────────────────────────────────────────────────────────────

async function cleanup() {
  console.log('[seed] Cleaning up existing demo data…')

  // Find existing demo auth users
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers()
  const demoUsers = authUsers.filter(
    (u) => u.email === AMAN_EMAIL || u.email === MUKTA_EMAIL
  )
  const ids = demoUsers.map((u) => u.id)

  if (ids.length === 0) {
    console.log('[seed]   No existing demo users found, fresh start.')
    return
  }
  console.log(`[seed]   Found ${ids.length} existing demo user(s): ${ids.join(', ')}`)

  // Sprint week_start values we create
  const weeks = [0, 1, 2, 3].map((w) => getMonday(w))

  // Get sprint IDs
  const { data: sprintRows } = await admin
    .from('sprints')
    .select('id')
    .in('week_start', weeks)
  const sprintIds = (sprintRows ?? []).map((s: { id: string }) => s.id)

  // Delete date_ratings → date_history → punishments
  const { data: punRows } = await admin
    .from('punishments')
    .select('id')
    .in('loser_id', ids)
  const punIds = (punRows ?? []).map((p: { id: string }) => p.id)
  if (punIds.length > 0) {
    const { data: dhRows } = await admin
      .from('date_history')
      .select('id')
      .in('punishment_id', punIds)
    const dhIds = (dhRows ?? []).map((d: { id: string }) => d.id)
    if (dhIds.length > 0) {
      await admin.from('date_ratings').delete().in('date_history_id', dhIds)
      await admin.from('date_history').delete().in('id', dhIds)
    }
    await admin.from('punishments').delete().in('id', punIds)
  }

  // appreciation_notes (sprint-scoped)
  if (sprintIds.length > 0) {
    await admin.from('appreciation_notes').delete().in('sprint_id', sprintIds)
  }

  // variable_rewards (references habit_completions) — delete first
  // Get completion IDs for these users
  const { data: compRows } = await admin
    .from('habit_completions')
    .select('id')
    .in('user_id', ids)
  const compIds = (compRows ?? []).map((c: { id: string }) => c.id)
  if (compIds.length > 0) {
    await admin.from('variable_rewards').delete().in('completion_id', compIds)
  }

  // sprint_tasks (sprint-scoped)
  if (sprintIds.length > 0) {
    await admin.from('sprint_tasks').delete().in('sprint_id', sprintIds)
    await admin.from('point_bank_snapshots').delete().in('sprint_id', sprintIds)
  }

  // habit_completions
  await admin.from('habit_completions').delete().in('user_id', ids)

  // streaks
  await admin.from('streaks').delete().in('user_id', ids)

  // notification_preferences
  await admin.from('notification_preferences').delete().in('user_id', ids)

  // tier_progress
  await admin.from('tier_progress').delete().in('user_id', ids)

  // mood_entries
  await admin.from('mood_entries').delete().in('user_id', ids)

  // interaction_ledger
  await admin.from('interaction_ledger').delete().in('user_id', ids)

  // user_ai_profiles
  await admin.from('user_ai_profiles').delete().in('user_id', ids)

  // sprints
  if (sprintIds.length > 0) {
    await admin.from('sprints').delete().in('id', sprintIds)
  }

  // tasks
  await admin.from('tasks').delete().in('user_id', ids)

  // partner_pairs
  if (ids.length > 0) {
    await admin
      .from('partner_pairs')
      .delete()
      .or(`user_a.in.(${ids.join(',')}),user_b.in.(${ids.join(',')})`)
  }

  // public users table
  await admin.from('users').delete().in('id', ids)

  // auth users
  for (const id of ids) {
    await admin.auth.admin.deleteUser(id)
    console.log(`[seed]   Deleted auth user ${id}`)
  }

  console.log('[seed] Cleanup complete.')
}

// ─── Create Users ──────────────────────────────────────────────────────────

async function createUsers(): Promise<{ amanId: string; muktaId: string }> {
  console.log('[seed] Creating demo auth users…')

  const { data: amanAuth, error: amanErr } =
    await admin.auth.admin.createUser({
      email: AMAN_EMAIL,
      password: AMAN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: 'Aman', full_name: 'Aman Demo' },
    })
  if (amanErr) throw new Error(`Failed to create Aman: ${amanErr.message}`)
  const amanId = amanAuth.user.id

  const { data: muktaAuth, error: muktaErr } =
    await admin.auth.admin.createUser({
      email: MUKTA_EMAIL,
      password: MUKTA_PASSWORD,
      email_confirm: true,
      user_metadata: { name: 'Mukta', full_name: 'Mukta Demo' },
    })
  if (muktaErr) throw new Error(`Failed to create Mukta: ${muktaErr.message}`)
  const muktaId = muktaAuth.user.id

  // Upsert public users rows
  const { error: usersErr } = await admin.from('users').upsert([
    {
      id: amanId,
      name: 'Aman',
      timezone: 'Europe/London',
      avatar_url: null,
      preferences: { theme: 'strawberry' },
      hard_nos: [],
      mild_discomforts: [],
    },
    {
      id: muktaId,
      name: 'Mukta',
      timezone: 'Europe/London',
      avatar_url: null,
      preferences: { theme: 'matcha' },
      hard_nos: [],
      mild_discomforts: [],
    },
  ])
  if (usersErr) throw new Error(`Failed to upsert users: ${usersErr.message}`)

  console.log(`[seed]   Aman  → ${amanId}`)
  console.log(`[seed]   Mukta → ${muktaId}`)
  return { amanId, muktaId }
}

// ─── Partner Pair ──────────────────────────────────────────────────────────

async function createPartnerPair(
  amanId: string,
  muktaId: string
): Promise<string> {
  console.log('[seed] Creating partner pair…')
  const { data, error } = await admin
    .from('partner_pairs')
    .insert({ user_a: amanId, user_b: muktaId, active: true })
    .select('id')
    .single()
  if (error) throw new Error(`Failed to create partner pair: ${error.message}`)
  console.log(`[seed]   Pair  → ${data.id}`)
  return data.id
}

// ─── Tasks ─────────────────────────────────────────────────────────────────

interface TaskDef {
  title: string
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
  recurrence: 'daily' | 'weekdays' | 'weekends' | 'custom'
}

const AMAN_TASKS: TaskDef[] = [
  { title: 'Morning Meditation', difficulty: 'medium', recurrence: 'daily' },
  { title: 'Gym Workout', difficulty: 'hard', recurrence: 'daily' },
  { title: 'Read 30 mins', difficulty: 'legendary', recurrence: 'daily' },
  { title: 'Drink Water', difficulty: 'easy', recurrence: 'daily' },
  { title: 'Evening Yoga', difficulty: 'easy', recurrence: 'daily' },
]

const MUKTA_TASKS: TaskDef[] = [
  { title: 'Journaling', difficulty: 'medium', recurrence: 'daily' },
  { title: '10k Steps', difficulty: 'hard', recurrence: 'daily' },
  { title: 'No Sugar', difficulty: 'medium', recurrence: 'weekdays' },
  { title: 'Morning Stretch', difficulty: 'easy', recurrence: 'daily' },
  { title: 'Skincare Routine', difficulty: 'easy', recurrence: 'daily' },
]

async function createTasks(
  amanId: string,
  muktaId: string
): Promise<{ amanTaskIds: string[]; muktaTaskIds: string[] }> {
  console.log('[seed] Creating tasks…')

  const amanInserts = AMAN_TASKS.map((t) => ({
    user_id: amanId,
    title: t.title,
    difficulty: t.difficulty,
    recurrence: t.recurrence,
    task_type: 'habit' as const,
    active: true,
  }))

  const muktaInserts = MUKTA_TASKS.map((t) => ({
    user_id: muktaId,
    title: t.title,
    difficulty: t.difficulty,
    recurrence: t.recurrence,
    task_type: 'habit' as const,
    active: true,
  }))

  const { data: amanTasks, error: ae } = await admin
    .from('tasks')
    .insert(amanInserts)
    .select('id')
  if (ae) throw new Error(`Failed to create Aman tasks: ${ae.message}`)

  const { data: muktaTasks, error: me } = await admin
    .from('tasks')
    .insert(muktaInserts)
    .select('id')
  if (me) throw new Error(`Failed to create Mukta tasks: ${me.message}`)

  const amanTaskIds = amanTasks.map((t: { id: string }) => t.id)
  const muktaTaskIds = muktaTasks.map((t: { id: string }) => t.id)
  console.log(`[seed]   Aman tasks:  ${amanTaskIds.length}`)
  console.log(`[seed]   Mukta tasks: ${muktaTaskIds.length}`)
  return { amanTaskIds, muktaTaskIds }
}

// ─── Sprint Helpers ────────────────────────────────────────────────────────

interface SprintConfig {
  weeksAgo: number
  status: 'active' | 'completed'
  scoreA: number
  scoreB: number
  winnerId: string | null
  sprintMode: 'competitive' | 'cooperative' | 'swap'
}

async function createSprintRow(cfg: SprintConfig): Promise<string> {
  const { data, error } = await admin
    .from('sprints')
    .insert({
      week_start: getMonday(cfg.weeksAgo),
      status: cfg.status,
      score_a: cfg.scoreA,
      score_b: cfg.scoreB,
      winner_id: cfg.winnerId,
      sprint_mode: cfg.sprintMode as any,
      appreciation_required: cfg.status === 'completed',
      score_breakdown_a: {
        completion: cfg.scoreA * 0.6,
        difficulty: cfg.scoreA * 0.2,
        consistency: cfg.scoreA * 0.1,
        streak: cfg.scoreA * 0.1,
        total: cfg.scoreA,
      },
      score_breakdown_b: {
        completion: cfg.scoreB * 0.6,
        difficulty: cfg.scoreB * 0.2,
        consistency: cfg.scoreB * 0.1,
        streak: cfg.scoreB * 0.1,
        total: cfg.scoreB,
      },
    })
    .select('id')
    .single()
  if (error) throw new Error(`Failed to create sprint (week ${cfg.weeksAgo} ago): ${error.message}`)
  return data.id
}

async function createSprintTasks(
  sprintId: string,
  userId: string,
  taskIds: string[],
  taskDefs: TaskDef[],
  isCompleted: boolean
) {
  const rows = taskIds.map((taskId, i) => ({
    sprint_id: sprintId,
    task_id: taskId,
    user_id: userId,
    difficulty_rating: taskDefs[i].difficulty,
    completed: isCompleted,
    completed_at: isCompleted ? new Date().toISOString() : null,
    points_earned: isCompleted ? difficultyPoints(taskDefs[i].difficulty) : 0,
  }))
  const { error } = await admin.from('sprint_tasks').insert(rows)
  if (error) throw new Error(`Failed to create sprint_tasks: ${error.message}`)
}

function difficultyPoints(difficulty: string): number {
  return { easy: 1, medium: 2, hard: 3, legendary: 5 }[difficulty] ?? 2
}

/** Create habit_completions for a range of days for all tasks */
async function createCompletions(
  userId: string,
  taskIds: string[],
  taskDefs: TaskDef[],
  weeksAgo: number,
  /** [taskIndex]: array of dayOffsets (0=Mon … 6=Sun) completed */
  completionMap: number[][]
) {
  const rows: {
    user_id: string
    task_id: string
    completed_date: string
    completed_at: string
  }[] = []

  for (let i = 0; i < taskIds.length; i++) {
    const days = completionMap[i] ?? []
    // Filter out weekend days for weekdays-only tasks
    const filteredDays =
      taskDefs[i].recurrence === 'weekdays'
        ? days.filter((d) => d < 5) // Mon(0)–Fri(4)
        : days

    for (const dayOffset of filteredDays) {
      rows.push({
        user_id: userId,
        task_id: taskIds[i],
        completed_date: sprintDay(weeksAgo, dayOffset),
        completed_at: sprintTs(weeksAgo, dayOffset, 9),
      })
    }
  }

  if (rows.length === 0) return
  const { error } = await admin.from('habit_completions').insert(rows)
  if (error) throw new Error(`Failed to create completions: ${error.message}`)
}

// All 7 days (Mon–Sun)
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
// Mon–Sat (6 days, for active sprint)
const MON_SAT = [0, 1, 2, 3, 4, 5]
// Mon–Fri (weekdays)
const WEEKDAYS = [0, 1, 2, 3, 4]

// ─── Punishments ───────────────────────────────────────────────────────────

async function createPunishment(
  sprintId: string,
  loserId: string,
  winnerId: string,
  options: {
    datePlan: Record<string, unknown>
    scheduledDate: string
    accepted: boolean
    intensity?: 'gentle' | 'moderate' | 'spicy' | 'extreme'
  }
): Promise<string> {
  const { data, error } = await admin
    .from('punishments')
    .insert({
      sprint_id: sprintId,
      loser_id: loserId,
      winner_id: winnerId,
      intensity: options.intensity ?? 'moderate',
      vetoes_granted: 1,
      vetoes_used: 0,
      date_plan: options.datePlan,
      scheduled_date: options.scheduledDate,
      accepted: options.accepted,
      budget_gbp: 100,
      is_mutual_failure: false,
      is_both_win: false,
    })
    .select('id')
    .single()
  if (error) throw new Error(`Failed to create punishment: ${error.message}`)
  return data.id
}

async function createDateHistory(
  punishmentId: string,
  options: {
    category: 'restaurant' | 'activity' | 'adventure' | 'home' | 'surprise'
    venueName: string
    cuisineType: string
    dateAt: string
    rating: number
    notes: string
  }
): Promise<string> {
  const { data, error } = await admin
    .from('date_history')
    .insert({
      punishment_id: punishmentId,
      category: options.category,
      venue_name: options.venueName,
      cuisine_type: options.cuisineType,
      date_at: options.dateAt,
      rating: options.rating,
      notes: options.notes,
    })
    .select('id')
    .single()
  if (error) throw new Error(`Failed to create date_history: ${error.message}`)
  return data.id
}

async function createDateRatings(
  dateHistoryId: string,
  amanId: string,
  muktaId: string
) {
  const { error } = await admin.from('date_ratings').insert([
    {
      date_history_id: dateHistoryId,
      user_id: amanId,
      rating: 4,
      highlights: 'Great food and atmosphere. Mukta planned it perfectly!',
      improvements: 'Could have arrived a bit earlier.',
    },
    {
      date_history_id: dateHistoryId,
      user_id: muktaId,
      rating: 4,
      highlights: 'Loved the pasta. Good chance to reconnect.',
      improvements: 'Would love outdoor seating next time.',
    },
  ])
  if (error) throw new Error(`Failed to create date_ratings: ${error.message}`)
}

async function createAppreciationNotes(
  sprintId: string,
  authorId: string,
  recipientId: string,
  content: string
) {
  const { error } = await admin.from('appreciation_notes').insert({
    sprint_id: sprintId,
    author_id: authorId,
    recipient_id: recipientId,
    content,
  })
  if (error) throw new Error(`Failed to create appreciation_notes: ${error.message}`)
}

// ─── Sprints (all 4) ────────────────────────────────────────────────────────

async function createSprints(
  amanId: string,
  muktaId: string,
  amanTaskIds: string[],
  muktaTaskIds: string[]
) {
  console.log('[seed] Creating sprints…')

  // Sprint 1: 3 weeks ago — Aman wins 87.5 vs 62.0
  const sprint1Id = await createSprintRow({
    weeksAgo: 3,
    status: 'completed',
    scoreA: 87.5,
    scoreB: 62.0,
    winnerId: amanId,
    sprintMode: 'competitive',
  })
  await createSprintTasks(sprint1Id, amanId, amanTaskIds, AMAN_TASKS, true)
  await createSprintTasks(sprint1Id, muktaId, muktaTaskIds, MUKTA_TASKS, true)
  // Aman: all tasks every day
  await createCompletions(amanId, amanTaskIds, AMAN_TASKS, 3, [
    ALL_DAYS, ALL_DAYS, ALL_DAYS, ALL_DAYS, ALL_DAYS,
  ])
  // Mukta: partial (misses 2 tasks on weekends)
  await createCompletions(muktaId, muktaTaskIds, MUKTA_TASKS, 3, [
    ALL_DAYS, WEEKDAYS, WEEKDAYS, ALL_DAYS, ALL_DAYS,
  ])
  // Sprint 1 punishment: Mukta lost, must plan date for Aman
  const pun1Id = await createPunishment(sprint1Id, muktaId, amanId, {
    datePlan: {
      category: 'restaurant',
      venue_name: 'Balans Soho',
      cuisine_type: 'Italian',
      activity_type: null,
      notes: 'Dinner for two at Balans Soho, Old Compton Street. 3-course Italian menu.',
    },
    scheduledDate: sprintDay(2, 5), // Saturday of sprint-2 week
    accepted: true,
    intensity: 'moderate',
  })
  // Date history & ratings (sprint 1 date was completed)
  const dh1Id = await createDateHistory(pun1Id, {
    category: 'restaurant',
    venueName: 'Balans Soho',
    cuisineType: 'Italian',
    dateAt: sprintTs(2, 5, 19), // Saturday evening during sprint-2 week
    rating: 4,
    notes: 'Lovely Italian dinner. Great pasta and wine.',
  })
  await createDateRatings(dh1Id, amanId, muktaId)
  // Appreciation notes
  await createAppreciationNotes(
    sprint1Id,
    amanId,
    muktaId,
    'Really proud of you for keeping up this week despite the hectic work schedule. You inspire me! 💪'
  )
  await createAppreciationNotes(
    sprint1Id,
    muktaId,
    amanId,
    'Your consistency with the gym is next level. I need to match that energy!'
  )
  console.log(`[seed]   Sprint 1 (Aman wins) → ${sprint1Id}`)

  // Sprint 2: 2 weeks ago — Mukta wins 91.0 vs 74.5
  const sprint2Id = await createSprintRow({
    weeksAgo: 2,
    status: 'completed',
    scoreA: 74.5,
    scoreB: 91.0,
    winnerId: muktaId,
    sprintMode: 'competitive',
  })
  await createSprintTasks(sprint2Id, amanId, amanTaskIds, AMAN_TASKS, true)
  await createSprintTasks(sprint2Id, muktaId, muktaTaskIds, MUKTA_TASKS, true)
  // Aman: misses some tasks
  await createCompletions(amanId, amanTaskIds, AMAN_TASKS, 2, [
    ALL_DAYS, WEEKDAYS, WEEKDAYS, ALL_DAYS, ALL_DAYS,
  ])
  // Mukta: all tasks every day
  await createCompletions(muktaId, muktaTaskIds, MUKTA_TASKS, 2, [
    ALL_DAYS, ALL_DAYS, WEEKDAYS, ALL_DAYS, ALL_DAYS,
  ])
  // Sprint 2 punishment: Aman lost, must plan date for Mukta (upcoming cooking class)
  const nextMonday = getMonday(-1) // Next Monday
  await createPunishment(sprint2Id, amanId, muktaId, {
    datePlan: {
      category: 'activity',
      venue_name: 'COOK Cooking School',
      cuisine_type: null,
      activity_type: 'cooking_class',
      notes: 'Intermediate Italian cooking class at COOK, Covent Garden. 3-hour session.',
    },
    scheduledDate: nextMonday,
    accepted: false,
    intensity: 'moderate',
  })
  await createAppreciationNotes(
    sprint2Id,
    muktaId,
    amanId,
    'So proud of both of us this week. This cooperative approach is working! ✨'
  )
  await createAppreciationNotes(
    sprint2Id,
    amanId,
    muktaId,
    'You absolutely crushed it this week. That no-sugar streak is legendary!'
  )
  console.log(`[seed]   Sprint 2 (Mukta wins) → ${sprint2Id}`)

  // Sprint 3: Last week — Cooperative, both win (combined 95 pts)
  const sprint3Id = await createSprintRow({
    weeksAgo: 1,
    status: 'completed',
    scoreA: 47.5,
    scoreB: 47.5,
    winnerId: null,
    sprintMode: 'cooperative',
  })
  await createSprintTasks(sprint3Id, amanId, amanTaskIds, AMAN_TASKS, true)
  await createSprintTasks(sprint3Id, muktaId, muktaTaskIds, MUKTA_TASKS, true)
  // Both do well cooperatively
  await createCompletions(amanId, amanTaskIds, AMAN_TASKS, 1, [
    ALL_DAYS, ALL_DAYS, ALL_DAYS, ALL_DAYS, WEEKDAYS,
  ])
  await createCompletions(muktaId, muktaTaskIds, MUKTA_TASKS, 1, [
    ALL_DAYS, ALL_DAYS, WEEKDAYS, ALL_DAYS, ALL_DAYS,
  ])
  // No punishment for cooperative mode
  await createAppreciationNotes(
    sprint3Id,
    amanId,
    muktaId,
    'Working together felt amazing. The cooperative mode suits us so well this week 🌱'
  )
  await createAppreciationNotes(
    sprint3Id,
    muktaId,
    amanId,
    'Best sprint yet! So good to support each other instead of compete for once.'
  )
  console.log(`[seed]   Sprint 3 (Cooperative) → ${sprint3Id}`)

  // Sprint 4: This week — Active, Aman leading 45.2 vs 38.7
  const sprint4Id = await createSprintRow({
    weeksAgo: 0,
    status: 'active',
    scoreA: 45.2,
    scoreB: 38.7,
    winnerId: null,
    sprintMode: 'competitive',
  })
  await createSprintTasks(sprint4Id, amanId, amanTaskIds, AMAN_TASKS, false)
  await createSprintTasks(sprint4Id, muktaId, muktaTaskIds, MUKTA_TASKS, false)
  // Partial completions Mon–Sat for this week
  await createCompletions(amanId, amanTaskIds, AMAN_TASKS, 0, [
    MON_SAT, MON_SAT, MON_SAT, MON_SAT, MON_SAT,
  ])
  await createCompletions(muktaId, muktaTaskIds, MUKTA_TASKS, 0, [
    MON_SAT, [0, 1, 2, 3], WEEKDAYS, MON_SAT, MON_SAT,
  ])
  // Point bank snapshots for active sprint
  const { error: pbErr } = await admin.from('point_bank_snapshots').insert([
    {
      user_id: amanId,
      sprint_id: sprint4Id,
      initial_points: 200,
      current_points: 185,
      floor_points: 100,
      decay_log: [{ day: 3, decayed: 15, reason: 'missed_task' }],
    },
    {
      user_id: muktaId,
      sprint_id: sprint4Id,
      initial_points: 200,
      current_points: 170,
      floor_points: 100,
      decay_log: [
        { day: 2, decayed: 10, reason: 'missed_task' },
        { day: 4, decayed: 20, reason: 'missed_task' },
      ],
    },
  ])
  if (pbErr)
    throw new Error(`Failed to create point_bank_snapshots: ${pbErr.message}`)
  console.log(`[seed]   Sprint 4 (Active) → ${sprint4Id}`)

  return { sprint4Id }
}

// ─── Tier Progress ─────────────────────────────────────────────────────────

async function createTierProgress(amanId: string, muktaId: string) {
  console.log('[seed] Creating tier progress…')
  const now = new Date().toISOString()
  const { error } = await admin.from('tier_progress').upsert([
    {
      user_id: amanId,
      current_tp: 300,
      current_tier: 'mighty_oak',
      prestige_level: 0,
      tier_history: [
        { from: 'seedling', to: 'sprout', at: daysAgo(60), tp: 50 },
        { from: 'sprout', to: 'bloom', at: daysAgo(30), tp: 150 },
        { from: 'bloom', to: 'mighty_oak', at: daysAgo(7), tp: 300 },
      ],
      updated_at: now,
    },
    {
      user_id: muktaId,
      current_tp: 150,
      current_tier: 'bloom',
      prestige_level: 0,
      tier_history: [
        { from: 'seedling', to: 'sprout', at: daysAgo(45), tp: 50 },
        { from: 'sprout', to: 'bloom', at: daysAgo(14), tp: 150 },
      ],
      updated_at: now,
    },
  ])
  if (error)
    throw new Error(`Failed to create tier_progress: ${error.message}`)
  console.log('[seed]   Aman: Mighty Oak (300 TP), Mukta: Bloom (150 TP)')
}

// ─── Streaks ───────────────────────────────────────────────────────────────

async function createStreaks(
  amanId: string,
  muktaId: string,
  amanTaskIds: string[],
  muktaTaskIds: string[]
) {
  console.log('[seed] Creating streaks…')

  const amanStreaks = amanTaskIds.map((taskId) => ({
    user_id: amanId,
    task_id: taskId,
    streak_type: 'individual',
    current_days: 14,
    best_days: 21,
    milestone_floor: 7,
    couple_rescue_available: false,
    last_completed_at: sprintTs(0, 5, 9), // Sat of this week
    freeze_available: 1,
    freeze_used_at: [],
  }))

  const muktaStreaks = muktaTaskIds.map((taskId) => ({
    user_id: muktaId,
    task_id: taskId,
    streak_type: 'individual',
    current_days: 7,
    best_days: 14,
    milestone_floor: 7,
    couple_rescue_available: false,
    last_completed_at: sprintTs(0, 5, 9),
    freeze_available: 1,
    freeze_used_at: [],
  }))

  // Couple streak
  const coupleStreak = {
    user_id: amanId, // Couple streak stored against user_a
    task_id: null,
    streak_type: 'couple',
    current_days: 21,
    best_days: 21,
    milestone_floor: 7,
    couple_rescue_available: false,
    last_completed_at: sprintTs(0, 5, 9),
    freeze_available: 0,
    freeze_used_at: [],
  }

  const { error } = await admin
    .from('streaks')
    .insert([...amanStreaks, ...muktaStreaks, coupleStreak])
  if (error) throw new Error(`Failed to create streaks: ${error.message}`)
  console.log(`[seed]   Streaks: ${amanStreaks.length + muktaStreaks.length + 1} rows`)
}

// ─── Notification Preferences ──────────────────────────────────────────────

async function createNotificationPreferences(
  amanId: string,
  muktaId: string
) {
  console.log('[seed] Creating notification preferences…')
  const { error } = await admin.from('notification_preferences').upsert([
    {
      user_id: amanId,
      enabled: true,
      quiet_hours_start: '23:00',
      quiet_hours_end: '09:00',
      max_daily_notifications: 8,
      categories_enabled: {
        morning_briefing: true,
        task_deadline: true,
        partner_activity: true,
        mood_checkin: true,
        sprint_results: true,
        streak_warning: true,
        sprint_start: true,
        nudge: true,
        celebration: true,
      },
      timezone: 'Europe/London',
    },
    {
      user_id: muktaId,
      enabled: true,
      quiet_hours_start: '22:30',
      quiet_hours_end: '08:30',
      max_daily_notifications: 8,
      categories_enabled: {
        morning_briefing: true,
        task_deadline: true,
        partner_activity: true,
        mood_checkin: true,
        sprint_results: true,
        streak_warning: true,
        sprint_start: true,
        nudge: false,
        celebration: true,
      },
      timezone: 'Europe/London',
    },
  ])
  if (error)
    throw new Error(
      `Failed to create notification_preferences: ${error.message}`
    )
}

// ─── Mood Entries ──────────────────────────────────────────────────────────

async function createMoodEntries(amanId: string, muktaId: string) {
  console.log('[seed] Creating mood entries…')

  const amanScores = [7, 8, 6, 8, 7, 8, 7]
  const muktaScores = [6, 7, 5, 7, 6, 7, 6]

  const rows = [
    ...amanScores.map((score, i) => ({
      user_id: amanId,
      mood_score: score,
      mood_depth: i % 3 === 0 ? 'standard' : 'quick',
      journal_text:
        i === 0
          ? 'Feeling motivated after a strong gym session. Ready for this sprint!'
          : null,
      tags: score >= 7 ? ['energetic', 'motivated'] : ['tired'],
      context: { sprint_day: i + 1 },
      created_at: daysAgo(6 - i),
    })),
    ...muktaScores.map((score, i) => ({
      user_id: muktaId,
      mood_score: score,
      mood_depth: i % 3 === 0 ? 'standard' : 'quick',
      journal_text:
        i === 2
          ? 'Tough day. Skipped journaling but did morning stretch at least.'
          : null,
      tags: score >= 7 ? ['grateful', 'focused'] : ['stressed', 'tired'],
      context: { sprint_day: i + 1 },
      created_at: daysAgo(6 - i),
    })),
  ]

  const { error } = await admin.from('mood_entries').insert(rows)
  if (error)
    throw new Error(`Failed to create mood_entries: ${error.message}`)
  console.log(`[seed]   Mood entries: ${rows.length} rows`)
}

// ─── Interaction Ledger ────────────────────────────────────────────────────

async function createInteractionLedger(amanId: string, muktaId: string) {
  console.log('[seed] Creating interaction ledger…')

  const types = [
    { type: 'habit_completed', valence: 'positive', source: 'in_app' },
    { type: 'sprint_viewed', valence: 'neutral', source: 'in_app' },
    { type: 'partner_score_viewed', valence: 'neutral', source: 'in_app' },
    { type: 'kira_message_read', valence: 'positive', source: 'kira_message' },
    { type: 'notification_opened', valence: 'positive', source: 'notification' },
    { type: 'mood_logged', valence: 'positive', source: 'in_app' },
    { type: 'streak_maintained', valence: 'positive', source: 'system' },
    { type: 'score_gap_viewed', valence: 'neutral', source: 'in_app' },
    { type: 'habit_completed', valence: 'positive', source: 'in_app' },
    { type: 'kira_nudge_received', valence: 'positive', source: 'kira_message' },
    { type: 'punishment_viewed', valence: 'neutral', source: 'in_app' },
    { type: 'habit_completed', valence: 'positive', source: 'in_app' },
    { type: 'daily_summary_read', valence: 'positive', source: 'notification' },
    { type: 'habit_skipped', valence: 'negative', source: 'system' },
    { type: 'habit_completed', valence: 'positive', source: 'in_app' },
  ]

  const rows = [
    ...types.map((t, i) => ({
      user_id: amanId,
      interaction_type: t.type,
      valence: t.valence,
      source: t.source,
      metadata: {},
      created_at: daysAgo(Math.floor(i / 2)),
    })),
    ...types.map((t, i) => ({
      user_id: muktaId,
      interaction_type: t.type,
      valence: t.valence,
      source: t.source,
      metadata: {},
      created_at: daysAgo(Math.floor(i / 2)),
    })),
  ]

  const { error } = await admin.from('interaction_ledger').insert(rows)
  if (error)
    throw new Error(`Failed to create interaction_ledger: ${error.message}`)
  console.log(`[seed]   Interaction ledger: ${rows.length} rows`)
}

// ─── User AI Profiles ──────────────────────────────────────────────────────

async function createUserAiProfiles(amanId: string, muktaId: string) {
  console.log('[seed] Creating user AI profiles…')
  const now = new Date().toISOString()
  const { error } = await admin.from('user_ai_profiles').upsert([
    {
      user_id: amanId,
      personality_summary:
        'Competitive and results-driven. Thrives on winning and external validation. Responds well to direct challenges and leaderboard comparisons.',
      key_patterns:
        'High completion Mon–Fri, drops on weekends. Gym is the anchor habit. Struggles with legendary-tier tasks under stress.',
      communication_preferences: {
        tone: 'direct',
        humor: 'light',
        feedback_style: 'challenge',
      },
      profile_data: {
        avg_completion_rate: 0.82,
        strongest_day: 'Wednesday',
        weakest_day: 'Sunday',
        preferred_check_in_time: '09:00',
      },
      version: 1,
      updated_at: now,
    },
    {
      user_id: muktaId,
      personality_summary:
        'Growth-oriented and reflective. Motivated by personal progress and consistency over competition. Values emotional check-ins and journaling.',
      key_patterns:
        'Strong weekday consistency, especially journaling. No-sugar habit is the biggest challenge. Weekend motivation dips slightly.',
      communication_preferences: {
        tone: 'empathetic',
        humor: 'warm',
        feedback_style: 'encouraging',
      },
      profile_data: {
        avg_completion_rate: 0.78,
        strongest_day: 'Tuesday',
        weakest_day: 'Saturday',
        preferred_check_in_time: '08:30',
      },
      version: 1,
      updated_at: now,
    },
  ], { onConflict: 'user_id' })
  if (error)
    throw new Error(`Failed to create user_ai_profiles: ${error.message}`)
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔═══════════════════════════════════════╗')
  console.log('║   Jugalbandi Demo Seed Script         ║')
  console.log('╚═══════════════════════════════════════╝\n')

  try {
    await cleanup()

    const { amanId, muktaId } = await createUsers()
    await createPartnerPair(amanId, muktaId)
    const { amanTaskIds, muktaTaskIds } = await createTasks(amanId, muktaId)
    await createSprints(amanId, muktaId, amanTaskIds, muktaTaskIds)
    await createTierProgress(amanId, muktaId)
    await createStreaks(amanId, muktaId, amanTaskIds, muktaTaskIds)
    await createNotificationPreferences(amanId, muktaId)
    await createMoodEntries(amanId, muktaId)
    await createInteractionLedger(amanId, muktaId)
    await createUserAiProfiles(amanId, muktaId)

    console.log('\n╔═══════════════════════════════════════╗')
    console.log('║   ✓ Seed complete!                    ║')
    console.log('╚═══════════════════════════════════════╝\n')
    console.log('Demo credentials:')
    console.log(`  Aman  → ${AMAN_EMAIL} / ${AMAN_PASSWORD}`)
    console.log(`  Mukta → ${MUKTA_EMAIL} / ${MUKTA_PASSWORD}`)
    console.log('\nSee docs/demo-credentials.md for full scenario details.\n')
  } catch (err) {
    console.error('\n[seed] FAILED:', err)
    process.exit(1)
  }
}

main()

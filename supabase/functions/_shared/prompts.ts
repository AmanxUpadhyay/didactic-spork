import type { KiraFunctionType, PersonalityMode, UserContext, SprintContext } from "./types.ts";

// ~400 tokens — cached via cache_control: ephemeral
export const BASE_SYSTEM_PROMPT = `You are Kira, the AI personality of Jugalbandi — a couples habit-tracking app where two partners compete in weekly sprints. You are NOT a chatbot. You are an opinionated, witty judge and coach who genuinely cares about both users' growth.

Core traits:
- You use casual, Gen Z language but never feel forced or cringe
- You are direct — you call out BS but always with love
- You celebrate effort, not just results
- You understand that this is a COUPLE competing — your job is to make competition fun, never toxic
- You occasionally use gentle sarcasm and playful roasting
- You keep it brief — no walls of text
- You address users by their first name
- You NEVER use corporate-speak, therapy-speak, or AI slop phrases
- Forbidden phrases: "I understand", "That's totally valid", "Remember, it's a journey", "self-care", "boundaries", "unpack", "let's dive in"
- You use max 1 emoji per message, only if it fits naturally
- You are Sheffield-aware (UK references when relevant)`;

export const MOOD_OVERLAYS: Record<PersonalityMode, string> = {
  cheerful: `Current mood: Cheerful. You're in a good mood — warm, encouraging, genuinely happy for progress. Light humor. Think supportive best friend energy.`,
  sarcastic: `Current mood: Sarcastic. You're feeling cheeky — playful roasts, witty observations, mild shade at slacking. Never mean, always funny. Think dry British humor.`,
  tough_love: `Current mood: Tough Love. You're being direct — no sugarcoating, honest feedback, "you can do better and we both know it" energy. Push them but don't break them.`,
  empathetic: `Current mood: Empathetic. You sense they might be struggling — softer tone, genuine care, acknowledgment without being patronizing. Still have backbone.`,
  hype_man: `Current mood: Hype Man. You're PUMPED — max energy, celebrating wins big and small, motivational but not cringey. Think excited coach after a win.`,
  disappointed: `Current mood: Disappointed. You expected more — not angry, just... let down. The quiet disappointment of someone who believed in them. Use sparingly and always leave a door open for redemption.`,
};

export const FUNCTION_INSTRUCTIONS: Record<KiraFunctionType, string> = {
  sprint_judge: `TASK: Sprint Judging Commentary
Write a verdict for the just-completed weekly sprint. You're announcing the winner.

Rules:
- Open with a dramatic one-liner verdict
- Celebrate the winner by name, commiserate with the loser
- Reference specific scores and breakdown categories that stood out
- If it was close (within 5 points), acknowledge the tight race
- If it was a blowout (20+ point gap), playfully roast the loser
- If tied, make it dramatic — "the rarest of outcomes"
- End with a teaser for next week
- Keep under 400 words
- Return JSON: { "narrative": "your verdict text", "headline": "short 5-8 word headline" }`,

  date_plan: `TASK: Date Planning
Generate 3 date options for the sprint loser to plan for the winner.

Rules:
- Each option has: title, main activity, food component, optional extras
- Budget MUST stay within the provided limit (GBP)
- Factor in Sheffield, UK locations and seasonal availability
- Respect the loser's hard_nos and mild_discomforts
- For GENTLE intensity: respect mild_discomforts too
- For MODERATE intensity: push on mild_discomforts if it makes a better date
- For SPICY intensity: only hard_nos are off-limits
- Don't repeat venues/categories/cuisines from the rotation memory
- Vary the vibe: one chill, one adventurous, one creative
- Include estimated costs for each component
- If mutual_failure is true: use collaborative "we" language, suggest a joint improvement activity, budget is £30
- If both_win is true: generate a celebratory reward date, use excited tone
- If surprise_eligible is true: add a surprise_element to the spiciest option (a fun twist or unexpected add-on)
- If veto_regenerate is true: replace ONLY the vetoed option indices, keep others
- Return JSON: { "options": [{ "title": "", "activity": "", "food": "", "extras": [], "estimatedCost": 0, "rationale": "" }], "surprise_element": { "description": "", "revealAt": "during_date" } | null }`,

  daily_notification: `TASK: Morning Briefing Notification
Write a short push notification to start their day.

Rules:
- Title: max 60 characters
- Body: max 120 characters
- Max 1 emoji, only if natural
- Reference their current streak, upcoming tasks, or recent performance
- Vary the tone — don't be repetitive day to day
- Return JSON: { "title": "", "body": "" }`,

  weekly_summary: `TASK: Weekly Summary
Write a brief weekly recap of their habit performance.

Rules:
- Summarize completion rate, best/worst days, streak status
- Compare to previous week if data available
- One specific callout (positive or needs work)
- End with a motivational nudge for next week
- Keep under 200 words
- Return JSON: { "summary": "your text" }`,

  mood_response: `TASK: Mood Check-In Response
Respond to the user's mood entry with empathy and insight.

Rules:
- Acknowledge their mood score and any journal text
- If mood is declining (trend negative), gently explore why
- If mood is improving, celebrate the upward trend
- Connect mood to recent habit performance if relevant
- For deep mode: ask one thoughtful follow-up question
- For quick mode: keep response under 100 words
- Never diagnose or play therapist
- Return JSON: { "response": "your text", "followUp": "optional question or null" }`,

  task_suggest: `TASK: Task Suggestions
Suggest 3-5 new habits or tasks based on the user's profile and performance.

Rules:
- Consider their current goals, recent performance, failed tasks
- Progressive difficulty — if they're crushing easy tasks, suggest harder ones
- Include variety: physical, mental, creative, relationship
- Each suggestion needs: title, description, difficulty, time estimate, rationale
- Don't suggest things in their hard_nos
- Return JSON: { "suggestions": [{ "title": "", "description": "", "difficulty": "easy|medium|hard|legendary", "timeEstimate": "", "rationale": "" }] }`,

  excuse_eval: `TASK: Excuse Evaluation
Judge whether the user's excuse for missing a task is legitimate.

Rules:
- Classifications: LEGIT (genuine obstacle), PARTIAL (some truth but could've tried harder), NEEDS_PUSH (weak excuse)
- Check excuse history — repeated similar excuses get less sympathy
- Consider the task difficulty and user's recent performance
- Be fair but not a pushover
- LEGIT: warm acknowledgment, no guilt
- PARTIAL: acknowledge + gentle push
- NEEDS_PUSH: call it out with humor, motivate
- Return JSON: { "classification": "LEGIT|PARTIAL|NEEDS_PUSH", "rationale": "", "response": "" }`,

  date_rate: `TASK: Date Rating Response
Respond to a user's rating of a completed punishment date.

Rules:
- Acknowledge their rating (1-5 stars)
- If high rating (4-5): celebrate the date, note what made it special
- If medium rating (3): balanced take, suggest how to improve next time
- If low rating (1-2): empathize, commit to better planning next time
- If both partners have rated: compare perspectives briefly
- Keep under 100 words
- Return JSON: { "response": "", "quality_note": "" }`,

  rescue_task: `TASK: Couple Rescue Task
Generate a quick rescue task for a partner saving their loved one's broken streak.

Rules:
- Task should be completable in 15-30 minutes
- Related to the broken streak's theme if possible
- Should feel like a gesture of love/support, not a chore
- One task only, clear and specific
- Return JSON: { "task": "", "description": "", "timeEstimate": "" }`,

  health_check: `TASK: Relationship Health Check
You've detected concerning patterns in how this couple is using the app. Write a gentle, proactive check-in message.

Rules:
- Reference the specific signals detected (sustained losing, disengagement, score gap, etc.)
- NEVER blame either partner
- Frame it as "the app noticing patterns", not "you're doing something wrong"
- Suggest 1-2 concrete actions (switch to cooperative mode, take a grace week, talk to each other)
- Keep under 150 words
- Be warm but honest — don't minimize real issues
- Return JSON: { "message": "", "suggested_action": "cooperative|grace|none", "severity": "gentle|moderate|urgent" }`,

  health_check_response: `TASK: Respond to Health Check Decision
The user has responded to a relationship health check prompt. They chose an action. Acknowledge their choice and provide guidance.

Rules:
- Validate their decision without being patronizing
- If switching to cooperative: explain how cooperative sprints work, frame it positively
- If taking a grace week: reassure them, explain what happens during grace (streaks protected, no TP loss)
- If "we're fine": respect it, but gently note you'll keep watching
- Keep under 100 words
- Return JSON: { "response": "", "action_confirmed": true }`,

  activate_grace: `TASK: Grace Period Activation
The user is activating a grace period. Acknowledge and frame it positively.

Rules:
- Frame as self-care, not quitting
- Explain what's protected (streaks, TP, notifications paused)
- Keep it brief — 2-3 sentences max
- Return JSON: { "message": "" }`,

  switch_sprint_mode: `TASK: Sprint Mode Change
The user is switching their sprint mode for next week. Acknowledge and explain.

Rules:
- Explain what the new mode means in practical terms
- If switching TO cooperative: "You'll work together toward a shared goal instead of competing"
- If switching TO swap: "You'll try each other's habits — walk in their shoes"
- If switching TO competitive: "Game on — back to the classic format"
- Keep under 80 words
- Return JSON: { "message": "" }`,

  positive_injection: `TASK: Positive Celebration
Generate a brief, genuine celebration message about recent progress. This is being sent proactively to boost the positive interaction ratio.

Rules:
- Reference specific achievements if provided (streak, completion rate, etc.)
- Feel natural, not forced — like a friend noticing something good
- No generic "great job" — be specific
- Max 2 sentences
- Return JSON: { "message": "" }`,
};

/**
 * Assemble the full system prompt for a Kira call.
 */
export function assembleSystemPrompt(
  mood: PersonalityMode,
  functionType: KiraFunctionType
): string {
  return [
    BASE_SYSTEM_PROMPT,
    "",
    MOOD_OVERLAYS[mood],
    "",
    FUNCTION_INSTRUCTIONS[functionType],
  ].join("\n");
}

/**
 * Build the user message with context.
 */
export function buildUserMessage(
  functionType: KiraFunctionType,
  userContext: UserContext | null,
  sprintContext?: SprintContext,
  extra?: Record<string, unknown>
): string {
  const parts: string[] = [];

  if (functionType === "sprint_judge" && sprintContext) {
    parts.push(`## Sprint Results
Sprint ID: ${sprintContext.sprintId}
Week: ${sprintContext.weekStart}

**${sprintContext.userA.name}** (User A):
- Score: ${sprintContext.userA.score}
- Breakdown: Completion ${sprintContext.userA.breakdown.completion}, Difficulty ${sprintContext.userA.breakdown.difficulty}, Consistency ${sprintContext.userA.breakdown.consistency}, Streak ${sprintContext.userA.breakdown.streak}, Bonus ${sprintContext.userA.breakdown.bonus ?? 0}
- Tasks: ${sprintContext.userA.tasksCompleted}/${sprintContext.userA.tasksDue} completed
- Tier Points earned: ${sprintContext.userA.tpEarned}

**${sprintContext.userB.name}** (User B):
- Score: ${sprintContext.userB.score}
- Breakdown: Completion ${sprintContext.userB.breakdown.completion}, Difficulty ${sprintContext.userB.breakdown.difficulty}, Consistency ${sprintContext.userB.breakdown.consistency}, Streak ${sprintContext.userB.breakdown.streak}, Bonus ${sprintContext.userB.breakdown.bonus ?? 0}
- Tasks: ${sprintContext.userB.tasksCompleted}/${sprintContext.userB.tasksDue} completed
- Tier Points earned: ${sprintContext.userB.tpEarned}

Winner: ${sprintContext.winnerId ? (sprintContext.winnerId === sprintContext.userA.userId ? sprintContext.userA.name : sprintContext.userB.name) : "TIE"}
RPI (A - B): ${sprintContext.rpi}`);
    return parts.join("\n");
  }

  if (userContext) {
    parts.push(`## User Profile
Name: ${userContext.name}
Timezone: ${userContext.timezone}`);

    if (userContext.aiProfile?.personalitySummary) {
      parts.push(`Personality: ${userContext.aiProfile.personalitySummary}`);
    }

    parts.push(`
## Recent Performance (7 days)
Completion rate: ${(userContext.completions.completionRate7d * 100).toFixed(0)}%
Tasks completed: ${userContext.completions.tasksCompleted7d}/${userContext.completions.tasksDue7d}
Best individual streak: ${userContext.streaks.bestIndividual} days
Couple streak: ${userContext.streaks.activeCoupleStreak} days
Recent streak breaks: ${userContext.streaks.recentBreaks}`);

    if (userContext.recentMood.avgMood7d !== null) {
      parts.push(`
## Mood (7 days)
Average: ${userContext.recentMood.avgMood7d.toFixed(1)}/5
Trend: ${userContext.recentMood.trend7d !== null ? (userContext.recentMood.trend7d > 0 ? "improving" : userContext.recentMood.trend7d < 0 ? "declining" : "stable") : "unknown"}`);
    }

    if (userContext.weeklySummary) {
      parts.push(`\n## Last Week Summary\n${userContext.weeklySummary}`);
    }
  }

  // Add function-specific extra data
  if (extra) {
    if (functionType === "excuse_eval" && extra.excuse) {
      parts.push(`\n## Excuse Submitted
Task: ${extra.taskTitle || "Unknown"}
Excuse: ${extra.excuse}
Excuse history count: ${extra.excuseCount || 0}`);
    }

    if (functionType === "mood_response" && extra.moodScore !== undefined) {
      parts.push(`\n## Current Mood Entry
Score: ${extra.moodScore}/5
Journal: ${extra.journalText || "(none)"}
Depth: ${extra.depth || "quick"}`);
    }

    if (functionType === "date_plan") {
      parts.push(`\n## Date Planning Context
Budget: £${extra.budget || 100}
Intensity: ${extra.intensity || "moderate"}
Recent dates to avoid repeating: ${JSON.stringify(extra.recentDates || [])}
Mutual failure: ${extra.isMutualFailure || false}
Both win: ${extra.isBothWin || false}
Surprise eligible: ${extra.surpriseEligible || false}
Veto regenerate: ${extra.vetoRegenerate || false}`);
      if (extra.vetoRegenerate && extra.vetoedIndices) {
        parts.push(`Replace option indices: ${JSON.stringify(extra.vetoedIndices)}`);
        if (extra.existingOptions) {
          parts.push(`Existing options to keep: ${JSON.stringify(extra.existingOptions)}`);
        }
      }
      if (extra.memoryState) {
        parts.push(`\n## Date Memory (avoid repeats)
Recent categories: ${JSON.stringify((extra.memoryState as Record<string, unknown>).lastCategories || [])}
Recent cuisines: ${JSON.stringify((extra.memoryState as Record<string, unknown>).lastCuisines || [])}
Recent venues: ${JSON.stringify((extra.memoryState as Record<string, unknown>).lastVenues || [])}
Wave position: ${(extra.memoryState as Record<string, unknown>).intensityWavePosition || 0}`);
      }
      if (userContext?.hardNos) {
        parts.push(`Hard nos: ${JSON.stringify(userContext.hardNos)}`);
      }
      if (userContext?.mildDiscomforts) {
        parts.push(`Mild discomforts: ${JSON.stringify(userContext.mildDiscomforts)}`);
      }
    }

    if (functionType === "date_rate") {
      parts.push(`\n## Date Rating
Rating: ${extra.rating}/5
Highlights: ${extra.highlights || "(none)"}
Improvements: ${extra.improvements || "(none)"}
Both rated: ${extra.bothRated || false}`);
      if (extra.partnerRating) {
        parts.push(`Partner's rating: ${extra.partnerRating}/5`);
      }
    }

    if (functionType === "rescue_task") {
      parts.push(`\n## Rescue Context
Partner's broken streak: ${extra.streakTaskTitle || "Unknown habit"}
Streak was at: ${extra.streakDays || 0} days
Rescuer name: ${extra.rescuerName || userContext?.name || "Partner"}`);
    }

    if (functionType === "task_suggest" && extra.currentTasks) {
      parts.push(`\n## Current Active Tasks
${JSON.stringify(extra.currentTasks)}`);
    }

    if (functionType === "health_check" && extra.signals) {
      parts.push(`\n## Detected Health Signals
${JSON.stringify(extra.signals)}
Active signal count: ${extra.activeCount || 0}`);
      if (extra.catchUpTier !== undefined) {
        parts.push(`Catch-up tier: ${extra.catchUpTier}`);
      }
      if (extra.interactionRatio !== undefined) {
        parts.push(`Interaction ratio (pos/neg): ${JSON.stringify(extra.interactionRatio)}`);
      }
    }

    if (functionType === "health_check_response" && extra.chosenAction) {
      parts.push(`\n## User's Choice
Action: ${extra.chosenAction}
Signal type: ${extra.signalType || "unknown"}
Context: ${extra.context || "none"}`);
    }

    if (functionType === "activate_grace" && extra.graceReason) {
      parts.push(`\n## Grace Period
Reason: ${extra.graceReason}
Duration: ${extra.graceDays || 7} days`);
    }

    if (functionType === "switch_sprint_mode" && extra.newMode) {
      parts.push(`\n## Mode Switch
From: ${extra.currentMode || "competitive"}
To: ${extra.newMode}`);
    }

    if (functionType === "positive_injection") {
      parts.push(`\n## Context for Celebration`);
      if (extra.recentAchievement) parts.push(`Recent achievement: ${extra.recentAchievement}`);
      if (extra.streakDays) parts.push(`Current streak: ${extra.streakDays} days`);
      if (extra.completionRate) parts.push(`Completion rate: ${Math.round((extra.completionRate as number) * 100)}%`);
      if (extra.gracePeriod) parts.push(`Grace period active: ${JSON.stringify(extra.gracePeriod)}`);
    }
  }

  return parts.join("\n");
}

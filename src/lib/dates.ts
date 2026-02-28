import type { Database } from '@/types/database'

type RecurrencePattern = Database['public']['Enums']['recurrence_pattern']

export function getTodayInTimezone(tz: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
}

export function getDayOfWeek(tz: string): number {
  // Returns 0=Sun, 1=Mon, ..., 6=Sat (matches JS Date / Postgres DOW)
  const dateStr = getTodayInTimezone(tz)
  return new Date(dateStr + 'T12:00:00').getDay()
}

export function isHabitDueToday(
  recurrence: RecurrencePattern | null,
  customDays: number[] | null,
  tz: string,
): boolean {
  if (!recurrence || recurrence === 'daily') return true

  const dow = getDayOfWeek(tz)

  if (recurrence === 'weekdays') return dow >= 1 && dow <= 5
  if (recurrence === 'weekends') return dow === 0 || dow === 6
  if (recurrence === 'custom' && customDays) return customDays.includes(dow)

  return true
}

export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function getWeekDates(tz: string): string[] {
  const today = getTodayInTimezone(tz)
  const date = new Date(today + 'T12:00:00')
  const dayOfWeek = date.getDay()
  // Start from Monday
  const monday = new Date(date)
  monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7))

  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

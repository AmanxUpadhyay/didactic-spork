import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

// --- Types ---

export interface NotificationTemplate {
  id: string;
  category: string;
  title_template: string;
  body_template: string;
  urgency: string | null;
  tag: string;
  actions: Record<string, unknown> | null;
}

export interface NotificationPayloadOpts {
  userId: string;
  category: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  tag?: string;
  urgency?: string;
  templateId?: string;
  scheduledFor?: string;
}

export interface NotificationQueueInsert {
  user_id: string;
  category: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  tag: string | null;
  urgency: string | null;
  template_id: string | null;
  scheduled_for: string;
  status: string;
}

// --- Functions ---

/**
 * Replace {{variable_name}} placeholders in a template string with values.
 */
export function interpolateTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

/**
 * Select a random template from the given category, avoiding templates
 * used for this user in the last 5 days.
 */
export async function selectTemplate(
  supabase: SupabaseClient,
  category: string,
  userId: string
): Promise<NotificationTemplate | null> {
  // Fetch all templates for this category
  const { data: templates, error: tplError } = await supabase
    .from("notification_templates")
    .select("id, category, title_template, body_template, urgency, tag, actions")
    .eq("category", category);

  if (tplError) {
    console.error("Failed to fetch notification templates:", tplError.message);
    return null;
  }

  if (!templates || templates.length === 0) {
    return null;
  }

  // Find template IDs used for this user in the last 5 days
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

  const { data: recentRows, error: recentError } = await supabase
    .from("notification_queue")
    .select("template_id")
    .eq("user_id", userId)
    .eq("category", category)
    .gt("created_at", fiveDaysAgo)
    .not("template_id", "is", null);

  if (recentError) {
    console.error("Failed to fetch recent notifications:", recentError.message);
    // Fall through and pick from all templates
  }

  const recentIds = new Set(
    (recentRows ?? []).map((r: { template_id: string }) => r.template_id)
  );

  // Filter out recently used templates
  const available = templates.filter(
    (t: NotificationTemplate) => !recentIds.has(t.id)
  );

  // Pick from available, or fall back to all if every template was used recently
  const pool = available.length > 0 ? available : templates;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  return picked as NotificationTemplate;
}

/**
 * Build a notification_queue row from options.
 */
export function buildNotificationPayload(
  opts: NotificationPayloadOpts
): NotificationQueueInsert {
  return {
    user_id: opts.userId,
    category: opts.category,
    title: opts.title,
    body: opts.body,
    data: opts.data ?? null,
    tag: opts.tag ?? null,
    urgency: opts.urgency ?? null,
    template_id: opts.templateId ?? null,
    scheduled_for: opts.scheduledFor ?? new Date().toISOString(),
    status: "pending",
  };
}

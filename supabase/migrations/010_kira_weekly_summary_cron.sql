-- Add weekly summary cron job for Kira
-- Runs Sunday 20:00 UTC (before sprint scoring at 22:00)
-- Generates a week-over-week summary via kira-cron Edge Function

SELECT cron.schedule('kira-weekly-summary', '0 20 * * 0', $$
  SELECT net.http_post(
    url := 'https://qfqyojetycefdwadralg.supabase.co/functions/v1/kira-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := '{"function_type":"weekly_summary"}'::jsonb
  );
$$);

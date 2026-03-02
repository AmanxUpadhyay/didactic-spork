-- Add 'boost' to notif_category enum
-- Boost is a positive-valence notification (partner cheering you on)
-- and must NOT be subject to the 5:1 ratio suppression guardrail.
ALTER TYPE notif_category ADD VALUE IF NOT EXISTS 'boost';

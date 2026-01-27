-- Add item_name/notes column to subscriptions table to track what was purchased (e.g., Consultation topic)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS item_name TEXT;

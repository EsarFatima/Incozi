
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS gateway_ref TEXT;
CREATE INDEX IF NOT EXISTS idx_subscriptions_gateway_ref ON subscriptions(gateway_ref);

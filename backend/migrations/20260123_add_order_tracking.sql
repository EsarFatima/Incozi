-- Migration: Add Order Tracking Fields to Subscriptions Table
-- Date: January 23, 2026
-- Description: Add order_status and tracking_notes columns for order management

-- Add order_status column (pending, in_progress, completed, on_hold)
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS order_status VARCHAR(20) DEFAULT 'pending';

-- Add tracking_notes column for admin notes
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS tracking_notes TEXT;

-- Add index for faster order status queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_order_status 
ON subscriptions(order_status);

-- Update existing subscriptions to have order_status
UPDATE subscriptions 
SET order_status = 
  CASE 
    WHEN status = 'active' THEN 'completed'
    WHEN status = 'pending' THEN 'pending'
    ELSE 'pending'
  END
WHERE order_status IS NULL;

-- Add columns to users table for profile management (if not exists)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS zip VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

-- Comment
COMMENT ON COLUMN subscriptions.order_status IS 'Order fulfillment status: pending, in_progress, completed, on_hold';
COMMENT ON COLUMN subscriptions.tracking_notes IS 'Internal notes for order tracking and communication';

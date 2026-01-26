-- Test Data Creation Script for Incozi
-- This script creates test services, subscriptions, and bookings
-- Run this in your Supabase SQL Editor

-- IMPORTANT: Replace with actual user IDs from your users table
-- You can find user IDs by running: SELECT id, email, full_name FROM users;

-- Example user IDs to use (replace with your actual IDs):
-- If user_id is a BIGINT, use numbers like 1, 2, 3
-- If user_id is a UUID, use UUIDs

-- ============================================
-- STEP 1: Create Test Services (if not exists)
-- ============================================
INSERT INTO services (name, description, is_active)
VALUES 
  ('Bookkeeping', 'Complete bookkeeping and accounting services', TRUE),
  ('Tax Compliance', 'Tax planning and compliance services', TRUE),
  ('Consultation', 'Business consultation services', TRUE),
  ('Incorporation', 'Business formation and incorporation', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 2: Create Test Plans
-- ============================================
INSERT INTO plans (service_id, name, price, billing_cycle, is_active)
SELECT id, 'Standard Plan', 299.99, 'monthly', TRUE FROM services WHERE name = 'Bookkeeping'
UNION ALL
SELECT id, 'Premium Plan', 599.99, 'monthly', TRUE FROM services WHERE name = 'Bookkeeping'
UNION ALL
SELECT id, 'Basic Plan', 199.99, 'monthly', TRUE FROM services WHERE name = 'Tax Compliance'
UNION ALL
SELECT id, 'Consultation Package', 399.99, 'one_time', TRUE FROM services WHERE name = 'Consultation';

-- ============================================
-- STEP 3: Create Test Subscriptions for Users
-- ============================================
-- For user with email 'haleemahzaheer80@gmail.com' (Haleemah)
INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
SELECT 
  u.id,
  p.id,
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year'
FROM users u, plans p
WHERE u.email = 'haleemahzaheer80@gmail.com' 
  AND p.name = 'Standard Plan'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions 
    WHERE user_id = u.id AND plan_id = p.id
  );

-- For user with email 'esarfatima16@gmail.com' (hello)
INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
SELECT 
  u.id,
  p.id,
  'active',
  CURRENT_DATE - INTERVAL '3 months',
  CURRENT_DATE + INTERVAL '9 months'
FROM users u, plans p
WHERE u.email = 'esarfatima16@gmail.com'
  AND p.name = 'Basic Plan'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions 
    WHERE user_id = u.id AND plan_id = p.id
  );

-- ============================================
-- STEP 4: Create Test Bookings/Consultations
-- ============================================
-- Upcoming bookings for Haleemah
INSERT INTO consultations (user_id, scheduled_at, status, notes)
SELECT 
  u.id,
  NOW() + INTERVAL '7 days',
  'booked',
  'Quarterly bookkeeping review'
FROM users u
WHERE u.email = 'haleemahzaheer80@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM consultations 
  WHERE user_id = u.id 
  AND scheduled_at > NOW()
  AND notes = 'Quarterly bookkeeping review'
);

INSERT INTO consultations (user_id, scheduled_at, status, notes)
SELECT 
  u.id,
  NOW() + INTERVAL '14 days',
  'booked',
  'Tax preparation consultation'
FROM users u
WHERE u.email = 'haleemahzaheer80@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM consultations 
  WHERE user_id = u.id 
  AND scheduled_at > NOW()
  AND notes = 'Tax preparation consultation'
);

-- Upcoming bookings for hello
INSERT INTO consultations (user_id, scheduled_at, status, notes)
SELECT 
  u.id,
  NOW() + INTERVAL '5 days',
  'booked',
  'Initial tax compliance review'
FROM users u
WHERE u.email = 'esarfatima16@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM consultations 
  WHERE user_id = u.id 
  AND scheduled_at > NOW()
  AND notes = 'Initial tax compliance review'
);

-- ============================================
-- STEP 5: Verify the test data was created
-- ============================================
-- Check subscriptions
SELECT 'Subscriptions for Users:' as section;
SELECT 
  u.full_name,
  u.email,
  s.name as service_name,
  p.name as plan_name,
  sub.status,
  sub.start_date,
  sub.end_date
FROM subscriptions sub
JOIN plans p ON sub.plan_id = p.id
JOIN services s ON p.service_id = s.id
JOIN users u ON sub.user_id = u.id
ORDER BY u.full_name;

-- Check upcoming consultations
SELECT 'Upcoming Consultations:' as section;
SELECT 
  u.full_name,
  u.email,
  c.scheduled_at,
  c.status,
  c.notes
FROM consultations c
JOIN users u ON c.user_id = u.id
WHERE c.scheduled_at > NOW()
ORDER BY c.scheduled_at;

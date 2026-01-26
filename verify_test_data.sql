-- Verification Script for Test Data
-- Run this in Supabase SQL Editor to verify if test data exists

-- ============================================
-- 1. Check if users exist
-- ============================================
SELECT 'STEP 1: CHECK USERS' as step;
SELECT id, email, full_name, role, is_verified, created_at FROM users ORDER BY created_at DESC;

-- ============================================
-- 2. Check if services exist
-- ============================================
SELECT 'STEP 2: CHECK SERVICES' as step;
SELECT id, name, description, is_active FROM services;

-- ============================================
-- 3. Check if plans exist
-- ============================================
SELECT 'STEP 3: CHECK PLANS' as step;
SELECT p.id, p.name, p.price, p.billing_cycle, s.name as service_name FROM plans p
JOIN services s ON p.service_id = s.id;

-- ============================================
-- 4. Check if subscriptions exist
-- ============================================
SELECT 'STEP 4: CHECK SUBSCRIPTIONS' as step;
SELECT 
    sub.id,
    u.email,
    u.full_name,
    s.name as service_name,
    p.name as plan_name,
    sub.status,
    sub.start_date,
    sub.end_date,
    sub.created_at
FROM subscriptions sub
JOIN users u ON sub.user_id = u.id
JOIN plans p ON sub.plan_id = p.id
JOIN services s ON p.service_id = s.id
ORDER BY sub.created_at DESC;

-- ============================================
-- 5. Check if consultations exist (THIS IS WHAT SHOWS IN BOOKINGS)
-- ============================================
SELECT 'STEP 5: CHECK CONSULTATIONS (BOOKINGS)' as step;
SELECT 
    c.id,
    u.id as user_id,
    u.email,
    u.full_name,
    c.scheduled_at,
    c.status,
    c.notes,
    c.created_at
FROM consultations c
JOIN users u ON c.user_id = u.id
ORDER BY c.scheduled_at DESC;

-- ============================================
-- 6. Check FUTURE bookings only (what should show in admin bookings)
-- ============================================
SELECT 'STEP 6: CHECK FUTURE BOOKINGS ONLY' as step;
SELECT 
    c.id,
    u.id as user_id,
    u.email,
    u.full_name,
    c.scheduled_at,
    c.status,
    c.notes,
    NOW() as current_time,
    CASE WHEN c.scheduled_at > NOW() THEN 'FUTURE' ELSE 'PAST' END as booking_type
FROM consultations c
JOIN users u ON c.user_id = u.id
WHERE c.scheduled_at > NOW()
ORDER BY c.scheduled_at ASC;

-- ============================================
-- 7. Count summary
-- ============================================
SELECT 'STEP 7: COUNT SUMMARY' as step;
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM services) as total_services,
    (SELECT COUNT(*) FROM plans) as total_plans,
    (SELECT COUNT(*) FROM subscriptions) as total_subscriptions,
    (SELECT COUNT(*) FROM consultations) as total_consultations,
    (SELECT COUNT(*) FROM consultations WHERE scheduled_at > NOW()) as future_bookings;

-- ============================================
-- 8. Check for any consultations with missing user references
-- ============================================
SELECT 'STEP 8: CHECK FOR ORPHANED CONSULTATIONS' as step;
SELECT 
    c.id,
    c.user_id,
    c.scheduled_at,
    c.notes,
    u.email
FROM consultations c
LEFT JOIN users u ON c.user_id = u.id
WHERE u.id IS NULL;

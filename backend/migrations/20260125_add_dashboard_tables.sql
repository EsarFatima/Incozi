-- Migration for Client Dashboard Features
-- Run this in your Supabase SQL Editor

-- 1. Entities Table
CREATE TABLE IF NOT EXISTS entities (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Assuming you use Supabase Auth, or your users table
    name VARCHAR(255) NOT NULL,
    compliance_status VARCHAR(50) DEFAULT 'Unknown', -- 'Good', 'Bad', 'Unknown'
    has_mrs BOOLEAN DEFAULT FALSE, -- Managed Report Service
    file_number VARCHAR(100),
    filing_date DATE,
    jurisdiction VARCHAR(100),
    domestic_jurisdiction VARCHAR(100),
    registered_agent VARCHAR(255) DEFAULT 'Incozi Services, Inc.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Calendar Events (Compliance Dates)
CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Denormalized for easier querying
    entity_id INTEGER REFERENCES entities(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL, -- e.g. "Annual Report Due"
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'overdue'
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Payment Methods (Stored Cards Metadata)
-- DO NOT STORE ACTUAL FULL CARD NUMBERS. Only last 4 and token.
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_type VARCHAR(50), -- 'Visa', 'MasterCard'
    last_four VARCHAR(4),
    expiry_month VARCHAR(2),
    expiry_year VARCHAR(4),
    cardholder_name VARCHAR(255),
    is_preferred BOOLEAN DEFAULT FALSE,
    stripe_payment_method_id VARCHAR(255), -- If using Stripe
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Accounting / Transactions
-- This might overlap with 'orders' or 'subscriptions', but this is a ledger view.
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'order', 'payment', 'charge', 'credit'
    amount DECIMAL(10, 2) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'completed',
    description VARCHAR(255), -- e.g. "Payment for Order #123"
    related_order_id INTEGER, -- Optional link to subscriptions/orders
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEED DATA (Optional - For Testing)
-- Insert these if your tables are empty to see data in the dashboard immediately.
/*
INSERT INTO entities (user_id, name, filing_date, jurisdiction, file_number) 
VALUES ('REPLACE_WITH_USER_UUID', 'Dev Unity Tech LLC', '2025-08-19', 'Delaware', '10302263');

INSERT INTO calendar_events (user_id, subject, due_date, status)
VALUES ('REPLACE_WITH_USER_UUID', 'Annual Report Due', '2026-06-01', 'pending');
*/

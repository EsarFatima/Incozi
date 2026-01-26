# How to Create Test Data for Active Services & Bookings

## Overview
Since you don't have payment processing yet, you need to manually create test records in your Supabase database to test the active services and bookings functionality.

## Method 1: Using Supabase SQL Editor (Easiest)

### Step 1: Go to Supabase SQL Editor
1. Go to your Supabase project: https://app.supabase.com
2. Click **SQL Editor** on the left sidebar
3. Click **New Query**

### Step 2: Run the Test Data Script
1. Copy the contents of `create_test_data.sql`
2. Paste it into the SQL editor
3. Click **Run**

This will automatically create:
- Test services (Bookkeeping, Tax Compliance, Consultation, Incorporation)
- Test plans with pricing
- Active subscriptions for your test users
- Upcoming bookings/consultations

### Step 3: Verify the Data
The script will output two tables showing:
- All subscriptions created for users
- All upcoming consultations

## Method 2: Manual SQL (if you want specific data)

### Check Your Current Users
```sql
SELECT id, email, full_name FROM users;
```
Copy a user ID you want to use for testing.

### Create a Service (if not exists)
```sql
INSERT INTO services (name, description, is_active)
VALUES ('Bookkeeping', 'Complete bookkeeping services', TRUE);
```

### Get Service and Create a Plan
```sql
INSERT INTO plans (service_id, name, price, billing_cycle, is_active)
SELECT id, 'Standard Plan', 299.99, 'monthly', TRUE
FROM services WHERE name = 'Bookkeeping'
LIMIT 1;
```

### Create an Active Subscription
```sql
INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
VALUES (
  1,  -- Replace with actual user_id
  1,  -- Replace with actual plan_id
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year'
);
```

### Create an Upcoming Booking
```sql
INSERT INTO consultations (user_id, scheduled_at, status, notes)
VALUES (
  1,  -- Replace with actual user_id
  NOW() + INTERVAL '7 days',
  'booked',
  'Monthly bookkeeping review'
);
```

## Method 3: Using Node.js Script

If you prefer creating data via your API, run:

```javascript
// In your server terminal
const supabaseClient = require('./backend/supabaseClient');

async function createTestData() {
  // Create service
  const { data: service } = await supabaseClient
    .from('services')
    .insert({ name: 'Bookkeeping', description: 'Test service', is_active: true })
    .select()
    .single();

  // Create plan
  const { data: plan } = await supabaseClient
    .from('plans')
    .insert({
      service_id: service.id,
      name: 'Standard',
      price: 299.99,
      billing_cycle: 'monthly',
      is_active: true
    })
    .select()
    .single();

  // Create subscription
  await supabaseClient
    .from('subscriptions')
    .insert({
      user_id: 1, // Replace with actual user_id
      plan_id: plan.id,
      status: 'active',
      start_date: new Date(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

  // Create consultation
  await supabaseClient
    .from('consultations')
    .insert({
      user_id: 1, // Replace with actual user_id
      scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'booked',
      notes: 'Test booking'
    });

  console.log('Test data created!');
}

createTestData();
```

## Expected Results After Adding Test Data

### On Dashboard (Overview Tab):
- ✅ "ACTIVE SERVICES" should show: **1** (or more)
- ✅ "Recent Activity" should display the active service with status "Active"

### On Admin Client Management:
- ✅ Click "View" for a user with test data
- ✅ "Service History" should list active services with:
  - Service name
  - Status (active)
  - Date purchased
  - Amount

### On Admin Bookings:
- ✅ "Upcoming Bookings" should list future consultations with:
  - Service type
  - Scheduled date/time
  - Status (booked)
  - Notes

## Important Notes

1. **User IDs**: Make sure you're using the correct user_id format:
   - BIGINT: 1, 2, 3, etc.
   - UUID: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

2. **Dates**: Test data uses:
   - `start_date`: Today
   - `end_date`: 1 year from today
   - `scheduled_at`: 7-14 days from now (future dates for testing)

3. **Status Values**:
   - subscriptions: `'active'`, `'pending'`, `'cancelled'`
   - consultations: `'booked'`, `'completed'`, `'cancelled'`

4. **Duplicate Prevention**: The script includes checks to avoid creating duplicate records if you run it multiple times.

## Troubleshooting

**"Foreign key constraint failed"**
- Make sure the user_id exists in the users table
- Make sure the service_id exists in the services table
- Make sure the plan_id exists in the plans table

**"User ID not found"**
- Run `SELECT id, email FROM users;` to see all available user IDs
- Update the script with a valid user_id

**Data not showing on dashboard**
- Clear browser cache (Ctrl+Shift+Delete)
- Check the browser console for API errors (F12)
- Verify the API endpoint returns the correct data
- Make sure the subscriptions.status is exactly 'active'

## Next Steps

Once you confirm test data works:
1. Verify the dashboard displays active services count
2. Check the admin client view modal shows service history
3. Confirm upcoming bookings appear in the modal
4. Test the admin bookings page shows all upcoming consultations

Then you can design your payment flow knowing the data fetching already works!

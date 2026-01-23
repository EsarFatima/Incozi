require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL or SUPABASE_KEY is missing in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = 'admin@incozi.com'; 
    const password = 'admin123'; 
    
    console.log(`Setting up admin user: ${email}`);

    try {
        // 1. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (fetchError) {
            throw fetchError;
        }

        if (existingUser) {
            console.log('User exists. Updating role and password...');
            const { error } = await supabase
                .from('users')
                .update({ 
                    role: 'admin', 
                    password_hash: hashedPassword,
                    full_name: 'System Admin',
                    is_verified: true
                })
                .eq('id', existingUser.id);
            
            if (error) throw error;
            console.log('✅ Existing user updated to Admin.');
        } else {
            console.log('User does not exist. Creating new admin...');
            const { error } = await supabase
                .from('users')
                .insert([{
                    email: email,
                    password_hash: hashedPassword,
                    full_name: 'System Admin',
                    role: 'admin',
                    is_verified: true
                }]);
            
            if (error) throw error;
            console.log('✅ New Admin user created.');
        }
        
        console.log('\n-----------------------------------');
        console.log('Login with these credentials:');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

createAdmin();

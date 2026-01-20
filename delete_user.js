require('dotenv').config();
const supabase = require('./backend/supabaseClient');

const emailToDelete = process.argv[2];

if (!emailToDelete) {
    console.error('Usage: node delete_user.js <email>');
    process.exit(1);
}

async function deleteUser() {
    console.log(`Deleting user: ${emailToDelete}...`);
    
    // Check if user exists first
    const { data: user, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', emailToDelete)
        .single();

    if (findError || !user) {
        console.error('User not found or error:', findError?.message);
        return;
    }

    // Delete user (Cascades should handle the rest in Supabase if defined with ON DELETE CASCADE)
    // In our setup_supabase.sql, we defined ON DELETE CASCADE for foreign keys.
    const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

    if (deleteError) {
        console.error('Error deleting user:', deleteError.message);
    } else {
        console.log(`User ${emailToDelete} deleted successfully from Supabase.`);
    }
}

deleteUser();

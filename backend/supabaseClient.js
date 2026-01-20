
require('dotenv').config({ path: '../.env' }); // Adjust path if necessary, or reliance on process.cwd()
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing in .env file. Please check SUPABASE_URL and SUPABASE_KEY.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;

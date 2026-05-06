// backend/src/db/supase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Check if important environment variables exist
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file!');
  console.error('Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1); // Stop the server
}

// Create Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('✅ Supabase Connected Successfully');

module.exports = supabase;
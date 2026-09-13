import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.SUPABASE_URL || '').split('=')[0].split(' ')[0].trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').split('=')[0].split(' ')[0].trim();

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;

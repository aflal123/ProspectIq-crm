import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/^["']|["']$/g, '').trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/^["']|["']$/g, '').trim();

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;

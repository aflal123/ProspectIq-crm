import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseUrl = rawUrl.replace(/^["']|["']$/g, '').trim();
const supabaseKey = rawKey.replace(/^["']|["']$/g, '').trim();

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;

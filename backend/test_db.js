require('dotenv').config();
const supabase = require('./src/db/supabase');

async function test() {
  const { data, error } = await supabase.from('users').select('*').limit(5);
  console.log('Users:', data);
  console.log('Error:', error);
}
test();

require('dotenv').config();
const supabase = require('./src/db/supabase');

async function test() {
  const { data, error } = await supabase
      .from('notes')
      .insert({
        lead_id: '35ae2684-3e6f-417e-bea1-3fd04d288cd7', // The ID from user's screenshot
        content: 'Test note',
        created_by: '84ff3f61-f6ba-4ee1-a8f2-303ab56dec87' // A valid user id from earlier
      })
      .select()
      .single();
  console.log('Error:', error);
}
test();

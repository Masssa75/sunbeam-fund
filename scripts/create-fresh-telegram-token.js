require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createFreshToken() {
  // First, delete the test connection
  const { error: deleteError } = await supabase
    .from('investor_telegram')
    .delete()
    .eq('telegram_chat_id', 123456789);
    
  if (deleteError) {
    console.log('Delete error:', deleteError);
  } else {
    console.log('✅ Cleaned up test connection');
  }
  
  // Get an investor to connect
  const { data: investors } = await supabase
    .from('investors')
    .select('*')
    .limit(1);
    
  if (!investors || investors.length === 0) {
    console.log('No investors found');
    return;
  }
  
  const investor = investors[0];
  console.log('\nUsing investor:', investor.name || investor.email);
  
  // Generate new token
  const token = Math.random().toString(36).substring(2, 15);
  
  // Create new connection record
  const { data: connection, error } = await supabase
    .from('investor_telegram')
    .insert({
      investor_id: investor.id,
      connection_token: token,
      telegram_chat_id: 0,
      is_active: false
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating connection:', error);
  } else {
    console.log('\n✅ Created new connection token!');
    console.log('\n🔗 Connection Link:');
    console.log('https://t.me/sunbeam_capital_bot?start=' + token);
    console.log('\nOr send this command to the bot:');
    console.log('/start ' + token);
  }
}

createFreshToken();
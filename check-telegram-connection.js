const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTelegramConnection() {
  console.log('Checking Telegram connections...\n');
  
  // Check Marc's connection (assuming user_id for marc@cyrator.com)
  const { data: marcUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'marc@cyrator.com')
    .single();
  
  if (marcUser) {
    const { data: connection } = await supabase
      .from('investor_telegram')
      .select('*')
      .eq('user_id', marcUser.id)
      .single();
    
    if (connection) {
      console.log('Marc\'s Telegram connection:');
      console.log(`- Connected: ${connection.is_active ? 'YES' : 'NO'}`);
      console.log(`- Chat ID: ${connection.telegram_chat_id}`);
      console.log(`- Username: ${connection.telegram_username || 'Not set'}`);
      console.log(`- Connected at: ${connection.connected_at}`);
    } else {
      console.log('No Telegram connection found for Marc');
    }
  }
  
  // Check all connections
  const { data: allConnections } = await supabase
    .from('investor_telegram')
    .select('*')
    .eq('is_active', true);
  
  console.log(`\nTotal active connections: ${allConnections?.length || 0}`);
}

checkTelegramConnection().catch(console.error);
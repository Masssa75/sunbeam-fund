require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testFullFlow() {
  console.log('🧪 Testing Full Telegram Notification Flow\n');
  
  // 1. Check current state
  console.log('📊 Current System State:\n');
  
  // Check investors
  const { data: investors } = await supabase
    .from('investors')
    .select('id, name, email')
    .limit(3);
    
  console.log('Investors:', investors?.length || 0);
  investors?.forEach(i => console.log(`  - ${i.name} (${i.email})`));
  
  // Check Telegram connections
  const { data: connections } = await supabase
    .from('investor_telegram')
    .select('*, investors(name, email)')
    .eq('is_active', true);
    
  console.log('\nActive Telegram Connections:', connections?.length || 0);
  connections?.forEach(c => console.log(`  - ${c.investors.name}: Chat ID ${c.telegram_chat_id}`));
  
  // Check high-importance tweets
  const { data: tweets } = await supabase
    .from('tweet_analyses')
    .select('*')
    .gte('importance_score', 7)
    .order('created_at', { ascending: false })
    .limit(3);
    
  console.log('\nHigh-Importance Tweets:', tweets?.length || 0);
  tweets?.forEach(t => console.log(`  - Score ${t.importance_score}: ${t.summary?.substring(0, 50)}...`));
  
  // 2. Generate connection instructions
  console.log('\n📱 To Connect an Investor to Telegram:\n');
  
  if (investors && investors.length > 0) {
    const investor = investors[0];
    
    // Generate a connection token
    const token = Math.random().toString(36).substring(2, 15);
    
    // Store it temporarily (in production, this would be done via admin UI)
    const { data: tempConnection, error } = await supabase
      .from('investor_telegram')
      .insert({
        investor_id: investor.id,
        connection_token: token,
        telegram_chat_id: 0, // Will be updated when user connects
        is_active: false // Will be activated when user connects
      })
      .select()
      .single();
      
    if (!error) {
      console.log(`1. Investor "${investor.name}" can now connect`);
      console.log(`2. They should:`);
      console.log(`   a) Open Telegram and search for @sunbeam_capital_bot`);
      console.log(`   b) Start a chat with the bot`);
      console.log(`   c) Send: /start ${token}`);
      console.log(`3. The bot will confirm the connection`);
      console.log(`4. They will then receive notifications for tweets with score ≥ 7`);
      
      // Clean up test token
      await supabase
        .from('investor_telegram')
        .delete()
        .eq('id', tempConnection.id);
    }
  }
  
  // 3. Show what would happen
  console.log('\n🚀 What Happens Next:\n');
  console.log('1. When the cron job runs (every minute), it:');
  console.log('   - Picks the next project to monitor');
  console.log('   - Fetches new tweets via nitter-search');
  console.log('   - Analyzes importance with AI');
  console.log('   - Finds tweets with score ≥ 7');
  console.log('');
  console.log('2. For each high-importance tweet:');
  console.log('   - Checks all active Telegram connections');
  console.log('   - Formats a nice notification message');
  console.log('   - Sends via Telegram bot');
  console.log('   - Logs in notification_logs table');
  
  // 4. Manual trigger test
  console.log('\n🔧 To Manually Trigger Monitoring:\n');
  console.log('Run: curl -X POST \\');
  console.log(`  ${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/monitor-projects \\`);
  console.log(`  -H "Authorization: Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}" \\`);
  console.log('  -H "Content-Type: application/json"');
  
  // Check notification logs
  const { data: logs } = await supabase
    .from('notification_logs')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(5);
    
  console.log('\n📝 Recent Notification Logs:', logs?.length || 0);
  logs?.forEach(log => {
    console.log(`  - ${new Date(log.sent_at).toLocaleString()}: ${log.notification_type} (${log.status})`);
  });
}

testFullFlow().catch(console.error);
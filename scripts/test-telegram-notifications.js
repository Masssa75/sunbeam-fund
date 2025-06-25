require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTelegramNotifications() {
  console.log('🚀 Testing Telegram Notification Flow\n');
  
  try {
    // 1. First, check if we have any investors
    const { data: investors, error: invError } = await supabase
      .from('investors')
      .select('*')
      .limit(1);
      
    if (invError || !investors?.length) {
      console.log('❌ No investors found. Please add an investor first via the admin panel.');
      return;
    }
    
    const testInvestor = investors[0];
    console.log(`✅ Using investor: ${testInvestor.name} (ID: ${testInvestor.id})\n`);
    
    // 2. Create a test Telegram connection
    // Note: This is for testing only. In production, users connect via the bot
    const testChatId = 123456789; // Test chat ID
    const connectionToken = Math.random().toString(36).substring(2, 15);
    
    const { data: connection, error: connError } = await supabase
      .from('investor_telegram')
      .insert({
        investor_id: testInvestor.id,
        telegram_chat_id: testChatId,
        telegram_username: 'test_user',
        connection_token: connectionToken,
        is_active: true,
        notification_preferences: {
          reports: true,
          portfolio_updates: true,
          important_alerts: true
        }
      })
      .select()
      .single();
      
    if (connError) {
      if (connError.message.includes('duplicate')) {
        console.log('⚠️  Test connection already exists. Proceeding with test...\n');
        const { data: existing } = await supabase
          .from('investor_telegram')
          .select('*')
          .eq('telegram_chat_id', testChatId)
          .single();
        if (existing) {
          await testNotification(existing);
        }
      } else {
        console.error('❌ Error creating test connection:', connError);
      }
      return;
    }
    
    console.log('✅ Created test Telegram connection\n');
    await testNotification(connection);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testNotification(connection) {
  console.log('📤 Testing notification send...\n');
  
  // Test sending a notification directly
  const testMessage = `🧪 Test Notification

This is a test message from Sunbeam Fund's monitoring system.

If you receive this, Telegram notifications are working correctly!

Important tweets will be sent here when detected.`;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-telegram-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: connection.telegram_chat_id.toString(),
        message: testMessage,
        parseMode: 'HTML'
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Test notification sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.log('❌ Failed to send test notification:', result.error || 'Unknown error');
      console.log('Response:', result);
    }
    
    // Now test the full monitoring flow
    console.log('\n📊 Testing full monitoring flow...\n');
    
    // Trigger monitor-projects manually
    const monitorResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/monitor-projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    
    const monitorResult = await monitorResponse.json();
    console.log('Monitor result:', monitorResult);
    
    // Check notification logs
    const { data: logs, error: logError } = await supabase
      .from('notification_logs')
      .select('*')
      .eq('investor_telegram_id', connection.id)
      .order('sent_at', { ascending: false })
      .limit(5);
      
    if (logs?.length > 0) {
      console.log(`\n✅ Found ${logs.length} notification log(s):`);
      logs.forEach(log => {
        console.log(`- Type: ${log.notification_type}, Status: ${log.status}, Sent: ${new Date(log.sent_at).toLocaleString()}`);
      });
    } else {
      console.log('\n⚠️  No notification logs found yet');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testTelegramNotifications();
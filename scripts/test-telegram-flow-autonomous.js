require('dotenv').config();

async function testNotificationBellFlow() {
  console.log('🧪 Testing Notification Bell Flow Autonomously\n');
  
  // 1. Test the API endpoint
  console.log('1️⃣ Testing token generation via API...');
  
  try {
    const response = await fetch('https://sunbeam.capital/api/telegram/generate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
    
  } catch (error) {
    console.log('API Error:', error.message);
  }
  
  // 2. Test webhook with a test token
  console.log('\n2️⃣ Testing webhook with the token from the link...');
  
  // Extract token from the URL you got
  const testToken = '7vxqjg29va5';
  
  try {
    const webhookResponse = await fetch('https://gualxudgbmpuhjbumfeh.supabase.co/functions/v1/telegram-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        update_id: 12345,
        message: {
          message_id: 1,
          from: { 
            id: 582076, 
            username: 'Marc',
            first_name: 'Marc'
          },
          chat: { 
            id: 582076, 
            type: 'private',
            username: 'Marc'
          },
          date: Math.floor(Date.now() / 1000),
          text: '/start ' + testToken
        }
      })
    });
    
    console.log('Webhook response status:', webhookResponse.status);
    const webhookResult = await webhookResponse.text();
    console.log('Webhook response:', webhookResult);
    
  } catch (error) {
    console.log('Webhook Error:', error.message);
  }
  
  // 3. Check database to see what happened
  console.log('\n3️⃣ Checking database for connection status...');
  
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data: connection } = await supabase
    .from('investor_telegram')
    .select('*')
    .eq('connection_token', testToken)
    .single();
    
  console.log('\nConnection status:');
  console.log('- Token:', connection?.connection_token);
  console.log('- Chat ID:', connection?.telegram_chat_id);
  console.log('- Username:', connection?.telegram_username);
  console.log('- Active:', connection?.is_active);
  console.log('- Connected at:', connection?.connected_at);
}

testNotificationBellFlow().catch(console.error);
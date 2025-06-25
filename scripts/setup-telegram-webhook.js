require('dotenv').config();

async function setupWebhook() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const webhookUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/telegram-webhook`;
  
  console.log('🔗 Setting up Telegram Webhook\n');
  console.log('Bot Token:', botToken ? '✅ Found' : '❌ Missing');
  console.log('Webhook URL:', webhookUrl);
  console.log('');
  
  if (!botToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN not found in .env file');
    return;
  }
  
  try {
    // First, get webhook info
    const infoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const webhookInfo = await infoResponse.json();
    
    console.log('📊 Current Webhook Status:');
    if (webhookInfo.ok && webhookInfo.result) {
      console.log('- URL:', webhookInfo.result.url || 'Not set');
      console.log('- Pending updates:', webhookInfo.result.pending_update_count || 0);
      if (webhookInfo.result.last_error_message) {
        console.log('- Last error:', webhookInfo.result.last_error_message);
      }
    }
    
    // Set the webhook
    console.log('\n🚀 Setting new webhook...\n');
    
    const setResponse = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query']
      })
    });
    
    const setResult = await setResponse.json();
    
    if (setResult.ok) {
      console.log('✅ Webhook set successfully!');
      console.log('\n📱 To test the bot:');
      console.log('1. Open Telegram');
      console.log('2. Search for @sunbeam_capital_bot');
      console.log('3. Start a chat and send /start');
      console.log('4. The bot will guide you through connection');
    } else {
      console.error('❌ Failed to set webhook:', setResult.description);
    }
    
    // Get bot info
    console.log('\n🤖 Bot Information:');
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const botInfo = await botInfoResponse.json();
    
    if (botInfo.ok && botInfo.result) {
      console.log('- Username: @' + botInfo.result.username);
      console.log('- Name:', botInfo.result.first_name);
      console.log('- Can join groups:', botInfo.result.can_join_groups);
      console.log('- Can read all messages:', botInfo.result.can_read_all_group_messages);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupWebhook();
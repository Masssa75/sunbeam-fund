// Edge Function to handle Telegram webhook updates
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      type: string;
    };
    date: number;
    text?: string;
    entities?: Array<{
      offset: number;
      length: number;
      type: string;
    }>;
  };
  callback_query?: {
    id: string;
    from: any;
    message: any;
    data: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Telegram bot token from environment
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    // Parse Telegram update
    const update: TelegramUpdate = await req.json();
    console.log('Received Telegram update:', JSON.stringify(update, null, 2));

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different types of updates
    if (update.message?.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const username = update.message.from.username || update.message.from.first_name;

      // Handle /start command with connection token
      if (text.startsWith('/start')) {
        const token = text.split(' ')[1]?.trim();
        
        if (!token) {
          // Show welcome message
          await sendMessage(TELEGRAM_BOT_TOKEN, chatId, 
            `<b>Welcome to Sunbeam Capital Bot! 👋</b>\n\n` +
            `I help Sunbeam Fund investors stay updated with:\n` +
            `• Important market alerts (score 7+/10)\n` +
            `• Monthly investment reports\n` +
            `• Portfolio updates\n\n` +
            `<b>Looks like you need a connection token.</b>\n\n` +
            `Please return to https://sunbeam.capital and click the notification bell to get your unique connection link.\n\n` +
            `Questions? Contact your fund administrator.`,
            { parseMode: 'HTML' }
          );
          return new Response('OK', { status: 200 });
        }

        // Verify the connection token
        const { data: existingConnection, error: checkError } = await supabase
          .from('investor_telegram')
          .select('*')
          .eq('connection_token', token)
          .single();

        if (checkError || !existingConnection) {
          await sendMessage(TELEGRAM_BOT_TOKEN, chatId, 
            '❌ Invalid or expired connection token. Please request a new connection link from Sunbeam Fund.'
          );
          return new Response('OK', { status: 200 });
        }

        // Check if this chat is already connected
        const { data: existingChat } = await supabase
          .from('investor_telegram')
          .select('id')
          .eq('telegram_chat_id', chatId)
          .neq('id', existingConnection.id)
          .single();

        if (existingChat) {
          await sendMessage(TELEGRAM_BOT_TOKEN, chatId, 
            '❌ This Telegram account is already connected to another investor account.'
          );
          return new Response('OK', { status: 200 });
        }

        // Update the connection with Telegram details
        const { error: updateError } = await supabase
          .from('investor_telegram')
          .update({
            telegram_chat_id: chatId,
            telegram_username: username,
            connected_at: new Date().toISOString(),
            is_active: true,
          })
          .eq('id', existingConnection.id);

        if (updateError) {
          console.error('Error updating connection:', updateError);
          await sendMessage(TELEGRAM_BOT_TOKEN, chatId, 
            '❌ Failed to connect your account. Please try again later.'
          );
          return new Response('OK', { status: 200 });
        }

        // Get investor details
        let investorName = 'Investor';
        if (existingConnection.investor_id) {
          const { data: investor } = await supabase
            .from('investors')
            .select('name, email')
            .eq('id', existingConnection.investor_id)
            .single();
          
          if (investor) {
            investorName = investor.name || investor.email || 'Investor';
          }
        }

        // Send success message
        await sendMessage(TELEGRAM_BOT_TOKEN, chatId, 
          `✅ <b>Successfully connected!</b>\n\n` +
          `Welcome ${investorName}! Your Telegram account is now connected to Sunbeam Fund.\n\n` +
          `You will receive:\n` +
          `• Important market alerts (score ≥ 7/10)\n` +
          `• Monthly investment reports\n` +
          `• Portfolio updates\n\n` +
          `Use /help to see available commands.`,
          { parseMode: 'HTML' }
        );

        return new Response('OK', { status: 200 });
      }


      // Handle /help command
      if (text === '/help') {
        const helpMessage = 
          `<b>📊 Sunbeam Fund Bot Commands</b>\n\n` +
          `/status - Check your connection status\n` +
          `/preferences - Manage notification preferences\n` +
          `/disconnect - Disconnect from notifications\n` +
          `/help - Show this help message\n\n` +
          `For support, please contact your fund administrator.`;

        await sendMessage(TELEGRAM_BOT_TOKEN, chatId, helpMessage, { parseMode: 'HTML' });
        return new Response('OK', { status: 200 });
      }

      // Handle /debug command
      if (text === '/debug') {
        const debugMessage = 
          `<b>🔍 Debug Information</b>\n\n` +
          `Chat ID: <code>${chatId}</code>\n` +
          `Username: @${username || 'not set'}\n` +
          `User ID: ${update.message.from.id}\n` +
          `First Name: ${update.message.from.first_name || 'not set'}\n\n` +
          `Use this Chat ID when connecting: <code>${chatId}</code>`;

        await sendMessage(TELEGRAM_BOT_TOKEN, chatId, debugMessage, { parseMode: 'HTML' });
        return new Response('OK', { status: 200 });
      }

      // Handle /status command
      if (text === '/status') {
        const { data: connection } = await supabase
          .from('investor_telegram')
          .select('*, investors(name, email, share_percentage)')
          .eq('telegram_chat_id', chatId)
          .eq('is_active', true)
          .single();

        if (!connection) {
          await sendMessage(TELEGRAM_BOT_TOKEN, chatId, 
            '❌ Your account is not connected. Please use the connection link provided by Sunbeam Fund.'
          );
        } else {
          const investor = connection.investors;
          await sendMessage(TELEGRAM_BOT_TOKEN, chatId, 
            `<b>📊 Connection Status</b>\n\n` +
            `✅ Connected as: ${investor.name}\n` +
            `📧 Email: ${investor.email}\n` +
            `💼 Share: ${investor.share_percentage}%\n` +
            `🔔 Notifications: ${connection.is_active ? 'Enabled' : 'Disabled'}\n` +
            `📅 Connected since: ${new Date(connection.connected_at).toLocaleDateString()}`,
            { parseMode: 'HTML' }
          );
        }
        return new Response('OK', { status: 200 });
      }

      // Handle /disconnect command
      if (text === '/disconnect') {
        const { error } = await supabase
          .from('investor_telegram')
          .update({ is_active: false })
          .eq('telegram_chat_id', chatId);

        if (!error) {
          await sendMessage(TELEGRAM_BOT_TOKEN, chatId, 
            '✅ You have been disconnected from Sunbeam Fund notifications.\n\n' +
            'To reconnect, please request a new connection link from your fund administrator.'
          );
        } else {
          await sendMessage(TELEGRAM_BOT_TOKEN, chatId, 
            '❌ Failed to disconnect. Please try again later.'
          );
        }
        return new Response('OK', { status: 200 });
      }

      // Handle /preferences command
      if (text === '/preferences') {
        const { data: connection } = await supabase
          .from('investor_telegram')
          .select('notification_preferences')
          .eq('telegram_chat_id', chatId)
          .eq('is_active', true)
          .single();

        if (!connection) {
          await sendMessage(TELEGRAM_BOT_TOKEN, chatId, 
            '❌ Your account is not connected. Please use the connection link provided by Sunbeam Fund.'
          );
        } else {
          const prefs = connection.notification_preferences || {};
          const message = 
            `<b>🔔 Notification Preferences</b>\n\n` +
            `Monthly Reports: ${prefs.reports !== false ? '✅' : '❌'}\n` +
            `Portfolio Updates: ${prefs.portfolio_updates !== false ? '✅' : '❌'}\n` +
            `Important Alerts: ${prefs.important_alerts !== false ? '✅' : '❌'}\n\n` +
            `<i>To change preferences, please contact your fund administrator.</i>`;

          await sendMessage(TELEGRAM_BOT_TOKEN, chatId, message, { parseMode: 'HTML' });
        }
        return new Response('OK', { status: 200 });
      }

      // Default response for unknown commands
      if (text.startsWith('/')) {
        await sendMessage(TELEGRAM_BOT_TOKEN, chatId, 
          '❓ Unknown command. Use /help to see available commands.'
        );
      }
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('OK', { status: 200 }); // Always return OK to Telegram
  }
});

// Helper function to send messages
async function sendMessage(
  botToken: string, 
  chatId: number, 
  text: string,
  options?: { parseMode?: string }
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parseMode || 'HTML',
      }),
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
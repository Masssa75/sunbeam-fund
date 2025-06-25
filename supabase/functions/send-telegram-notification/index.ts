// Edge Function to send Telegram notifications to investors
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  chatId?: number | string;
  investorId?: string;
  message: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disableWebPagePreview?: boolean;
  disableNotification?: boolean;
  replyMarkup?: any;
  notificationType?: 'report' | 'portfolio_update' | 'alert' | 'general';
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  error_code?: number;
  description?: string;
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

    // Parse request body
    const body: RequestBody = await req.json();
    const { 
      chatId, 
      investorId, 
      message, 
      parseMode = 'HTML',
      disableWebPagePreview = false,
      disableNotification = false,
      replyMarkup,
      notificationType = 'general'
    } = body;

    // Validate input
    if (!message) {
      throw new Error('Message is required');
    }

    let targetChatId = chatId;

    // If investorId is provided instead of chatId, look it up
    if (!targetChatId && investorId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: telegramData, error } = await supabase
        .from('investor_telegram')
        .select('telegram_chat_id')
        .eq('investor_id', investorId)
        .eq('is_active', true)
        .single();

      if (error || !telegramData) {
        throw new Error(`No active Telegram connection found for investor ${investorId}`);
      }

      targetChatId = telegramData.telegram_chat_id;
    }

    if (!targetChatId) {
      throw new Error('Either chatId or investorId must be provided');
    }

    // Send message via Telegram API
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const params: any = {
      chat_id: targetChatId,
      text: message,
      parse_mode: parseMode,
      disable_web_page_preview: disableWebPagePreview,
      disable_notification: disableNotification,
    };

    if (replyMarkup) {
      params.reply_markup = typeof replyMarkup === 'string' 
        ? replyMarkup 
        : JSON.stringify(replyMarkup);
    }

    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const telegramResult: TelegramResponse = await telegramResponse.json();

    // Log the notification if successful
    if (telegramResult.ok && investorId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get investor_telegram record
      const { data: telegramData } = await supabase
        .from('investor_telegram')
        .select('id')
        .eq('investor_id', investorId)
        .single();

      if (telegramData) {
        // Log the notification
        await supabase
          .from('notification_logs')
          .insert({
            investor_telegram_id: telegramData.id,
            notification_type: notificationType,
            message: message,
            telegram_message_id: telegramResult.result?.message_id,
            status: 'sent',
            metadata: {
              chat_id: targetChatId,
              parse_mode: parseMode,
            }
          });

        // Update last notification timestamp
        await supabase
          .from('investor_telegram')
          .update({ last_notification_at: new Date().toISOString() })
          .eq('id', telegramData.id);
      }
    }

    // Return the Telegram API response
    return new Response(
      JSON.stringify({
        success: telegramResult.ok,
        messageId: telegramResult.result?.message_id,
        ...(!telegramResult.ok && { error: telegramResult.description }),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: telegramResult.ok ? 200 : 400,
      }
    );

  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
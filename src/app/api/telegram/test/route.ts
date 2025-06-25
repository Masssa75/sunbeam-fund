import { NextRequest, NextResponse } from 'next/server';
import { TelegramBot } from '@/lib/telegram';
import { getServerAuth } from '@/lib/supabase/server-auth';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const { user, isAdmin } = await getServerAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Use admin client for data operations
    const supabase = supabaseAdmin;

    const body = await request.json();
    const { chatId, message, investorId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'Telegram bot not configured' }, { status: 500 });
    }

    const bot = new TelegramBot(botToken);
    
    let targetChatId = chatId;

    // If investorId provided, look up their Telegram chat ID
    if (!targetChatId && investorId) {
      const { data: telegramData, error } = await supabase
        .from('investor_telegram')
        .select('telegram_chat_id')
        .eq('investor_id', investorId)
        .eq('is_active', true)
        .single();

      if (error || !telegramData) {
        return NextResponse.json({ 
          error: `No active Telegram connection found for investor ${investorId}` 
        }, { status: 404 });
      }

      targetChatId = telegramData.telegram_chat_id;
    }

    if (!targetChatId) {
      return NextResponse.json({ 
        error: 'Either chatId or investorId must be provided' 
      }, { status: 400 });
    }

    // Send the test message
    const result = await bot.sendMessage(targetChatId, message, {
      parseMode: 'HTML',
      disableWebPagePreview: true,
    });

    if (result.ok) {
      // Log the test notification
      if (investorId) {
        const { data: telegramData } = await supabase
          .from('investor_telegram')
          .select('id')
          .eq('investor_id', investorId)
          .single();

        if (telegramData) {
          await supabase
            .from('notification_logs')
            .insert({
              investor_telegram_id: telegramData.id,
              notification_type: 'general',
              message: message,
              telegram_message_id: result.result?.message_id,
              status: 'sent',
              metadata: { test: true, sent_by: user.email }
            });
        }
      }

      return NextResponse.json({
        success: true,
        messageId: result.result?.message_id,
        chatId: targetChatId,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.description || 'Failed to send message',
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error testing Telegram notification:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// GET endpoint to check bot info and webhook status
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const { user, isAdmin } = await getServerAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Use admin client for data operations
    const supabase = supabaseAdmin;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'Telegram bot not configured' }, { status: 500 });
    }

    const bot = new TelegramBot(botToken);

    // Get bot info
    const meResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const meData = await meResponse.json();

    // Get webhook info
    const webhookInfo = await bot.getWebhookInfo();

    // Get connected investors count
    const { count } = await supabase
      .from('investor_telegram')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return NextResponse.json({
      bot: meData.result,
      webhook: webhookInfo.result,
      connectedInvestors: count || 0,
    });

  } catch (error) {
    console.error('Error getting Telegram info:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
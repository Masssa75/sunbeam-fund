import { NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/supabase/server-auth';
import { supabaseAdmin } from '@/lib/supabase/server-client';

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

    // Call the Supabase Edge Function to send the message
    // The Edge Function has the TELEGRAM_BOT_TOKEN securely stored
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-telegram-notification`;
    
    // Prepare the request body for the Edge Function
    const edgeFunctionBody = {
      chatId,
      investorId,
      message,
      parseMode: 'HTML',
      disableWebPagePreview: true,
      notificationType: 'general',
    };

    // Call the Edge Function with service role key for authentication
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(edgeFunctionBody),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        chatId: chatId || 'resolved from investorId',
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send message',
      }, { status: response.status || 400 });
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

    // For the GET endpoint, we'll return a simplified response
    // since we can't directly access the bot token from here
    // The actual bot info is managed in Supabase Edge Functions

    // Get connected investors count
    const { count } = await supabase
      .from('investor_telegram')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Return what we can access from the database
    // Bot info and webhook status are managed in Edge Functions
    return NextResponse.json({
      bot: null, // Bot info is in Edge Functions
      webhook: null, // Webhook info is in Edge Functions
      connectedInvestors: count || 0,
      message: 'Bot configuration is managed in Supabase Edge Functions',
    });

  } catch (error) {
    console.error('Error getting Telegram info:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
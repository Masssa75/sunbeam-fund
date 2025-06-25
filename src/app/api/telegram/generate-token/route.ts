import { NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/supabase/server-auth';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const { user, isAdmin } = await getServerAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client for data operations
    const supabase = supabaseAdmin;

    const body = await request.json();
    let { investorId } = body;

    // If no investorId provided and user is not admin, use their own investor ID
    if (!investorId && !isAdmin) {
      const { data: investor } = await supabase
        .from('investors')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (!investor) {
        return NextResponse.json({ error: 'Not an investor' }, { status: 403 });
      }
      
      investorId = investor.id;
    }

    if (!investorId) {
      return NextResponse.json({ error: 'Investor ID is required' }, { status: 400 });
    }

    // Check if investor exists
    const { data: investor, error: investorError } = await supabase
      .from('investors')
      .select('id, name, email')
      .eq('id', investorId)
      .single();

    if (investorError || !investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 });
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('investor_telegram')
      .select('id, connection_token, telegram_chat_id')
      .eq('investor_id', investorId)
      .single();

    if (existingConnection) {
      // If already connected, return existing token
      if (existingConnection.telegram_chat_id) {
        return NextResponse.json({ 
          token: existingConnection.connection_token,
          alreadyConnected: true 
        });
      }
      // Return existing unused token
      return NextResponse.json({ 
        token: existingConnection.connection_token,
        alreadyConnected: false 
      });
    }

    // Generate new connection token
    const tokenData = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create new connection record
    const { data: newConnection, error: createError } = await supabase
      .from('investor_telegram')
      .insert({
        investor_id: investorId,
        connection_token: tokenData,
        telegram_chat_id: null, // Will be updated when they connect
        is_active: false, // Will be activated when they connect
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating connection:', createError);
      return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
    }

    return NextResponse.json({ 
      token: tokenData,
      alreadyConnected: false 
    });

  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
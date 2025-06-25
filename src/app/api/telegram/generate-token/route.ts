import { NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/supabase/server-auth';
import { supabaseAdmin } from '@/lib/supabase/server-client';

export async function POST(request: NextRequest) {
  console.log('[generate-token] API called');
  
  try {
    // Check if user is authenticated
    const { user, isAdmin } = await getServerAuth();
    console.log('[generate-token] User:', user?.email, 'Admin:', isAdmin);
    
    if (!user) {
      console.log('[generate-token] No user found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client for data operations
    const supabase = supabaseAdmin;

    let investorId;
    try {
      const body = await request.json();
      investorId = body.investorId;
    } catch {
      // No body provided, that's okay
      investorId = undefined;
    }

    // If no investorId provided, use their own investor ID
    if (!investorId) {
      console.log('[generate-token] No investorId provided, looking up user:', user.id);
      const { data: investor, error: lookupError } = await supabase
        .from('investors')
        .select('id')
        .eq('id', user.id)
        .single();
      
      console.log('[generate-token] Investor lookup result:', investor, 'Error:', lookupError);
      
      if (!investor) {
        console.log('[generate-token] User is not an investor, returning 403');
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
    console.log('[generate-token] Checking for existing connection for investor:', investorId);
    const { data: existingConnections, error: checkError } = await supabase
      .from('investor_telegram')
      .select('id, connection_token, telegram_chat_id, is_active')
      .eq('investor_id', investorId)
      .order('created_at', { ascending: false })
      .limit(1);

    console.log('[generate-token] Existing connections query result:', existingConnections, 'Error:', checkError);
    console.log('[generate-token] Query returned', existingConnections?.length || 0, 'connections');

    if (existingConnections && existingConnections.length > 0) {
      const existingConnection = existingConnections[0];
      
      // If already connected, return existing token
      if (existingConnection.telegram_chat_id && existingConnection.telegram_chat_id !== 0 && existingConnection.is_active) {
        console.log('[generate-token] Already connected and active, returning existing token');
        return NextResponse.json({ 
          token: existingConnection.connection_token,
          alreadyConnected: true 
        });
      }
      
      // Return existing unused token if it's not connected yet
      if (!existingConnection.is_active || !existingConnection.telegram_chat_id || existingConnection.telegram_chat_id === 0) {
        console.log('[generate-token] Found unused token, returning it');
        return NextResponse.json({ 
          token: existingConnection.connection_token,
          alreadyConnected: false 
        });
      }
    }

    // Generate new connection token
    const tokenData = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('[generate-token] Generated new token:', tokenData);

    // Create new connection record
    console.log('[generate-token] Creating new connection record for investor:', investorId);
    const { data: newConnection, error: createError } = await supabase
      .from('investor_telegram')
      .insert({
        investor_id: investorId,
        connection_token: tokenData,
        telegram_chat_id: null, // NULL instead of 0 to avoid unique constraint issues
        is_active: false, // Will be activated when they connect
      })
      .select()
      .single();

    console.log('[generate-token] Insert result:', newConnection, 'Error:', createError);

    if (createError) {
      console.error('[generate-token] Error creating connection - Full error:', createError);
      console.error('[generate-token] Error details:', {
        code: createError.code,
        message: createError.message,
        details: createError.details,
        hint: createError.hint
      });
      
      // Provide more specific error messages based on the error code
      let errorMessage = 'Failed to create connection';
      if (createError.code === '23505') {
        errorMessage = 'A connection attempt is already in progress. Please try again in a moment.';
      } else if (createError.code === '23503') {
        errorMessage = 'Invalid investor account. Please contact support.';
      } else if (createError.code === '42P01') {
        errorMessage = 'Database configuration error. Please contact support.';
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    console.log('[generate-token] Successfully created connection, returning token');
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
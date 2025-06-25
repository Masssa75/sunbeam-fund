import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-auth';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminEmails = ['marc@cyrator.com', 'marc@minutevideos.com'];
    const isAdmin = adminEmails.includes(user.email || '');

    if (!isAdmin) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!adminUser) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    const body = await request.json();
    const { investorId } = body;

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
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('generate_connection_token');

    if (tokenError || !tokenData) {
      console.error('Error generating token:', tokenError);
      return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }

    // Create new connection record
    const { data: newConnection, error: createError } = await supabase
      .from('investor_telegram')
      .insert({
        investor_id: investorId,
        connection_token: tokenData,
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
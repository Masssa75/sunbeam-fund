#!/usr/bin/env node

const fetch = require('node-fetch');

async function testAPIDirect() {
  console.log('Testing notification APIs directly...\n');

  // First, let's check what the connection-status API returns without auth
  console.log('1. Testing connection-status without auth:');
  try {
    const response = await fetch('http://localhost:3001/api/notifications/connection-status/');
    const data = await response.json();
    console.log('   Response:', data);
  } catch (error) {
    console.log('   Error:', error.message);
  }

  // Now let's check the database directly
  console.log('\n2. Checking database directly:');
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4'
  );

  // Check marc@cyrator.com
  const { data: investor } = await supabase
    .from('investors')
    .select('id, email, name')
    .eq('email', 'marc@cyrator.com')
    .single();

  console.log('   Investor:', investor);

  if (investor) {
    const { data: telegram } = await supabase
      .from('investor_telegram')
      .select('*')
      .eq('investor_id', investor.id)
      .eq('is_active', true)
      .single();

    console.log('   Telegram connection:', telegram);
  }

  // Check marc@minutevideos.com
  console.log('\n3. Checking marc@minutevideos.com:');
  const { data: investor2 } = await supabase
    .from('investors')
    .select('id, email, name')
    .eq('email', 'marc@minutevideos.com')
    .single();

  console.log('   Investor:', investor2);

  if (investor2) {
    const { data: telegram2 } = await supabase
      .from('investor_telegram')
      .select('*')
      .eq('investor_id', investor2.id)
      .eq('is_active', true)
      .single();

    console.log('   Telegram connection:', telegram2);
  }

  // Let's also check auth.users to see the user IDs
  console.log('\n4. Checking auth.users:');
  const { data: users } = await supabase
    .from('auth.users')
    .select('id, email')
    .in('email', ['marc@cyrator.com', 'marc@minutevideos.com']);

  console.log('   Users:', users);
}

testAPIDirect().catch(console.error);
#!/usr/bin/env node

const fetch = require('node-fetch');

async function testProductionConnection() {
  console.log('Testing production connection status...\n');

  // Test without auth first
  console.log('1. Testing without auth:');
  try {
    const response = await fetch('https://sunbeam.capital/api/notifications/connection-status/');
    const data = await response.json();
    console.log('   Response:', data);
  } catch (error) {
    console.log('   Error:', error.message);
  }

  // Now let's check the database directly for comparison
  console.log('\n2. Checking database directly:');
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4'
  );

  // Check all telegram connections
  const { data: connections } = await supabase
    .from('investor_telegram')
    .select(`
      *,
      investors!inner(email, name)
    `)
    .eq('is_active', true);

  console.log('   Active Telegram connections:');
  connections?.forEach(conn => {
    console.log(`   - ${conn.investors.email}: @${conn.telegram_username} (chat_id: ${conn.telegram_chat_id})`);
  });

  // Check recent alerts endpoint too
  console.log('\n3. Testing recent-alerts without auth:');
  try {
    const response = await fetch('https://sunbeam.capital/api/notifications/recent-alerts/');
    const data = await response.json();
    console.log('   Response:', { alertCount: data.alerts?.length || 0 });
  } catch (error) {
    console.log('   Error:', error.message);
  }
}

testProductionConnection().catch(console.error);
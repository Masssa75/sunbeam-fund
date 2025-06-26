#!/usr/bin/env node

const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

async function testConnectionAPI() {
  console.log('Testing connection API locally...\n');

  // Create a logged-in session for marc@cyrator.com
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM'
  );

  // Sign in as marc@cyrator.com
  console.log('1. Signing in as marc@cyrator.com...');
  const { data: auth, error } = await supabase.auth.signInWithPassword({
    email: 'marc@cyrator.com',
    password: '123456'
  });

  if (error) {
    console.log('   Sign in failed:', error.message);
    console.log('   Trying marc@minutevideos.com instead...');
    
    const { data: auth2, error: error2 } = await supabase.auth.signInWithPassword({
      email: 'marc@minutevideos.com',
      password: '123456'
    });

    if (error2) {
      console.log('   Sign in failed:', error2.message);
      return;
    }

    console.log('   Signed in as marc@minutevideos.com');
    console.log('   User ID:', auth2.user.id);
    console.log('   Email:', auth2.user.email);

    // Test the API with auth token
    console.log('\n2. Testing connection-status API with auth:');
    try {
      const response = await fetch('http://localhost:3001/api/notifications/connection-status/', {
        headers: {
          'Authorization': `Bearer ${auth2.session.access_token}`,
          'Cookie': `sb-gualxudgbmpuhjbumfeh-auth-token=${auth2.session.access_token}`
        }
      });
      const data = await response.json();
      console.log('   Response:', data);
    } catch (err) {
      console.log('   Error:', err.message);
    }

    return;
  }

  console.log('   Signed in successfully!');
  console.log('   User ID:', auth.user.id);
  console.log('   Email:', auth.user.email);

  // Test the API with auth token
  console.log('\n2. Testing connection-status API with auth:');
  try {
    const response = await fetch('http://localhost:3001/api/notifications/connection-status/', {
      headers: {
        'Authorization': `Bearer ${auth.session.access_token}`,
        'Cookie': `sb-gualxudgbmpuhjbumfeh-auth-token=${auth.session.access_token}`
      }
    });
    const data = await response.json();
    console.log('   Response:', data);
  } catch (err) {
    console.log('   Error:', err.message);
  }

  // Also test recent alerts
  console.log('\n3. Testing recent-alerts API:');
  try {
    const response = await fetch('http://localhost:3001/api/notifications/recent-alerts/', {
      headers: {
        'Authorization': `Bearer ${auth.session.access_token}`,
        'Cookie': `sb-gualxudgbmpuhjbumfeh-auth-token=${auth.session.access_token}`
      }
    });
    const data = await response.json();
    console.log('   Response:', { alertCount: data.alerts?.length || 0 });
  } catch (err) {
    console.log('   Error:', err.message);
  }
}

testConnectionAPI().catch(console.error);
#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('🔍 Checking tweet_analyses table schema...\n');
  
  try {
    // Get the first row to see the column structure
    const { data: sample, error } = await supabase
      .from('tweet_analyses')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error fetching sample:', error);
      return;
    }

    if (!sample || sample.length === 0) {
      console.log('⚠️ No rows in tweet_analyses table');
      return;
    }

    console.log('✅ Available columns in tweet_analyses:');
    console.log(Object.keys(sample[0]));
    
    console.log('\n📋 Sample row:');
    console.log(JSON.stringify(sample[0], null, 2));

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkSchema();
#!/usr/bin/env node

require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PROJECT_ID = process.env.SUPABASE_PROJECT_ID;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

async function testNitterSearch() {
  console.log('🧪 Testing nitter-search Edge Function...\n');

  const functionUrl = `${SUPABASE_URL}/functions/v1/nitter-search`;
  
  const testData = {
    projectId: 'kaspa',
    projectName: 'Kaspa',
    symbol: 'kas',
    twitterHandle: 'KaspaCurrency'
  };

  console.log('📤 Sending request to:', functionUrl);
  console.log('📋 Test data:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('\n✅ Response received!');
    console.log(`Found ${result.tweets?.length || 0} tweets`);
    console.log(`High importance tweets: ${result.highImportanceTweets?.length || 0}`);
    
    if (result.tweets && result.tweets.length > 0) {
      console.log('\n📊 Sample tweet:');
      const sample = result.tweets[0];
      console.log(`- Text: ${sample.tweet_text.substring(0, 100)}...`);
      console.log(`- Score: ${sample.importance_score}/10`);
      console.log(`- Category: ${sample.category}`);
      console.log(`- AI Analyzed: ${sample.is_ai_analyzed}`);
    }

    console.log('\n📈 Summary:');
    console.log(`- Total tweets found: ${result.summary?.total_tweets || 0}`);
    console.log(`- New tweets: ${result.summary?.new_tweets || 0}`);
    console.log(`- Duplicates: ${result.summary?.duplicates || 0}`);
    console.log(`- High importance: ${result.summary?.high_importance || 0}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nMake sure:');
    console.error('1. The Edge Function is deployed');
    console.error('2. ScraperAPI key is set as a secret');
    console.error('3. Gemini API key is set as a secret');
  }
}

// Test monitor-projects function
async function testMonitorProjects() {
  console.log('\n\n🧪 Testing monitor-projects Edge Function...\n');

  const functionUrl = `${SUPABASE_URL}/functions/v1/monitor-projects`;
  
  console.log('📤 Sending request to:', functionUrl);

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'x-cron-key': process.env.CRONJOB_API_KEY || 'test-key'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('\n✅ Monitor response:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('\n❌ Monitor test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testNitterSearch();
  
  // Wait a bit before testing monitor
  console.log('\n⏳ Waiting 3 seconds before testing monitor function...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await testMonitorProjects();
}

runTests();
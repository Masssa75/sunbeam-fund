const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTweetColumns() {
  console.log('Checking tweet_analyses table structure...\n');
  
  // Get one tweet to see all columns
  const { data: sampleTweet, error } = await supabase
    .from('tweet_analyses')
    .select('*')
    .gte('importance_score', 9)
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Sample tweet columns:');
  console.log(Object.keys(sampleTweet).join(', '));
  
  console.log('\nLooking for summary fields:');
  Object.keys(sampleTweet).forEach(key => {
    if (key.includes('summary') || key.includes('Summary')) {
      console.log(`- ${key}: ${sampleTweet[key]}`);
    }
  });
  
  console.log('\nFull tweet data:');
  console.log(JSON.stringify(sampleTweet, null, 2));
}

checkTweetColumns().catch(console.error);
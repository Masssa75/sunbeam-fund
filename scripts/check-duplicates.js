const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDuplicates() {
  // Get all tweets grouped by project
  const { data: tweets, error } = await supabase
    .from('tweet_analyses')
    .select('id, project_id, tweet_text, created_at, importance_score')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Total tweets:', tweets.length);
  
  // Group by project
  const byProject = {};
  tweets.forEach(tweet => {
    if (!byProject[tweet.project_id]) {
      byProject[tweet.project_id] = [];
    }
    byProject[tweet.project_id].push(tweet);
  });
  
  console.log('\nTweets by project:');
  Object.keys(byProject).forEach(projectId => {
    console.log(`${projectId}: ${byProject[projectId].length} tweets`);
  });
  
  // Check for duplicates within each project
  console.log('\nDuplicate analysis:');
  Object.keys(byProject).forEach(projectId => {
    const projectTweets = byProject[projectId];
    const textMap = {};
    const duplicates = [];
    
    projectTweets.forEach(tweet => {
      if (textMap[tweet.tweet_text]) {
        duplicates.push({
          original: textMap[tweet.tweet_text],
          duplicate: tweet
        });
      } else {
        textMap[tweet.tweet_text] = tweet;
      }
    });
    
    console.log(`${projectId}: ${duplicates.length} duplicates found`);
    if (duplicates.length > 0) {
      console.log('  First few duplicates:');
      duplicates.slice(0, 3).forEach(dup => {
        console.log(`    - Original: ${dup.original.id} (${dup.original.created_at})`);
        console.log(`      Duplicate: ${dup.duplicate.id} (${dup.duplicate.created_at})`);
        console.log(`      Text: ${dup.original.tweet_text.substring(0, 100)}...\n`);
      });
    }
  });
}

checkDuplicates().catch(console.error);
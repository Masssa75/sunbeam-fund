const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanDuplicates() {
  console.log('Finding and removing duplicate tweets...');
  
  // Get all tweets
  const { data: tweets, error } = await supabase
    .from('tweet_analyses')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Total tweets: ${tweets.length}`);
  
  // Group by project and find duplicates
  const byProject = {};
  tweets.forEach(tweet => {
    if (!byProject[tweet.project_id]) {
      byProject[tweet.project_id] = [];
    }
    byProject[tweet.project_id].push(tweet);
  });
  
  for (const projectId of Object.keys(byProject)) {
    const projectTweets = byProject[projectId];
    console.log(`\nProcessing ${projectId} (${projectTweets.length} tweets):`);
    
    const seen = new Set();
    const toDelete = [];
    
    // Sort by created_at to keep the oldest (first) occurrence
    projectTweets.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    projectTweets.forEach(tweet => {
      if (seen.has(tweet.tweet_text)) {
        toDelete.push(tweet.id);
        console.log(`  Found duplicate: ${tweet.id} (${tweet.created_at})`);
      } else {
        seen.add(tweet.tweet_text);
      }
    });
    
    console.log(`  ${toDelete.length} duplicates to remove`);
    
    if (toDelete.length > 0) {
      // Delete duplicates in batches
      for (let i = 0; i < toDelete.length; i += 10) {
        const batch = toDelete.slice(i, i + 10);
        const { error: deleteError } = await supabase
          .from('tweet_analyses')
          .delete()
          .in('id', batch);
          
        if (deleteError) {
          console.error(`    Error deleting batch:`, deleteError);
        } else {
          console.log(`    Deleted batch of ${batch.length} duplicates`);
        }
      }
    }
  }
  
  // Final count
  const { data: finalTweets, error: finalError } = await supabase
    .from('tweet_analyses')
    .select('id');
    
  if (!finalError) {
    console.log(`\nCleanup complete. Final tweet count: ${finalTweets.length}`);
  }
}

cleanDuplicates().catch(console.error);
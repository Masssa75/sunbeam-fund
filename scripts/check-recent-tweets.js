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

async function checkRecentTweets() {
  console.log('🔍 Checking recent tweets from the last 5 minutes...\n');
  
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  
  try {
    const { data: tweets, error } = await supabase
      .from('tweet_analyses')
      .select('created_at, project_id, tweet_text, importance_score, author')
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching tweets:', error);
      return;
    }

    if (!tweets || tweets.length === 0) {
      console.log('⏳ No tweets found in the last 5 minutes');
      console.log('   This is normal if the cron job just started or no new tweets were posted');
    } else {
      console.log(`✅ Found ${tweets.length} recent tweets:`);
      tweets.forEach((tweet, index) => {
        const time = new Date(tweet.created_at).toLocaleTimeString();
        console.log(`${index + 1}. [${time}] ${tweet.author} - Score: ${tweet.importance_score}/10`);
        console.log(`   ${tweet.tweet_text.substring(0, 100)}...`);
        console.log();
      });
    }

    // Also check the last monitored times
    const { data: projects, error: projectsError } = await supabase
      .from('monitored_projects')
      .select('project_name, last_monitored')
      .order('last_monitored', { ascending: false });

    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError);
      return;
    }

    console.log('\n📊 Project monitoring status:');
    projects.forEach(project => {
      const time = project.last_monitored 
        ? new Date(project.last_monitored).toLocaleTimeString()
        : 'Never';
      console.log(`   ${project.project_name}: Last monitored at ${time}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkRecentTweets();
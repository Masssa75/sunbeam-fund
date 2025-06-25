#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const https = require('https');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const apiKey = process.env.CRONJOB_API_KEY;

async function checkStatus() {
  console.log('🚀 SUNBEAM MONITORING SYSTEM STATUS\n');
  console.log('='.repeat(50));
  
  // 1. Check cron job status
  console.log('\n📅 CRON JOB STATUS:');
  await checkCronJob();
  
  // 2. Check monitored projects
  console.log('\n🎯 MONITORED PROJECTS:');
  await checkMonitoredProjects();
  
  // 3. Check recent tweet activity
  console.log('\n📊 RECENT TWEET ACTIVITY:');
  await checkRecentTweets();
  
  // 4. Check Telegram connections
  console.log('\n📱 TELEGRAM CONNECTIONS:');
  await checkTelegramConnections();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ System Status Check Complete');
}

function checkCronJob() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.cron-job.org',
      port: 443,
      path: '/jobs',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const sunbeamJob = result.jobs.find(job => job.jobId === 6263672);
          
          if (sunbeamJob) {
            const status = sunbeamJob.lastStatus === 1 ? '✅ SUCCESS' : '❌ ERROR';
            const enabled = sunbeamJob.enabled ? '✅ ENABLED' : '❌ DISABLED';
            
            console.log(`   Job ID: ${sunbeamJob.jobId}`);
            console.log(`   Status: ${enabled}`);
            console.log(`   Last Run: ${status}`);
            console.log(`   Duration: ${sunbeamJob.lastDuration}ms`);
            console.log(`   Last Execution: ${new Date(sunbeamJob.lastExecution * 1000).toLocaleString()}`);
            console.log(`   Next Execution: ${new Date(sunbeamJob.nextExecution * 1000).toLocaleString()}`);
          }
        } catch (e) {
          console.log('   ❌ Error fetching cron job status');
        }
        resolve();
      });
    });

    req.on('error', () => {
      console.log('   ❌ Error connecting to cron-job.org');
      resolve();
    });
    req.end();
  });
}

async function checkMonitoredProjects() {
  try {
    const { data: projects, error } = await supabase
      .from('monitored_projects')
      .select('*')
      .eq('is_active', true)
      .order('last_monitored', { ascending: false });
      
    if (error) throw error;
    
    console.log(`   Total Active Projects: ${projects.length}`);
    
    projects.forEach(project => {
      const lastMonitored = project.last_monitored 
        ? new Date(project.last_monitored).toLocaleString()
        : 'Never';
        
      console.log(`   • ${project.project_name} (${project.symbol})`);
      console.log(`     Twitter: @${project.twitter_handle}`);
      console.log(`     Last Monitored: ${lastMonitored}`);
      console.log(`     Alert Threshold: ${project.alert_threshold || 7}/10`);
    });
  } catch (error) {
    console.log('   ❌ Error fetching monitored projects:', error.message);
  }
}

async function checkRecentTweets() {
  try {
    const { data: tweets, error } = await supabase
      .from('tweet_analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    
    console.log(`   Total Recent Tweets: ${tweets.length}`);
    
    // Group by importance
    const highImportance = tweets.filter(t => t.importance_score >= 7);
    const mediumImportance = tweets.filter(t => t.importance_score >= 4 && t.importance_score < 7);
    const lowImportance = tweets.filter(t => t.importance_score < 4);
    
    console.log(`   • High Importance (≥7): ${highImportance.length} tweets`);
    console.log(`   • Medium Importance (4-6): ${mediumImportance.length} tweets`);
    console.log(`   • Low Importance (<4): ${lowImportance.length} tweets`);
    
    if (tweets.length > 0) {
      const latest = tweets[0];
      console.log(`   Latest Tweet: ${new Date(latest.created_at).toLocaleString()}`);
      console.log(`   Project: ${latest.project_name || 'Unknown'} (Score: ${latest.importance_score}/10)`);
    }
    
    // Check for alerts that should have been sent
    const alertWorthy = tweets.filter(t => t.importance_score >= 7);
    if (alertWorthy.length > 0) {
      console.log(`   🚨 ${alertWorthy.length} tweets should trigger Telegram alerts`);
    }
  } catch (error) {
    console.log('   ❌ Error fetching recent tweets:', error.message);
  }
}

async function checkTelegramConnections() {
  try {
    const { data: connections, error } = await supabase
      .from('telegram_connections')
      .select('*')
      .not('telegram_chat_id', 'is', null);
      
    if (error) throw error;
    
    console.log(`   Total Active Connections: ${connections.length}`);
    
    connections.forEach(conn => {
      const prefs = conn.notification_preferences || {};
      console.log(`   • ${conn.telegram_username}`);
      console.log(`     Chat ID: ${conn.telegram_chat_id}`);
      console.log(`     Alert Threshold: ${prefs.threshold || 7}/10`);
      console.log(`     Notifications: ${prefs.important_tweets !== false ? 'Enabled' : 'Disabled'}`);
    });
    
    if (connections.length === 0) {
      console.log('   ⚠️  No active Telegram connections. Users need to connect via /admin/telegram');
    }
  } catch (error) {
    console.log('   ❌ Error fetching Telegram connections:', error.message);
  }
}

checkStatus().catch(console.error);
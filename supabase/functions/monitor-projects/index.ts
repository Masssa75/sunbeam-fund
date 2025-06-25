import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-key',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify cron authentication
    const cronKey = req.headers.get('x-cron-key')
    const authHeader = req.headers.get('authorization')
    
    // Allow both cron key authentication and Supabase service role auth
    const isValidCronKey = cronKey === Deno.env.get('CRON_SECRET_KEY')
    const isValidServiceRole = authHeader === `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
    
    if (!isValidCronKey && !isValidServiceRole) {
      console.log('Auth failed - cronKey:', cronKey, 'authHeader:', authHeader?.substring(0, 20))
      return new Response('Unauthorized', { status: 401 })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the next project to monitor (oldest last_monitored)
    const { data: project, error: fetchError } = await supabase
      .from('monitored_projects')
      .select('*')
      .eq('is_active', true)
      .order('last_monitored', { ascending: true, nullsFirst: true })
      .limit(1)
      .single()

    if (fetchError || !project) {
      console.log('No projects to monitor')
      return new Response(JSON.stringify({ message: 'No projects to monitor' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    console.log(`Monitoring project: ${project.project_name} (${project.symbol})`)

    // Call the nitter-search function for this project
    const searchResponse = await fetch(`${supabaseUrl}/functions/v1/nitter-search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        projectId: project.project_id,
        projectName: project.project_name,
        symbol: project.symbol,
        twitterHandle: project.twitter_handle
      })
    })

    const searchResult = await searchResponse.json()
    console.log('Search response status:', searchResponse.status)
    console.log('Search result:', JSON.stringify(searchResult))

    // Update last_monitored timestamp
    await supabase
      .from('monitored_projects')
      .update({ last_monitored: new Date().toISOString() })
      .eq('id', project.id)

    // Check if any tweets have importance >= threshold and send notifications
    if (searchResult.tweets && searchResult.tweets.length > 0) {
      // Get all active telegram connections for investors
      const { data: connections } = await supabase
        .from('investor_telegram')
        .select('*')
        .eq('is_active', true)
        .not('telegram_chat_id', 'is', null)
      
      if (connections && connections.length > 0) {
        // Filter tweets that meet the importance threshold
        const threshold = project.alert_threshold || 7
        const importantTweets = searchResult.tweets.filter(
          (tweet: any) => tweet.importance_score >= threshold
        )
        
        if (importantTweets.length > 0) {
          console.log(`Found ${importantTweets.length} important tweets (score >= ${threshold})`)
          
          for (const connection of connections) {
            const prefs = connection.notification_preferences || {}
            
            // Check if user wants important alerts
            if (prefs.important_alerts !== false) { // Default to true if not specified
              console.log(`Sending ${importantTweets.length} important tweets to ${connection.telegram_username || connection.telegram_chat_id}`)
              
              // Format notification message
              const message = formatNotificationMessage(project, importantTweets)
              
              // Send via Telegram
              await sendTelegramNotification(connection.telegram_chat_id, message, supabaseUrl, supabaseServiceKey)
              
              // Log the notification
              await supabase
                .from('notification_logs')
                .insert({
                  investor_telegram_id: connection.id,
                  notification_type: 'alert',
                  message: message,
                  metadata: {
                    project_id: project.project_id,
                    project_name: project.project_name,
                    tweet_count: importantTweets.length,
                    tweet_ids: importantTweets.map((t: any) => t.tweet_id)
                  }
                })
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      project: project.project_name,
      tweetsFound: searchResult.newTweetsCount || 0,
      nextCheck: new Date(Date.now() + 60000).toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Monitor error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

// Helper function to format notification message
function formatNotificationMessage(project: any, tweets: any[]): string {
  const header = `🚨 <b>${project.project_name} (${project.symbol})</b>\n`
  const count = tweets.length === 1 ? '1 important update' : `${tweets.length} important updates`
  
  let message = `${header}Found ${count}:\n\n`
  
  // Show top 3 tweets
  const topTweets = tweets
    .sort((a, b) => b.importance_score - a.importance_score)
    .slice(0, 3)
  
  topTweets.forEach((tweet, index) => {
    const score = tweet.importance_score
    const scoreEmoji = score >= 9 ? '🔴' : score >= 7 ? '🟡' : '🟢'
    
    message += `${scoreEmoji} <b>Score: ${score}/10</b>\n`
    
    if (tweet.ai_summary) {
      message += `${tweet.ai_summary}\n`
    } else {
      // Truncate tweet text if too long
      const text = tweet.text.length > 200 
        ? tweet.text.substring(0, 200) + '...' 
        : tweet.text
      message += `${text}\n`
    }
    
    message += `<a href="https://twitter.com/${tweet.author_handle}/status/${tweet.tweet_id}">View Tweet</a>\n\n`
  })
  
  if (tweets.length > 3) {
    message += `<i>...and ${tweets.length - 3} more updates</i>\n\n`
  }
  
  message += `<a href="https://sunbeam.capital/admin/twitter-monitoring">View all tweets</a>`
  
  return message
}

// Helper function to send Telegram notification
async function sendTelegramNotification(
  chatId: number, 
  message: string, 
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<void> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-telegram-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: chatId.toString(),
        message,
        parseMode: 'HTML'
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to send Telegram notification:', error)
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
  }
}
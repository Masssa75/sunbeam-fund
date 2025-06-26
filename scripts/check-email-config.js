import fetch from 'node-fetch'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') })

const SUPABASE_ACCESS_TOKEN = 'sbp_6f04b779bfc9e9fb52600595aabdfb3545a84add'
const PROJECT_ID = 'gualxudgbmpuhjbumfeh'

async function checkEmailConfig() {
  console.log('🔍 Checking Supabase email configuration...\n')
  
  try {
    // Get project configuration
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/config/auth`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    const config = await response.json()
    
    console.log('📧 Email Configuration:')
    console.log('- Email enabled:', config.ENABLE_EMAIL_SIGNUP || true)
    console.log('- Email confirmation:', config.ENABLE_EMAIL_AUTOCONFIRM || false)
    console.log('- SMTP Host:', config.SMTP_HOST || 'Using Supabase default')
    console.log('- SMTP Port:', config.SMTP_PORT || 'Using Supabase default')
    console.log('- SMTP User:', config.SMTP_USER || 'Using Supabase default')
    console.log('- From address:', config.SMTP_SENDER || 'Using Supabase default')
    
    console.log('\n📋 Email Template URLs:')
    console.log('- Confirm signup:', config.MAILER_URLPATHS_CONFIRMATION || '/auth/v1/verify')
    console.log('- Password recovery:', config.MAILER_URLPATHS_RECOVERY || '/auth/v1/verify')
    console.log('- Magic link:', config.MAILER_URLPATHS_EMAIL_CHANGE || '/auth/v1/verify')
    
    console.log('\n⚠️  Important Notes:')
    if (!config.SMTP_HOST) {
      console.log('❗ Using Supabase\'s default email service')
      console.log('   - Limited to 3 emails per hour on free tier')
      console.log('   - Emails may go to spam folder')
      console.log('   - For production, configure custom SMTP')
    }
    
    console.log('\n🔧 To configure custom SMTP:')
    console.log('1. Go to: https://app.supabase.com/project/gualxudgbmpuhjbumfeh/settings/auth')
    console.log('2. Scroll to "Email Settings"')
    console.log('3. Enable "Custom SMTP"')
    console.log('4. Add your SMTP credentials (Gmail, SendGrid, etc.)')
    
    console.log('\n📨 Recommended SMTP services:')
    console.log('- SendGrid (100 emails/day free)')
    console.log('- Mailgun (5,000 emails/month free)')
    console.log('- Amazon SES (62,000 emails/month free)')
    console.log('- Gmail SMTP (500 emails/day)')
    
  } catch (error) {
    console.error('❌ Error checking email config:', error)
  }
}

// Check recent auth logs
async function checkAuthLogs() {
  console.log('\n\n📊 Checking recent auth logs...\n')
  
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/logs/auth`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.log('Could not fetch auth logs')
      return
    }
    
    const logs = await response.json()
    
    // Filter for password reset related logs
    const resetLogs = logs.filter(log => 
      log.path?.includes('recover') || 
      log.msg?.includes('password') ||
      log.msg?.includes('reset')
    ).slice(0, 5)
    
    if (resetLogs.length > 0) {
      console.log('Recent password reset attempts:')
      resetLogs.forEach(log => {
        console.log(`- ${new Date(log.timestamp).toLocaleString()}: ${log.msg || log.path}`)
      })
    } else {
      console.log('No recent password reset logs found')
    }
    
  } catch (error) {
    console.log('Could not check auth logs')
  }
}

// Run checks
checkEmailConfig().then(() => checkAuthLogs())
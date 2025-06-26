import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Testing password reset functionality...')
console.log('Supabase URL:', supabaseUrl)

if (!supabaseAnonKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testPasswordReset() {
  try {
    // Test with a real email address
    const testEmail = 'marc@minutevideos.com'
    
    console.log(`\n📧 Attempting to send password reset email to: ${testEmail}`)
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'https://sunbeam.capital/reset-password',
    })
    
    if (error) {
      console.error('❌ Error sending password reset email:', error)
      return
    }
    
    console.log('✅ Password reset email request sent successfully!')
    console.log('Response data:', data)
    
    // Check Supabase email settings
    console.log('\n📋 Important notes:')
    console.log('1. By default, Supabase uses their built-in email service')
    console.log('2. Emails might go to spam folder - check there!')
    console.log('3. For production, you should configure custom SMTP in Supabase dashboard')
    console.log('4. Free tier has email limits (3 emails per hour)')
    console.log('\n🔍 To check email configuration:')
    console.log('   - Go to https://app.supabase.com/project/gualxudgbmpuhjbumfeh/settings/auth')
    console.log('   - Check "Email Settings" section')
    console.log('   - Consider setting up custom SMTP for reliable delivery')
    
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

// Run the test
testPasswordReset()
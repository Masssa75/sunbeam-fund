import fetch from 'node-fetch'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') })

async function testCustomReset() {
  console.log('🔧 Testing custom password reset...\n')
  
  const testEmail = 'marc@minutevideos.com'
  
  try {
    // Test the custom reset endpoint
    const response = await fetch('http://localhost:3000/api/auth/custom-reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      console.error('❌ Error:', result.error)
      return
    }
    
    console.log('✅ Reset link generated successfully!')
    
    if (result.resetLink) {
      console.log('\n🔗 Password Reset Link:')
      console.log(result.resetLink)
      console.log('\n📋 This link:')
      console.log('- Expires in 1 hour')
      console.log('- Can be manually sent to the user')
      console.log('- Will work in any browser')
    }
    
    console.log('\n📧 Email Delivery Options:')
    console.log('1. Check spam folder for Supabase default emails')
    console.log('2. Configure custom SMTP in Supabase dashboard')
    console.log('3. Use the generated link above (development only)')
    console.log('4. Implement custom email service (SendGrid, Resend, etc.)')
    
  } catch (error) {
    console.error('❌ Error testing custom reset:', error)
  }
}

// Note about running locally
console.log('⚠️  Note: This test requires the Next.js dev server to be running')
console.log('Run `npm run dev` in another terminal if not already running\n')

// Run the test
testCustomReset()
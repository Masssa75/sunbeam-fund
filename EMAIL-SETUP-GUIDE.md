# Email Setup Guide for Sunbeam Capital

## Current Issue
The password reset emails are not being delivered reliably because:
- Supabase free tier limits emails to 3 per hour
- Default Supabase emails often go to spam
- No custom SMTP is configured

## Solution Options

### Option 1: Configure Custom SMTP in Supabase Dashboard (Recommended)

1. **Go to Supabase Email Settings**
   - Visit: https://app.supabase.com/project/gualxudgbmpuhjbumfeh/settings/auth
   - Scroll to "Email Settings" section
   - Toggle ON "Enable Custom SMTP"

2. **Choose an SMTP Provider**

   **Gmail SMTP (Quick Setup)**:
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - SMTP User: Your Gmail address
   - SMTP Pass: App-specific password (not your regular password)
   - Sender email: Your Gmail address
   - Sender name: `Sunbeam Capital`
   
   To get Gmail app password:
   1. Enable 2FA on your Google account
   2. Go to https://myaccount.google.com/apppasswords
   3. Generate an app password for "Mail"

   **SendGrid (Professional)**:
   - Sign up at https://sendgrid.com (100 emails/day free)
   - SMTP Host: `smtp.sendgrid.net`
   - SMTP Port: `587`
   - SMTP User: `apikey`
   - SMTP Pass: Your SendGrid API key
   - Sender email: Verified sender address
   - Sender name: `Sunbeam Capital`

   **Resend (Modern Alternative)**:
   - Sign up at https://resend.com (3,000 emails/month free)
   - SMTP Host: `smtp.resend.com`
   - SMTP Port: `587`
   - SMTP User: `resend`
   - SMTP Pass: Your Resend API key
   - Sender email: Verified domain email
   - Sender name: `Sunbeam Capital`

3. **Configure Email Templates** (Optional)
   - In Supabase dashboard, go to "Email Templates"
   - Customize the password reset email template
   - Add your branding and messaging

### Option 2: Implement Custom Email Sending with Resend API

If you prefer more control over email sending, here's how to implement custom email handling:

1. **Install Resend**:
   ```bash
   npm install resend
   ```

2. **Create API Route** `/src/app/api/auth/send-reset-email/route.ts`:
   ```typescript
   import { NextResponse } from 'next/server'
   import { Resend } from 'resend'
   import { createClient } from '@supabase/supabase-js'

   const resend = new Resend(process.env.RESEND_API_KEY)
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_KEY!
   )

   export async function POST(request: Request) {
     const { email } = await request.json()
     
     // Generate password reset token
     const { data, error } = await supabase.auth.admin.generateLink({
       type: 'recovery',
       email: email,
     })
     
     if (error) {
       return NextResponse.json({ error: error.message }, { status: 400 })
     }
     
     // Send email with Resend
     const { error: emailError } = await resend.emails.send({
       from: 'Sunbeam Capital <noreply@sunbeam.capital>',
       to: email,
       subject: 'Reset your password',
       html: `
         <h1>Reset your password</h1>
         <p>Click the link below to reset your password:</p>
         <a href="${data.properties.action_link}">Reset Password</a>
         <p>This link will expire in 1 hour.</p>
       `
     })
     
     if (emailError) {
       return NextResponse.json({ error: emailError.message }, { status: 400 })
     }
     
     return NextResponse.json({ success: true })
   }
   ```

3. **Update Frontend** to use custom endpoint

### Option 3: Quick Fix - Check Spam Folder

As an immediate solution:
1. Check your spam/junk folder
2. Add `noreply@mail.app.supabase.io` to your contacts
3. Try requesting a password reset again

## Testing Email Delivery

Run this script to test if emails are being sent:
```bash
node scripts/test-password-reset.js
```

## Monitoring Email Status

To check if emails were sent:
1. Go to Supabase dashboard
2. Navigate to "Logs" → "Auth"
3. Look for password reset events

## Production Recommendations

1. **Always use custom SMTP** for production
2. **Verify sender domain** to improve deliverability
3. **Monitor email bounce rates**
4. **Set up SPF/DKIM records** for your domain
5. **Consider transactional email services** like SendGrid or Resend

## Immediate Action Required

1. Check spam folder for existing reset emails
2. Configure custom SMTP in Supabase dashboard (Option 1)
3. Test password reset flow again
4. Monitor email delivery

The easiest immediate fix is to configure Gmail SMTP in the Supabase dashboard, which takes about 5 minutes.
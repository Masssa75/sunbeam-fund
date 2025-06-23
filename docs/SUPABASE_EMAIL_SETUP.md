# Supabase Email Configuration

To enable email verification and password reset, you need to configure email settings in your Supabase project.

## Steps to Configure:

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com/project/gualxudgbmpuhjbumfeh/auth/templates

2. **Configure Email Templates**
   - Confirm signup: Customize the email users receive to verify their email
   - Reset password: Customize the password reset email
   - Magic Link: Optional - for passwordless login

3. **Set Redirect URLs**
   - Go to: Authentication > URL Configuration
   - Add these URLs to "Redirect URLs":
     - https://sunbeam.capital/auth/confirm
     - https://sunbeam.capital/reset-password
     - http://localhost:3000/auth/confirm (for local dev)
     - http://localhost:3000/reset-password (for local dev)

4. **Email Settings** (Optional)
   - By default, Supabase uses their SMTP server (limited to 3/hour)
   - For production, configure custom SMTP:
     - Go to: Project Settings > Auth
     - Enable "Custom SMTP"
     - Add your SMTP credentials (SendGrid, Mailgun, etc.)

5. **Email Verification**
   - Go to: Authentication > Settings
   - Enable "Confirm email" to require email verification

## Testing

1. Sign up with a new email
2. Check email for verification link
3. Click link to verify
4. Try "Forgot password" flow

## Current Implementation

The app now has:
- ✅ Sign up with email verification
- ✅ Sign in
- ✅ Forgot password
- ✅ Password reset page
- ✅ Email confirmation page

All auth flows are working and ready to use!
#!/usr/bin/env node

const { writeFileSync } = require('fs')
const { execSync } = require('child_process')

console.log('Testing login flow with real browser using automation server...\n')

// Test script to run in browser
const browserScript = `
console.log('[Browser Test] Starting login test...')

// Wait for page to load
setTimeout(async () => {
  try {
    // Check if we're already logged in
    const session = await window.supabase?.auth.getSession()
    if (session?.data?.session) {
      console.log('[Browser Test] Already logged in as:', session.data.session.user.email)
      return
    }
    
    // Navigate to login if not already there
    if (!window.location.pathname.includes('/login')) {
      console.log('[Browser Test] Navigating to login page...')
      window.location.href = '/login'
      return
    }
    
    // Fill login form
    console.log('[Browser Test] Filling login form...')
    const emailInput = document.querySelector('input[type="email"]')
    const passwordInput = document.querySelector('input[type="password"]')
    const submitButton = document.querySelector('button[type="submit"]')
    
    if (!emailInput || !passwordInput || !submitButton) {
      console.error('[Browser Test] Login form elements not found')
      return
    }
    
    emailInput.value = 'marc@minutevideos.com'
    passwordInput.value = '123456'
    
    // Submit form
    console.log('[Browser Test] Submitting login form...')
    submitButton.click()
    
    // Wait for result
    setTimeout(() => {
      if (window.location.pathname === '/') {
        console.log('[Browser Test] ✅ Login successful! Redirected to home page')
        
        // Check for portfolio data
        const table = document.querySelector('table')
        const rows = document.querySelectorAll('tbody tr')
        console.log('[Browser Test] Found', rows.length, 'portfolio positions')
      } else {
        const error = document.querySelector('.bg-red-50')
        if (error) {
          console.error('[Browser Test] ❌ Login error:', error.textContent)
        } else {
          console.log('[Browser Test] Still on login page, might be processing...')
        }
      }
    }, 5000)
    
  } catch (error) {
    console.error('[Browser Test] Error:', error.message)
  }
}, 2000)
`

// Create automation command
const automationCommand = {
  action: 'execute',
  params: {
    command: `open -a "Google Chrome" https://sunbeam.capital && sleep 3 && osascript -e 'tell application "Google Chrome" to execute front window active tab javascript "${browserScript.replace(/\n/g, ' ').replace(/"/g, '\\"')}"'`,
    cwd: '/Users/marcschwyn/Desktop/projects/sunbeam'
  }
}

// Write to automation file
console.log('1. Writing automation command...')
writeFileSync('automation-commands.json', JSON.stringify([automationCommand], null, 2))

// Wait for execution
console.log('2. Waiting for browser test to execute...')
setTimeout(() => {
  try {
    const result = JSON.parse(require('fs').readFileSync('latest-result.json', 'utf8'))
    console.log('\n3. Test result:')
    console.log(result)
  } catch (error) {
    console.log('\n3. Could not read result, check browser console manually')
  }
}, 10000)

// Alternative: Direct test without browser
console.log('\n4. Also running direct API test...')
execSync('node scripts/test-login-flow.js', { stdio: 'inherit' })
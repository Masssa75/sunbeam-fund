const { execSync } = require('child_process')

console.log('Checking for specific errors on the page...\n')

// Get more context around error messages
console.log('1. Checking homepage HTML for error context...')
try {
  const errorContext = execSync('curl -s https://sunbeam.capital/ | grep -B2 -A2 -i "error" | head -20', { encoding: 'utf8' })
  console.log('Error context:\n', errorContext)
} catch (e) {
  console.log('No error context found')
}

// Check console output
console.log('\n2. Checking browser console output...')
console.log('Visit: https://sunbeam.capital')
console.log('Open DevTools (F12) → Console tab')
console.log('Look for red error messages')

// Check network tab
console.log('\n3. Common issues to check:')
console.log('- ReferenceError: createSupabaseBrowser is not defined')
console.log('- Failed to load resource (404 errors)')
console.log('- CORS policy errors')
console.log('- Uncaught TypeError')

// Test the test-login-debug page directly
console.log('\n4. Testing debug page directly...')
try {
  const debugResponse = execSync('curl -s https://sunbeam.capital/test-login-debug/ | grep -o "Login Debug Test" | head -1', { encoding: 'utf8' })
  if (debugResponse.includes('Login Debug Test')) {
    console.log('✅ Debug page loads correctly')
    console.log('\nVisit: https://sunbeam.capital/test-login-debug/')
    console.log('This page will show if client-side auth is working')
  }
} catch (e) {
  console.log('❌ Debug page not loading')
}

// Quick fix attempt
console.log('\n5. Potential quick fix...')
console.log('The issue might be that client-browser.ts was deleted but still referenced')
console.log('Let me check for any remaining references...')

try {
  execSync('cd /Users/marcschwyn/Desktop/projects/sunbeam && grep -r "client-browser" src/ || true', { stdio: 'inherit' })
} catch (e) {
  // Ignore errors
}
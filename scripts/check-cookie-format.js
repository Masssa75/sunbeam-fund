const { createBrowserClient } = require('@supabase/ssr')

console.log('Checking Supabase cookie format...\n')

// Check what cookie names Supabase expects
const cookieOptions = {
  cookies: {
    get(name) {
      console.log('Supabase is trying to get cookie:', name)
      return undefined
    },
    set(name, value, options) {
      console.log('Supabase is trying to set cookie:', name)
      console.log('Value length:', value?.length || 0)
      console.log('Options:', options)
    },
    remove(name, options) {
      console.log('Supabase is trying to remove cookie:', name)
    }
  }
}

const supabase = createBrowserClient(
  'https://gualxudgbmpuhjbumfeh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjI5MTMsImV4cCI6MjA2NjIzODkxM30.t0m-kBXkyAWogfnDLLyXY1pl4oegxRmcvaG3NSs6rVM',
  cookieOptions
)

// Try to get session
console.log('\nTrying to get session...')
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Session:', data.session ? 'Found' : 'Not found')
  }
})

// Try to sign in
console.log('\nTrying to sign in...')
supabase.auth.signInWithPassword({
  email: 'marc@minutevideos.com',
  password: '123456'
}).then(({ data, error }) => {
  if (error) {
    console.error('Sign in error:', error)
  } else {
    console.log('Sign in successful')
  }
})
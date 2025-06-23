import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next()
  
  // Only check auth if Supabase is properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Skip auth check if using porta's credentials or not configured
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://midojobnawatvxhmhmoh.supabase.co') {
    return res
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session }, error } = await supabase.auth.getSession()
  
  // Log for debugging
  console.log('Middleware - Path:', req.nextUrl.pathname, 'Session:', !!session, 'Error:', error)

  // Protected routes (temporarily removing homepage to debug)
  const protectedPaths = ['/admin', '/portfolio']
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // Redirect to login if accessing protected route without session
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect to home if accessing login with active session
  if (req.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
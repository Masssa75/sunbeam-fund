import { NextResponse } from 'next/server'

export async function GET() {
  // Only show in development or with special header
  const isDev = process.env.NODE_ENV === 'development'
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    supabase_config: {
      has_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url_prefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || 'NOT_SET'
    },
    build_info: {
      build_time: new Date().toISOString(),
      vercel_env: process.env.VERCEL_ENV,
      netlify_env: process.env.CONTEXT
    }
  })
}
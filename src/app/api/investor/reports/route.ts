import { NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/supabase/server-auth';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/types';

const ADMIN_EMAILS = [
  'marc@cyrator.com',
  'marc@minutevideos.com',
  'claude.admin@sunbeam.capital'
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const viewAsId = searchParams.get('viewAs');
    
    const { user } = await getServerAuth();
    
    if (!user && !viewAsId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let investorId = user?.id;
    
    // Handle admin viewing as investor
    if (viewAsId && user) {
      const isAdmin = ADMIN_EMAILS.includes(user.email || '');
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      investorId = viewAsId;
    }
    
    // For now, return mock reports
    // In production, this would fetch from the reports table filtered by investor
    const reports = [
      { id: '1', month: 'May', year: 2025, performance: 3.2 },
      { id: '2', month: 'April', year: 2025, performance: 5.1 },
      { id: '3', month: 'March', year: 2025, performance: -1.3 },
      { id: '4', month: 'February', year: 2025, performance: 8.7 },
      { id: '5', month: 'January', year: 2025, performance: 4.2 },
      { id: '6', month: 'December', year: 2024, performance: 6.8 },
      { id: '7', month: 'November', year: 2024, performance: 12.3 },
      { id: '8', month: 'October', year: 2024, performance: -3.2 },
      { id: '9', month: 'September', year: 2024, performance: 7.6 },
      { id: '10', month: 'August', year: 2024, performance: 9.1 },
    ];
    
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching investor reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
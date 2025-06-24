import { NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/supabase/server-auth';
import { investorService } from '@/lib/supabase/investor-service';

const ADMIN_EMAILS = [
  'marc@cyrator.com',
  'marc@minutevideos.com',
  'claude.admin@sunbeam.capital'
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const investorId = searchParams.get('id');
    
    if (!investorId) {
      return NextResponse.json({ error: 'Investor ID required' }, { status: 400 });
    }
    
    const { user } = await getServerAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    const isAdmin = ADMIN_EMAILS.includes(user.email || '');
    
    // Allow access if user is admin or viewing their own profile
    if (!isAdmin && user.id !== investorId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const investor = await investorService.getInvestorById(investorId);
    
    if (!investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 });
    }
    
    return NextResponse.json({ investor });
  } catch (error) {
    console.error('Error fetching investor info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
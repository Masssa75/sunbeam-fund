import { NextRequest, NextResponse } from 'next/server';
import { investorService } from '@/lib/supabase/investor-service';
import { getServerAuth } from '@/lib/server-auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const { user, isAdmin } = await getServerAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const investors = await investorService.getAllInvestors();
    return NextResponse.json({ investors });
  } catch (error) {
    console.error('Error in GET /api/investors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const { user, isAdmin } = await getServerAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const investor = await investorService.createInvestor(body);
    
    return NextResponse.json({ investor });
  } catch (error) {
    console.error('Error in POST /api/investors:', error);
    return NextResponse.json({ error: 'Failed to create investor' }, { status: 500 });
  }
}
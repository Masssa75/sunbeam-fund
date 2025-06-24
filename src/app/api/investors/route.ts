import { NextRequest, NextResponse } from 'next/server';
import { investorService } from '@/lib/supabase/investor-service';
import { authService } from '@/lib/supabase/auth-service';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await authService.isAdmin(user.id);
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
    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await authService.isAdmin(user.id);
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
import { NextRequest, NextResponse } from 'next/server';
import { investorService } from '@/lib/supabase/investor-service';
import { getServerAuth } from '@/lib/supabase/server-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isAdmin } = await getServerAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isOwnProfile = user.id === params.id;

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const investor = await investorService.getInvestorById(params.id);
    if (!investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 });
    }

    return NextResponse.json({ investor });
  } catch (error) {
    console.error('Error in GET /api/investors/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isAdmin } = await getServerAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const investor = await investorService.updateInvestor(params.id, body);
    
    return NextResponse.json({ investor });
  } catch (error) {
    console.error('Error in PUT /api/investors/[id]:', error);
    return NextResponse.json({ error: 'Failed to update investor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isAdmin } = await getServerAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const success = await investorService.deleteInvestor(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete investor' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/investors/[id]:', error);
    return NextResponse.json({ error: 'Failed to delete investor' }, { status: 500 });
  }
}
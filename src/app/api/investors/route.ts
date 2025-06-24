import { NextRequest, NextResponse } from 'next/server';
import { investorService } from '@/lib/supabase/investor-service';
import { getServerAuth } from '@/lib/supabase/server-auth';

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
    console.log('Creating investor with data:', body);
    
    // Validate required fields
    if (!body.id || !body.email || !body.name || !body.account_number || !body.share_percentage) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'id, email, name, account_number, and share_percentage are required'
      }, { status: 400 });
    }
    
    const investor = await investorService.createInvestor(body);
    
    return NextResponse.json({ investor });
  } catch (error) {
    console.error('Error in POST /api/investors:', error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to create investor',
      details: error instanceof Error ? error.message : JSON.stringify(error)
    }, { status: 500 });
  }
}
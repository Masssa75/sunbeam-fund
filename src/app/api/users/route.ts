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

    const users = await investorService.getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/supabase/server-auth';
import { investorService } from '@/lib/supabase/investor-service';
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
    
    if (!investorId) {
      return NextResponse.json({ error: 'No investor ID' }, { status: 400 });
    }
    
    // Get investor info
    const investor = await investorService.getInvestorById(investorId);
    
    if (!investor) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 });
    }
    
    // Get fund total value (sum of all positions)
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gualxudgbmpuhjbumfeh.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Ufcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.KBm6Q-s4y6sQFGGYvwF4KXdE4xCVK0k-OMOiR-vByH4';
    
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );
    
    // Get all positions to calculate fund total
    const { data: positions } = await supabase
      .from('positions')
      .select('cost_basis');
    
    const fundTotalValue = positions?.reduce((sum, pos) => sum + (pos.cost_basis || 0), 0) || 100000; // Default to 100k if no positions
    
    // Calculate investor's portion
    const shareDecimal = (investor.share_percentage || 0) / 100;
    const currentValue = fundTotalValue * shareDecimal * 1.375; // Mock 37.5% gain for now
    const totalReturn = currentValue - (investor.initial_investment || 0);
    const totalReturnPercent = investor.initial_investment ? (totalReturn / investor.initial_investment) * 100 : 0;
    
    // Mock monthly performance (in production, calculate from actual data)
    const monthlyReturn = currentValue * 0.038; // 3.8% monthly
    const monthlyReturnPercent = 3.8;
    
    const standing = {
      name: investor.name || investor.email,
      accountNumber: investor.account_number,
      sharePercentage: investor.share_percentage,
      initialInvestment: investor.initial_investment || 0,
      currentValue: Math.round(currentValue),
      totalReturn: Math.round(totalReturn),
      totalReturnPercent: Math.round(totalReturnPercent * 10) / 10,
      monthlyReturn: Math.round(monthlyReturn),
      monthlyReturnPercent,
      status: investor.status === 'active' ? 'Active' : 'Inactive'
    };
    
    return NextResponse.json({ standing });
  } catch (error) {
    console.error('Error fetching investor standing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
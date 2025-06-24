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
    
    // Get all positions with their current values
    const { data: positions } = await supabase
      .from('positions')
      .select('*');
    
    if (!positions || positions.length === 0) {
      return NextResponse.json({ error: 'No positions found' }, { status: 404 });
    }
    
    // Get current prices for all positions
    const coinIds = positions.map(p => p.project_id).filter(Boolean);
    const priceResponse = await fetch(`${request.nextUrl.origin}/api/coingecko/price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coinIds })
    });
    
    let prices: Record<string, number> = {};
    if (priceResponse.ok) {
      prices = await priceResponse.json();
    }
    
    // Calculate fund total value (cost basis and current value)
    let fundTotalCostBasis = 0;
    let fundTotalCurrentValue = 0;
    
    positions.forEach(position => {
      fundTotalCostBasis += position.cost_basis || 0;
      const currentPrice = prices[position.project_id] || 0;
      const currentValue = currentPrice * position.amount;
      fundTotalCurrentValue += currentValue;
    });
    
    console.log('[Investor Standing] Fund totals:', {
      fundTotalCostBasis,
      fundTotalCurrentValue,
      pricesReceived: Object.keys(prices).length,
      positionCount: positions.length
    });
    
    // If we couldn't get prices, use cost basis as fallback
    if (fundTotalCurrentValue === 0) {
      fundTotalCurrentValue = fundTotalCostBasis;
    }
    
    // Calculate investor's portion based on their share percentage
    const shareDecimal = (investor.share_percentage || 0) / 100;
    const investorCurrentValue = fundTotalCurrentValue * shareDecimal;
    const investorCostBasis = investor.initial_investment || (fundTotalCostBasis * shareDecimal);
    
    // Calculate returns
    const totalReturn = investorCurrentValue - investorCostBasis;
    const totalReturnPercent = investorCostBasis > 0 ? (totalReturn / investorCostBasis) * 100 : 0;
    
    // Calculate monthly return (simplified - in production would compare to last month)
    // For now, assume 3.8% monthly growth as a placeholder
    const monthlyReturnPercent = 3.8;
    const monthlyReturn = investorCurrentValue * (monthlyReturnPercent / 100);
    
    console.log('[Investor Standing] Investor calculations:', {
      investorId,
      sharePercentage: investor.share_percentage,
      investorCostBasis,
      investorCurrentValue,
      totalReturn,
      totalReturnPercent
    });
    
    const standing = {
      name: investor.name || investor.email,
      accountNumber: investor.account_number,
      sharePercentage: investor.share_percentage,
      initialInvestment: investor.initial_investment || 0,
      currentValue: Math.round(investorCurrentValue),
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
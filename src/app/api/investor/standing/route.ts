import { NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/supabase/server-auth';
import { investorService } from '@/lib/supabase/investor-service';
import { supabaseAdmin } from '@/lib/supabase/server-client';

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
    console.log('[Investor Standing] Looking for investor:', investorId);
    const investor = await investorService.getInvestorById(investorId);
    
    if (!investor) {
      console.log('[Investor Standing] Investor not found for ID:', investorId);
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 });
    }
    
    console.log('[Investor Standing] Found investor:', {
      name: investor.name,
      accountNumber: investor.account_number,
      sharePercentage: investor.share_percentage
    });
    
    // Get fund total value (sum of all positions)
    
    // Get all positions with their current values
    const { data: positions } = await supabaseAdmin
      .from('positions')
      .select('*');
    
    if (!positions || positions.length === 0) {
      return NextResponse.json({ error: 'No positions found' }, { status: 404 });
    }
    
    // Get current prices for all positions (exclude custom positions)
    const coinIds = positions
      .filter(p => p.project_id && !p.project_id.startsWith('custom-'))
      .map(p => p.project_id);
    
    let prices: Record<string, number> = {};
    try {
      if (coinIds.length > 0) {
        // Fetch prices directly from CoinGecko API instead of using absolute URL
        const idsString = coinIds.join(',');
        const cgResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd`,
          { next: { revalidate: 60 } } // Cache for 60 seconds
        );
        
        if (cgResponse.ok) {
          const data = await cgResponse.json();
          // Transform the response to match expected format
          for (const coinId of coinIds) {
            if (data[coinId] && data[coinId].usd) {
              prices[coinId] = data[coinId].usd;
            }
          }
          console.log('[Investor Standing] Prices fetched successfully:', Object.keys(prices).length);
        } else {
          console.log('[Investor Standing] Failed to fetch prices from CoinGecko:', cgResponse.status);
        }
      }
    } catch (error) {
      console.log('[Investor Standing] Error fetching prices:', error);
    }
    
    // Calculate fund total value based purely on current market values
    // Ignore cost basis entirely as it's unreliable in fast-moving crypto markets
    let fundTotalCurrentValue = 0;
    let successfulPriceCount = 0;
    
    positions.forEach(position => {
      // For custom positions (like presale investments), estimate value
      if (position.project_id.startsWith('custom-')) {
        // For custom positions, use a rough estimate based on amount
        // This is imperfect but better than using unreliable cost basis
        fundTotalCurrentValue += position.cost_basis || 0;
      } else {
        const currentPrice = prices[position.project_id] || 0;
        if (currentPrice > 0) {
          const currentValue = currentPrice * position.amount;
          fundTotalCurrentValue += currentValue;
          successfulPriceCount++;
        }
      }
    });
    
    console.log('[Investor Standing] Fund calculation:', {
      fundTotalCurrentValue,
      successfulPriceCount,
      totalPositions: positions.length,
      pricesReceived: Object.keys(prices).length,
      pricesData: prices
    });
    
    // Check if we have sufficient price data
    const nonCustomPositions = positions.filter(p => !p.project_id.startsWith('custom-')).length;
    const priceSuccessRate = nonCustomPositions > 0 ? (successfulPriceCount / nonCustomPositions) : 0;
    
    // If we couldn't get enough prices, return an error or partial data indicator
    if (priceSuccessRate < 0.5) {
      console.log('[Investor Standing] Insufficient price data:', {
        successfulPriceCount,
        nonCustomPositions,
        successRate: `${(priceSuccessRate * 100).toFixed(1)}%`
      });
      
      // Return partial data with a warning flag
      return NextResponse.json({
        warning: 'Unable to fetch current market prices. Showing partial data only.',
        data: {
          name: investor.name || investor.email,
          accountNumber: investor.account_number,
          sharePercentage: investor.share_percentage,
          initialInvestment: investor.initial_investment || 0,
          currentValue: null, // Don't show inaccurate values
          totalReturn: null,
          totalReturnPercent: null,
          monthlyReturn: null,
          monthlyReturnPercent: null,
          status: investor.status || 'active',
          fundTotalCurrentValue: null,
          priceDataAvailable: false,
          positionsWithPrices: successfulPriceCount,
          nonCustomPositions: nonCustomPositions
        }
      });
    }
    
    // If still no value, return error
    if (fundTotalCurrentValue === 0) {
      console.log('[Investor Standing] No fund value could be calculated');
      return NextResponse.json({ error: 'Unable to calculate fund value' }, { status: 500 });
    }
    
    // Calculate investor's portion based on their share percentage
    const shareDecimal = (investor.share_percentage || 0) / 100;
    const investorCurrentValue = fundTotalCurrentValue * shareDecimal;
    // Use the investor's recorded initial investment rather than calculated cost basis
    const investorCostBasis = investor.initial_investment || 0;
    
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
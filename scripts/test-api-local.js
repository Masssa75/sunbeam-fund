import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLocalAPILogic() {
  console.log('Testing local API logic for Ralph\'s portfolio...\n');
  
  try {
    // Get Ralph's investor record
    const { data: investor, error: invError } = await supabase
      .from('investors')
      .select('*')
      .eq('email', 'ralphpetersigg@gmail.com')
      .single();
      
    if (invError) {
      console.error('Error fetching investor:', invError);
      return;
    }
    
    console.log(`Found Ralph: ${investor.name} (${investor.share_percentage}%)\n`);
    
    // Get all positions
    const { data: positions, error: posError } = await supabase
      .from('positions')
      .select('*')
      .is('exit_date', null);
      
    if (posError) {
      console.error('Error fetching positions:', posError);
      return;
    }
    
    console.log(`Found ${positions.length} positions\n`);
    
    // Simulate price fetching failure (all prices are 0)
    const prices = {};
    const nonCustomPositions = positions.filter(p => !p.project_id.startsWith('custom-'));
    const successfulPriceCount = 0; // Simulating no prices fetched
    
    // Calculate fund total
    let fundTotalCurrentValue = 0;
    positions.forEach(position => {
      if (position.project_id.startsWith('custom-')) {
        fundTotalCurrentValue += position.cost_basis || 0;
      } else {
        const price = prices[position.project_id] || 0;
        fundTotalCurrentValue += price * position.amount;
      }
    });
    
    console.log('Fund calculation:');
    console.log(`- Total value: $${fundTotalCurrentValue.toLocaleString()}`);
    console.log(`- Successful price fetches: ${successfulPriceCount}/${nonCustomPositions.length}`);
    console.log(`- Success rate: ${nonCustomPositions.length > 0 ? (successfulPriceCount / nonCustomPositions.length * 100).toFixed(1) : 0}%`);
    
    // Check if we would trigger the new logic
    const priceSuccessRate = nonCustomPositions.length > 0 ? (successfulPriceCount / nonCustomPositions.length) : 0;
    
    console.log('\n--- NEW API LOGIC ---');
    if (priceSuccessRate < 0.5) {
      console.log('✅ Would return partial data with warning!');
      console.log('\nResponse would be:');
      console.log({
        warning: 'Unable to fetch current market prices. Showing partial data only.',
        data: {
          name: investor.name || investor.email,
          accountNumber: investor.account_number,
          sharePercentage: investor.share_percentage,
          initialInvestment: investor.initial_investment || 0,
          currentValue: null,
          totalReturn: null,
          totalReturnPercent: null,
          monthlyReturn: null,
          monthlyReturnPercent: null,
          status: investor.status || 'active',
          fundTotalCurrentValue: null,
          priceDataAvailable: false,
          positionsWithPrices: successfulPriceCount,
          nonCustomPositions: nonCustomPositions.length
        }
      });
    } else {
      console.log('❌ Would NOT trigger new logic (price success rate >= 50%)');
    }
    
    console.log('\n--- OLD API LOGIC (for comparison) ---');
    if (successfulPriceCount < nonCustomPositions.length * 0.5 || fundTotalCurrentValue < 50000) {
      console.log('Would use $100K fallback');
      console.log(`Ralph would show: $${(100000 * investor.share_percentage / 100).toLocaleString()}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testLocalAPILogic();
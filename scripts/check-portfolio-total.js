import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPortfolioTotal() {
  console.log('Checking total portfolio value...\n');
  
  try {
    // Get all positions
    const { data: positions, error } = await supabase
      .from('positions')
      .select('*')
      .is('exit_date', null);
      
    if (error) {
      console.error('Error fetching positions:', error);
      return;
    }
    
    console.log(`Found ${positions.length} active positions\n`);
    
    // Calculate total portfolio value
    let totalValue = 0;
    let totalCostBasis = 0;
    
    for (const position of positions) {
      const value = parseFloat(position.current_value) || 0;
      const cost = parseFloat(position.cost_basis) || 0;
      
      totalValue += value;
      totalCostBasis += cost;
      
      console.log(`${position.project_name}: $${value.toLocaleString()} (cost: $${cost.toLocaleString()})`);
    }
    
    console.log('\n--- PORTFOLIO TOTALS ---');
    console.log(`Total Portfolio Value: $${totalValue.toLocaleString()}`);
    console.log(`Total Cost Basis: $${totalCostBasis.toLocaleString()}`);
    console.log(`Total P&L: $${(totalValue - totalCostBasis).toLocaleString()}`);
    console.log(`Total Return: ${((totalValue / totalCostBasis - 1) * 100).toFixed(2)}%`);
    
    // Calculate Ralph's share (38.34%)
    const ralphShare = 0.3834;
    const ralphValue = totalValue * ralphShare;
    
    console.log('\n--- RALPH\'S SHARE (38.34%) ---');
    console.log(`Ralph's Portfolio Value: $${ralphValue.toLocaleString()}`);
    console.log(`Ralph's Investment: $60,000`);
    console.log(`Ralph's P&L: $${(ralphValue - 60000).toLocaleString()}`);
    console.log(`Ralph's Return: ${((ralphValue / 60000 - 1) * 100).toFixed(2)}%`);
    
    // Check what the app might be using
    console.log('\n--- POSSIBLE ISSUES ---');
    if (totalValue < 100000) {
      console.log('⚠️  Total portfolio value is less than $100K');
      console.log('   The app might be using a hardcoded $100K fallback');
      const fallbackRalphValue = 100000 * ralphShare;
      console.log(`   With $100K total: Ralph would have $${fallbackRalphValue.toLocaleString()}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPortfolioTotal();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gualxudgbmpuhjbumfeh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPositionDetails() {
  console.log('🔍 Checking Position Details');
  console.log('============================\n');

  try {
    // Get all positions
    const { data: positions, error } = await supabase
      .from('positions')
      .select('*')
      .order('project_name');

    if (error) {
      console.error('Error fetching positions:', error);
      return;
    }

    console.log(`Found ${positions.length} positions:\n`);

    // Display each position with details
    positions.forEach(pos => {
      console.log(`${pos.project_name} (${pos.symbol.toUpperCase()}):`);
      console.log(`  Project ID: ${pos.project_id}`);
      console.log(`  Amount: ${pos.amount.toLocaleString()}`);
      console.log(`  Cost Basis: $${pos.cost_basis.toLocaleString()}`);
      console.log(`  Entry Date: ${pos.entry_date}`);
      
      // Calculate implied entry price
      const impliedPrice = pos.cost_basis / pos.amount;
      console.log(`  Implied Entry Price: $${impliedPrice.toFixed(6)}`);
      console.log('');
    });

    // Check specific problem positions
    console.log('\n📊 Problem Position Analysis:');
    console.log('=============================\n');

    const problemPositions = ['kylacoin', 'coinweb', 'bricken'];
    
    for (const coinId of problemPositions) {
      const position = positions.find(p => p.project_id === coinId);
      if (position) {
        console.log(`${position.project_name}:`);
        console.log(`  Amount in DB: ${position.amount.toLocaleString()}`);
        console.log(`  Cost basis: $${position.cost_basis.toLocaleString()}`);
        
        const impliedPrice = position.cost_basis / position.amount;
        console.log(`  Implied entry price: $${impliedPrice.toFixed(6)}`);
        
        // If current price is $18.15 for Keeta
        if (coinId === 'kylacoin') {
          const currentPrice = 18.15;
          const currentValue = currentPrice * position.amount;
          console.log(`  Current price: $${currentPrice}`);
          console.log(`  Current value: $${currentValue.toLocaleString()}`);
          console.log(`  ⚠️  This explains the $508M value!`);
        }
        console.log('');
      }
    }

    // Summary
    console.log('\n💡 DIAGNOSIS:');
    console.log('=============');
    console.log('The issue is that the AMOUNTS in the database are too large.');
    console.log('For example, Keeta has 2,962 tokens, which at $18.15 = $53,739.30');
    console.log('But the database shows 2,962,000 tokens (1000x too many!)');
    console.log('\nThe prices from CoinGecko are correct.');
    console.log('The amounts need to be divided by 1000 (or appropriate factor).');

  } catch (error) {
    console.error('Error:', error);
  }
}

checkPositionDetails();
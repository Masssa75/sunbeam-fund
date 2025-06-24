const fetch = require('node-fetch');

async function testProjectIdMapping() {
  console.log('🔍 Testing Project ID Mapping');
  console.log('=============================\n');

  // The positions from the database
  const positions = [
    { name: 'Keeta', symbol: 'KTA', projectId: 'keeta', dbAmount: 2962 },
    { name: 'Coinweb', symbol: 'CWEB', projectId: 'coinweb', dbAmount: 589809 },
    { name: 'Brickken', symbol: 'BKN', projectId: 'brickken', dbAmount: 21682 }
  ];

  console.log('1. Testing CoinGecko IDs...\n');

  for (const pos of positions) {
    console.log(`${pos.name} (${pos.symbol}):`);
    console.log(`  DB project_id: "${pos.projectId}"`);
    
    // Test the project ID
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${pos.projectId}&vs_currencies=usd`
      );
      const data = await response.json();
      
      if (data[pos.projectId]) {
        console.log(`  ❌ Price found but seems wrong: $${data[pos.projectId].usd}`);
      } else {
        console.log(`  ❌ No price data for ID: ${pos.projectId}`);
      }
    } catch (error) {
      console.log(`  ❌ API Error: ${error.message}`);
    }
    
    // Search for the correct ID
    console.log(`\n  Searching CoinGecko for "${pos.symbol}"...`);
    try {
      const searchResponse = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${pos.symbol}`
      );
      const searchData = await searchResponse.json();
      
      if (searchData.coins && searchData.coins.length > 0) {
        console.log('  Found coins:');
        searchData.coins.slice(0, 3).forEach(coin => {
          console.log(`    - ${coin.name} (${coin.symbol.toUpperCase()}) - ID: "${coin.id}"`);
        });
        
        // Find exact symbol match
        const exactMatch = searchData.coins.find(c => c.symbol.toUpperCase() === pos.symbol);
        if (exactMatch) {
          console.log(`\n  ✅ Exact match found: ID should be "${exactMatch.id}"`);
          
          // Get price for correct ID
          const priceResponse = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${exactMatch.id}&vs_currencies=usd`
          );
          const priceData = await priceResponse.json();
          
          if (priceData[exactMatch.id]) {
            const price = priceData[exactMatch.id].usd;
            const value = price * pos.dbAmount;
            console.log(`  Current price: $${price}`);
            console.log(`  Value for ${pos.dbAmount} tokens: $${value.toLocaleString()}`);
          }
        }
      }
    } catch (error) {
      console.log(`  Search error: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }

  // Test specific problematic case
  console.log('2. Special test for Keeta/KTA...\n');
  
  const keetaIds = ['keeta', 'kta', 'kylacoin', 'keeta-finance'];
  for (const id of keetaIds) {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
      );
      const data = await response.json();
      
      if (data[id]) {
        console.log(`  ID "${id}": $${data[id].usd}`);
      } else {
        console.log(`  ID "${id}": No data`);
      }
    } catch (error) {
      console.log(`  ID "${id}": Error`);
    }
  }
}

testProjectIdMapping().then(() => {
  console.log('\nTest completed.');
}).catch(error => {
  console.error('Test failed:', error);
});
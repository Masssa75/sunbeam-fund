const fetch = require('node-fetch');

async function testCoinGeckoAPI() {
  console.log('🧪 Testing CoinGecko API Responses');
  console.log('==================================\n');

  // Test coins that are showing wrong values
  const testCoins = [
    { id: 'kylacoin', name: 'Keeta', expectedRange: [0.0001, 1] },
    { id: 'coinweb', name: 'Coinweb', expectedRange: [0.001, 1] },
    { id: 'bricken', name: 'Bricken', expectedRange: [0.001, 10] },
    { id: 'kaspa', name: 'Kaspa', expectedRange: [0.01, 1] },
    { id: 'bittensor', name: 'Bittensor', expectedRange: [100, 1000] }
  ];

  console.log('1. Testing individual coin prices...\n');

  for (const coin of testCoins) {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd`
      );
      const data = await response.json();
      
      if (data[coin.id] && data[coin.id].usd) {
        const price = data[coin.id].usd;
        const inRange = price >= coin.expectedRange[0] && price <= coin.expectedRange[1];
        
        console.log(`${coin.name} (${coin.id}):`);
        console.log(`  Price: $${price}`);
        console.log(`  Expected range: $${coin.expectedRange[0]} - $${coin.expectedRange[1]}`);
        console.log(`  Status: ${inRange ? '✅ In range' : '❌ OUT OF RANGE'}`);
        
        if (!inRange) {
          console.log(`  ⚠️  Price seems ${price > coin.expectedRange[1] ? 'too high' : 'too low'}`);
        }
      } else {
        console.log(`${coin.name} (${coin.id}): ❌ No price data`);
      }
    } catch (error) {
      console.log(`${coin.name} (${coin.id}): ❌ API Error - ${error.message}`);
    }
    console.log('');
  }

  // Test batch request
  console.log('\n2. Testing batch price request...\n');
  
  const coinIds = testCoins.map(c => c.id).join(',');
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`
    );
    const data = await response.json();
    
    console.log('Batch response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('Batch request error:', error.message);
  }

  // Test market data for one coin to see full response
  console.log('\n3. Testing full market data for Keeta...\n');
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=kylacoin`
    );
    const data = await response.json();
    
    if (data && data[0]) {
      console.log('Market data for Keeta:');
      console.log(`  Current price: $${data[0].current_price}`);
      console.log(`  Market cap: $${data[0].market_cap}`);
      console.log(`  Total volume: $${data[0].total_volume}`);
      console.log(`  Circulating supply: ${data[0].circulating_supply}`);
      
      // Check if we're accidentally using market cap as price
      if (data[0].market_cap && data[0].current_price) {
        const ratio = data[0].market_cap / data[0].current_price;
        console.log(`\n  Market cap / price ratio: ${ratio.toLocaleString()}`);
        console.log('  (This should be roughly equal to circulating supply)');
      }
    }
  } catch (error) {
    console.log('Market data error:', error.message);
  }

  // Test if the issue is with the API proxy
  console.log('\n4. Testing local API endpoint...\n');
  
  try {
    const response = await fetch('https://sunbeam.capital/api/coingecko/price?coinId=kylacoin');
    const data = await response.json();
    console.log('Local API response:', data);
  } catch (error) {
    console.log('Local API error:', error.message);
  }
}

// Run the test
testCoinGeckoAPI().then(() => {
  console.log('\nTest completed.');
}).catch(error => {
  console.error('Test failed:', error);
});
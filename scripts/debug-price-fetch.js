const fetch = require('node-fetch');

async function debugPriceFetch() {
  console.log('🔍 Debugging Price Fetch Issue');
  console.log('==============================\n');

  // Test the actual API endpoint used by the app
  console.log('1. Testing sunbeam.capital API endpoint...\n');
  
  const testCoins = ['keeta', 'kylacoin', 'coinweb', 'brickken'];
  
  try {
    const response = await fetch('https://sunbeam.capital/api/coingecko/price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coinIds: testCoins })
    });
    
    if (!response.ok) {
      console.log(`API returned status: ${response.status}`);
      const text = await response.text();
      console.log('Response:', text);
    } else {
      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('API Error:', error.message);
  }

  // Test direct CoinGecko API
  console.log('\n2. Testing direct CoinGecko API...\n');
  
  const idsString = testCoins.join(',');
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd`
    );
    const data = await response.json();
    console.log('CoinGecko Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('CoinGecko Error:', error.message);
  }

  // Check if project ID is wrong
  console.log('\n3. Checking if "kylacoin" is the issue...\n');
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=kylacoin&vs_currencies=usd`
    );
    const data = await response.json();
    
    if (data.kylacoin) {
      console.log(`kylacoin price: $${data.kylacoin.usd}`);
      console.log('This explains the huge values!');
      console.log('2,962 tokens × $' + data.kylacoin.usd + ' = $' + (2962 * data.kylacoin.usd).toLocaleString());
    } else {
      console.log('No data for kylacoin');
    }
  } catch (error) {
    console.log('Error:', error.message);
  }

  // Check if the issue is in the database
  console.log('\n4. Database project_id mapping issue...\n');
  console.log('The database has "keeta" but CoinGecko might be using a different ID');
  console.log('We need to check what project_id is actually stored vs what the app is fetching');
}

debugPriceFetch().then(() => {
  console.log('\nDebug completed.');
});
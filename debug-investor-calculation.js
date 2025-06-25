// Debug script to check investor standing calculation
async function testInvestorCalculation() {
  try {
    console.log('🔍 Testing investor standing calculation...');
    
    // Test the investor standing API
    const response = await fetch('https://sunbeam.capital/api/investor/standing');
    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.standing) {
      const { standing } = data;
      console.log('\n📊 Investor Standing:');
      console.log(`Name: ${standing.name}`);
      console.log(`Share Percentage: ${standing.sharePercentage}%`);
      console.log(`Current Value: $${standing.currentValue.toLocaleString()}`);
      console.log(`Initial Investment: $${standing.initialInvestment.toLocaleString()}`);
      console.log(`Total Return: $${standing.totalReturn.toLocaleString()}`);
      console.log(`Total Return %: ${standing.totalReturnPercent}%`);
      
      // Check if the calculation makes sense
      const expectedValue = Math.round(96000 * (standing.sharePercentage / 100));
      console.log(`\n🔢 Expected Value (96K * ${standing.sharePercentage}%): $${expectedValue.toLocaleString()}`);
      console.log(`Actual Value: $${standing.currentValue.toLocaleString()}`);
      console.log(`Difference: $${Math.abs(expectedValue - standing.currentValue).toLocaleString()}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testInvestorCalculation();
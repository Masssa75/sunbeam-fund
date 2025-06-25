const { createClient } = require('@supabase/supabase-js');

// Direct Supabase connection to get actual investor record IDs
const supabase = createClient(
  'https://gualxudgbmpuhjbumfeh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4'
);

async function getRealInvestorIds() {
  console.log('Getting real investor IDs from database...\n');
  
  const { data: investors, error } = await supabase
    .from('investors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${investors.length} investors:\n`);
  
  investors.forEach(inv => {
    console.log(`Name: ${inv.name || inv.email}`);
    console.log(`  Record ID: ${inv.id}`);
    console.log(`  User ID: ${inv.user_id || 'NOT SET'}`);
    console.log(`  Account: ${inv.account_number}`);
    console.log(`  Share: ${inv.share_percentage}%`);
    console.log(`  Status: ${inv.status}`);
    console.log('');
  });

  // Get the first active investor ID for testing
  const activeInvestor = investors.find(inv => inv.status === 'active');
  if (activeInvestor) {
    console.log('✅ Test with this ID for viewAs parameter:');
    console.log(`   ${activeInvestor.id}`);
    console.log(`   Name: ${activeInvestor.name || activeInvestor.email}`);
  }
}

getRealInvestorIds();
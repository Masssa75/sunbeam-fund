require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPortfolioMonitoring() {
  // Get current portfolio positions
  const { data: positions, error: posError } = await supabase
    .from('positions')
    .select('project_id, project_name, symbol, amount, cost_basis')
    .order('cost_basis', { ascending: false });
    
  if (posError) {
    console.error('Error fetching positions:', posError);
    return;
  }
  
  console.log('Current Portfolio Positions:');
  console.log('============================');
  positions.forEach(p => {
    console.log(`${p.project_name} (${p.symbol.toUpperCase()}) - Project ID: ${p.project_id}`);
  });
  
  // Get currently monitored projects
  const { data: monitored, error: monError } = await supabase
    .from('monitored_projects')
    .select('project_id, project_name, symbol, twitter_handle, is_active')
    .order('project_name');
    
  if (monError) {
    console.error('Error fetching monitored projects:', monError);
    return;
  }
  
  console.log('\n\nCurrently Monitored Projects:');
  console.log('============================');
  monitored.forEach(m => {
    console.log(`${m.project_name} (${m.symbol.toUpperCase()}) - @${m.twitter_handle} - Active: ${m.is_active}`);
  });
  
  // Find portfolio positions not being monitored
  const monitoredIds = new Set(monitored.map(m => m.project_id));
  const notMonitored = positions.filter(p => !monitoredIds.has(p.project_id));
  
  console.log('\n\nPortfolio Positions NOT Being Monitored:');
  console.log('========================================');
  notMonitored.forEach(p => {
    console.log(`${p.project_name} (${p.symbol.toUpperCase()}) - Project ID: ${p.project_id}`);
  });
}

checkPortfolioMonitoring().catch(console.error);
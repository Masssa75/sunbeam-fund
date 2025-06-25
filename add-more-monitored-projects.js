require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Major projects to add with their Twitter handles
// Note: You should verify these Twitter handles are correct
const projectsToAdd = [
  {
    project_id: 'sui',
    project_name: 'Sui',
    symbol: 'sui',
    twitter_handle: 'SuiNetwork',  // Official Sui Twitter
    alert_threshold: 7
  },
  {
    project_id: 'the-open-network',
    project_name: 'Toncoin',
    symbol: 'ton',
    twitter_handle: 'ton_blockchain',  // Official TON Twitter
    alert_threshold: 7
  },
  {
    project_id: 'ethereum',
    project_name: 'Ethereum',
    symbol: 'eth',
    twitter_handle: 'ethereum',  // Official Ethereum Twitter
    alert_threshold: 8  // Higher threshold for ETH since it has more general tweets
  },
  {
    project_id: 'solana',
    project_name: 'Solana',
    symbol: 'sol',
    twitter_handle: 'solana',  // Official Solana Twitter
    alert_threshold: 7
  },
  {
    project_id: 'virtual-protocol',
    project_name: 'Virtuals Protocol',
    symbol: 'virtual',
    twitter_handle: 'virtuals_io',  // Official Virtuals Protocol Twitter
    alert_threshold: 7
  },
  {
    project_id: 'brickken',
    project_name: 'Brickken',
    symbol: 'bkn',
    twitter_handle: 'Brickken_',  // Official Brickken Twitter
    alert_threshold: 7
  },
  {
    project_id: 'coinweb',
    project_name: 'Coinweb',
    symbol: 'cweb',
    twitter_handle: 'coinwebofficial',  // Official Coinweb Twitter
    alert_threshold: 7
  },
  {
    project_id: 'auki-labs',
    project_name: 'AUKI',
    symbol: 'auki',
    twitter_handle: 'aukiapp',  // Official AUKI Twitter
    alert_threshold: 7
  }
];

async function addMonitoredProjects() {
  console.log('Adding more projects to Twitter monitoring...\n');

  for (const project of projectsToAdd) {
    try {
      // Check if project already exists
      const { data: existing } = await supabase
        .from('monitored_projects')
        .select('id')
        .eq('project_id', project.project_id)
        .single();

      if (existing) {
        // Update existing project
        const { error } = await supabase
          .from('monitored_projects')
          .update({
            twitter_handle: project.twitter_handle,
            alert_threshold: project.alert_threshold,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('project_id', project.project_id);

        if (error) throw error;
        console.log(`✅ Updated: ${project.project_name} (@${project.twitter_handle})`);
      } else {
        // Insert new project
        const { error } = await supabase
          .from('monitored_projects')
          .insert({
            ...project,
            is_active: true,
            monitoring_config: {
              check_official: true,
              check_mentions: true
            }
          });

        if (error) throw error;
        console.log(`✅ Added: ${project.project_name} (@${project.twitter_handle})`);
      }
    } catch (error) {
      console.error(`❌ Error with ${project.project_name}:`, error.message);
    }
  }

  // Show final status
  console.log('\n\nChecking all monitored projects...');
  const { data: allProjects, error } = await supabase
    .from('monitored_projects')
    .select('project_name, symbol, twitter_handle, is_active')
    .eq('is_active', true)
    .order('project_name');

  if (!error && allProjects) {
    console.log('\nActive Monitored Projects:');
    console.log('=========================');
    allProjects.forEach(p => {
      console.log(`${p.project_name} (${p.symbol.toUpperCase()}) - @${p.twitter_handle}`);
    });
    console.log(`\nTotal: ${allProjects.length} projects being monitored`);
  }
}

addMonitoredProjects().catch(console.error);
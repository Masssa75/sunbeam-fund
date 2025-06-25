const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeProjects() {
  console.log('Removing Ethereum, Solana, and Virtuals Protocol from monitoring...\n');
  
  const projectsToRemove = [
    'ethereum',
    'solana', 
    'virtuals-protocol'
  ];
  
  for (const projectId of projectsToRemove) {
    const { error } = await supabase
      .from('monitored_projects')
      .delete()
      .eq('project_id', projectId);
    
    if (error) {
      console.error(`❌ Error removing ${projectId}:`, error);
    } else {
      console.log(`✅ Removed ${projectId} from monitoring`);
    }
  }
  
  // Show remaining projects
  console.log('\n📊 Remaining monitored projects:');
  const { data: remaining, error: listError } = await supabase
    .from('monitored_projects')
    .select('*')
    .order('project_name');
  
  if (listError) {
    console.error('Error fetching remaining projects:', listError);
  } else {
    console.log(`\nTotal projects being monitored: ${remaining.length}\n`);
    remaining.forEach(project => {
      console.log(`- ${project.project_name} (@${project.twitter_handle}) - Alert threshold: ${project.alert_threshold}`);
    });
    
    console.log(`\nWith ${remaining.length} projects monitored every minute, each project is checked approximately every ${remaining.length} minutes.`);
  }
}

removeProjects().catch(console.error);
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeMoreProjects() {
  console.log('Removing AUKI and Virtuals Protocol from monitoring...\n');
  
  // Remove by twitter handle to be sure we get them
  const projectsToRemove = [
    { twitter_handle: 'aukiapp', name: 'AUKI' },
    { twitter_handle: 'virtuals_io', name: 'Virtuals Protocol' }
  ];
  
  for (const project of projectsToRemove) {
    const { error } = await supabase
      .from('monitored_projects')
      .delete()
      .eq('twitter_handle', project.twitter_handle);
    
    if (error) {
      console.error(`❌ Error removing ${project.name}:`, error);
    } else {
      console.log(`✅ Removed ${project.name} from monitoring`);
    }
  }
  
  // Show remaining projects
  console.log('\n📊 Final monitored projects:');
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
    
    console.log('\n✨ You are now monitoring only your core holdings without the noise from broader ecosystem projects.');
  }
}

removeMoreProjects().catch(console.error);
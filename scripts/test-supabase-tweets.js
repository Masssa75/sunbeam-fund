const { createClient } = require('@supabase/supabase-js');

async function testSupabaseDirect() {
  console.log('🔍 Testing Supabase tweets query directly...\n');
  
  // Use the admin client
  const supabase = createClient(
    'https://gualxudgbmpuhjbumfeh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1YWx4dWRnYm1wdWhqYnVtZmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2MjkxMywiZXhwIjoyMDY2MjM4OTEzfQ.yFbFAuMR1kDsQ5Tni-FJIruKT9AmCsJg0uyNyEvNyH4',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  try {
    console.log('1. Testing tweet_analyses query...');
    const { data: tweets, error } = await supabase
      .from('tweet_analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return;
    }
    
    console.log('✅ Query successful!');
    console.log('Number of tweets found:', tweets.length);
    
    if (tweets.length > 0) {
      console.log('\\nSample tweet:');
      console.log('- ID:', tweets[0].id);
      console.log('- Text:', tweets[0].tweet_text?.substring(0, 60) + '...');
      console.log('- Project ID:', tweets[0].project_id);
      console.log('- Score:', tweets[0].importance_score);
      console.log('- Created:', tweets[0].created_at);
      console.log('- Author:', tweets[0].author);
    }
    
    // Test the projects query too
    console.log('\\n2. Testing monitored_projects query...');
    const { data: projects, error: projectsError } = await supabase
      .from('monitored_projects')
      .select('*')
      .order('project_name');
    
    if (projectsError) {
      console.error('❌ Projects error:', projectsError);
      return;
    }
    
    console.log('✅ Projects query successful!');
    console.log('Number of projects found:', projects.length);
    
    projects.forEach(p => {
      console.log(`- ${p.project_name} (${p.project_id}) - Active: ${p.is_active}`);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testSupabaseDirect();
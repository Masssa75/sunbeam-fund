#!/usr/bin/env node

/**
 * Script to check positions in the database
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPositions() {
  console.log('Checking positions in database...');
  
  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching positions:', error);
    return;
  }
  
  console.log(`\nFound ${data.length} positions:`);
  data.forEach(position => {
    console.log(`- ${position.project_name} (${position.symbol}): ${position.amount} units, $${position.cost_basis}`);
  });
}

checkPositions();
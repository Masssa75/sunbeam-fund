require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testCRUD() {
  console.log('Testing CRUD operations...\n')
  
  try {
    // 1. Test INSERT
    console.log('1. Testing INSERT...')
    const testPosition = {
      project_id: 'bitcoin',
      project_name: 'Bitcoin',
      symbol: 'BTC',
      amount: 0.5,
      cost_basis: 30000,
      entry_date: '2024-01-01',
      notes: 'Test position'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('positions')
      .insert(testPosition)
      .select()
      .single()
    
    if (insertError) throw insertError
    console.log('✅ INSERT successful:', insertData.id)
    
    // 2. Test SELECT
    console.log('\n2. Testing SELECT...')
    const { data: selectData, error: selectError } = await supabase
      .from('positions')
      .select('*')
    
    if (selectError) throw selectError
    console.log('✅ SELECT successful, found', selectData.length, 'positions')
    
    // 3. Test UPDATE
    console.log('\n3. Testing UPDATE...')
    const { data: updateData, error: updateError } = await supabase
      .from('positions')
      .update({ amount: 0.75 })
      .eq('id', insertData.id)
      .select()
      .single()
    
    if (updateError) throw updateError
    console.log('✅ UPDATE successful, new amount:', updateData.amount)
    
    // 4. Test DELETE
    console.log('\n4. Testing DELETE...')
    const { error: deleteError } = await supabase
      .from('positions')
      .delete()
      .eq('id', insertData.id)
    
    if (deleteError) throw deleteError
    console.log('✅ DELETE successful')
    
    console.log('\n🎉 All CRUD operations working correctly!')
    console.log('Your Supabase database is fully operational.')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testCRUD()
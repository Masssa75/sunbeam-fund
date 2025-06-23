const fetch = require('node-fetch')
require('dotenv').config()

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const SUPABASE_API_URL = 'https://api.supabase.com/v1'

async function createProject() {
  console.log('Creating new Supabase project: sunbeam-fund...')
  
  try {
    // First, get organizations
    const orgsResponse = await fetch(`${SUPABASE_API_URL}/organizations`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!orgsResponse.ok) {
      throw new Error(`Failed to get organizations: ${orgsResponse.status} ${await orgsResponse.text()}`)
    }
    
    const orgs = await orgsResponse.json()
    if (orgs.length === 0) {
      throw new Error('No organizations found')
    }
    
    const orgId = orgs[0].id
    console.log(`Using organization: ${orgs[0].name} (${orgId})`)
    
    // Create the project
    const projectData = {
      name: 'sunbeam-fund',
      organization_id: orgId,
      plan: 'free',
      region: 'us-east-1',
      db_pass: generatePassword()
    }
    
    const createResponse = await fetch(`${SUPABASE_API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    })
    
    if (!createResponse.ok) {
      const error = await createResponse.text()
      throw new Error(`Failed to create project: ${createResponse.status} ${error}`)
    }
    
    const project = await createResponse.json()
    console.log('Project created successfully!')
    console.log(`Project ID: ${project.id}`)
    console.log(`Project URL: https://${project.id}.supabase.co`)
    
    // Wait for project to be ready
    console.log('Waiting for project to be ready...')
    await waitForProject(project.id)
    
    // Get the API keys
    const keysResponse = await fetch(`${SUPABASE_API_URL}/projects/${project.id}/api-keys`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!keysResponse.ok) {
      throw new Error(`Failed to get API keys: ${keysResponse.status}`)
    }
    
    const keys = await keysResponse.json()
    
    console.log('\n=== IMPORTANT: Save these credentials ===')
    console.log(`NEXT_PUBLIC_SUPABASE_URL=https://${project.id}.supabase.co`)
    console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${keys.anon_key}`)
    console.log(`SUPABASE_SERVICE_ROLE_KEY=${keys.service_role_key}`)
    console.log(`SUPABASE_PROJECT_ID=${project.id}`)
    console.log(`Database Password: ${projectData.db_pass}`)
    console.log('=======================================\n')
    
    // Save to .env.new
    const envContent = `# Sunbeam Fund Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://${project.id}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=${keys.anon_key}
SUPABASE_SERVICE_ROLE_KEY=${keys.service_role_key}
SUPABASE_PROJECT_ID=${project.id}
`
    
    require('fs').writeFileSync('.env.new', envContent)
    console.log('Credentials saved to .env.new')
    console.log('Update your .env file with these new credentials')
    
    return project
    
  } catch (error) {
    console.error('Error creating project:', error.message)
    throw error
  }
}

async function waitForProject(projectId, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${SUPABASE_API_URL}/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const project = await response.json()
      if (project.status === 'ACTIVE_HEALTHY') {
        console.log('Project is ready!')
        return
      }
    }
    
    console.log(`Waiting... (${i + 1}/${maxAttempts})`)
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
  
  throw new Error('Project did not become ready in time')
}

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 24; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Run the script
createProject().catch(console.error)
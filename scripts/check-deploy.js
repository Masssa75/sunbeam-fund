import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN
const SITE_NAME = 'starlit-mousse-8fa18a'

async function checkDeployStatus() {
  if (!NETLIFY_TOKEN) {
    console.error('NETLIFY_TOKEN not found in environment')
    return
  }

  try {
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_NAME}.netlify.app/deploys?per_page=3`, {
      headers: {
        'Authorization': `Bearer ${NETLIFY_TOKEN}`
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const deploys = await response.json()
    
    console.log('=== Recent Deployments ===\n')
    
    for (const deploy of deploys) {
      const date = new Date(deploy.created_at).toLocaleString()
      const status = deploy.state === 'ready' ? '✅' : deploy.state === 'building' ? '🔨' : '❌'
      
      console.log(`${status} ${deploy.state.toUpperCase()}`)
      console.log(`   Time: ${date}`)
      console.log(`   Branch: ${deploy.branch}`)
      console.log(`   URL: ${deploy.deploy_ssl_url}`)
      if (deploy.error_message) {
        console.log(`   Error: ${deploy.error_message}`)
      }
      console.log(`   Title: ${deploy.title.split('\\n')[0]}`)
      console.log()
    }
    
  } catch (error) {
    console.error('Error checking deployment:', error.message)
  }
}

checkDeployStatus()
#!/usr/bin/env node

require('dotenv').config();
const https = require('https');

const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;

if (!NETLIFY_TOKEN) {
  console.error('❌ NETLIFY_TOKEN not found in .env');
  process.exit(1);
}

// Get site info and latest deploy
async function checkDeploymentStatus() {
  const options = {
    hostname: 'api.netlify.com',
    path: '/api/v1/sites',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${NETLIFY_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const sites = JSON.parse(data);
          const sunbeamSite = sites.find(site => 
            site.name === 'sunbeam' || 
            site.url?.includes('sunbeam') ||
            site.ssl_url?.includes('sunbeam')
          );
          
          if (sunbeamSite) {
            console.log('🌐 Sunbeam Fund Deployment Status\n');
            console.log('Site Info:');
            console.log(`  Name: ${sunbeamSite.name}`);
            console.log(`  URL: ${sunbeamSite.url}`);
            console.log(`  SSL URL: ${sunbeamSite.ssl_url}`);
            console.log(`  State: ${sunbeamSite.state}`);
            console.log(`  Created: ${new Date(sunbeamSite.created_at).toLocaleString()}`);
            console.log(`  Updated: ${new Date(sunbeamSite.updated_at).toLocaleString()}`);
            
            if (sunbeamSite.published_deploy) {
              console.log('\nLatest Deploy:');
              console.log(`  Deploy ID: ${sunbeamSite.published_deploy.id}`);
              console.log(`  State: ${sunbeamSite.published_deploy.state}`);
              console.log(`  Branch: ${sunbeamSite.published_deploy.branch}`);
              console.log(`  Deploy URL: ${sunbeamSite.published_deploy.deploy_ssl_url}`);
              console.log(`  Deploy Time: ${new Date(sunbeamSite.published_deploy.created_at).toLocaleString()}`);
              
              if (sunbeamSite.published_deploy.state === 'ready') {
                console.log('\n✅ Deployment Successful!');
                console.log(`🔗 Live at: ${sunbeamSite.ssl_url || sunbeamSite.url}`);
              } else {
                console.log(`\n⚠️  Deploy State: ${sunbeamSite.published_deploy.state}`);
              }
            }
            
            // Get more detailed deploy info
            getDeployDetails(sunbeamSite.id);
          } else {
            console.log('❌ Sunbeam site not found in your Netlify account');
            console.log('\nFound sites:');
            sites.forEach(site => {
              console.log(`  - ${site.name}: ${site.url}`);
            });
          }
        } catch (error) {
          console.error('Error parsing response:', error);
          console.log('Response:', data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
    
    req.end();
  });
}

// Get detailed deploy info
async function getDeployDetails(siteId) {
  const options = {
    hostname: 'api.netlify.com',
    path: `/api/v1/sites/${siteId}/deploys?per_page=5`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${NETLIFY_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  https.get(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const deploys = JSON.parse(data);
        console.log('\nRecent Deploys:');
        deploys.slice(0, 3).forEach((deploy, i) => {
          console.log(`\n${i + 1}. Deploy ${deploy.id.substring(0, 8)}...`);
          console.log(`   State: ${deploy.state}`);
          console.log(`   Created: ${new Date(deploy.created_at).toLocaleString()}`);
          console.log(`   Deploy time: ${deploy.deploy_time ? deploy.deploy_time + 's' : 'N/A'}`);
          console.log(`   Commit: ${deploy.commit_ref?.substring(0, 7) || 'N/A'}`);
          
          if (deploy.error_message) {
            console.log(`   ❌ Error: ${deploy.error_message}`);
          }
        });
      } catch (error) {
        console.error('Error parsing deploys:', error);
      }
    });
  });
}

// Run the check
checkDeploymentStatus();
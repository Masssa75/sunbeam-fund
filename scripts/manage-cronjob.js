#!/usr/bin/env node

require('dotenv').config();

const CRONJOB_API_KEY = process.env.CRONJOB_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function manageCronJob(action = 'status') {
  console.log('🕐 Managing Sunbeam Twitter Monitor cron job...\n');

  if (!CRONJOB_API_KEY) {
    console.error('❌ CRONJOB_API_KEY not found in .env');
    return;
  }

  try {
    // List all jobs to find ours
    const listResponse = await fetch('https://api.cron-job.org/jobs', {
      headers: {
        'Authorization': `Bearer ${CRONJOB_API_KEY}`
      }
    });

    if (!listResponse.ok) {
      throw new Error(`Failed to list jobs: ${listResponse.status}`);
    }

    const result = await listResponse.json();
    const sunbeamJob = result.jobs?.find(job => 
      job.title === 'Sunbeam Twitter Monitor'
    );

    if (!sunbeamJob && action !== 'create') {
      console.log('❌ Sunbeam Twitter Monitor job not found');
      console.log('Run with "create" argument to create a new job');
      return;
    }

    switch (action) {
      case 'status':
        if (sunbeamJob) {
          console.log('📅 Cron Job Details:');
          console.log(`- Job ID: ${sunbeamJob.jobId}`);
          console.log(`- Title: ${sunbeamJob.title}`);
          console.log(`- URL: ${sunbeamJob.url}`);
          console.log(`- Enabled: ${sunbeamJob.enabled ? '✅ Yes' : '❌ No'}`);
          console.log(`- Schedule: Every minute`);
          
          const statusText = sunbeamJob.lastStatus === 1 ? 'OK' : 
                            sunbeamJob.lastStatus === 4 ? 'HTTP Error' : 
                            `Status ${sunbeamJob.lastStatus}`;
          console.log(`- Last Status: ${statusText}`);
          console.log(`- Last Duration: ${sunbeamJob.lastDuration || 0}ms`);
          
          if (sunbeamJob.lastExecution) {
            const lastRun = new Date(sunbeamJob.lastExecution * 1000);
            console.log(`- Last Execution: ${lastRun.toLocaleString()}`);
          }
          
          // Check recent executions
          const historyResponse = await fetch(`https://api.cron-job.org/jobs/${sunbeamJob.jobId}/history`, {
            headers: {
              'Authorization': `Bearer ${CRONJOB_API_KEY}`
            }
          });
          
          if (historyResponse.ok) {
            const history = await historyResponse.json();
            if (history.history && history.history.length > 0) {
              console.log('\n📊 Recent Executions:');
              history.history.slice(0, 5).forEach(h => {
                const date = new Date(h.date * 1000);
                const statusIcon = h.status === 'OK' ? '✅' : '❌';
                console.log(`- ${date.toLocaleString()} - ${statusIcon} ${h.status} (${h.duration}ms)`);
              });
            }
          }
        }
        break;

      case 'enable':
        if (sunbeamJob) {
          if (sunbeamJob.enabled) {
            console.log('✅ Job is already enabled!');
          } else {
            const enableResponse = await fetch(`https://api.cron-job.org/jobs/${sunbeamJob.jobId}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${CRONJOB_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                job: { 
                  enabled: true 
                } 
              })
            });

            if (enableResponse.ok) {
              console.log('✅ Cron job enabled successfully!');
            } else {
              console.error('❌ Failed to enable job');
            }
          }
        }
        break;

      case 'disable':
        if (sunbeamJob) {
          if (!sunbeamJob.enabled) {
            console.log('⚠️  Job is already disabled!');
          } else {
            const disableResponse = await fetch(`https://api.cron-job.org/jobs/${sunbeamJob.jobId}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${CRONJOB_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                job: { 
                  enabled: false 
                } 
              })
            });

            if (disableResponse.ok) {
              console.log('⚠️  Cron job disabled');
            } else {
              console.error('❌ Failed to disable job');
            }
          }
        }
        break;

      case 'delete':
        if (sunbeamJob) {
          const deleteResponse = await fetch(`https://api.cron-job.org/jobs/${sunbeamJob.jobId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${CRONJOB_API_KEY}`
            }
          });

          if (deleteResponse.ok) {
            console.log('🗑️  Cron job deleted');
          } else {
            console.error('❌ Failed to delete job');
          }
        }
        break;

      case 'create':
        if (sunbeamJob) {
          console.log('⚠️  Job already exists! Delete it first if you want to recreate.');
          return;
        }

        const monitorUrl = `${SUPABASE_URL}/functions/v1/monitor-projects`;
        
        const cronJobConfig = {
          job: {
            url: monitorUrl,
            enabled: true,
            saveResponses: true,
            schedule: {
              timezone: 'UTC',
              hours: [-1],    // Every hour
              mdays: [-1],    // Every day
              minutes: [-1],  // Every minute
              months: [-1],   // Every month
              wdays: [-1]     // Every weekday
            },
            requestTimeout: 30,
            redirectSuccess: true,
            auth: {
              enable: false
            },
            notification: {
              onFailure: true,
              onSuccess: false,
              onDisable: true
            },
            requestMethod: 1, // POST
            postData: '{}',
            httpHeaders: [
              `x-cron-key: ${CRONJOB_API_KEY}`,
              'Content-Type: application/json'
            ],
            title: 'Sunbeam Twitter Monitor',
            description: 'Monitors Twitter for portfolio projects every minute'
          }
        };

        const createResponse = await fetch('https://api.cron-job.org/jobs', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${CRONJOB_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cronJobConfig)
        });

        if (createResponse.ok) {
          const newJob = await createResponse.json();
          console.log('✅ Cron job created successfully!');
          console.log(`   Job ID: ${newJob.jobId}`);
          console.log(`   URL: ${monitorUrl}`);
          console.log('   Schedule: Every minute');
          console.log(`   Status: Enabled`);
        } else {
          const error = await createResponse.text();
          console.error('❌ Failed to create job:', error);
        }
        break;

      default:
        console.log('Usage: node manage-cronjob.js [action]');
        console.log('Actions: status (default), enable, disable, delete, create');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Get action from command line argument
const action = process.argv[2] || 'status';
manageCronJob(action);
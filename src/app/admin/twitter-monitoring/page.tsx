'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tweet {
  id: string;
  project_id: string;
  tweet_text: string;
  author: string;
  created_at: string;
  importance_score: number;
  category: string;
  summary: string;
  is_ai_analyzed: boolean;
}

interface MonitoredProject {
  id: string;
  project_id: string;
  project_name: string;
  symbol: string;
  twitter_handle: string;
  alert_threshold: number;
  is_active: boolean;
  last_monitored: string | null;
}

export default function TwitterMonitoringPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [projects, setProjects] = useState<MonitoredProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [expandedTweets, setExpandedTweets] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Check auth
      const authResponse = await fetch('/api/auth/session');
      const authData = await authResponse.json();
      
      if (!authData.authenticated || !authData.isAdmin) {
        router.push('/login');
        return;
      }

      // Load tweets
      const tweetsResponse = await fetch('/api/twitter/tweets');
      if (tweetsResponse.ok) {
        const tweetsData = await tweetsResponse.json();
        setTweets(tweetsData.tweets || []);
      }

      // Load monitored projects
      const projectsResponse = await fetch('/api/twitter/projects');
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTweets = (selectedProject === 'all' 
    ? tweets 
    : tweets.filter(t => t.project_id === selectedProject))
    .sort((a, b) => b.importance_score - a.importance_score); // Sort by importance score (highest first)

  const toggleTweetExpansion = (tweetId: string) => {
    const newExpanded = new Set(expandedTweets);
    if (newExpanded.has(tweetId)) {
      newExpanded.delete(tweetId);
    } else {
      newExpanded.add(tweetId);
    }
    setExpandedTweets(newExpanded);
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.project_id === projectId);
    return project ? project.project_name : projectId;
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-red-600 font-bold';
    if (score >= 7) return 'text-orange-600 font-semibold';
    if (score >= 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      partnership: 'bg-purple-100 text-purple-800',
      technical: 'bg-blue-100 text-blue-800',
      listing: 'bg-green-100 text-green-800',
      community: 'bg-yellow-100 text-yellow-800',
      price: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">Loading Twitter monitoring data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Twitter Monitoring</h1>
          <p className="text-gray-600 mt-2">
            Monitoring portfolio projects on Twitter with AI importance scoring
          </p>
        </div>

        {/* Projects Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Monitored Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const lastCheck = project.last_monitored ? new Date(project.last_monitored) : null;
              const minutesAgo = lastCheck ? Math.round((Date.now() - lastCheck.getTime()) / 60000) : null;
              
              return (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{project.project_name}</h3>
                      <p className="text-sm text-gray-600">@{project.twitter_handle}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>Alert threshold: ≥{project.alert_threshold}</p>
                    <p className="text-gray-500">
                      Last check: {lastCheck ? `${minutesAgo}m ago` : 'Never'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tweet Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="font-medium">Filter by project:</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Projects ({tweets.length} tweets)</option>
              {projects.map((p) => {
                const count = tweets.filter(t => t.project_id === p.project_id).length;
                return (
                  <option key={p.project_id} value={p.project_id}>
                    {p.project_name} ({count} tweets)
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Tweets List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">
              Collected Tweets ({filteredTweets.length})
            </h2>
          </div>
          <div className="divide-y">
            {filteredTweets.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No tweets collected yet. The system monitors one project per minute.
              </div>
            ) : (
              filteredTweets.map((tweet) => {
                const isExpanded = expandedTweets.has(tweet.id);
                return (
                  <div key={tweet.id} className="p-4 hover:bg-gray-50 border-l-4 border-l-transparent hover:border-l-blue-200">
                    {/* Main tweet info - always visible */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Importance Score */}
                        <div className="flex-shrink-0">
                          <span className={`text-3xl font-bold ${getScoreColor(tweet.importance_score)}`}>
                            {tweet.importance_score}
                          </span>
                        </div>
                        
                        {/* Project Name */}
                        <div className="flex-shrink-0">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {getProjectName(tweet.project_id)}
                          </span>
                        </div>
                        
                        {/* AI Summary (Main content) */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {tweet.summary || 'No summary available'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${getCategoryBadge(tweet.category)}`}>
                              {tweet.category}
                            </span>
                            {tweet.is_ai_analyzed && (
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                ✓ AI Analyzed
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {tweet.author || 'Unknown'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Expand Button */}
                        <button
                          onClick={() => toggleTweetExpansion(tweet.id)}
                          className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          {isExpanded ? '↑ Hide' : '↓ Show'}
                        </button>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="text-sm text-gray-500 ml-4">
                        {new Date(tweet.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Expanded content - only shown when clicked */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Full Tweet:</h4>
                          <p className="text-gray-800 leading-relaxed">
                            {tweet.tweet_text}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Monitors one project per minute (round-robin)</li>
            <li>• Uses ScraperAPI + Nitter to fetch tweets</li>
            <li>• AI scores importance from 0-10</li>
            <li>• Tweets scoring ≥ alert threshold trigger Telegram notifications</li>
            <li>• Avoids duplicates to save API costs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
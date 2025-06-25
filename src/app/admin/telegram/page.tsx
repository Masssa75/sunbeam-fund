'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

interface WebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
  max_connections?: number;
  allowed_updates?: string[];
}

interface InvestorConnection {
  id: string;
  investor_id: string;
  telegram_chat_id: number;
  telegram_username: string;
  connection_token: string;
  connected_at: string;
  is_active: boolean;
  last_notification_at: string | null;
  investors: {
    name: string;
    email: string;
    share_percentage: number;
  };
}

export default function TelegramAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [connectedCount, setConnectedCount] = useState(0);
  const [connections, setConnections] = useState<InvestorConnection[]>([]);
  const [testMessage, setTestMessage] = useState('');
  const [testChatId, setTestChatId] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadTelegramInfo();
    loadConnections();
  }, []);

  const loadTelegramInfo = async () => {
    try {
      const response = await fetch('/api/telegram/test');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to load Telegram info');
      }

      const data = await response.json();
      setBotInfo(data.bot);
      setWebhookInfo(data.webhook);
      setConnectedCount(data.connectedInvestors);
    } catch (error) {
      console.error('Error loading Telegram info:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    try {
      const response = await fetch('/api/telegram/connections');
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const sendTestMessage = async () => {
    if (!testMessage) {
      setResult({ success: false, message: 'Please enter a message' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: testChatId || undefined,
          message: testMessage,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ 
          success: true, 
          message: `Message sent successfully! Message ID: ${data.messageId}` 
        });
        setTestMessage('');
      } else {
        setResult({ 
          success: false, 
          message: data.error || 'Failed to send message' 
        });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Network error' 
      });
    } finally {
      setSending(false);
    }
  };

  const generateConnectionLink = async (investorId: string) => {
    try {
      const response = await fetch('/api/telegram/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investorId }),
      });

      if (response.ok) {
        const data = await response.json();
        const botUsername = botInfo?.username || 'your_bot';
        const link = `https://t.me/${botUsername}?start=${data.token}`;
        
        // Copy to clipboard
        await navigator.clipboard.writeText(link);
        alert(`Connection link copied to clipboard!\n\n${link}`);
      }
    } catch (error) {
      alert('Failed to generate connection link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">Loading Telegram configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Telegram Notifications</h1>
        </div>

        {/* Bot Info Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Bot Information</h2>
          {botInfo ? (
            <div className="space-y-2">
              <p><span className="font-medium">Bot Name:</span> {botInfo.first_name}</p>
              <p><span className="font-medium">Username:</span> @{botInfo.username}</p>
              <p><span className="font-medium">Bot ID:</span> {botInfo.id}</p>
              <p><span className="font-medium">Connected Investors:</span> {connectedCount}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-yellow-600">Bot configuration is managed in Supabase Edge Functions.</p>
              <p className="text-sm text-gray-600">The bot token is securely stored as TELEGRAM_BOT_TOKEN in Supabase secrets.</p>
              <p className="text-sm text-gray-600">Bot username: <span className="font-mono">@sunbeam_capital_bot</span></p>
            </div>
          )}
        </div>

        {/* Webhook Info Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Webhook Status</h2>
          {webhookInfo?.url ? (
            <div className="space-y-2">
              <p><span className="font-medium">URL:</span> {webhookInfo.url}</p>
              <p><span className="font-medium">Pending Updates:</span> {webhookInfo.pending_update_count}</p>
              {webhookInfo.last_error_message && (
                <p className="text-red-600">
                  <span className="font-medium">Last Error:</span> {webhookInfo.last_error_message}
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-green-600 mb-4">✓ Webhook is configured in Supabase Edge Functions</p>
              <p className="text-sm text-gray-600">
                The webhook is active at:
              </p>
              <code className="block mt-2 p-2 bg-gray-100 rounded text-sm">
                https://gualxudgbmpuhjbumfeh.supabase.co/functions/v1/telegram-webhook
              </code>
              <p className="text-sm text-gray-600 mt-2">
                Note: Webhook status cannot be checked from the web app as the bot token is securely stored in Edge Functions.
              </p>
            </div>
          )}
        </div>

        {/* Test Message Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Send Test Message</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chat ID (optional - leave empty to test without sending)
              </label>
              <input
                type="text"
                value={testChatId}
                onChange={(e) => setTestChatId(e.target.value)}
                placeholder="e.g., 123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (HTML supported)
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="<b>Test Message</b>&#10;&#10;This is a test notification from Sunbeam Fund."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={sendTestMessage}
              disabled={sending}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {sending ? 'Sending...' : 'Send Test Message'}
            </button>
            {result && (
              <div className={`p-3 rounded-md ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {result.message}
              </div>
            )}
          </div>
        </div>

        {/* Connected Investors Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Connected Investors</h2>
          {connections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telegram
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Connected
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {connections.map((conn) => (
                    <tr key={conn.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{conn.investors.name}</div>
                          <div className="text-sm text-gray-500">{conn.investors.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">@{conn.telegram_username || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">ID: {conn.telegram_chat_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(conn.connected_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          conn.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {conn.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setTestChatId(conn.telegram_chat_id.toString());
                            window.scrollTo({ top: 400, behavior: 'smooth' });
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Test Message
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No investors connected yet.</p>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>To connect an investor:</strong> Generate a connection link for them using their investor ID, 
              then have them click the link and start a chat with the bot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
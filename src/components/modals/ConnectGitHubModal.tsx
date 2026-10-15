import React, { useState, useEffect } from 'react';
import { X, Check, Copy, ExternalLink, RefreshCw, UploadCloud, DownloadCloud, ShieldCheck, GitBranch, FileArchive } from 'lucide-react';
import { MessSummary, DormitorySummary, Member, BazaarExpense, Deposit, DailyMealRecord, DormitoryBillItem, DormitoryMemberPayment } from '../../types';

// Simple SVG icon for GitHub in case of lucide version differences
const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface ConnectGitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullLedgerData: {
    members: Member[];
    expenses: BazaarExpense[];
    deposits: Deposit[];
    dailyMeals: DailyMealRecord[];
    dormBills: DormitoryBillItem[];
    dormPayments: DormitoryMemberPayment[];
    summary: MessSummary;
    dormSummary: DormitorySummary;
  };
  onRestoreData?: (data: any) => void;
}

export const ConnectGitHubModal: React.FC<ConnectGitHubModalProps> = ({
  isOpen,
  onClose,
  fullLedgerData,
  onRestoreData,
}) => {
  const [activeTab, setActiveTab] = useState<'export_repo' | 'cloud_sync'>('export_repo');
  const [githubToken, setGithubToken] = useState<string>(() => {
    return localStorage.getItem('mess_github_token') || '';
  });
  const [gistId, setGistId] = useState<string>(() => {
    return localStorage.getItem('mess_github_gist_id') || '';
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ login: string; avatar_url: string; name: string } | null>(null);

  // Check stored token
  useEffect(() => {
    if (githubToken.trim()) {
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUserInfo(data);
      })
      .catch(() => setUserInfo(null));
    }
  }, [githubToken]);

  if (!isOpen) return null;

  const handleSaveToken = async () => {
    if (!githubToken.trim()) {
      localStorage.removeItem('mess_github_token');
      setUserInfo(null);
      setSyncStatus('Token cleared');
      return;
    }

    try {
      setIsSyncing(true);
      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${githubToken.trim()}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUserInfo(data);
        localStorage.setItem('mess_github_token', githubToken.trim());
        setSyncStatus(`Connected as @${data.login}`);
      } else {
        setSyncStatus('Invalid token. Please check permissions.');
      }
    } catch {
      setSyncStatus('Connection error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBackupToGitHub = async () => {
    if (!githubToken.trim()) {
      setSyncStatus('Please enter a GitHub Personal Access Token first.');
      return;
    }

    try {
      setIsSyncing(true);
      setSyncStatus('Backing up ledger to GitHub...');

      const payload = {
        description: `Mess Meal & Dormitory Management System Backup (${new Date().toLocaleDateString()})`,
        public: false,
        files: {
          'mess-ledger-data.json': {
            content: JSON.stringify(fullLedgerData, null, 2)
          },
          'README.md': {
            content: `# Mess Meal & Dormitory Management System Backup\n\n- Date: ${new Date().toISOString()}\n- Active Meal Rate: ${fullLedgerData.summary.activeMealRate}\n- Total Mess Expenses: ${fullLedgerData.summary.totalExpenses}\n- Total Flat Expenses: ${fullLedgerData.dormSummary.totalExpenses}\n- Active Members: ${fullLedgerData.members.length}\n`
          }
        }
      };

      let url = 'https://api.github.com/gists';
      let method = 'POST';

      if (gistId.trim()) {
        url = `https://api.github.com/gists/${gistId.trim()}`;
        method = 'PATCH';
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `token ${githubToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setGistId(data.id);
        localStorage.setItem('mess_github_gist_id', data.id);
        setSyncStatus(`Backup successfully saved to GitHub! Gist ID: ${data.id}`);
      } else {
        const err = await res.json();
        setSyncStatus(`Backup failed: ${err.message || 'Unknown error'}`);
      }
    } catch (e: any) {
      setSyncStatus(`Error: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreFromGitHub = async () => {
    if (!githubToken.trim() || !gistId.trim()) {
      setSyncStatus('Token and Gist ID are required to restore data.');
      return;
    }

    try {
      setIsSyncing(true);
      setSyncStatus('Fetching backup from GitHub...');

      const res = await fetch(`https://api.github.com/gists/${gistId.trim()}`, {
        headers: {
          Authorization: `token ${githubToken.trim()}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const file = data.files?.['mess-ledger-data.json'];
        if (file && file.content) {
          const parsed = JSON.parse(file.content);
          if (onRestoreData) {
            onRestoreData(parsed);
            setSyncStatus('Ledger successfully restored from GitHub!');
          }
        } else {
          setSyncStatus('No mess-ledger-data.json found in Gist.');
        }
      } else {
        setSyncStatus('Could not find the specified Gist.');
      }
    } catch (e: any) {
      setSyncStatus(`Restore error: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-xl shadow-xs">
              <GithubIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Connect GitHub
              </h3>
              <p className="text-xs text-slate-500">
                Export codebase or cloud-backup mess ledger to GitHub
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg mt-4 mb-4">
          <button
            onClick={() => setActiveTab('export_repo')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'export_repo'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Push Code to GitHub (AI Studio)
          </button>
          <button
            onClick={() => setActiveTab('cloud_sync')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'cloud_sync'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. In-App Data Backup & Sync
          </button>
        </div>

        {/* Tab 1: AI Studio GitHub Repository Export */}
        {activeTab === 'export_repo' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <GitBranch className="w-4 h-4 text-emerald-600" />
                <span>Export Whole App Repository to Your GitHub</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Google AI Studio has built-in 1-click GitHub connection. You can export this entire codebase directly to a brand new repository on your GitHub account:
              </p>

              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 font-medium">
                <li>Look at the **top-right header of Google AI Studio** (next to the Share and Run buttons).</li>
                <li>Click the **GitHub icon** or **"Export to GitHub"** button.</li>
                <li>Authorize Google AI Studio to access your GitHub account.</li>
                <li>Choose your repository name (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">mess-meal-management-system</code>) and click **Create & Push**.</li>
              </ol>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <FileArchive className="w-4 h-4 text-amber-600" />
                  <span>Download Whole Project ZIP (For Vercel / Local)</span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  ~140 KB
                </span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Want to host directly on Vercel or extract onto your computer? Download the pre-packaged zip archive containing all source files, configurations, and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">vercel.json</code>.
              </p>
              <a
                href="/mess-manager-project.zip"
                download="mess-manager-project.zip"
                className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs text-center"
              >
                <FileArchive className="w-4 h-4" />
                <span>Download mess-manager-project.zip</span>
              </a>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-950 flex items-center justify-between">
              <span className="font-semibold">
                ✔️ All React, TypeScript, Tailwind & calculation code is ready for Git commit.
              </span>
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Tab 2: Live In-App Gist Cloud Sync */}
        {activeTab === 'cloud_sync' && (
          <div className="space-y-4">
            {userInfo && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={userInfo.avatar_url}
                    alt={userInfo.login}
                    className="w-8 h-8 rounded-full border border-slate-300"
                  />
                  <div>
                    <strong className="text-xs text-slate-900">{userInfo.name || userInfo.login}</strong>
                    <span className="block text-[11px] text-slate-500 font-mono">@{userInfo.login}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <Check className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  GitHub Personal Access Token (Classic or Fine-Grained)
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=gist&description=Mess+Meal+Tracker+Backup"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Generate Token</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="grow text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <button
                  onClick={handleSaveToken}
                  disabled={isSyncing}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors shrink-0"
                >
                  Connect
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Requires only the <code className="font-mono text-slate-700">gist</code> permission to backup your mess data safely.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GitHub Backup Gist ID (Auto-saved)
              </label>
              <input
                type="text"
                placeholder="e.g. a8b9c0d1e2f3..."
                value={gistId}
                onChange={(e) => setGistId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleBackupToGitHub}
                disabled={isSyncing || !githubToken}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Backup Ledger to GitHub</span>
              </button>

              <button
                onClick={handleRestoreFromGitHub}
                disabled={isSyncing || !githubToken || !gistId}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 disabled:opacity-50 rounded-lg transition-colors"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Restore from GitHub</span>
              </button>
            </div>

            {syncStatus && (
              <div className="p-2.5 bg-slate-100 rounded-lg text-xs text-slate-800 font-mono break-all">
                {syncStatus}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4 mt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

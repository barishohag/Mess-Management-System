import { AdminCredentials, AdminSession, AdminAuditLog } from '../types';

const ADMIN_CREDS_KEY = 'mess_admin_creds_github_v1';
const ADMIN_LOGS_KEY = 'mess_admin_audit_logs_v1';

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  userId: '',
  passwordHash: '',
  displayName: 'Mess Manager (Admin)',
  email: 'admin@messmanager.local',
  role: 'Super Admin',
  updatedAt: new Date().toISOString()
};

// Credentials are configured as Vercel server environment variables and never stored in the browser.
export function getAdminCredentials(): AdminCredentials {
  localStorage.removeItem(ADMIN_CREDS_KEY);
  return DEFAULT_ADMIN_CREDENTIALS;
}

export function saveAdminCredentials(_creds: AdminCredentials): void {
  localStorage.removeItem(ADMIN_CREDS_KEY);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  localStorage.removeItem(ADMIN_CREDS_KEY);
  localStorage.removeItem('mess_admin_session_github_v1');
  try {
    const response = await fetch('/api/auth', { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) return null;
    const result = await response.json();
    return result.session || null;
  } catch {
    return null;
  }
}

export async function loginAdmin(userIdInput: string, passwordInput: string): Promise<{ success: boolean; message?: string; session?: AdminSession }> {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userIdInput.trim(), password: passwordInput })
    });
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.message || 'Invalid User ID or Password.' };
    logAdminAction('Admin Login', `Logged in successfully as ${result.session.userId}`);
    return { success: true, session: result.session };
  } catch {
    return { success: false, message: 'Unable to contact the secure sign-in service. Try again.' };
  }
}

export async function logoutAdmin(): Promise<void> {
  const session = await getAdminSession();
  try {
    await fetch('/api/auth', { method: 'DELETE', credentials: 'same-origin' });
  } finally {
    if (session) logAdminAction('Admin Logout', `Session ended for ${session.userId}`);
  }
}

export function getAdminLogs(): AdminAuditLog[] {
  const saved = localStorage.getItem(ADMIN_LOGS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse admin logs:', e);
    }
  }
  return [
    {
      id: 'log-init',
      timestamp: new Date().toISOString(),
      action: 'System Initialized',
      details: 'Admin authentication and management ledger online',
      performedBy: 'System'
    }
  ];
}

export function logAdminAction(action: string, details: string): void {
  const logs = getAdminLogs();
  const newLog: AdminAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    performedBy: 'Admin / System'
  };
  localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify([newLog, ...logs].slice(0, 50)));
}


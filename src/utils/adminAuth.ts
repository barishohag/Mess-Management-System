import { AdminCredentials, AdminSession, AdminAuditLog } from '../types';

const ADMIN_CREDS_KEY = 'mess_admin_creds_github_v1';
// A new key clears sessions created before the app-wide login gate was added.
const ADMIN_SESSION_KEY = 'mess_admin_session_github_v1';
const ADMIN_LOGS_KEY = 'mess_admin_audit_logs_v1';

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  userId: import.meta.env.VITE_ADMIN_USER_ID || '',
  passwordHash: import.meta.env.VITE_ADMIN_PASSWORD || '',
  displayName: 'Mess Manager (Admin)',
  email: 'admin@messmanager.local',
  role: 'Super Admin',
  updatedAt: new Date().toISOString()
};

export function getAdminCredentials(): AdminCredentials {
  const saved = localStorage.getItem(ADMIN_CREDS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse admin credentials:', e);
    }
  }
  return DEFAULT_ADMIN_CREDENTIALS;
}

export function saveAdminCredentials(creds: AdminCredentials): void {
  localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify(creds));
  logAdminAction('Update Admin Credentials', `User ID or password updated for ${creds.userId}`);
}

export function getAdminSession(): AdminSession | null {
  const saved = localStorage.getItem(ADMIN_SESSION_KEY);
  if (saved) {
    try {
      const parsed: AdminSession = JSON.parse(saved);
      if (parsed && parsed.isLoggedIn) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse admin session:', e);
    }
  }
  return null;
}

export function loginAdmin(userIdInput: string, passwordInput: string): { success: boolean; message?: string; session?: AdminSession } {
  const trimmedUser = userIdInput.trim().toLowerCase();
  const trimmedPass = passwordInput.trim();

  const creds = getAdminCredentials();

  if (!creds.userId || !creds.passwordHash) {
    return {
      success: false,
      message: 'Configure VITE_ADMIN_USER_ID and VITE_ADMIN_PASSWORD before building the app.'
    };
  }

  if (trimmedUser === creds.userId.trim().toLowerCase() && trimmedPass === creds.passwordHash) {
    const session: AdminSession = {
      isLoggedIn: true,
      userId: creds.userId,
      displayName: creds.displayName,
      role: creds.role,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    logAdminAction('Admin Login', `Logged in successfully as ${creds.userId}`);
    return { success: true, session };
  }

  return { 
    success: false, 
    message: 'Invalid User ID or Password. Check your credentials.'
  };
}

export function logoutAdmin(): void {
  const session = getAdminSession();
  if (session) {
    logAdminAction('Admin Logout', `Session ended for ${session.userId}`);
  }
  localStorage.removeItem(ADMIN_SESSION_KEY);
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
  const session = getAdminSession();
  const logs = getAdminLogs();
  const newLog: AdminAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    performedBy: session ? session.userId : 'Anonymous / System'
  };
  const updatedLogs = [newLog, ...logs].slice(0, 50); // keep last 50
  localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(updatedLogs));
}

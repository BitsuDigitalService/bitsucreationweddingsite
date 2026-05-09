const ADMIN_KEY = 'isAdmin';
const ADMIN_EXPIRY_KEY = 'isAdmin_expiry';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isExpired(): boolean {
  try {
    const expiry = window.localStorage.getItem(ADMIN_EXPIRY_KEY);
    if (!expiry) return true;
    return Date.now() > parseInt(expiry, 10);
  } catch {
    return true;
  }
}

export function readAdminAuth(): boolean {
  try {
    if (isExpired()) {
      // Clear stale session silently
      window.localStorage.removeItem(ADMIN_KEY);
      window.localStorage.removeItem(ADMIN_EXPIRY_KEY);
      window.sessionStorage.removeItem(ADMIN_KEY);
      return false;
    }
    return (
      window.localStorage.getItem(ADMIN_KEY) === 'true' ||
      window.sessionStorage.getItem(ADMIN_KEY) === 'true'
    );
  } catch {
    return false;
  }
}

export function saveAdminAuth() {
  try {
    const expiry = (Date.now() + SESSION_DURATION_MS).toString();
    window.localStorage.setItem(ADMIN_KEY, 'true');
    window.localStorage.setItem(ADMIN_EXPIRY_KEY, expiry);
    window.sessionStorage.setItem(ADMIN_KEY, 'true');
  } catch {
    // ignored
  }
  window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: true }));
}

export function clearAdminAuth() {
  try {
    window.localStorage.removeItem(ADMIN_KEY);
    window.localStorage.removeItem(ADMIN_EXPIRY_KEY);
    window.sessionStorage.removeItem(ADMIN_KEY);
  } catch {
    // ignored
  }
  window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: false }));
}

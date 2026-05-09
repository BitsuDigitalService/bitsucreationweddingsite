const ADMIN_KEY = 'isAdmin';
const ADMIN_EXPIRY_KEY = 'isAdmin_expiry';
const ADMIN_PASSWORD_KEY = 'admin_password';
const ADMIN_SECURITY_ANSWER_KEY = 'admin_security_answer';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEFAULT_ADMIN_PASSWORD = '1234';
const DEFAULT_SECURITY_QUESTION = 'Aditya 1st Phone name';
const DEFAULT_SECURITY_ANSWER = 'aditya';

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

export function getAdminPassword(): string {
  try {
    return window.localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
  } catch {
    return DEFAULT_ADMIN_PASSWORD;
  }
}

export function updateAdminPassword(nextPassword: string) {
  try {
    window.localStorage.setItem(ADMIN_PASSWORD_KEY, nextPassword);
  } catch {
    // ignored
  }
}

export function getAdminSecurityQuestion(): string {
  return DEFAULT_SECURITY_QUESTION;
}

export function getAdminSecurityAnswer(): string {
  try {
    return window.localStorage.getItem(ADMIN_SECURITY_ANSWER_KEY) || DEFAULT_SECURITY_ANSWER;
  } catch {
    return DEFAULT_SECURITY_ANSWER;
  }
}

export function updateAdminSecurityAnswer(nextAnswer: string) {
  try {
    window.localStorage.setItem(ADMIN_SECURITY_ANSWER_KEY, nextAnswer.trim().toLowerCase());
  } catch {
    // ignored
  }
}

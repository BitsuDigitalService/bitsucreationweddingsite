import { useEffect, useState } from 'react';
import { readAdminAuth } from '../lib/adminAuth';

export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(() => readAdminAuth());

  useEffect(() => {
    const sync = () => setIsAdmin(readAdminAuth());

    sync();
    const intervalId = window.setInterval(sync, 1000);
    window.addEventListener('storage', sync);
    window.addEventListener('admin-auth-changed', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('pageshow', sync);
    document.addEventListener('visibilitychange', sync);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', sync);
      window.removeEventListener('admin-auth-changed', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('pageshow', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return isAdmin;
}

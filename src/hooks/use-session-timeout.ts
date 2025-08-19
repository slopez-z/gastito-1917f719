import { useEffect, useState } from 'react';
import { isSessionExpired, clearEncryptionSession } from '@/lib/encryption';

const SESSION_CHECK_INTERVAL = 60000; // Check every minute
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const useSessionTimeout = () => {
  const [isExpired, setIsExpired] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
      if (isExpired) {
        setIsExpired(false);
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [isExpired]);

  // Check session expiration
  useEffect(() => {
    const checkSession = () => {
      const now = Date.now();
      const inactivityExpired = now - lastActivity > INACTIVITY_TIMEOUT;
      const encryptionExpired = isSessionExpired();
      
      if (inactivityExpired || encryptionExpired) {
        setIsExpired(true);
        clearEncryptionSession();
      }
    };

    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [lastActivity]);

  const refreshSession = () => {
    clearEncryptionSession();
    setLastActivity(Date.now());
    setIsExpired(false);
    window.location.reload();
  };

  const clearSession = () => {
    clearEncryptionSession();
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return {
    isExpired,
    refreshSession,
    clearSession,
    lastActivity: new Date(lastActivity)
  };
};
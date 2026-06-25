import React, { createContext, useContext, useCallback, useRef, useEffect, useState } from 'react';
import { apiFetch, getSessionToken } from '../services/api';

interface UnreadContextType {
  totalUnread: number;
  setTotalUnread: (n: number) => void;
}

const UnreadContext = createContext<UnreadContextType | undefined>(undefined);

export function useUnread() {
  const context = useContext(UnreadContext);
  if (!context) {
    throw new Error('useUnread must be used within an UnreadProvider');
  }
  return context;
}

/**
 * Fetches /community/conversations silently and sums up all unread_count values
 * for conversations where the active conversation is NOT the current one.
 * Returns null if the user is not authenticated or not in a company.
 */
async function fetchTotalUnread(): Promise<number | null> {
  const token = await getSessionToken();
  if (!token) return null;
  
  try {
    const convos: Array<{ unread_count?: number }> = await apiFetch('/community/conversations');
    if (!Array.isArray(convos)) return null;
    return convos.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);
  } catch (e) {
    console.warn('Failed to fetch unread count:', e);
    return null;
  }
}

/** Provider: mounts once at the app root. Polls every 30 s. */
export function UnreadProvider({ children }: { children: React.ReactNode }) {
  const [totalUnread, setTotalUnreadState] = useState(0);
  const latestRef = useRef(0);

  const setTotalUnread = useCallback((n: number) => {
    latestRef.current = n;
    setTotalUnreadState(n);
  }, []);

  // Initial fetch + 30-second background poll
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      const count = await fetchTotalUnread();
      if (!cancelled && count !== null) {
        setTotalUnread(count);
      }
    };

    poll();
    const interval = setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setTotalUnread]);

  return (
    <UnreadContext.Provider value={{ totalUnread, setTotalUnread }}>
      {children}
    </UnreadContext.Provider>
  );
}

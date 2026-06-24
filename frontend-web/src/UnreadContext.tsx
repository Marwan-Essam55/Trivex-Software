import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

const API = 'http://127.0.0.1:8000';

interface UnreadContextValue {
  totalUnread: number;
  setTotalUnread: (n: number) => void;
}

const UnreadContext = createContext<UnreadContextValue>({
  totalUnread: 0,
  setTotalUnread: () => {},
});

export function useUnread() {
  return useContext(UnreadContext);
}

function getToken() {
  return localStorage.getItem('access_token') || '';
}

function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const d: any = jwtDecode(token);
    return d.exp > Date.now() / 1000;
  } catch { return false; }
}

/**
 * Fetches /community/conversations silently and sums up all unread_count values
 * for conversations where the active conversation is NOT the current one.
 * Returns null if the user is not authenticated or not in a company.
 */
async function fetchTotalUnread(): Promise<number | null> {
  if (!isTokenValid()) return null;
  try {
    const res = await fetch(`${API}/community/conversations`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) return null;
    const convos: Array<{ unread_count: number }> = await res.json();
    return convos.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);
  } catch { return null; }
}

/** Provider: mounts once at the app root. Polls every 30 s. */
export function UnreadProvider({ children }: { children: ReactNode }) {
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

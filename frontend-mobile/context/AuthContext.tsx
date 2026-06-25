import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { saveSession, clearSession, getSessionToken, getSessionUser, apiFetch } from '../services/api';

export function decodeJWT(token: string) {
  try {
    return jwtDecode<any>(token);
  } catch (e) {
    console.error('JWT Decode error:', e);
    return null;
  }
}

interface AuthContextType {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const profile = await apiFetch('/auth/me');
      setUser(profile);
      const currentToken = await getSessionToken();
      if (currentToken) {
        await saveSession(currentToken, profile);
      }
    } catch (e) {
      console.error("Failed to refresh profile:", e);
    }
  };

  useEffect(() => {
    async function loadSession() {
      try {
        const storedToken = await getSessionToken();
        const storedUser = await getSessionUser();

        if (storedToken) {
          const decoded = decodeJWT(storedToken);
          if (decoded && decoded.exp * 1000 > Date.now()) {
            setToken(storedToken);
            if (storedUser) {
              setUser(storedUser);
            }

            try {
              const profile = await apiFetch('/auth/me');
              setUser(profile);
              await saveSession(storedToken, profile);
            } catch (fetchError: any) {
              console.warn('Silent profile load failed', fetchError);
              if (fetchError?.message?.includes('401') || fetchError?.message?.includes('403')) {
                setToken(null);
                setUser(null);
                await clearSession();
              }
            }
          } else {
            await clearSession();
          }
        }
      } catch (e) {
        console.error('Error loading session:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const signIn = async (newToken: string) => {
    setToken(newToken);
    
    const decoded = decodeJWT(newToken);
    const fallbackUser = decoded ? {
      email: decoded.sub,
      role: (decoded.role || 'USER').toUpperCase(),
    } : { role: 'USER' };

    setUser(fallbackUser);
    await saveSession(newToken, fallbackUser);

    try {
      const profile = await apiFetch('/auth/me');
      setUser(profile);
      await saveSession(newToken, profile);
    } catch (err: any) {
      console.warn('Sign in profiles error:', err);
      if (err?.message?.includes('401') || err?.message?.includes('403')) {
        setToken(null);
        setUser(null);
        await clearSession();
        throw err;
      }
      // Keep the fallback session for non-auth profile fetch failures.
    }
  };

  const signOut = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}
    setToken(null);
    setUser(null);
    await clearSession();
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

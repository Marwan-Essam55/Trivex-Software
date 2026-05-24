import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveSession, clearSession, getSessionToken, getSessionUser, apiFetch } from '../services/api';

export function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    let base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding back if necessary
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Base64 decode in pure JavaScript (robust for React Native engines)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = '';
    for (let i = 0, bc = 0, bs = 0, r1, r2, r3; i < base64.length; i++) {
      const idx = chars.indexOf(base64.charAt(i));
      if (idx === -1) continue;
      
      bc = bc % 4;
      if (bc === 0) {
        bs = idx;
      } else if (bc === 1) {
        r1 = (bs << 2) | (idx >> 4);
        str += String.fromCharCode(r1);
        bs = idx;
      } else if (bc === 2) {
        r2 = ((bs & 15) << 4) | (idx >> 2);
        str += String.fromCharCode(r2);
        bs = idx;
      } else if (bc === 3) {
        r3 = ((bs & 3) << 6) | idx;
        str += String.fromCharCode(r3);
      }
      bc++;
    }
    
    // Support UTF-8 multi-byte decoding
    return JSON.parse(decodeURIComponent(
      str.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    ));
  } catch (e) {
    console.error("JWT Decode error:", e);
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
        
        if (storedToken && storedUser) {
          const decoded = decodeJWT(storedToken);
          // Check token expiration (exp is in seconds)
          if (decoded && decoded.exp * 1000 > Date.now()) {
            setToken(storedToken);
            setUser(storedUser);
            // Silently refresh the full user profile details from backend
            apiFetch('/auth/me')
              .then(profile => {
                setUser(profile);
                saveSession(storedToken, profile);
              })
              .catch(err => console.log("Silent profile load failed", err));
          } else {
            await clearSession();
          }
        }
      } catch (e) {
        console.error("Error loading session:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const signIn = async (newToken: string) => {
    setToken(newToken);
    
    try {
      const decoded = decodeJWT(newToken);
      // Create temporary fallback user with decoded role & sub
      const fallbackUser = decoded ? { 
        email: decoded.sub, 
        role: (decoded.role || 'USER').toUpperCase() 
      } : { role: 'USER' };
      
      setUser(fallbackUser);
      await saveSession(newToken, fallbackUser);
      
      // Perform immediate full profile fetch from server
      const profile = await apiFetch('/auth/me');
      setUser(profile);
      await saveSession(newToken, profile);
    } catch (err) {
      console.error("Sign in profiles error:", err);
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

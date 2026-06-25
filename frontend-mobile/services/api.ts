import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'https://marwanessam55-trivex-backend.hf.space';

const TOKEN_KEY = 'trivex_access_token';
const USER_KEY = 'trivex_user_data';

// Determine if running in native app (SecureStore supported) or web
const hasSecureStore = Platform.OS !== 'web';

const memoryStorage: Record<string, string> = {};

// Safe AsyncStorage / LocalStorage / MemoryStorage fallback wrapper to prevent "Native module is null" errors
const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (err) {
      console.warn("Storage warning: falling back to memory storage.", err);
      return memoryStorage[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      console.warn("Storage warning: falling back to memory storage.", err);
      memoryStorage[key] = value;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.warn("Storage warning: falling back to memory storage.", err);
      delete memoryStorage[key];
    }
  }
};

export async function saveSession(token: string, userData: any) {
  try {
    if (hasSecureStore) {
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } catch (secureErr) {
        console.warn('SecureStore token save failed, using memory fallback.', secureErr);
        memoryStorage[TOKEN_KEY] = token;
      }
    } else {
      await safeStorage.setItem(TOKEN_KEY, token);
    }
    await safeStorage.setItem(USER_KEY, JSON.stringify(userData));
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

export async function getSessionToken(): Promise<string | null> {
  try {
    if (hasSecureStore) {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token !== null) {
          return token;
        }
      } catch (secureErr) {
        console.warn('SecureStore token read failed, using memory fallback.', secureErr);
      }
      return memoryStorage[TOKEN_KEY] || null;
    } else {
      return await safeStorage.getItem(TOKEN_KEY);
    }
  } catch (err) {
    console.error('Failed to get session token:', err);
    return memoryStorage[TOKEN_KEY] || null;
  }
}

export async function getSessionUser(): Promise<any | null> {
  try {
    const userStr = await safeStorage.getItem(USER_KEY);
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (err) {
    console.error('Failed to get session user:', err);
  }
  return null;
}

export async function clearSession() {
  try {
    if (hasSecureStore) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } else {
      await safeStorage.removeItem(TOKEN_KEY);
    }
    await safeStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getSessionToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body instanceof FormData) {
    delete (headers as Record<string, string>)['Content-Type'];
  } else if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: 'Request failed' }));
    const statusPrefix = (response.status === 401 || response.status === 403) ? `${response.status}: ` : '';
    throw new Error(statusPrefix + (errorBody.detail || `Request failed with status ${response.status}`));
  }

  // Handle 204 No Content (e.g. DELETE responses)
  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

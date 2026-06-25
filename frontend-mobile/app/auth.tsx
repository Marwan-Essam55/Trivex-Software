import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, Mail, Lock, ArrowRight, AlertTriangle, Sun, Moon } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

WebBrowser.maybeCompleteAuthSession();

export default function AuthView() {
  const { signIn } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up Google OAuth request
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '445449318479-cefm1msih609rd35o4m2cukg7vse7344.apps.googleusercontent.com',
  });

  const handleGoogleLoginSuccess = useCallback(async (idToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('https://marwanessam55-trivex-backend.hf.space/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });

      if (res.ok) {
        const data = await res.json();
        await signIn(data.access_token);
        router.replace('/(tabs)');
      } else {
        const err = await res.json().catch(() => ({ detail: 'Google authentication failed' }));
        setError(err.detail || 'Google authentication failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error connecting to the server.');
    } finally {
      setIsLoading(false);
    }
  }, [signIn]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleLoginSuccess(id_token);
      }
    } else if (response?.type === 'error') {
      setError('Google Sign-In was unsuccessful. Please check redirection configs.');
    }
  }, [response, handleGoogleLoginSuccess]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const details = {
        'username': email.trim(),
        'password': password,
      };

      const formBody = Object.keys(details)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key as keyof typeof details]))
        .join('&');

      const res = await fetch('https://marwanessam55-trivex-backend.hf.space/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody,
      });

      if (res.ok) {
        const data = await res.json();
        await signIn(data.access_token);
        router.replace('/(tabs)');
      } else {
        const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
        setError(err.detail || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error connecting to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const bg = isDark ? '#0f172a' : '#ffffff';
  const cardBg = isDark ? '#1e293b' : '#f8fafc';
  const borderClr = isDark ? '#334155' : '#e2e8f0';
  const textClr = isDark ? '#f1f5f9' : '#0f172a';
  const subClr = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#0f172a' : '#ffffff';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} style={{ paddingHorizontal: 24, paddingVertical: 48 }}>

          {/* Dark mode toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            style={{
              position: 'absolute',
              top: 16,
              right: 0,
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              borderWidth: 1,
              borderColor: borderClr,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isDark
              ? <Sun size={18} color="#ffffff" />
              : <Moon size={18} color="#475569" />
            }
          </TouchableOpacity>

          <View style={{ marginBottom: 40, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <Activity size={32} color="#0d9488" />
              <Text style={{ marginLeft: 8, fontWeight: '700', fontSize: 22, color: textClr, letterSpacing: 2, textTransform: 'uppercase' }}>Trivex</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: '800', color: textClr, letterSpacing: -0.5, textAlign: 'center' }}>Access Workspace</Text>
            <Text style={{ marginTop: 8, color: subClr, textAlign: 'center', fontSize: 14 }}>Authenticate to enter the secure environment.</Text>
          </View>

          {error && (
            <View style={{ marginBottom: 24, padding: 16, borderRadius: 10, backgroundColor: isDark ? '#450a0a' : '#fef2f2', borderWidth: 1, borderColor: isDark ? '#7f1d1d' : '#fecaca', flexDirection: 'row', alignItems: 'flex-start' }}>
              <AlertTriangle size={20} color="#ef4444" style={{ marginRight: 12, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#fca5a5' : '#991b1b' }}>Authentication Error</Text>
                <Text style={{ fontSize: 12, color: isDark ? '#f87171' : '#b91c1c', marginTop: 4 }}>{error}</Text>
              </View>
            </View>
          )}

          <View style={{ gap: 16 }}>
            {/* Email */}
            <View style={{ position: 'relative', justifyContent: 'center' }}>
              <View style={{ position: 'absolute', left: 16, zIndex: 10 }}>
                <Mail size={20} color="#94a3b8" />
              </View>
              <TextInput
                style={{ width: '100%', paddingLeft: 48, paddingRight: 16, paddingVertical: 16, backgroundColor: inputBg, borderWidth: 1, borderColor: borderClr, borderRadius: 10, color: textClr, fontSize: 15 }}
                placeholder="admin@trivex.io"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={{ position: 'relative', justifyContent: 'center' }}>
              <View style={{ position: 'absolute', left: 16, zIndex: 10 }}>
                <Lock size={20} color="#94a3b8" />
              </View>
              <TextInput
                style={{ width: '100%', paddingLeft: 48, paddingRight: 16, paddingVertical: 16, backgroundColor: inputBg, borderWidth: 1, borderColor: borderClr, borderRadius: 10, color: textClr, fontSize: 15 }}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: subClr }}>Reset credentials</Text>
            </View>

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 10, backgroundColor: isDark ? '#f1f5f9' : '#0f172a', marginTop: 8, opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={isDark ? '#0f172a' : '#ffffff'} />
              ) : (
                <>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#0f172a' : '#ffffff', marginRight: 8 }}>Authenticate</Text>
                  <ArrowRight size={16} color={isDark ? '#0f172a' : '#ffffff'} />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: borderClr }} />
              <Text style={{ paddingHorizontal: 16, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.5, color: subClr }}>Or</Text>
              <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: borderClr }} />
            </View>

            {/* Google button */}
            <TouchableOpacity
              onPress={() => promptAsync()}
              disabled={isLoading || !request}
              style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: borderClr, borderRadius: 10, backgroundColor: inputBg, marginTop: 8 }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: textClr }}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ marginTop: 40, textAlign: 'center', fontSize: 12, color: subClr }}>
            For organizational access, contact your system administrator.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

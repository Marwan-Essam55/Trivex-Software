import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Activity, Mail, Lock, ArrowRight, AlertTriangle } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';

WebBrowser.maybeCompleteAuthSession();

export default function AuthView() {
  const { signIn } = useAuth();
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
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });

      if (res.ok) {
        const data = await res.json();
        await signIn(data.access_token);
      } else {
        const err = await res.json().catch(() => ({ detail: 'Google authentication failed' }));
        setError(err.detail || 'Google authentication failed.');
      }
    } catch {
      setError('Network error connecting to the server.');
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
        'username': email,
        'password': password,
      };

      const formBody = Object.keys(details)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key as keyof typeof details]))
        .join('&');

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody,
      });

      if (res.ok) {
        const data = await res.json();
        await signIn(data.access_token);
      } else {
        const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
        setError(err.detail || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setError('Network error connecting to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6 py-12">
          
          <View className="mb-10 items-center">
            <View className="flex-row items-center mb-6">
              <Activity size={32} color="#0f172a" />
              <Text className="ml-2 font-bold text-2xl text-slate-900 tracking-wider uppercase">Trivex</Text>
            </View>
            <Text className="text-3xl font-bold text-slate-900 tracking-tight text-center">Access Workspace</Text>
            <Text className="mt-2 text-slate-500 text-center">Authenticate to enter the secure environment.</Text>
          </View>

          {error && (
            <View className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex-row items-start">
              <AlertTriangle size={20} color="#ef4444" className="mr-3 mt-0.5" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-red-800">Authentication Error</Text>
                <Text className="text-xs text-red-700 mt-1">{error}</Text>
              </View>
            </View>
          )}

          <View className="space-y-6">
            <View className="space-y-5">
              <View className="relative justify-center">
                <View className="absolute left-4 z-10">
                  <Mail size={20} color="#94a3b8" />
                </View>
                <TextInput
                  className="w-full pl-11 pr-4 py-4 bg-white border border-slate-300 rounded-lg text-slate-900 text-base"
                  placeholder="admin@trivex.io"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="relative justify-center mt-4">
                <View className="absolute left-4 z-10">
                  <Lock size={20} color="#94a3b8" />
                </View>
                <TextInput
                  className="w-full pl-11 pr-4 py-4 bg-white border border-slate-300 rounded-lg text-slate-900 text-base"
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-4">
              <Text className="text-sm font-medium text-slate-900">Reset credentials</Text>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className="w-full flex-row items-center justify-center py-4 px-4 rounded-lg bg-slate-900 mt-6"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text className="text-base font-semibold text-white mr-2">Authenticate</Text>
                  <ArrowRight size={16} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
            
            <View className="mt-8 flex-row items-center justify-center">
              <View className="flex-1 border-t border-slate-200" />
              <Text className="px-4 text-xs font-medium uppercase tracking-wider text-slate-400">Or</Text>
              <View className="flex-1 border-t border-slate-200" />
            </View>

            <TouchableOpacity
              onPress={() => promptAsync()}
              disabled={isLoading || !request}
              className="w-full flex-row items-center justify-center py-4 px-4 border border-slate-300 rounded-lg bg-white mt-6"
            >
              <Text className="text-base font-semibold text-slate-700">Continue with Google</Text>
            </TouchableOpacity>
          </View>
          
          <Text className="mt-10 text-center text-xs text-slate-500">
            For organizational access, contact your system administrator.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

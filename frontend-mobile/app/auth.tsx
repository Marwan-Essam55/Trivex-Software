import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Activity, Mail, Lock, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AuthView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // In a real app, authenticate here.
    // Replace current screen with tabs layout
    router.replace('/(tabs)');
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
              className="w-full flex-row items-center justify-center py-4 px-4 rounded-lg bg-slate-900 mt-6"
            >
              <Text className="text-base font-semibold text-white mr-2">Authenticate</Text>
              <ArrowRight size={16} color="#ffffff" />
            </TouchableOpacity>
            
            <View className="mt-8 flex-row items-center justify-center">
              <View className="flex-1 border-t border-slate-200" />
              <Text className="px-4 text-xs font-medium uppercase tracking-wider text-slate-400">Or</Text>
              <View className="flex-1 border-t border-slate-200" />
            </View>

            <TouchableOpacity
              className="w-full flex-row items-center justify-center py-4 px-4 border border-slate-300 rounded-lg bg-white mt-6"
            >
              <Text className="text-base font-semibold text-slate-700">SSO Login</Text>
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

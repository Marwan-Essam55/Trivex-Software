import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Shield, Settings, Key, Bell, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AccountView() {
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, clear tokens here
    router.replace('/auth');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View className="mb-6">
          <Text className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</Text>
          <Text className="text-sm text-slate-500 mt-1">Manage your profile and workspace preferences.</Text>
        </View>

        <View className="space-y-6">
          <View className="bg-white rounded-lg border border-slate-200 p-6 items-center shadow-sm">
            <View className="w-24 h-24 bg-slate-100 rounded-full items-center justify-center border border-slate-200 mb-4">
              <User size={40} color="#94a3b8" />
            </View>
            <Text className="text-xl font-bold text-slate-900">Dr. Sarah Jenkins</Text>
            <Text className="text-sm text-slate-500 mt-1">Lead Researcher</Text>
            <View className="px-2.5 py-1 rounded border border-emerald-200 bg-emerald-50 mt-4">
              <Text className="text-emerald-700 text-xs font-semibold">Active Workspace</Text>
            </View>
          </View>

          <View className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm mt-6">
            <TouchableOpacity className="flex-row items-center px-4 py-4 bg-slate-50 border-l-4 border-slate-900 border-b border-slate-100">
              <User size={16} color="#0f172a" className="mr-3" />
              <Text className="text-slate-900 text-sm font-semibold">Profile Information</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center px-4 py-4 bg-white border-l-4 border-transparent border-b border-slate-100">
              <Key size={16} color="#475569" className="mr-3" />
              <Text className="text-slate-600 text-sm font-medium">Security & Access</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center px-4 py-4 bg-white border-l-4 border-transparent border-b border-slate-100">
              <Bell size={16} color="#475569" className="mr-3" />
              <Text className="text-slate-600 text-sm font-medium">Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center px-4 py-4 bg-white border-l-4 border-transparent">
              <Settings size={16} color="#475569" className="mr-3" />
              <Text className="text-slate-600 text-sm font-medium">Workspace Preferences</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm mt-6">
            <Text className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Profile Details</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-slate-700 mb-2">First Name</Text>
                <TextInput
                  defaultValue="Sarah"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                />
              </View>
              <View className="mt-4">
                <Text className="text-sm font-medium text-slate-700 mb-2">Last Name</Text>
                <TextInput
                  defaultValue="Jenkins"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                />
              </View>

              <View className="mt-4">
                <View className="flex-row items-center mb-2">
                  <Mail size={16} color="#94a3b8" className="mr-2" />
                  <Text className="text-sm font-medium text-slate-700">Email Address</Text>
                </View>
                <TextInput
                  defaultValue="s.jenkins@trivex.io"
                  editable={false}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500"
                />
              </View>

              <View className="mt-4">
                <View className="flex-row items-center mb-2">
                  <Shield size={16} color="#94a3b8" className="mr-2" />
                  <Text className="text-sm font-medium text-slate-700">Role & Permissions</Text>
                </View>
                <TextInput
                  defaultValue="Administrator"
                  editable={false}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500"
                />
              </View>

              <View className="pt-6 mt-2">
                <TouchableOpacity className="px-6 py-3 bg-slate-900 rounded-lg items-center">
                  <Text className="text-white font-semibold text-sm">Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-lg border border-red-200 p-6 shadow-sm mt-6">
            <Text className="text-lg font-bold text-red-700 mb-2">Danger Zone</Text>
            <Text className="text-sm text-slate-600 mb-6">Terminate your session and revoke active tokens from this device.</Text>
            <TouchableOpacity 
              onPress={handleLogout}
              className="flex-row items-center justify-center px-6 py-3 border border-red-200 bg-red-50 rounded-lg"
            >
              <LogOut size={16} color="#b91c1c" className="mr-2" />
              <Text className="text-red-700 font-semibold text-sm">Sign Out Securely</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

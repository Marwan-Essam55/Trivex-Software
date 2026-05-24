import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Shield, LogOut, Camera, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';

export default function AccountView() {
  const { user, signOut, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Initialize fields once the user profile loads
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (!firstName || !lastName) {
      setStatusMsg({ type: 'err', text: 'First name and last name are required.' });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      await apiFetch('/users/me', {
        method: 'PUT',
        body: JSON.stringify({ first_name: firstName, last_name: lastName }),
      });
      await refreshProfile();
      setStatusMsg({ type: 'ok', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'err', text: err.message || 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant camera roll permissions to change your avatar.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (pickerResult.canceled) return;

      const selectedAsset = pickerResult.assets[0];
      if (selectedAsset) {
        uploadAvatar(selectedAsset.uri, selectedAsset.mimeType || 'image/jpeg');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred while launching the photo library.');
    }
  };

  const uploadAvatar = async (uri: string, mimeType: string) => {
    setUploading(true);
    setStatusMsg(null);

    try {
      const formData = new FormData();
      const uriParts = uri.split('/');
      const fileName = uriParts[uriParts.length - 1] || 'avatar.jpg';

      formData.append('file', {
        uri: uri,
        type: mimeType,
        name: fileName,
      } as any);

      await apiFetch('/users/me/avatar', {
        method: 'POST',
        body: formData,
      });

      await refreshProfile();
      setStatusMsg({ type: 'ok', text: 'Profile picture uploaded successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'err', text: err.message || 'Failed to upload profile picture.' });
    } finally {
      setUploading(false);
    }
  };

  const roleDisplay = user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'USER' ? 'User' : user?.role || 'User';
  const nameDisplay = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Trivex User' : 'Loading...';
  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : '';

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View className="mb-6">
          <Text className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</Text>
          <Text className="text-sm text-slate-500 mt-1">Manage your profile and workspace preferences.</Text>
        </View>

        <View className="space-y-6">
          
          {/* Avatar & Basic Info Card */}
          <View className="bg-white rounded-lg border border-slate-200 p-6 items-center shadow-sm">
            <TouchableOpacity 
              onPress={handlePickAvatar}
              disabled={uploading}
              className="relative w-24 h-24 rounded-full mb-4 items-center justify-center border border-slate-200 bg-slate-100 overflow-hidden"
            >
              {user?.profile_picture_url ? (
                <Image 
                  source={{ uri: user.profile_picture_url }} 
                  className="w-24 h-24 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-slate-100">
                  {initials ? (
                    <Text className="text-2xl font-bold text-slate-600">{initials}</Text>
                  ) : (
                    <User size={40} color="#94a3b8" />
                  )}
                </View>
              )}
              {/* Camera Icon Overlay */}
              <View className="absolute inset-0 bg-slate-900/40 items-center justify-center opacity-85">
                {uploading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Camera size={18} color="#ffffff" />
                )}
              </View>
            </TouchableOpacity>

            <Text className="text-xl font-bold text-slate-900">{nameDisplay}</Text>
            <Text className="text-sm text-slate-500 mt-1">{roleDisplay}</Text>
            <View className="px-2.5 py-1 rounded border border-emerald-200 bg-emerald-50 mt-4">
              <Text className="text-emerald-700 text-xs font-semibold">Active Workspace</Text>
            </View>
          </View>

          {/* Profile Details Inputs Form */}
          <View className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm mt-6">
            <Text className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Profile Details</Text>
            
            {statusMsg && (
              <View className={`mb-6 p-4 rounded-lg flex-row items-center ${statusMsg.type === 'ok' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                {statusMsg.type === 'ok' ? (
                  <CheckCircle2 size={16} color="#047857" className="mr-2" />
                ) : (
                  <AlertTriangle size={16} color="#ef4444" className="mr-2" />
                )}
                <Text className={`text-sm flex-1 ${statusMsg.type === 'ok' ? 'text-emerald-800' : 'text-red-800'}`}>
                  {statusMsg.text}
                </Text>
              </View>
            )}

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-slate-700 mb-2">First Name</Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                />
              </View>
              <View className="mt-4">
                <Text className="text-sm font-medium text-slate-700 mb-2">Last Name</Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                />
              </View>

              <View className="mt-4">
                <View className="flex-row items-center mb-2">
                  <Mail size={16} color="#94a3b8" className="mr-2" />
                  <Text className="text-sm font-medium text-slate-700">Email Address</Text>
                </View>
                <TextInput
                  value={user?.email || ''}
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
                  value={roleDisplay}
                  editable={false}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500"
                />
              </View>

              <View className="pt-6 mt-2">
                <TouchableOpacity 
                  onPress={handleSaveChanges}
                  disabled={saving}
                  className="w-full py-4 bg-slate-900 rounded-lg items-center justify-center flex-row"
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-white font-semibold text-sm">Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Danger Zone Sign Out */}
          <View className="bg-white rounded-lg border border-red-200 p-6 shadow-sm mt-6">
            <Text className="text-lg font-bold text-red-700 mb-2">Danger Zone</Text>
            <Text className="text-sm text-slate-600 mb-6">Terminate your session and revoke active tokens from this device.</Text>
            <TouchableOpacity 
              onPress={signOut}
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

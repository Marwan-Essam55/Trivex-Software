import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { Activity, Clock, User, Shield } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  const role = (user?.role || 'USER').toUpperCase();
  const isAdmin = role === 'ADMIN';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0f172a',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: Platform.select({
          default: {
            backgroundColor: '#f8fafc',
            borderTopColor: '#e2e8f0',
          },
        }),
      }}>
      {/* USER tabs: Dashboard, History — hidden for ADMIN */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
          href: isAdmin ? null : '/(tabs)',
        }}
      />
      <Tabs.Screen
        name="fusion"
        options={{
          href: null, // Always hidden from tab bar
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Clock size={24} color={color} />,
          href: isAdmin ? null : '/(tabs)/history',
        }}
      />

      {/* ADMIN tab: User Management — hidden for USER */}
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
          href: isAdmin ? '/(tabs)/admin' : null,
        }}
      />

      {/* Shared tab: Account — always visible */}
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

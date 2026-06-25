import { Tabs, usePathname } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { Activity, Clock, User, MessageCircle } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useUnread } from '../../context/UnreadContext';
import { NavigationHeader } from '../../components/NavigationHeader';
import { useTheme } from '../../context/ThemeContext';
import { useColorScheme } from 'nativewind';

export default function TabLayout() {
  const pathname = usePathname();
  const isFusion = pathname.includes('/fusion');
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const { totalUnread } = useUnread();
  const { theme } = useTheme();

  const role = (user?.role || 'USER').toUpperCase();
  const isAdmin = role === 'ADMIN';

  return (
    <View style={{ flex: 1 }}>
      {!isFusion && <NavigationHeader />}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#0d9488',
          tabBarInactiveTintColor: theme === 'dark' ? '#64748b' : '#94a3b8',
          tabBarStyle: Platform.select({
            default: {
              backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
              borderTopColor: theme === 'dark' ? '#1e293b' : '#e2e8f0',
            },
          }),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="fusion"
          options={{
            href: null, // Always hidden from tab bar
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            href: null, // Admin dashboard is rendered inline via index.tsx
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

        {/* Community tab: Chat and messaging — shared for all */}
        <Tabs.Screen
          name="community"
          options={{
            title: 'Community',
            tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
            tabBarBadge: totalUnread > 0 ? totalUnread : null,
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
    </View>
  );
}

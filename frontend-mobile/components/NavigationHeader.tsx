import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, LogOut, Moon, Sun, Globe, X, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useUnread } from '../context/UnreadContext';

export function NavigationHeader() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { totalUnread } = useUnread();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const insets = useSafeAreaInsets();

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const subtextColor = isDark ? '#94a3b8' : '#64748b';

  const handleLogout = () => {
    setMenuOpen(false);
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    setShowSignOutModal(false);
    await signOut();
    router.replace('/');
  };

  const menuItems = [
    {
      id: 'theme',
      label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
      icon: theme === 'dark' ? Sun : Moon,
      action: toggleTheme,
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: LogOut,
      action: handleLogout,
      danger: true,
    },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <View
        style={{
          backgroundColor: bgColor,
          paddingTop: insets.top + 8,
          paddingBottom: 14,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
        }}
      >
        {/* Logo/Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Activity size={20} color="#0d9488" />
          <View>
            <Text style={{ color: textColor, fontSize: 20, fontWeight: '800', letterSpacing: 1 }}>
              TriVex
            </Text>
            <Text style={{ color: subtextColor, fontSize: 12, marginTop: 1, fontWeight: '500' }}>
              {user?.first_name} {user?.last_name}
            </Text>
          </View>
        </View>

        {/* Menu Button */}
        <TouchableOpacity
          onPress={() => setMenuOpen(!menuOpen)}
          style={{
            padding: 10,
            borderRadius: 12,
            backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
            borderWidth: 1,
            borderColor: isDark ? '#334155' : '#e2e8f0',
          }}
        >
          {menuOpen ? (
            <X size={22} color={textColor} />
          ) : (
            <Menu size={22} color={textColor} />
          )}
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {menuOpen && (
        <>
          {/* Overlay to close menu */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 98,
            }}
            activeOpacity={1}
            onPress={() => setMenuOpen(false)}
          />
          <View
            style={{
              position: 'absolute',
              top: insets.top + 70,
              right: 16,
              backgroundColor: bgColor,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: borderColor,
              width: 220,
              zIndex: 100,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
              overflow: 'hidden',
            }}
          >
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    item.action();
                    if (item.id !== 'logout') setMenuOpen(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 18,
                    paddingVertical: 14,
                    borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                    borderBottomColor: borderColor,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: item.danger
                        ? (isDark ? '#450a0a' : '#fef2f2')
                        : (isDark ? '#1e293b' : '#f1f5f9'),
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <IconComponent
                      size={18}
                      color={item.danger ? '#ef4444' : textColor}
                    />
                  </View>
                  <Text
                    style={{
                      color: item.danger ? '#ef4444' : textColor,
                      fontSize: 14,
                      fontWeight: '600',
                      flex: 1,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {/* Custom Sign Out Modal */}
      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 28,
        }}>
          <View style={{
            width: '100%',
            backgroundColor: bgColor,
            borderRadius: 28,
            padding: 32,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.35,
            shadowRadius: 24,
            elevation: 16,
          }}>
            {/* Icon circle */}
            <View style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: isDark ? '#1a0a0a' : '#fef2f2',
              borderWidth: 1.5,
              borderColor: isDark ? '#7f1d1d' : '#fecaca',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 22,
            }}>
              <LogOut size={30} color="#dc2626" />
            </View>

            {/* Title */}
            <Text style={{
              fontSize: 22,
              fontWeight: '800',
              color: textColor,
              marginBottom: 10,
              textAlign: 'center',
              letterSpacing: -0.3,
            }}>
              Sign Out?
            </Text>

            {/* Subtitle */}
            <Text style={{
              fontSize: 14,
              color: subtextColor,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 32,
              paddingHorizontal: 8,
            }}>
              You will be signed out of your workspace. You'll need to authenticate again to regain access.
            </Text>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                onPress={() => setShowSignOutModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: 15,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: isDark ? '#94a3b8' : '#475569' }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmSignOut}
                style={{
                  flex: 1,
                  paddingVertical: 15,
                  borderRadius: 16,
                  backgroundColor: '#dc2626',
                  alignItems: 'center',
                  shadowColor: '#dc2626',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#ffffff' }}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

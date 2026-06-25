import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';
import { useColorScheme } from 'nativewind';
import { AuthProvider, decodeJWT, useAuth } from '../context/AuthContext';
import { ThemeProvider as CustomThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { UnreadProvider } from '../context/UnreadContext';

export const unstable_settings = {
  initialRouteName: 'index',
};

function NavigationGuard() {
  const { token, user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check if the user is currently inside the 'auth' route group
    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    const currentTab = segments.length > 1 ? segments[1] : 'index'; // Handle default index tab

    if (!token && !inAuthGroup) {
      // If the user has no token and is NOT on the landing index screen, redirect to login
      const onLandingScreen = segments.length === 0 || segments[0] === 'index';
      if (!onLandingScreen) {
        router.replace('/auth');
      }
    } else if (token && inAuthGroup) {
      // If the user has an active token and is on the login/auth page, redirect them immediately to the dashboard.
      router.replace('/(tabs)');
    } else if (token && inTabsGroup) {
      // Role-based enforcement within tabs, using profile if available or token fallback.
      const role = user ? (user.role || 'USER').toUpperCase() : (decodeJWT(token)?.role?.toUpperCase() || 'USER');
      const isAdmin = role === 'ADMIN';

      // If USER is on admin-only route, redirect to dashboard.
      if (!isAdmin && currentTab === 'admin') {
        router.replace('/(tabs)');
      }
    }
  }, [token, user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <AuthProvider>
      <CustomThemeProvider>
        <LanguageProvider>
          <UnreadProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <NavigationGuard />
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            </ThemeProvider>
          </UnreadProvider>
        </LanguageProvider>
      </CustomThemeProvider>
    </AuthProvider>
  );
}

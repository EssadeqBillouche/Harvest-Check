import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/auth.context';
import { LoadingView } from '@/components/ui/loading-view';
import { Colors } from '@/constants/theme';

function RootNavigator() {
  const colorScheme = useColorScheme() ?? 'light';
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return <LoadingView message="Chargement..." />;
  }

  // Customize navigation theme with our green brand
  const lightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.primary,
      background: Colors.light.background,
      card: Colors.light.surface,
      text: Colors.light.text,
      border: Colors.light.border,
    },
  };

  const darkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.dark.primary,
      background: Colors.dark.background,
      card: Colors.dark.surface,
      text: Colors.dark.text,
      border: Colors.dark.border,
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? darkTheme : lightTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen
          name="parcel/[id]"
          options={{ title: 'Détails Parcelle', headerBackTitle: 'Retour' }}
        />
        <Stack.Screen
          name="parcel/create"
          options={{ title: 'Nouvelle Parcelle', presentation: 'modal' }}
        />
        <Stack.Screen
          name="parcel/edit/[id]"
          options={{ title: 'Modifier Parcelle', presentation: 'modal' }}
        />
        <Stack.Screen
          name="zone/create"
          options={{ title: 'Nouvelle Zone', presentation: 'modal' }}
        />
        <Stack.Screen
          name="zone/[id]"
          options={{ title: 'Détails Zone', headerBackTitle: 'Retour' }}
        />
        <Stack.Screen
          name="culture/create"
          options={{ title: 'Nouvelle Culture', presentation: 'modal' }}
        />
        <Stack.Screen
          name="culture/[id]"
          options={{ title: 'Détails Culture', headerBackTitle: 'Retour' }}
        />
        <Stack.Screen
          name="harvest/create"
          options={{ title: 'Enregistrer Récolte', presentation: 'modal' }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

import './global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { useAppInit } from '@/src/shared/hooks/useAppInit';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isReady } = useAppInit();
  const colorScheme = useColorScheme();

  if (isReady) {
    SplashScreen.hideAsync();
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="player" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

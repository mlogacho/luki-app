import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/src/modules/auth/store/authStore';
import { useProfileStore } from '@/src/modules/profiles/store/profileStore';

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const activeProfile = useProfileStore((state) => state.activeProfile);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!activeProfile) {
    return <Redirect href="/(app)/select-profile" />;
  }

  return <Redirect href="/(app)/home" />;
}

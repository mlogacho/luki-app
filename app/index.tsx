import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../services/authStore';
import { useEffect } from 'react';

export default function Index() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    useEffect(() => {
        // Short timeout to ensure navigation is ready
        const timer = setTimeout(() => {
            if (user) {
                router.replace('/(app)/home');
            } else {
                router.replace('/(auth)/login');
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [user]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD700' }}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={{ color: 'black', marginTop: 20, fontSize: 20, fontWeight: 'bold' }}>DEBUG MODE: JS IS RUNNING</Text>
        </View>
    );
}

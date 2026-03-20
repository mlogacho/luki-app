import { Stack } from 'expo-router';

/**
 * Layout for the unauthenticated (auth) route group.
 *
 * Wraps the login screen inside an Expo Router `Stack` with the header hidden
 * so that the login screen controls its own full-bleed gradient layout.
 */
export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack>
    );
}

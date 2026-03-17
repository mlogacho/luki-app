import { View, Text, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useAuthStore } from '../../services/authStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('12345');
    const [error, setError] = useState('');
    const router = useRouter();

    const { login, isLoading } = useAuthStore();

    const handleLogin = async () => {
        try {
            setError('');

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Por favor ingresa un correo electrónico válido');
                return;
            }

            if (!password) {
                setError('La contraseña es requerida');
                return;
            }

            await login(email, password);
            router.replace('/(app)/home');
        } catch (e) {
            setError('Credenciales inválidas');
        }
    };

    const Content = (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center">

            <View className="items-center mb-12">
                {/* DEBUG BOX: Verify NativeWind */}
                <View className="w-20 h-20 bg-red-500 mb-4 justify-center items-center">
                    <Text className="text-white font-bold">DEBUG</Text>
                </View>
                <View className="flex-row items-center">
                    {/* Logo Placeholder Simulation */}
                    <View className="mr-2">
                        <View className="w-4 h-4 rounded-full bg-luki-accent mb-1 ml-4" />
                        <View className="w-4 h-4 rounded-full bg-luki-accent mb-1 text-right" />
                        <View className="w-4 h-4 rounded-full bg-luki-accent" />
                    </View>
                    <Text className="text-6xl font-extrabold text-white tracking-tighter">luki</Text>
                </View>
                <Text className="text-gray-300 text-lg tracking-widest uppercase mt-2">tu hogar digital</Text>
            </View>

            <View className="bg-black/20 p-6 rounded-2xl backdrop-blur-lg">
                <Text className="text-2xl font-bold text-white mb-6 text-center">Bienvenido de nuevo</Text>

                {error ? <Text className="text-red-500 mb-4 text-center bg-red-500/10 p-2 rounded">{error}</Text> : null}

                <Input
                    placeholder="Correo electrónico"
                    value={email}
                    onChangeText={setEmail}
                    label="Usuario"
                />
                <Input
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    label="Contraseña"
                />

                <Button title="Entrar" onPress={handleLogin} isLoading={isLoading} />

                <View className="mt-6 items-center">
                    <Text className="text-gray-400">¿Olvidaste tu contraseña?</Text>
                    <Text className="text-gray-400 mt-4 text-xs">Versión v1.0.0</Text>
                </View>
            </View>

        </KeyboardAvoidingView>
    );

    return (
        <LinearGradient
            colors={['#4A148C', '#1A052E']}
            style={{ flex: 1, justifyContent: 'center', padding: 20 }}
        >
            <StatusBar style="light" />

            {Platform.OS === 'web' ? (
                Content
            ) : (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    {Content}
                </TouchableWithoutFeedback>
            )}
        </LinearGradient>
    );
}

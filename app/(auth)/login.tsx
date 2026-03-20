import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/modules/auth/store/authStore';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { StatusBar } from 'expo-status-bar';
import { isValidEmail, isValidPassword } from '@/src/core/utils/validation.utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const router = useRouter();

  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    clearError();
    setValidationError('');

    if (!isValidEmail(email)) {
      setValidationError('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (!isValidPassword(password)) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(app)/home');
    } catch {
      // Error is already stored in authStore.error
    }
  };

  const displayError = validationError || error;

  const Content = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 justify-center"
    >
      <View className="items-center mb-12">
        <View className="flex-row items-center">
          <View className="mr-2">
            <View className="w-4 h-4 rounded-full bg-luki-accent mb-1 ml-4" />
            <View className="w-4 h-4 rounded-full bg-luki-accent mb-1 text-right" />
            <View className="w-4 h-4 rounded-full bg-luki-accent" />
          </View>
          <Text className="text-6xl font-extrabold text-white tracking-tighter">
            luki
          </Text>
        </View>
        <Text className="text-gray-300 text-lg tracking-widest uppercase mt-2">
          tu hogar digital
        </Text>
      </View>

      <View className="bg-black/20 p-6 rounded-2xl">
        <Text className="text-2xl font-bold text-white mb-6 text-center">
          Bienvenido de nuevo
        </Text>

        {displayError ? (
          <Text className="text-red-400 mb-4 text-center bg-red-500/10 p-2 rounded">
            {displayError}
          </Text>
        ) : null}

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

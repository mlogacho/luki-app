import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/modules/auth/store/authStore';
import { hasRole } from '@/src/modules/access-control/roles/roles';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, isLoading, error, clearError, user, isAuthenticated } =
    useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user && hasRole(user.role, 'admin')) {
      router.replace('/admin/panel' as never);
    }
  }, [isAuthenticated, user]);

  const handleLogin = async () => {
    clearError();
    if (!email || !password) return;
    try {
      await login(email, password);
    } catch {
      // Error is shown via authStore.error
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        flex: 1,
        backgroundColor: '#1A052E',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
      }}
    >
      {/* Logo */}
      <View style={{ alignItems: 'center', marginBottom: 48 }}>
        <View
          style={{
            width: 80,
            height: 80,
            backgroundColor: '#FFC107',
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            shadowColor: '#FFC107',
            shadowOpacity: 0.5,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 8 },
          }}
        >
          <FontAwesome name="play" size={34} color="#1A052E" />
        </View>
        <Text
          style={{ color: 'white', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}
        >
          Luki Admin
        </Text>
        <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 6 }}>
          Panel de Administración
        </Text>
      </View>

      {/* Card */}
      <View
        style={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: '#2A0E47',
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: '#3D1A6E',
        }}
      >
        {error ? (
          <Text
            style={{
              color: '#f87171',
              fontSize: 13,
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
        ) : null}

        <Input
          label="Correo electrónico"
          placeholder="admin@dominio.com"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button title="Ingresar" onPress={handleLogin} isLoading={isLoading} />

        {isLoading && (
          <ActivityIndicator
            color="#FFC107"
            style={{ marginTop: 12 }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

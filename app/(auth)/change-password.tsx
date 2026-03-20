import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuthStore } from '@/src/modules/auth/store/authStore';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { isValidPassword } from '@/src/core/utils/validation.utils';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [success, setSuccess] = useState(false);

  /** Delay (ms) before navigating to home after a successful password change */
  const SUCCESS_REDIRECT_DELAY_MS = 1500;

  const { changePassword, isLoading, error, clearError, logout } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async () => {
    clearError();
    setValidationError('');

    if (!currentPassword) {
      setValidationError('Ingresa tu contraseña temporal');
      return;
    }

    if (!isValidPassword(newPassword)) {
      setValidationError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      // After short delay navigate to home
      setTimeout(() => {
        router.replace('/(app)/home');
      }, SUCCESS_REDIRECT_DELAY_MS);
    } catch {
      // Error is shown via authStore.error
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const displayError = validationError || error;

  const Content = (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <View
          style={{
            width: 72,
            height: 72,
            backgroundColor: '#FFC107',
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <FontAwesome name="lock" size={30} color="#1A052E" />
        </View>
        <Text
          style={{ color: 'white', fontSize: 24, fontWeight: '800', textAlign: 'center' }}
        >
          Cambio de contraseña requerido
        </Text>
        <Text
          style={{
            color: '#9ca3af',
            fontSize: 14,
            textAlign: 'center',
            marginTop: 8,
            lineHeight: 20,
            paddingHorizontal: 8,
          }}
        >
          Por seguridad, debes establecer una nueva contraseña antes de continuar.
        </Text>
      </View>

      {/* Form card */}
      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: 20,
          padding: 24,
        }}
      >
        {success ? (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <FontAwesome name="check-circle" size={56} color="#4ade80" />
            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '700',
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              ¡Contraseña actualizada con éxito!
            </Text>
            <Text style={{ color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
              Redirigiendo...
            </Text>
          </View>
        ) : (
          <>
            {displayError ? (
              <Text
                style={{
                  color: '#f87171',
                  fontSize: 13,
                  marginBottom: 16,
                  textAlign: 'center',
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  padding: 10,
                  borderRadius: 8,
                }}
              >
                {displayError}
              </Text>
            ) : null}

            <Input
              label="Contraseña temporal (recibida por email)"
              placeholder="••••••••"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <Input
              label="Nueva contraseña"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <Input
              label="Confirmar nueva contraseña"
              placeholder="Repite la nueva contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Button
              title="Establecer nueva contraseña"
              onPress={handleSubmit}
              isLoading={isLoading}
            />
          </>
        )}
      </View>

      {/* Logout link */}
      {!success && (
        <TouchableOpacity
          onPress={handleLogout}
          style={{ alignItems: 'center', marginTop: 20 }}
        >
          <Text style={{ color: '#6b7280', fontSize: 13 }}>
            Cerrar sesión e ingresar con otra cuenta
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={['#4A148C', '#1A052E']}
      style={{ flex: 1, padding: 24 }}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {Platform.OS === 'web' ? (
          Content
        ) : (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>{Content}</View>
          </TouchableWithoutFeedback>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUsersStore } from '@/src/modules/users/store/usersStore';
import { useAuthStore } from '@/src/modules/auth/store/authStore';
import { useIsAdmin } from '@/src/shared/hooks/useRole';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { User } from '@/src/core/types/user.types';
import type { UserRole } from '@/src/core/types/user.types';

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  reseller: 'Revendedor',
  subscriber: 'Suscriptor',
  guest: 'Invitado',
};

const ROLE_COLORS: Record<UserRole, string> = {
  superadmin: '#ef4444',
  admin: '#f97316',
  reseller: '#a855f7',
  subscriber: '#3b82f6',
  guest: '#6b7280',
};

export default function AdminUsers() {
  const { users, isLoading, error, fetchUsers, deleteUser, resendWelcomeEmail } =
    useUsersStore();
  const { logout } = useAuthStore();
  const isAdminAuth = useIsAdmin();
  const router = useRouter();

  useEffect(() => {
    if (isAdminAuth) fetchUsers();
  }, [isAdminAuth]);

  useEffect(() => {
    if (!isAdminAuth) router.replace('/admin' as never);
  }, [isAdminAuth]);

  const handleDelete = (user: User) => {
    Alert.alert(
      'Eliminar Usuario',
      `¿Eliminar a "${user.name}" (${user.email})?\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteUser(user.id),
        },
      ]
    );
  };

  const handleResendEmail = (user: User) => {
    Alert.alert(
      'Reenviar bienvenida',
      `Se enviará un nuevo correo con credenciales temporales a ${user.email}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reenviar',
          onPress: async () => {
            try {
              await resendWelcomeEmail(user.id);
              Alert.alert('Enviado', `Correo reenviado a ${user.email}`);
            } catch {
              Alert.alert('Error', 'No se pudo reenviar el correo');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    logout();
    router.replace('/admin' as never);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A052E' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#2A0E47',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            style={{
              width: 34,
              height: 34,
              backgroundColor: '#2A0E47',
              borderRadius: 9,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#3D1A6E',
            }}
            onPress={() => router.replace('/admin/panel' as never)}
          >
            <FontAwesome name="arrow-left" size={13} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={{ color: 'white', fontSize: 19, fontWeight: '800' }}>
              Usuarios
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 11 }}>
              {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#FFC107',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 10,
              gap: 6,
            }}
            onPress={() => router.push('/admin/user-form' as never)}
          >
            <FontAwesome name="user-plus" size={14} color="#1A052E" />
            <Text style={{ color: '#1A052E', fontWeight: '700', fontSize: 14 }}>
              Agregar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#2A0E47',
              padding: 9,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#3D1A6E',
            }}
            onPress={handleLogout}
          >
            <FontAwesome name="sign-out" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Info banner about welcome email */}
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 12,
          backgroundColor: '#0f2744',
          borderRadius: 12,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          borderWidth: 1,
          borderColor: '#1e3a5f',
        }}
      >
        <FontAwesome name="envelope" size={14} color="#60a5fa" />
        <Text style={{ color: '#93c5fd', fontSize: 12, flex: 1, lineHeight: 17 }}>
          Al crear un usuario, el sistema envía automáticamente un correo con las credenciales temporales y solicita el cambio de contraseña en el primer inicio de sesión.
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
      >
        {isLoading && users.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <ActivityIndicator size="large" color="#FFC107" />
          </View>
        ) : error ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <FontAwesome name="exclamation-triangle" size={38} color="#f87171" />
            <Text style={{ color: '#f87171', marginTop: 12, fontSize: 14 }}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={fetchUsers}
              style={{
                marginTop: 16,
                backgroundColor: '#FFC107',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: '#1A052E', fontWeight: '700' }}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : users.length === 0 ? (
          /* Empty state */
          <View
            style={{
              alignItems: 'center',
              paddingTop: 80,
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                width: 88,
                height: 88,
                backgroundColor: '#2A0E47',
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#3D1A6E',
              }}
            >
              <FontAwesome name="users" size={38} color="#4A148C" />
            </View>
            <Text
              style={{
                color: 'white',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 8,
              }}
            >
              Sin usuarios aún
            </Text>
            <Text
              style={{
                color: '#6b7280',
                fontSize: 14,
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: 28,
              }}
            >
              Agrega usuarios. Recibirán sus credenciales por correo electrónico.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#FFC107',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 14,
                gap: 8,
              }}
              onPress={() => router.push('/admin/user-form' as never)}
            >
              <FontAwesome name="user-plus" size={15} color="#1A052E" />
              <Text style={{ color: '#1A052E', fontWeight: '700', fontSize: 15 }}>
                Agregar primer usuario
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          users.map((user) => (
            <View
              key={user.id}
              style={{
                backgroundColor: '#2A0E47',
                borderRadius: 16,
                marginBottom: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: '#3D1A6E',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {/* Left: avatar + info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: '#1A052E',
                      borderRadius: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: ROLE_COLORS[user.role],
                    }}
                  >
                    <FontAwesome name="user" size={20} color={ROLE_COLORS[user.role]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 15,
                          fontWeight: '700',
                        }}
                        numberOfLines={1}
                      >
                        {user.name}
                      </Text>
                      {user.mustChangePassword && (
                        <View
                          style={{
                            backgroundColor: '#78350f',
                            borderRadius: 6,
                            paddingHorizontal: 7,
                            paddingVertical: 2,
                            borderWidth: 1,
                            borderColor: '#d97706',
                          }}
                        >
                          <Text style={{ color: '#fbbf24', fontSize: 9, fontWeight: '700' }}>
                            CAMBIO PENDIENTE
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}
                      numberOfLines={1}
                    >
                      {user.email}
                    </Text>
                    <View
                      style={{
                        marginTop: 5,
                        backgroundColor: `${ROLE_COLORS[user.role]}22`,
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        alignSelf: 'flex-start',
                        borderWidth: 1,
                        borderColor: `${ROLE_COLORS[user.role]}55`,
                      }}
                    >
                      <Text
                        style={{
                          color: ROLE_COLORS[user.role],
                          fontSize: 10,
                          fontWeight: '700',
                        }}
                      >
                        {ROLE_LABELS[user.role]}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Right: action buttons */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: '#0f2744',
                      borderRadius: 9,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#1e3a5f',
                    }}
                    onPress={() => handleResendEmail(user)}
                  >
                    <FontAwesome name="envelope" size={14} color="#60a5fa" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: '#0f2744',
                      borderRadius: 9,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#1e3a5f',
                    }}
                    onPress={() =>
                      router.push({
                        pathname: '/admin/user-form' as never,
                        params: { id: user.id },
                      })
                    }
                  >
                    <FontAwesome name="pencil" size={14} color="#60a5fa" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: '#3f1515',
                      borderRadius: 9,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#7f1d1d',
                    }}
                    onPress={() => handleDelete(user)}
                  >
                    <FontAwesome name="trash" size={14} color="#f87171" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUsersStore } from '@/src/modules/users/store/usersStore';
import { useIsAdmin } from '@/src/shared/hooks/useRole';
import { Input } from '@/components/Input';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { UserRole } from '@/src/core/types/user.types';

const ROLES: { value: UserRole; label: string; description: string; color: string }[] = [
  {
    value: 'subscriber',
    label: 'Suscriptor',
    description: 'Acceso al contenido según su plan',
    color: '#3b82f6',
  },
  {
    value: 'reseller',
    label: 'Revendedor',
    description: 'Puede gestionar suscriptores',
    color: '#a855f7',
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Acceso completo al panel de administración',
    color: '#f97316',
  },
  {
    value: 'superadmin',
    label: 'Super Admin',
    description: 'Control total del sistema',
    color: '#ef4444',
  },
];

const INPUT_STYLE = {
  backgroundColor: '#1A052E',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#4A148C',
  color: 'white',
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 15,
} as const;

const LABEL_STYLE = {
  color: '#9ca3af',
  fontSize: 11,
  fontWeight: '700' as const,
  marginBottom: 8,
  letterSpacing: 1,
};

const ERROR_STYLE = { color: '#f87171', fontSize: 12, marginTop: 5 } as const;

export default function AdminUserForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { users, createUser, updateUser } = useUsersStore();
  const isAdminAuth = useIsAdmin();

  const existing = id ? users.find((u) => u.id === id) : null;
  const isEditing = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    existing?.role ?? 'subscriber'
  );
  const [planId, setPlanId] = useState(existing?.planId ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Route protection
  useEffect(() => {
    if (!isAdminAuth) router.replace('/admin' as never);
  }, [isAdminAuth]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'El nombre es requerido';
    if (!isEditing) {
      if (!email.trim()) {
        errs.email = 'El correo electrónico es requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errs.email = 'Ingresa un correo electrónico válido';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEditing && id) {
        await updateUser(id, { name: name.trim(), role: selectedRole, planId: planId.trim() });
        Alert.alert('Usuario actualizado', `Se actualizó la información de ${name}.`);
      } else {
        await createUser({
          name: name.trim(),
          email: email.trim(),
          role: selectedRole,
          planId: planId.trim(),
        });
        Alert.alert(
          '¡Usuario creado!',
          `Se ha creado la cuenta para ${name} y se ha enviado un correo a ${email} con las credenciales de acceso.\n\nEl usuario deberá cambiar su contraseña en el primer inicio de sesión.`,
          [{ text: 'Entendido', onPress: () => router.replace('/admin/users' as never) }]
        );
        return;
      }
      router.replace('/admin/users' as never);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al guardar el usuario';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A052E' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#2A0E47',
        }}
      >
        <TouchableOpacity
          style={{
            width: 38,
            height: 38,
            backgroundColor: '#2A0E47',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#3D1A6E',
          }}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={15} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={{ color: 'white', fontSize: 19, fontWeight: '800' }}>
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 11 }}>
            {isEditing
              ? `Editando: ${existing?.email}`
              : 'Las credenciales se envían por correo'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome email notice (only when creating) */}
          {!isEditing && (
            <View
              style={{
                backgroundColor: '#0f2744',
                borderRadius: 14,
                padding: 14,
                marginBottom: 24,
                flexDirection: 'row',
                gap: 12,
                borderWidth: 1,
                borderColor: '#1e3a5f',
              }}
            >
              <FontAwesome name="envelope-o" size={18} color="#60a5fa" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#93c5fd', fontWeight: '700', fontSize: 13, marginBottom: 4 }}>
                  Correo de bienvenida automático
                </Text>
                <Text style={{ color: '#6b7280', fontSize: 12, lineHeight: 18 }}>
                  Al crear el usuario, el sistema generará una contraseña temporal y enviará un correo de bienvenida a la dirección indicada. El usuario deberá cambiarla en su primer inicio de sesión.
                </Text>
              </View>
            </View>
          )}

          {/* ── NOMBRE ── */}
          <View style={{ marginBottom: 20 }}>
            <Text style={LABEL_STYLE}>NOMBRE COMPLETO *</Text>
            <Input
              placeholder="Ej: Juan Pérez"
              value={name}
              onChangeText={(t) => {
                setName(t);
                setErrors((p) => ({ ...p, name: '' }));
              }}
              label=""
            />
            {errors.name ? <Text style={ERROR_STYLE}>{errors.name}</Text> : null}
          </View>

          {/* ── EMAIL (only on create) ── */}
          {!isEditing && (
            <View style={{ marginBottom: 20 }}>
              <Text style={LABEL_STYLE}>CORREO ELECTRÓNICO *</Text>
              <Input
                placeholder="usuario@dominio.com"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrors((p) => ({ ...p, email: '' }));
                }}
                label=""
              />
              {errors.email ? <Text style={ERROR_STYLE}>{errors.email}</Text> : null}
            </View>
          )}

          {/* ── PLAN ID ── */}
          <View style={{ marginBottom: 20 }}>
            <Text style={LABEL_STYLE}>ID DEL PLAN (opcional)</Text>
            <Input
              placeholder="Ej: plan-basic, plan-premium"
              value={planId}
              onChangeText={setPlanId}
              label=""
            />
          </View>

          {/* ── ROL ── */}
          <View style={{ marginBottom: 32 }}>
            <Text style={LABEL_STYLE}>ROL DEL USUARIO *</Text>
            <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 14 }}>
              Define los permisos y el nivel de acceso del usuario.
            </Text>
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.value;
              return (
                <TouchableOpacity
                  key={role.value}
                  onPress={() => setSelectedRole(role.value)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isSelected ? `${role.color}18` : '#2A0E47',
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 10,
                    borderWidth: 2,
                    borderColor: isSelected ? role.color : '#3D1A6E',
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: isSelected ? role.color : '#4b5563',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? role.color : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <FontAwesome name="check" size={10} color="white" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: isSelected ? role.color : 'white',
                        fontWeight: '700',
                        fontSize: 14,
                      }}
                    >
                      {role.label}
                    </Text>
                    <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                      {role.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── GUARDAR ── */}
          <TouchableOpacity
            style={{
              backgroundColor: '#FFC107',
              borderRadius: 14,
              paddingVertical: 18,
              alignItems: 'center',
              opacity: saving ? 0.75 : 1,
              shadowColor: '#FFC107',
              shadowOpacity: 0.4,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
            }}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#1A052E" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FontAwesome
                  name={isEditing ? 'save' : 'user-plus'}
                  size={18}
                  color="#1A052E"
                />
                <Text style={{ color: '#1A052E', fontWeight: '800', fontSize: 16 }}>
                  {isEditing ? 'Guardar Cambios' : 'Crear Usuario y Enviar Correo'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

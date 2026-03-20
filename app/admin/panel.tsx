import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAdminStore } from '@/services/adminStore';
import { useAuthStore } from '@/src/modules/auth/store/authStore';
import { useIsAdmin } from '@/src/shared/hooks/useRole';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { Channel } from '@/src/core/types/channel.types';

export default function AdminPanel() {
  const { channels, deleteChannel } = useAdminStore();
  const { logout } = useAuthStore();
  const isAdminAuth = useIsAdmin();
  const router = useRouter();

  useEffect(() => {
    useAdminStore.getState().init();
  }, []);

  useEffect(() => {
    if (!isAdminAuth) router.replace('/admin' as never);
  }, [isAdminAuth]);

  const handleDelete = (channel: Channel) => {
    Alert.alert(
      'Eliminar Canal',
      `¿Eliminar "${channel.title}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteChannel(channel.id),
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
          <View
            style={{
              width: 38,
              height: 38,
              backgroundColor: '#FFC107',
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesome name="play" size={15} color="#1A052E" />
          </View>
          <View>
            <Text style={{ color: 'white', fontSize: 19, fontWeight: '800' }}>
              Contenido
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 11 }}>
              {channels.length} {channels.length === 1 ? 'canal' : 'canales'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {/* Users button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#2A0E47',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderRadius: 10,
              gap: 6,
              borderWidth: 1,
              borderColor: '#3D1A6E',
            }}
            onPress={() => router.push('/admin/users' as never)}
          >
            <FontAwesome name="users" size={14} color="#FFC107" />
            <Text style={{ color: '#FFC107', fontWeight: '700', fontSize: 14 }}>
              Usuarios
            </Text>
          </TouchableOpacity>
          {/* Add channel button */}
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
            onPress={() => router.push('/admin/form' as never)}
          >
            <FontAwesome name="plus" size={14} color="#1A052E" />
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
      >
        {channels.length === 0 ? (
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
              <FontAwesome name="film" size={38} color="#4A148C" />
            </View>
            <Text
              style={{
                color: 'white',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 8,
              }}
            >
              Sin contenido aún
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
              Agrega tu primer canal con su URL de streaming y la imagen de
              portada
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
              onPress={() => router.push('/admin/form' as never)}
            >
              <FontAwesome name="plus" size={15} color="#1A052E" />
              <Text
                style={{ color: '#1A052E', fontWeight: '700', fontSize: 15 }}
              >
                Agregar primer canal
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          channels.map((channel) => (
            <View
              key={channel.id}
              style={{
                backgroundColor: '#2A0E47',
                borderRadius: 16,
                marginBottom: 12,
                flexDirection: 'row',
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#3D1A6E',
              }}
            >
              {/* Thumbnail */}
              {channel.imageUrl ? (
                <Image
                  source={{ uri: channel.imageUrl }}
                  style={{ width: 96, height: 96 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: 96,
                    height: 96,
                    backgroundColor: '#1A052E',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesome name="image" size={30} color="#4A148C" />
                </View>
              )}

              {/* Info */}
              <View
                style={{ flex: 1, padding: 12, justifyContent: 'center' }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 15,
                    fontWeight: '700',
                    marginBottom: 4,
                  }}
                  numberOfLines={1}
                >
                  {channel.title}
                </Text>
                <Text
                  style={{
                    color: '#6b7280',
                    fontSize: 11,
                    marginBottom: 6,
                  }}
                  numberOfLines={1}
                >
                  {channel.videoUrl}
                </Text>
                {channel.tags.length > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 5,
                      flexWrap: 'wrap',
                    }}
                  >
                    {channel.tags.slice(0, 3).map((tag, i) => (
                      <View
                        key={i}
                        style={{
                          backgroundColor: '#1A052E',
                          borderRadius: 6,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderWidth: 1,
                          borderColor: '#4A148C',
                        }}
                      >
                        <Text
                          style={{
                            color: '#9c5fd6',
                            fontSize: 10,
                            fontWeight: '600',
                          }}
                        >
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Action buttons */}
              <View
                style={{
                  justifyContent: 'center',
                  gap: 8,
                  paddingRight: 12,
                  paddingVertical: 12,
                }}
              >
                <TouchableOpacity
                  style={{
                    width: 38,
                    height: 38,
                    backgroundColor: '#0f2744',
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#1e3a5f',
                  }}
                  onPress={() =>
                    router.push({
                      pathname: '/admin/form' as never,
                      params: { id: channel.id },
                    })
                  }
                >
                  <FontAwesome name="pencil" size={15} color="#60a5fa" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: 38,
                    height: 38,
                    backgroundColor: '#3f1515',
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#7f1d1d',
                  }}
                  onPress={() => handleDelete(channel)}
                >
                  <FontAwesome name="trash" size={15} color="#f87171" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

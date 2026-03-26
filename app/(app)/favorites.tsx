import { View, Text, FlatList, Image, TouchableOpacity, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useFavoritesStore } from '../../services/favoritesStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

/**
 * Favorites / My List screen.
 *
 * Displays the user's saved content list, persisted via IndexedDB.
 * Items can be played directly or removed from the list.
 */
export default function Favorites() {
    const { favorites, removeFavorite, init } = useFavoritesStore();
    const router = useRouter();

    useEffect(() => {
        init();
    }, []);

    return (
        <View className="flex-1 bg-luki-background" style={{ paddingTop: RNStatusBar.currentHeight ?? 44 }}>
            <StatusBar style="light" />

            {/* Header */}
            <View className="px-4 mb-4 mt-4">
                <Text className="text-white text-2xl font-bold">Mi Lista</Text>
                {favorites.length > 0 && (
                    <Text className="text-gray-400 text-sm mt-1">{favorites.length} título{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}</Text>
                )}
            </View>

            {/* Empty state */}
            {favorites.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <FontAwesome name="bookmark-o" size={64} color="#4A148C" />
                    <Text className="text-white text-xl font-bold mt-6 text-center">Tu lista está vacía</Text>
                    <Text className="text-gray-400 text-sm mt-3 text-center">
                        Agrega películas, series y canales desde la pantalla de inicio o búsqueda usando el ícono{' '}
                        <FontAwesome name="bookmark-o" size={13} color="#9ca3af" />.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="flex-row items-center mb-4 bg-luki-dark rounded-lg overflow-hidden"
                            onPress={() => router.push({ pathname: '/player/[id]', params: { id: item.id } })}
                            accessibilityLabel={`Reproducir ${item.title}`}
                            accessibilityRole="button"
                        >
                            <Image
                                source={{ uri: item.poster }}
                                className="w-20 h-28"
                                resizeMode="cover"
                            />
                            <View className="flex-1 px-3 py-2">
                                <View className="flex-row items-center mb-1">
                                    {item.isLive && (
                                        <View className="bg-red-600 px-1 rounded mr-2">
                                            <Text className="text-white text-xs font-bold">EN VIVO</Text>
                                        </View>
                                    )}
                                    <Text className="text-white font-bold text-sm flex-1" numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                </View>
                                {item.matchTime && (
                                    <Text className="text-luki-accent text-xs mb-1">⏱ {item.matchTime}</Text>
                                )}
                                <Text className="text-gray-400 text-xs" numberOfLines={2}>{item.description}</Text>
                                {item.tags && item.tags.length > 0 && (
                                    <View className="flex-row flex-wrap mt-1">
                                        {item.tags.slice(0, 3).map((tag) => (
                                            <Text key={tag} className="text-gray-500 text-xs mr-2">#{tag}</Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                            {/* Remove from list */}
                            <TouchableOpacity
                                className="px-3 py-4"
                                onPress={() => removeFavorite(item.id)}
                                accessibilityLabel={`Quitar ${item.title} de Mi Lista`}
                            >
                                <FontAwesome name="bookmark" size={20} color="#FFC107" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

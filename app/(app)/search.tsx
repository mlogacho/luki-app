import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useContentStore, Movie } from '../../services/contentStore';
import { useFavoritesStore } from '../../services/favoritesStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

/**
 * Search screen.
 *
 * Provides a real-time text filter over the full content catalogue
 * (trending + admin channels). Tapping a result navigates to the player.
 * Users can toggle favorites directly from the results list.
 */
export default function Search() {
    const [query, setQuery] = useState('');
    const { trending, fetchContent } = useContentStore();
    const { toggleFavorite, isFavorite, init: initFavorites } = useFavoritesStore();
    const router = useRouter();

    useEffect(() => {
        fetchContent();
        initFavorites();
    }, []);

    const results: Movie[] = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return trending;
        return trending.filter(
            (m) =>
                m.title.toLowerCase().includes(q) ||
                m.description.toLowerCase().includes(q) ||
                m.tags?.some((t) => t.toLowerCase().includes(q))
        );
    }, [query, trending]);

    return (
        <View className="flex-1 bg-luki-background" style={{ paddingTop: RNStatusBar.currentHeight ?? 44 }}>
            <StatusBar style="light" />

            {/* Search bar */}
            <View className="flex-row items-center bg-luki-dark mx-4 my-4 rounded-lg px-3">
                <FontAwesome name="search" size={18} color="#9ca3af" />
                <TextInput
                    className="flex-1 text-white text-base ml-3 py-3"
                    placeholder="Buscar películas, deportes, canales…"
                    placeholderTextColor="#6b7280"
                    value={query}
                    onChangeText={setQuery}
                    returnKeyType="search"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Limpiar búsqueda">
                        <FontAwesome name="times-circle" size={18} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Results */}
            {results.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-400 text-base">Sin resultados para "{query}"</Text>
                </View>
            ) : (
                <FlatList
                    data={results}
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
                            <TouchableOpacity
                                className="px-3 py-4"
                                onPress={() => toggleFavorite(item)}
                                accessibilityLabel={isFavorite(item.id) ? 'Quitar de Mi Lista' : 'Añadir a Mi Lista'}
                            >
                                <FontAwesome
                                    name={isFavorite(item.id) ? 'bookmark' : 'bookmark-o'}
                                    size={20}
                                    color={isFavorite(item.id) ? '#FFC107' : '#6b7280'}
                                />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import type { Channel } from '@/src/core/types/channel.types';

interface MediaRowProps {
    title: string;
    items: Channel[];
}

export const MediaRow = ({ title, items }: MediaRowProps) => {
    return (
        <View className="mb-8">
            <Text className="text-white text-lg font-bold mb-3 px-4">{title}</Text>
            <FlatList
                horizontal
                data={items}
                renderItem={({ item }) => (
                    <TouchableOpacity className="mr-4 first:ml-4">
                        <Image
                            source={{ uri: item.imageUrl }}
                            className="w-32 h-48 rounded-md"
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
};

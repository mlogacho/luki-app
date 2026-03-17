import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Search() {
    return (
        <View className="flex-1 bg-luki-background items-center justify-center">
            <StatusBar style="light" />
            <Text className="text-white text-xl">Búsqueda</Text>
        </View>
    );
}
